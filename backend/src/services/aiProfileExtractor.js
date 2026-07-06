const { GoogleGenAI } = require("@google/genai");
const { PDFParse } = require("pdf-parse");

const { GEMINI_API_KEY, GEMINI_MODEL } = require("../config");
const {
  normalizeProfileInput,
  parseLineBasedText,
  parseUploadedBiodata,
} = require("./profileParser");

const textMimeTypes = new Set([
  "application/json",
  "text/plain",
  "text/csv",
  "application/csv",
]);

const profileProperties = {
  profileType: { type: ["string", "null"], enum: ["bride", "groom", null] },
  fullName: { type: ["string", "null"] },
  gender: { type: ["string", "null"] },
  dateOfBirth: { type: ["string", "null"], description: "ISO date, YYYY-MM-DD" },
  timeOfBirth: { type: ["string", "null"] },
  placeOfBirth: { type: ["string", "null"] },
  height: { type: ["string", "null"] },
  complexion: { type: ["string", "null"] },
  caste: { type: ["string", "null"] },
  subCaste: { type: ["string", "null"] },
  gotra: { type: ["string", "null"] },
  manglik: { type: ["string", "null"] },
  rashi: { type: ["string", "null"] },
  nakshatra: { type: ["string", "null"] },
  maritalStatus: { type: ["string", "null"] },
  motherTongue: { type: ["string", "null"] },
  religion: { type: ["string", "null"] },
  education: { type: ["string", "null"] },
  occupation: { type: ["string", "null"] },
  annualIncome: {
    type: ["number", "string", "null"],
    description: "Annual income in INR number when possible",
  },
  workLocation: { type: ["string", "null"] },
  fatherName: { type: ["string", "null"] },
  fatherOccupation: { type: ["string", "null"] },
  motherName: { type: ["string", "null"] },
  motherOccupation: { type: ["string", "null"] },
  siblings: { type: ["string", "null"] },
  familyType: { type: ["string", "null"] },
  familyValues: { type: ["string", "null"] },
  residence: { type: ["string", "null"] },
  city: { type: ["string", "null"] },
  state: { type: ["string", "null"] },
  country: { type: ["string", "null"] },
  diet: { type: ["string", "null"] },
  smoking: { type: ["string", "null"] },
  drinking: { type: ["string", "null"] },
  hobbies: { type: ["string", "null"] },
  about: { type: ["string", "null"] },
  partnerPreferences: { type: ["string", "null"] },
  contactEmail: { type: ["string", "null"] },
  contactPhone: { type: ["string", "null"] },
};

const profileSchema = {
  type: "object",
  additionalProperties: false,
  properties: profileProperties,
  required: Object.keys(profileProperties),
};

function getClient() {
  if (!GEMINI_API_KEY) {
    return null;
  }
  return new GoogleGenAI({ apiKey: GEMINI_API_KEY });
}

function isImage(file) {
  return file?.mimetype?.startsWith("image/");
}

function isPdf(file) {
  return file?.mimetype === "application/pdf" || file?.originalname?.toLowerCase().endsWith(".pdf");
}

function isTextLike(file) {
  return textMimeTypes.has(file?.mimetype) || /\.(json|txt|csv)$/i.test(file?.originalname || "");
}

function fileText(file) {
  return file.buffer.toString("utf8").replace(/^\uFEFF/, "").trim();
}

async function extractPdfText(file) {
  const parser = new PDFParse({ data: file.buffer });
  try {
    const result = await parser.getText();
    return String(result.text || "").trim();
  } finally {
    await parser.destroy();
  }
}

function withoutNulls(value) {
  return Object.fromEntries(
    Object.entries(value || {}).filter(([, fieldValue]) => fieldValue !== null && fieldValue !== ""),
  );
}

function contentFromText(text, label) {
  return [
    {
      text: [
        `Extract Indian matrimonial biodata fields from this ${label}.`,
        "Return only information explicitly present or strongly implied.",
        "Use null for unknown fields. Convert dates to YYYY-MM-DD when possible.",
        "Convert lakh/crore salary to annual INR number when possible.",
        "Preserve caste/sub-caste/family details exactly when readable.",
        "",
        text.slice(0, 30000),
      ].join("\n"),
    },
  ];
}

function filePart(file) {
  return {
    inlineData: {
      data: file.buffer.toString("base64"),
      mimeType: isPdf(file) ? "application/pdf" : file.mimetype,
    },
  };
}

function contentFromImage(file) {
  return [
    {
      text: [
        "Read this matrimonial biodata image and extract all profile fields.",
        "The image may contain large decorative text, Indian names, caste, DOB, education, family and residence details.",
        "Use null for fields that are not visible. Convert dates to YYYY-MM-DD and salary to annual INR number when possible.",
      ].join("\n"),
    },
    filePart(file),
  ];
}

function contentFromPdfFile(file) {
  return [
    {
      text: [
        "Read this matrimonial biodata PDF and extract the profile fields.",
        "Use null for missing fields. Convert dates to YYYY-MM-DD and salary to annual INR number when possible.",
      ].join("\n"),
    },
    filePart(file),
  ];
}

async function contentFromFiles(files, textInput) {
  const textChunks = [];
  const parts = [
    {
      text: [
        "Extract one Indian matrimonial biodata profile from the provided files and text.",
        "Files may include biodata PDF/image/text plus separate candidate photos.",
        "Use the biodata-like documents/images for profile fields. Do not invent fields from photos unless visible text is present.",
        "Use null for missing fields. Convert dates to YYYY-MM-DD and salary to annual INR number when possible.",
      ].join("\n"),
    },
  ];

  if (textInput) {
    textChunks.push(`Pasted text:\n${textInput}`);
  }

  for (const file of files) {
    if (isTextLike(file)) {
      textChunks.push(`${file.originalname || "text file"}:\n${fileText(file)}`);
      continue;
    }

    if (isPdf(file)) {
      const pdfText = await extractPdfText(file);
      if (pdfText.length > 80) {
        textChunks.push(`${file.originalname || "PDF text"}:\n${pdfText}`);
      } else {
        parts.push(filePart(file));
      }
      continue;
    }

    if (isImage(file)) {
      parts.push(filePart(file));
    }
  }

  if (textChunks.length) {
    parts.push({
      text: textChunks.join("\n\n---\n\n").slice(0, 45000),
    });
  }

  return parts;
}

function responseText(response) {
  if (typeof response.text === "function") {
    return response.text();
  }

  if (response.text) {
    return response.text;
  }

  return response.candidates?.[0]?.content?.parts
    ?.map((part) => part.text)
    .filter(Boolean)
    .join("");
}

async function callGemini(parts) {
  const client = getClient();
  if (!client) {
    const err = new Error("GEMINI_API_KEY is required for AI extraction from this file type");
    err.status = 400;
    throw err;
  }

  const response = await client.models.generateContent({
    model: GEMINI_MODEL,
    contents: [{ role: "user", parts }],
    config: {
      responseMimeType: "application/json",
      responseSchema: profileSchema,
    },
  });

  const outputText = responseText(response);
  if (!outputText) {
    const err = new Error("AI extraction did not return profile data");
    err.status = 502;
    throw err;
  }

  return normalizeProfileInput(withoutNulls(JSON.parse(outputText)));
}

function normalizeFiles(file, files) {
  if (Array.isArray(files)) {
    return files.filter(Boolean);
  }
  return file ? [file] : [];
}

async function extractProfileWithAi({ file, files, text }) {
  const allFiles = normalizeFiles(file, files);
  const textInput = String(text || "").trim();

  if (!allFiles.length && !textInput) {
    const err = new Error("Provide a biodata image, PDF, text, CSV, or JSON file");
    err.status = 400;
    throw err;
  }

  if (allFiles.length > 1) {
    if (!getClient()) {
      const textChunks = [];
      for (const currentFile of allFiles) {
        if (isTextLike(currentFile)) {
          textChunks.push(fileText(currentFile));
        } else if (isPdf(currentFile)) {
          textChunks.push(await extractPdfText(currentFile));
        }
      }
      if (textInput) {
        textChunks.push(textInput);
      }
      if (textChunks.some(Boolean)) {
        const combinedText = textChunks.filter(Boolean).join("\n");
        return {
          aiUsed: false,
          draft: normalizeProfileInput(parseLineBasedText(combinedText)),
          extractedTextPreview: combinedText.slice(0, 500),
          sourceType: "multi-file-text-fallback",
        };
      }
    }

    return {
      aiUsed: true,
      draft: await callGemini(await contentFromFiles(allFiles, textInput)),
      extractedTextPreview: textInput.slice(0, 500),
      sourceType: "multi-file",
    };
  }

  const singleFile = allFiles[0];

  if (!getClient()) {
    if (singleFile && (isTextLike(singleFile) || isPdf(singleFile))) {
      if (isPdf(singleFile)) {
        const pdfText = await extractPdfText(singleFile);
        return {
          aiUsed: false,
          draft: normalizeProfileInput(parseUploadedBiodata({
            ...singleFile,
            buffer: Buffer.from(pdfText),
            originalname: `${singleFile.originalname}.txt`,
            mimetype: "text/plain",
          })),
          extractedTextPreview: pdfText.slice(0, 500),
          sourceType: "pdf-text-fallback",
        };
      }

      return {
        aiUsed: false,
        draft: parseUploadedBiodata(singleFile),
        extractedTextPreview: fileText(singleFile).slice(0, 500),
        sourceType: "text-fallback",
      };
    }

    if (textInput) {
      return {
        aiUsed: false,
        draft: normalizeProfileInput(parseLineBasedText(textInput)),
        extractedTextPreview: textInput.slice(0, 500),
        sourceType: "manual-text-fallback",
      };
    }
  }

  if (singleFile && isImage(singleFile)) {
    return {
      aiUsed: true,
      draft: await callGemini(contentFromImage(singleFile)),
      sourceType: "image",
    };
  }

  if (singleFile && isPdf(singleFile)) {
    const pdfText = await extractPdfText(singleFile);
    if (pdfText.length > 80) {
      return {
        aiUsed: true,
        draft: await callGemini(contentFromText(pdfText, "PDF text")),
        extractedTextPreview: pdfText.slice(0, 500),
        sourceType: "pdf-text",
      };
    }

    return {
      aiUsed: true,
      draft: await callGemini(contentFromPdfFile(singleFile)),
      sourceType: "pdf-file",
    };
  }

  if (singleFile) {
    const rawText = fileText(singleFile);
    return {
      aiUsed: Boolean(getClient()),
      draft: getClient()
        ? await callGemini(contentFromText(rawText, singleFile.originalname || "uploaded file"))
        : parseUploadedBiodata(singleFile),
      extractedTextPreview: rawText.slice(0, 500),
      sourceType: "text-file",
    };
  }

  return {
    aiUsed: Boolean(getClient()),
    draft: getClient()
      ? await callGemini(contentFromText(textInput, "pasted text"))
      : normalizeProfileInput(parseLineBasedText(textInput)),
    extractedTextPreview: textInput.slice(0, 500),
    sourceType: "pasted-text",
  };
}

module.exports = {
  extractProfileWithAi,
};
