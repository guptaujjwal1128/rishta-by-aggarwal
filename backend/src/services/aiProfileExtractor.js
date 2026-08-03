const { GoogleGenAI } = require("@google/genai");
const { PDFParse } = require("pdf-parse");

const {
  GCP_PROJECT_ID,
  VERTEX_AI_LOCATION,
  VERTEX_AI_IMAGE_PROCESSING_PRIMARY,
  VERTEX_AI_IMAGE_PROCESSING_SECONDARY,
} = require("../config");
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

const CONFIDENCE_THRESHOLD = 0.85;
const confidenceFields = [
  "fullName",
  "profileType",
  "dateOfBirth",
  "height",
  "complexion",
  "caste",
  "education",
  "occupation",
  "fatherName",
  "motherName",
  "residence",
];

const profileProperties = {
  profileType: { type: ["string", "null"], enum: ["bride", "groom", null] },
  fullName: { type: ["string", "null"] },
  gender: { type: ["string", "null"] },
  dateOfBirth: {
    type: ["string", "null"],
    description: "ISO date, YYYY-MM-DD",
  },
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

function getVertexAiClient() {
  if (
    !GCP_PROJECT_ID ||
    !VERTEX_AI_LOCATION ||
    !VERTEX_AI_IMAGE_PROCESSING_PRIMARY
  ) {
    return null;
  }
  return new GoogleGenAI({
    vertexai: true,
    project: GCP_PROJECT_ID,
    location: VERTEX_AI_LOCATION,
    apiVersion: "v1",
  });
}

function isImage(file) {
  return file?.mimetype?.startsWith("image/");
}

function isPdf(file) {
  return (
    file?.mimetype === "application/pdf" ||
    file?.originalname?.toLowerCase().endsWith(".pdf")
  );
}

function isTextLike(file) {
  return (
    textMimeTypes.has(file?.mimetype) ||
    /\.(json|txt|csv)$/i.test(file?.originalname || "")
  );
}

function fileText(file) {
  return file.buffer
    .toString("utf8")
    .replace(/^\uFEFF/, "")
    .trim();
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
    Object.entries(value || {}).filter(
      ([, fieldValue]) => fieldValue !== null && fieldValue !== "",
    ),
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
      textChunks.push(
        `${file.originalname || "text file"}:\n${fileText(file)}`,
      );
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

  return {
    parts,
    sourceText: textChunks.join("\n\n---\n\n").slice(0, 45000),
  };
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

async function generateStructuredProfile(parts, model) {
  const client = getVertexAiClient();
  if (!client) {
    const err = new Error(
      "Vertex AI project, location, and primary image-processing model are required for AI extraction from this file type",
    );
    err.status = 400;
    throw err;
  }

  const response = await client.models.generateContent({
    model,
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

function normalizedEvidence(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function fieldHasEvidence(field, value, sourceText) {
  if (!sourceText) {
    return false;
  }
  const source = normalizedEvidence(sourceText);
  const normalizedValue = normalizedEvidence(value);
  if (!normalizedValue) {
    return false;
  }
  if (source.includes(normalizedValue)) {
    return true;
  }
  if (field === "profileType") {
    return (
      (value === "bride" && /\b(bride|female|girl)\b/.test(source)) ||
      (value === "groom" && /\b(groom|male|boy)\b/.test(source))
    );
  }
  return false;
}

function isFieldValid(field, value) {
  if (value === undefined || value === null || value === "") {
    return false;
  }
  if (field === "profileType") {
    return value === "bride" || value === "groom";
  }
  if (field === "dateOfBirth") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
      return false;
    }
    const birthDate = new Date(`${value}T00:00:00Z`);
    const age =
      (Date.now() - birthDate.getTime()) / (365.2425 * 24 * 60 * 60 * 1000);
    return !Number.isNaN(age) && age >= 18 && age <= 100;
  }
  if (field === "contactEmail") {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value));
  }
  if (field === "contactPhone") {
    const digits = String(value).replace(/\D/g, "");
    return digits.length >= 7 && digits.length <= 15;
  }
  if (field === "annualIncome") {
    return Number.isFinite(Number(value)) && Number(value) > 0;
  }
  return String(value).trim().length > 1;
}

function isFieldConsistent(field, value, draft) {
  if (field !== "profileType" || !draft.gender) {
    return true;
  }
  const gender = String(draft.gender).toLowerCase();
  return (
    (value === "bride" && gender.includes("female")) ||
    (value === "groom" && gender.includes("male"))
  );
}

function scoreField(field, value, draft, sourceText) {
  if (value === undefined || value === null || value === "") {
    return 0;
  }
  const hasSourceText = Boolean(sourceText);
  let score = hasSourceText ? 0.45 : 0.7;
  if (hasSourceText && fieldHasEvidence(field, value, sourceText)) {
    score += 0.35;
  }
  if (isFieldValid(field, value)) {
    score += hasSourceText ? 0.15 : 0.2;
  }
  if (isFieldConsistent(field, value, draft)) {
    score += hasSourceText ? 0.05 : 0.1;
  }
  return Math.min(1, Number(score.toFixed(2)));
}

function confidenceLevel(score) {
  if (score >= CONFIDENCE_THRESHOLD) {
    return "high";
  }
  return score >= 0.65 ? "medium" : "low";
}

function assessProfileConfidence(draft, sourceText = "") {
  const fieldScores = Object.fromEntries(
    Object.entries(draft).map(([field, value]) => [
      field,
      scoreField(field, value, draft, sourceText),
    ]),
  );
  const score = Number(
    (
      confidenceFields.reduce(
        (total, field) => total + (fieldScores[field] || 0),
        0,
      ) / confidenceFields.length
    ).toFixed(2),
  );
  return { score, level: confidenceLevel(score), fieldScores };
}

function sameFieldValue(first, second) {
  return normalizedEvidence(first) === normalizedEvidence(second);
}

function combineModelResults(primary, secondary, sourceText) {
  const draft = { ...primary, ...secondary };
  const assessed = assessProfileConfidence(draft, sourceText);
  for (const field of Object.keys(draft)) {
    if (
      primary[field] !== undefined &&
      secondary[field] !== undefined &&
      sameFieldValue(primary[field], secondary[field])
    ) {
      assessed.fieldScores[field] = Math.min(
        1,
        Number(((assessed.fieldScores[field] || 0) + 0.1).toFixed(2)),
      );
    }
  }
  assessed.score = Number(
    (
      confidenceFields.reduce(
        (total, field) => total + (assessed.fieldScores[field] || 0),
        0,
      ) / confidenceFields.length
    ).toFixed(2),
  );
  assessed.level = confidenceLevel(assessed.score);
  return { draft, assessed };
}

async function extractWithModelFallback(parts, sourceText = "") {
  let primaryDraft;
  let primaryError;
  try {
    primaryDraft = await generateStructuredProfile(
      parts,
      VERTEX_AI_IMAGE_PROCESSING_PRIMARY,
    );
  } catch (err) {
    primaryError = err;
  }

  const primaryConfidence = primaryDraft
    ? assessProfileConfidence(primaryDraft, sourceText)
    : { score: 0, level: "low", fieldScores: {} };
  const canUseSecondary =
    Boolean(VERTEX_AI_IMAGE_PROCESSING_SECONDARY) &&
    VERTEX_AI_IMAGE_PROCESSING_SECONDARY !== VERTEX_AI_IMAGE_PROCESSING_PRIMARY;
  const shouldUseSecondary =
    canUseSecondary &&
    (!primaryDraft || primaryConfidence.score < CONFIDENCE_THRESHOLD);

  if (!shouldUseSecondary) {
    if (!primaryDraft) {
      throw primaryError;
    }
    return {
      draft: primaryDraft,
      confidence: {
        ...primaryConfidence,
        threshold: CONFIDENCE_THRESHOLD,
        modelTier: "primary",
        secondaryUsed: false,
      },
    };
  }

  try {
    const secondaryDraft = await generateStructuredProfile(
      parts,
      VERTEX_AI_IMAGE_PROCESSING_SECONDARY,
    );
    const combined = primaryDraft
      ? combineModelResults(primaryDraft, secondaryDraft, sourceText)
      : {
          draft: secondaryDraft,
          assessed: assessProfileConfidence(secondaryDraft, sourceText),
        };
    return {
      draft: combined.draft,
      confidence: {
        ...combined.assessed,
        threshold: CONFIDENCE_THRESHOLD,
        modelTier: "secondary",
        secondaryUsed: true,
        primaryScore: primaryConfidence.score,
      },
    };
  } catch (secondaryError) {
    if (!primaryDraft) {
      throw secondaryError;
    }
    return {
      draft: primaryDraft,
      confidence: {
        ...primaryConfidence,
        threshold: CONFIDENCE_THRESHOLD,
        modelTier: "primary",
        secondaryUsed: false,
        secondaryAttempted: true,
        secondaryFailed: true,
      },
    };
  }
}

function deterministicResult(draft, sourceText) {
  return {
    aiUsed: false,
    draft,
    confidence: {
      ...assessProfileConfidence(draft, sourceText),
      threshold: CONFIDENCE_THRESHOLD,
      modelTier: "none",
      secondaryUsed: false,
    },
  };
}

function normalizeFiles(file, files) {
  if (Array.isArray(files)) {
    return files.filter(Boolean);
  }
  return file ? [file] : [];
}

async function vertexResult({
  parts,
  sourceText = "",
  sourceType,
  extractedTextPreview,
}) {
  const extracted = await extractWithModelFallback(parts, sourceText);
  return {
    aiUsed: true,
    ...extracted,
    ...(extractedTextPreview ? { extractedTextPreview } : {}),
    sourceType,
  };
}

async function extractProfileWithAi({ file, files, text }) {
  const allFiles = normalizeFiles(file, files);
  const textInput = String(text || "").trim();

  if (!allFiles.length && !textInput) {
    const err = new Error(
      "Provide a biodata image, PDF, text, CSV, or JSON file",
    );
    err.status = 400;
    throw err;
  }

  if (allFiles.length > 1) {
    if (!getVertexAiClient()) {
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
          ...deterministicResult(
            normalizeProfileInput(parseLineBasedText(combinedText)),
            combinedText,
          ),
          extractedTextPreview: combinedText.slice(0, 500),
          sourceType: "multi-file-text-fallback",
        };
      }
    }

    const combined = await contentFromFiles(allFiles, textInput);
    return vertexResult({
      parts: combined.parts,
      sourceText: combined.sourceText,
      extractedTextPreview: textInput.slice(0, 500),
      sourceType: "multi-file",
    });
  }

  const singleFile = allFiles[0];

  if (!getVertexAiClient()) {
    if (singleFile && (isTextLike(singleFile) || isPdf(singleFile))) {
      if (isPdf(singleFile)) {
        const pdfText = await extractPdfText(singleFile);
        const draft = normalizeProfileInput(
          parseUploadedBiodata({
            ...singleFile,
            buffer: Buffer.from(pdfText),
            originalname: `${singleFile.originalname}.txt`,
            mimetype: "text/plain",
          }),
        );
        return {
          ...deterministicResult(draft, pdfText),
          extractedTextPreview: pdfText.slice(0, 500),
          sourceType: "pdf-text-fallback",
        };
      }

      const rawText = fileText(singleFile);
      return {
        ...deterministicResult(parseUploadedBiodata(singleFile), rawText),
        extractedTextPreview: fileText(singleFile).slice(0, 500),
        sourceType: "text-fallback",
      };
    }

    if (textInput) {
      return {
        ...deterministicResult(
          normalizeProfileInput(parseLineBasedText(textInput)),
          textInput,
        ),
        extractedTextPreview: textInput.slice(0, 500),
        sourceType: "manual-text-fallback",
      };
    }
  }

  if (singleFile && isImage(singleFile)) {
    return vertexResult({
      parts: contentFromImage(singleFile),
      sourceType: "image",
    });
  }

  if (singleFile && isPdf(singleFile)) {
    const pdfText = await extractPdfText(singleFile);
    if (pdfText.length > 80) {
      return vertexResult({
        parts: contentFromText(pdfText, "PDF text"),
        sourceText: pdfText,
        extractedTextPreview: pdfText.slice(0, 500),
        sourceType: "pdf-text",
      });
    }

    return vertexResult({
      parts: contentFromPdfFile(singleFile),
      sourceType: "pdf-file",
    });
  }

  if (singleFile) {
    const rawText = fileText(singleFile);
    if (getVertexAiClient()) {
      return vertexResult({
        parts: contentFromText(
          rawText,
          singleFile.originalname || "uploaded file",
        ),
        sourceText: rawText,
        extractedTextPreview: rawText.slice(0, 500),
        sourceType: "text-file",
      });
    }
    return {
      ...deterministicResult(parseUploadedBiodata(singleFile), rawText),
      extractedTextPreview: rawText.slice(0, 500),
      sourceType: "text-file",
    };
  }

  if (getVertexAiClient()) {
    return vertexResult({
      parts: contentFromText(textInput, "pasted text"),
      sourceText: textInput,
      extractedTextPreview: textInput.slice(0, 500),
      sourceType: "pasted-text",
    });
  }
  return {
    ...deterministicResult(
      normalizeProfileInput(parseLineBasedText(textInput)),
      textInput,
    ),
    extractedTextPreview: textInput.slice(0, 500),
    sourceType: "pasted-text",
  };
}

module.exports = {
  assessProfileConfidence,
  extractProfileWithAi,
};
