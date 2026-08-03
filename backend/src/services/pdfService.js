const fs = require("fs");
const fsp = require("fs/promises");
const os = require("os");
const path = require("path");
const PDFDocument = require("pdfkit");

const { UPLOAD_DIR } = require("../config");

const page = {
  width: 595,
  height: 842,
  margin: 44,
  contentWidth: 507,
};

function valueOrDash(value) {
  if (value == null || value === "") {
    return "-";
  }
  if (typeof value === "number") {
    return new Intl.NumberFormat("en-IN").format(value);
  }
  return String(value);
}

function formatIncome(value) {
  if (!value) {
    return "-";
  }
  if (typeof value !== "number") {
    return valueOrDash(value);
  }
  return `INR ${new Intl.NumberFormat("en-IN").format(value)} per annum`;
}

function photoPath(photo) {
  if (photo?.localPath && fs.existsSync(photo.localPath)) {
    return photo.localPath;
  }
  if (!photo?.filename) {
    return "";
  }
  const candidate = path.join(UPLOAD_DIR, "photos", photo.filename);
  return fs.existsSync(candidate) ? candidate : "";
}

async function downloadRemotePhoto(photo, tempDir) {
  if (!photo?.url || !photo.url.startsWith("http")) {
    return photo;
  }

  try {
    const response = await fetch(photo.url);
    if (!response.ok) {
      return photo;
    }
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) {
      return photo;
    }
    const extension = path.extname(new URL(photo.url).pathname) || ".jpg";
    const localPath = path.join(
      tempDir,
      `${photo.id || Date.now()}${extension}`,
    );
    const buffer = Buffer.from(await response.arrayBuffer());
    await fsp.writeFile(localPath, buffer);
    return { ...photo, localPath };
  } catch {
    return photo;
  }
}

async function preparePdfPhotos(profile) {
  const photos = profile.photos || [];
  if (!photos.some((photo) => photo?.url?.startsWith("http"))) {
    return { profile, cleanup: async () => {} };
  }

  const tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), "rishta-pdf-"));
  const preparedPhotos = await Promise.all(
    photos.map((photo) => downloadRemotePhoto(photo, tempDir)),
  );

  return {
    profile: { ...profile, photos: preparedPhotos },
    cleanup: async () => {
      await fsp.rm(tempDir, { recursive: true, force: true });
    },
  };
}

function drawBackground(doc) {
  doc.rect(0, 0, page.width, page.height).fill("#fff9f2");
  doc.circle(560, 42, 80).fillOpacity(0.12).fill("#b9471f").fillOpacity(1);
  doc.circle(18, 820, 95).fillOpacity(0.08).fill("#c65b7c").fillOpacity(1);
  doc
    .fillOpacity(1)
    .fillColor("#9b8d84")
    .font("Helvetica")
    .fontSize(6)
    .text("Rishta by Aggarwal", page.margin, page.height - 26, {
      width: page.contentWidth,
      align: "right",
    });
}

function ensurePage(doc, cursorY, neededHeight) {
  if (cursorY + neededHeight <= page.height - page.margin) {
    return cursorY;
  }
  doc.addPage();
  drawBackground(doc);
  return page.margin;
}

function sectionTitle(doc, title, y) {
  doc.roundedRect(page.margin, y, page.contentWidth, 24, 5).fill("#fff1e4");
  doc
    .fillColor("#7c2f16")
    .font("Helvetica-Bold")
    .fontSize(12)
    .text(title, page.margin + 12, y + 7, { width: page.contentWidth - 24 });
  return y + 36;
}

function fieldHeight(doc, label, value, width) {
  const labelWidth = Math.min(120, width * 0.36);
  const valueWidth = width - labelWidth - 8;
  const text = valueOrDash(value);
  const labelHeight = doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .heightOfString(label, {
      width: labelWidth,
    });
  const valueHeight = doc.font("Helvetica").fontSize(10).heightOfString(text, {
    width: valueWidth,
  });
  return Math.max(labelHeight, valueHeight, 14) + 10;
}

function drawField(doc, label, value, x, y, width) {
  const labelWidth = Math.min(120, width * 0.36);
  const valueWidth = width - labelWidth - 8;
  const height = fieldHeight(doc, label, value, width);

  doc
    .fillColor("#8f3516")
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(label, x, y, { width: labelWidth });
  doc
    .fillColor("#222222")
    .font("Helvetica")
    .fontSize(10)
    .text(valueOrDash(value), x + labelWidth + 8, y, { width: valueWidth });

  return height;
}

function drawRows(doc, rows, startY) {
  let y = startY;
  const gutter = 22;
  const colWidth = (page.contentWidth - gutter) / 2;
  const leftX = page.margin + 12;
  const rightX = leftX + colWidth + gutter;
  const fullWidth = page.contentWidth - 24;

  rows.forEach((row) => {
    if (row.length === 1) {
      const [field] = row;
      const needed = fieldHeight(doc, field[0], field[1], fullWidth);
      y = ensurePage(doc, y, needed);
      y += drawField(doc, field[0], field[1], leftX, y, fullWidth);
      return;
    }

    const [left, right] = row;
    const needed = Math.max(
      fieldHeight(doc, left[0], left[1], colWidth),
      fieldHeight(doc, right[0], right[1], colWidth),
    );
    y = ensurePage(doc, y, needed);
    drawField(doc, left[0], left[1], leftX, y, colWidth);
    drawField(doc, right[0], right[1], rightX, y, colWidth);
    y += needed;
  });

  return y;
}

function drawPhotoBox(doc, imagePath, x, y, width, height, fallbackText) {
  doc.roundedRect(x, y, width, height, 8).fillAndStroke("#fff1e4", "#e8b58e");
  if (imagePath) {
    doc.image(imagePath, x + 4, y + 4, {
      fit: [width - 8, height - 8],
      align: "center",
      valign: "center",
    });
    return;
  }
  doc
    .fillColor("#8f3516")
    .font("Helvetica-Bold")
    .fontSize(26)
    .text(fallbackText, x, y + height / 2 - 14, { align: "center", width });
}

function drawPhotoStrip(doc, profile, y) {
  const photos = (profile.photos || [])
    .map(photoPath)
    .filter(Boolean)
    .slice(0, 5);
  if (!photos.length) {
    return y;
  }

  y = ensurePage(doc, y, 122);
  y = sectionTitle(doc, "Photos", y);
  const gap = 10;
  const size = 88;
  photos.forEach((imagePath, index) => {
    const x = page.margin + 10 + index * (size + gap);
    drawPhotoBox(doc, imagePath, x, y, size, 104, "");
  });
  return y + 122;
}

function drawHeader(doc, profile) {
  drawBackground(doc);

  doc
    .font("Helvetica-Bold")
    .fontSize(24)
    .fillColor("#7c2f16")
    .text("Marriage Biodata", page.margin, page.margin);

  const firstPhotoPath = photoPath(profile.photos?.[0]);
  drawPhotoBox(
    doc,
    firstPhotoPath,
    420,
    page.margin,
    112,
    132,
    (profile.fullName || "P").slice(0, 1).toUpperCase(),
  );

  doc
    .font("Helvetica-Bold")
    .fontSize(20)
    .fillColor("#222222")
    .text(profile.fullName || "Profile", page.margin, 112, { width: 340 });
  doc
    .font("Helvetica")
    .fontSize(11)
    .fillColor("#555555")
    .text(
      [profile.profileType, profile.city, profile.state, profile.country]
        .filter(Boolean)
        .join(" | "),
      page.margin,
      140,
      { width: 340 },
    );
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor("#666666")
    .text(
      `Detail status: ${profile.isVerified ? "Verified by admin" : "Not verified by admin"}`,
      page.margin,
      162,
      { width: 340 },
    );

  return 206;
}

async function createBiodataPdf(inputProfile, res) {
  const prepared = await preparePdfPhotos(inputProfile);
  const profile = prepared.profile;
  const doc = new PDFDocument({
    margin: page.margin,
    size: "A4",
    autoFirstPage: false,
  });
  const fileName = `${profile.fullName || "profile"}-biodata.pdf`
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  doc.pipe(res);

  doc.addPage();
  let y = drawHeader(doc, profile);

  const sections = [
    {
      title: "Personal Details",
      rows: [
        [
          ["Date of Birth", profile.dateOfBirth],
          ["Time of Birth", profile.timeOfBirth],
        ],
        [
          ["Place of Birth", profile.placeOfBirth],
          ["Height", profile.height],
        ],
        [
          ["Complexion", profile.complexion],
          ["Marital Status", profile.maritalStatus],
        ],
        [
          [
            "Caste",
            [profile.caste, profile.subCaste].filter(Boolean).join(" - "),
          ],
          ["Gotra", profile.gotra],
        ],
        [
          ["Manglik", profile.manglik],
          ["Mother Tongue", profile.motherTongue],
        ],
        [
          ["Rashi", profile.rashi],
          ["Nakshatra", profile.nakshatra],
        ],
      ],
    },
    {
      title: "Education & Career",
      rows: [
        [["Education", profile.education]],
        [["Occupation", profile.occupation]],
        [
          ["Annual Income", formatIncome(profile.annualIncome)],
          ["Work Location", profile.workLocation],
        ],
      ],
    },
    {
      title: "Family Details",
      rows: [
        [
          ["Father", profile.fatherName],
          ["Occupation", profile.fatherOccupation],
        ],
        [
          ["Mother", profile.motherName],
          ["Occupation", profile.motherOccupation],
        ],
        [["Siblings", profile.siblings]],
        [["Residence", profile.residence]],
        [
          ["Family Type", profile.familyType],
          ["Family Values", profile.familyValues],
        ],
      ],
    },
    {
      title: "Lifestyle & Preferences",
      rows: [
        [
          ["Diet", profile.diet],
          ["Smoking", profile.smoking],
        ],
        [
          ["Drinking", profile.drinking],
          ["Hobbies", profile.hobbies],
        ],
        [["About", profile.about]],
        [["Partner Preference", profile.partnerPreferences]],
      ],
    },
  ];

  sections.forEach((section) => {
    y = ensurePage(doc, y + 14, 72);
    y = sectionTitle(doc, section.title, y);
    y = drawRows(doc, section.rows, y);
  });

  y = drawPhotoStrip(doc, profile, y + 10);
  y = ensurePage(doc, y + 16, 46);
  doc
    .moveTo(page.margin, y)
    .lineTo(page.margin + page.contentWidth, y)
    .strokeColor("#e8b58e")
    .stroke();
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor("#666666")
    .text(
      `Contact: ${valueOrDash(profile.contactEmail)} | ${valueOrDash(profile.contactPhone)}`,
      page.margin,
      y + 12,
      { width: page.contentWidth, align: "center" },
    );

  doc.on("end", () => {
    void prepared.cleanup();
  });
  doc.end();
}

module.exports = {
  createBiodataPdf,
};
