const keyMap = {
  "profile for": "profileType",
  type: "profileType",
  "bride groom": "profileType",
  name: "fullName",
  "full name": "fullName",
  gender: "gender",
  "date of birth": "dateOfBirth",
  dob: "dateOfBirth",
  "birth date": "dateOfBirth",
  "time of birth": "timeOfBirth",
  "place of birth": "placeOfBirth",
  "birth place": "placeOfBirth",
  height: "height",
  complexion: "complexion",
  caste: "caste",
  "sub caste": "subCaste",
  subcaste: "subCaste",
  gotra: "gotra",
  manglik: "manglik",
  rashi: "rashi",
  nakshatra: "nakshatra",
  religion: "religion",
  "marital status": "maritalStatus",
  "mother tongue": "motherTongue",
  education: "education",
  occupation: "occupation",
  profession: "occupation",
  "annual salary": "annualIncome",
  salary: "annualIncome",
  income: "annualIncome",
  "annual income": "annualIncome",
  "work location": "workLocation",
  "father name": "fatherName",
  "fathers name": "fatherName",
  "father's name": "fatherName",
  "father occupation": "fatherOccupation",
  "mother name": "motherName",
  "mothers name": "motherName",
  "mother's name": "motherName",
  "mother occupation": "motherOccupation",
  siblings: "siblings",
  "family type": "familyType",
  "family values": "familyValues",
  residence: "residence",
  city: "city",
  location: "city",
  state: "state",
  country: "country",
  diet: "diet",
  food: "diet",
  smoking: "smoking",
  drinking: "drinking",
  hobbies: "hobbies",
  about: "about",
  "partner preferences": "partnerPreferences",
  "contact email": "contactEmail",
  "contact phone": "contactPhone",
  phone: "contactPhone",
  email: "contactEmail",
};

const profileFields = new Set(Object.values(keyMap));

function normalizeKey(key) {
  return String(key)
    .trim()
    .toLowerCase()
    .replace(/[`']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function cleanValue(value) {
  if (value == null) {
    return "";
  }
  return String(value).replace(/\s+/g, " ").trim();
}

function normalizeAnnualIncome(value) {
  const cleaned = cleanValue(value);
  if (!cleaned) {
    return "";
  }

  const numeric = Number(cleaned.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return cleaned;
  }

  const lowered = cleaned.toLowerCase();
  if (lowered.includes("crore")) {
    return Math.round(numeric * 10000000);
  }
  if (lowered.includes("lakh") || lowered.includes("lac")) {
    return Math.round(numeric * 100000);
  }
  return Math.round(numeric);
}

function normalizeDateValue(value) {
  const cleaned = cleanValue(value);
  if (!cleaned) {
    return "";
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    return cleaned;
  }

  const withoutOrdinals = cleaned.replace(/(\d+)(st|nd|rd|th)/gi, "$1");
  const parsed = new Date(withoutOrdinals);
  if (Number.isNaN(parsed.getTime())) {
    return cleaned;
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeProfileInput(input = {}) {
  const draft = {};

  Object.entries(input).forEach(([rawKey, rawValue]) => {
    const directKey = profileFields.has(rawKey) ? rawKey : null;
    const mappedKey = directKey || keyMap[normalizeKey(rawKey)];
    if (!mappedKey) {
      return;
    }

    const value = cleanValue(rawValue);
    if (!value) {
      return;
    }

    if (mappedKey === "annualIncome") {
      draft[mappedKey] = normalizeAnnualIncome(value);
      return;
    }
    if (mappedKey === "dateOfBirth") {
      draft[mappedKey] = normalizeDateValue(value);
      return;
    }

    draft[mappedKey] = value;
  });

  if (draft.profileType) {
    const type = String(draft.profileType).toLowerCase();
    if (type.includes("bride") || type.includes("female")) {
      draft.profileType = "bride";
    } else if (type.includes("groom") || type.includes("male")) {
      draft.profileType = "groom";
    }
  }

  return draft;
}

function parseLineBasedText(text) {
  const raw = {};

  text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const match = line.match(/^([^:,-]{2,80})\s*[:,-]\s*(.+)$/);
      if (!match) {
        return;
      }
      raw[match[1]] = match[2];
    });

  return raw;
}

function parseUploadedBiodata(file) {
  const text = file.buffer.toString("utf8").replace(/^\uFEFF/, "").trim();
  const name = file.originalname.toLowerCase();

  if (!text) {
    const err = new Error("Uploaded file is empty");
    err.status = 400;
    throw err;
  }

  if (name.endsWith(".json") || file.mimetype === "application/json") {
    try {
      return normalizeProfileInput(JSON.parse(text));
    } catch {
      const err = new Error("Could not parse JSON biodata file");
      err.status = 400;
      throw err;
    }
  }

  return normalizeProfileInput(parseLineBasedText(text));
}

module.exports = {
  normalizeAnnualIncome,
  normalizeDateValue,
  normalizeProfileInput,
  parseLineBasedText,
  parseUploadedBiodata,
};
