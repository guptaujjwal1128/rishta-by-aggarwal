const { randomUUID } = require("crypto");
const { Pool } = require("pg");

const { DATABASE_URL } = require("../config");
const { Permissions } = require("../auth/permissions");

const pool = new Pool({
  connectionString: DATABASE_URL,
});

const profileColumns = {
  profileType: "profile_type",
  fullName: "full_name",
  gender: "gender",
  dateOfBirth: "date_of_birth",
  timeOfBirth: "time_of_birth",
  placeOfBirth: "place_of_birth",
  height: "height",
  complexion: "complexion",
  caste: "caste",
  subCaste: "sub_caste",
  gotra: "gotra",
  manglik: "manglik",
  rashi: "rashi",
  nakshatra: "nakshatra",
  maritalStatus: "marital_status",
  motherTongue: "mother_tongue",
  religion: "religion",
  education: "education",
  occupation: "occupation",
  annualIncome: "annual_income",
  workLocation: "work_location",
  fatherName: "father_name",
  fatherOccupation: "father_occupation",
  motherName: "mother_name",
  motherOccupation: "mother_occupation",
  siblings: "siblings",
  familyType: "family_type",
  familyValues: "family_values",
  residence: "residence",
  city: "city",
  state: "state",
  country: "country",
  diet: "diet",
  smoking: "smoking",
  drinking: "drinking",
  hobbies: "hobbies",
  about: "about",
  partnerPreferences: "partner_preferences",
  contactEmail: "contact_email",
  contactPhone: "contact_phone",
};

function asDate(value) {
  if (!value) {
    return null;
  }
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  return String(value).slice(0, 10);
}

function asNumber(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function toPublicUser(row) {
  if (!row) {
    return null;
  }
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    passwordHash: row.password_hash,
    role: row.role,
    authProvider: row.auth_provider,
    socialProviders: row.social_providers || [],
    canEditBio: row.can_edit_bio !== false,
    permissions: row.permissions || {},
    createdAt: row.created_at,
  };
}

function withoutPasswordHash(user) {
  if (!user) {
    return null;
  }
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}

function toProfile(row) {
  if (!row) {
    return null;
  }
  return {
    id: row.id,
    userId: row.user_id,
    profileType: row.profile_type,
    fullName: row.full_name,
    gender: row.gender,
    dateOfBirth: asDate(row.date_of_birth),
    timeOfBirth: row.time_of_birth,
    placeOfBirth: row.place_of_birth,
    height: row.height,
    complexion: row.complexion,
    caste: row.caste,
    subCaste: row.sub_caste,
    gotra: row.gotra,
    manglik: row.manglik,
    rashi: row.rashi,
    nakshatra: row.nakshatra,
    maritalStatus: row.marital_status,
    motherTongue: row.mother_tongue,
    religion: row.religion,
    education: row.education,
    occupation: row.occupation,
    annualIncome: row.annual_income === null ? null : Number(row.annual_income),
    workLocation: row.work_location,
    fatherName: row.father_name,
    fatherOccupation: row.father_occupation,
    motherName: row.mother_name,
    motherOccupation: row.mother_occupation,
    siblings: row.siblings,
    familyType: row.family_type,
    familyValues: row.family_values,
    residence: row.residence,
    city: row.city,
    state: row.state,
    country: row.country,
    diet: row.diet,
    smoking: row.smoking,
    drinking: row.drinking,
    hobbies: row.hobbies,
    about: row.about,
    partnerPreferences: row.partner_preferences,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    photos: row.photos || [],
    isLocked: Boolean(row.is_locked),
    lockedAt: row.locked_at,
    lockedReason: row.locked_reason,
    isVerified: Boolean(row.is_verified),
    verifiedAt: row.verified_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const completionFields = [
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

function calculateProfileCompletion(profile) {
  if (!profile) {
    return 0;
  }
  const filled = completionFields.filter((field) => Boolean(profile[field]));
  return Math.round((filled.length / completionFields.length) * 100);
}

function toNotification(row) {
  if (!row) {
    return null;
  }
  return {
    id: row.id,
    userId: row.user_id,
    channel: row.channel,
    title: row.title,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
    readAt: row.read_at,
  };
}

function profileDbValue(field, value) {
  if (field === "annualIncome") {
    return asNumber(value);
  }
  if (field === "dateOfBirth") {
    return value || null;
  }
  return value === undefined ? null : value;
}

async function query(text, params = []) {
  return pool.query(text, params);
}

async function seedDemoProfiles() {
  const demoProfiles = [
    {
      id: "10000000-0000-4000-8000-000000000001",
      profileType: "bride",
      fullName: "Aanya Agarwal",
      gender: "Female",
      dateOfBirth: "1997-03-12",
      timeOfBirth: "09:30",
      placeOfBirth: "Delhi",
      height: "5 feet 4 inch",
      complexion: "Fair",
      caste: "Baniya - Agarwal",
      subCaste: "Goyal",
      gotra: "Goyal",
      manglik: "No",
      maritalStatus: "Never Married",
      motherTongue: "Hindi",
      religion: "Hindu",
      education: "MBA, Delhi University",
      occupation: "Product Manager",
      annualIncome: 1800000,
      workLocation: "Gurugram",
      fatherName: "Rajesh Agarwal",
      fatherOccupation: "Business",
      motherName: "Sunita Agarwal",
      motherOccupation: "Homemaker",
      siblings: "1 brother, unmarried",
      familyType: "Nuclear",
      familyValues: "Moderate",
      residence: "Pitampura, Delhi",
      city: "Delhi",
      state: "Delhi",
      country: "India",
      diet: "Vegetarian",
      smoking: "No",
      drinking: "No",
      hobbies: "Classical music, travel, reading",
      about:
        "Warm, ambitious, family-oriented and looking for a compatible partner.",
      partnerPreferences:
        "Well-educated, respectful family, based in Delhi NCR or open to relocation.",
      contactEmail: "demo.bride@rishta.local",
      contactPhone: "+91 90000 00001",
    },
    {
      id: "10000000-0000-4000-8000-000000000002",
      profileType: "groom",
      fullName: "Rohan Gupta",
      gender: "Male",
      dateOfBirth: "1994-08-21",
      timeOfBirth: "18:15",
      placeOfBirth: "Jaipur",
      height: "5 feet 10 inch",
      complexion: "Wheatish",
      caste: "Baniya - Gupta",
      subCaste: "Agarwal",
      gotra: "Bansal",
      manglik: "No",
      maritalStatus: "Never Married",
      motherTongue: "Hindi",
      religion: "Hindu",
      education: "B.Tech, IIT Delhi",
      occupation: "Software Architect",
      annualIncome: 3200000,
      workLocation: "Bengaluru",
      fatherName: "Manoj Gupta",
      fatherOccupation: "Chartered Accountant",
      motherName: "Poonam Gupta",
      motherOccupation: "Teacher",
      siblings: "1 sister, married",
      familyType: "Joint",
      familyValues: "Traditional",
      residence: "Vaishali Nagar, Jaipur",
      city: "Bengaluru",
      state: "Karnataka",
      country: "India",
      diet: "Vegetarian",
      smoking: "No",
      drinking: "Occasionally",
      hobbies: "Running, investing, cooking",
      about:
        "Grounded, professionally settled and values family relationships.",
      partnerPreferences:
        "Educated, kind, career-positive and family-oriented.",
      contactEmail: "demo.groom@rishta.local",
      contactPhone: "+91 90000 00002",
    },
  ];

  for (const profile of demoProfiles) {
    const fields = Object.keys(profileColumns);
    const columns = ["id", ...fields.map((field) => profileColumns[field])];
    const values = [
      profile.id,
      ...fields.map((field) => profileDbValue(field, profile[field])),
    ];
    const placeholders = values.map((_, index) => `$${index + 1}`);

    await query(
      `
        INSERT INTO profiles (${columns.join(", ")})
        VALUES (${placeholders.join(", ")})
        ON CONFLICT (id) DO NOTHING
      `,
      values,
    );
  }
}

async function initDb() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id uuid PRIMARY KEY,
      name text NOT NULL,
      email text NOT NULL UNIQUE,
      phone text UNIQUE,
      password_hash text,
      role text NOT NULL DEFAULT 'user',
      auth_provider text NOT NULL DEFAULT 'password',
      social_providers text[] NOT NULL DEFAULT '{}',
      can_edit_bio boolean NOT NULL DEFAULT true,
      permissions jsonb NOT NULL DEFAULT '{}',
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  await query(
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user'",
  );
  await query(
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS can_edit_bio boolean NOT NULL DEFAULT true",
  );
  await query(
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions jsonb NOT NULL DEFAULT '{}'",
  );
  await query("UPDATE users SET role = 'user' WHERE role IS NULL");
  await query("UPDATE users SET permissions = '{}' WHERE permissions IS NULL");
  await query("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user'");
  await query("ALTER TABLE users ALTER COLUMN role SET NOT NULL");
  await query(
    "ALTER TABLE users ALTER COLUMN permissions SET DEFAULT '{}'::jsonb",
  );
  await query("ALTER TABLE users ALTER COLUMN permissions SET NOT NULL");
  await query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check') THEN
        ALTER TABLE users
        ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'admin')) NOT VALID;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_permissions_object_check') THEN
        ALTER TABLE users
        ADD CONSTRAINT users_permissions_object_check
        CHECK (jsonb_typeof(permissions) = 'object') NOT VALID;
      END IF;
    END $$;
  `);
  await query("ALTER TABLE users VALIDATE CONSTRAINT users_role_check");
  await query(
    "ALTER TABLE users VALIDATE CONSTRAINT users_permissions_object_check",
  );

  await query(`
    CREATE TABLE IF NOT EXISTS profiles (
      id uuid PRIMARY KEY,
      user_id uuid REFERENCES users(id) ON DELETE CASCADE,
      profile_type text,
      full_name text,
      gender text,
      date_of_birth date,
      time_of_birth text,
      place_of_birth text,
      height text,
      complexion text,
      caste text,
      sub_caste text,
      gotra text,
      manglik text,
      rashi text,
      nakshatra text,
      marital_status text,
      mother_tongue text,
      religion text,
      education text,
      occupation text,
      annual_income numeric,
      work_location text,
      father_name text,
      father_occupation text,
      mother_name text,
      mother_occupation text,
      siblings text,
      family_type text,
      family_values text,
      residence text,
      city text,
      state text,
      country text,
      diet text,
      smoking text,
      drinking text,
      hobbies text,
      about text,
      partner_preferences text,
      contact_email text,
      contact_phone text,
      photos jsonb NOT NULL DEFAULT '[]',
      is_locked boolean NOT NULL DEFAULT false,
      locked_at timestamptz,
      locked_reason text,
      is_verified boolean NOT NULL DEFAULT false,
      verified_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  await query(
    "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_locked boolean NOT NULL DEFAULT false",
  );
  await query(
    "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS locked_at timestamptz",
  );
  await query(
    "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS locked_reason text",
  );
  await query(
    "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false",
  );
  await query(
    "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verified_at timestamptz",
  );

  await query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id uuid PRIMARY KEY,
      user_id uuid REFERENCES users(id) ON DELETE CASCADE,
      channel text NOT NULL,
      title text NOT NULL,
      message text NOT NULL,
      status text NOT NULL DEFAULT 'queued',
      created_at timestamptz NOT NULL DEFAULT now(),
      read_at timestamptz
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS admin_audit_log (
      id uuid PRIMARY KEY,
      actor_user_id uuid NOT NULL REFERENCES users(id),
      action text NOT NULL,
      target_type text NOT NULL,
      target_id text,
      before_state jsonb,
      after_state jsonb,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  await query(`
    CREATE UNIQUE INDEX IF NOT EXISTS profiles_user_id_unique
    ON profiles(user_id)
    WHERE user_id IS NOT NULL;
  `);

  await seedDemoProfiles();
}

async function createUser({
  name,
  email,
  phone,
  passwordHash,
  authProvider = "password",
}) {
  const result = await query(
    `
      INSERT INTO users (id, name, email, phone, password_hash, auth_provider)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
    [
      randomUUID(),
      name,
      email,
      phone || null,
      passwordHash || null,
      authProvider,
    ],
  );
  return toPublicUser(result.rows[0]);
}

async function findUserById(id) {
  const result = await query("SELECT * FROM users WHERE id = $1", [id]);
  return toPublicUser(result.rows[0]);
}

async function findUserByEmailOrPhone(email, phone) {
  const result = await query(
    "SELECT * FROM users WHERE email = $1 OR ($2::text IS NOT NULL AND phone = $2) LIMIT 1",
    [email, phone || null],
  );
  return toPublicUser(result.rows[0]);
}

async function findUserByIdentifier(identifier) {
  const result = await query(
    "SELECT * FROM users WHERE email = $1 OR phone = $2 LIMIT 1",
    [identifier, identifier],
  );
  return toPublicUser(result.rows[0]);
}

async function upsertSocialUser({ provider, name, email, phone }) {
  const existing = await findUserByEmailOrPhone(email, phone);
  if (!existing) {
    const result = await query(
      `
        INSERT INTO users (id, name, email, phone, auth_provider, social_providers)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `,
      [
        randomUUID(),
        name || email.split("@")[0],
        email,
        phone || null,
        provider,
        [provider],
      ],
    );
    return toPublicUser(result.rows[0]);
  }

  const providers = Array.from(
    new Set([...(existing.socialProviders || []), provider]),
  );
  const result = await query(
    `
      UPDATE users
      SET
        name = COALESCE(NULLIF($2, ''), name),
        phone = COALESCE(NULLIF($3, ''), phone),
        auth_provider = COALESCE(auth_provider, $4),
        social_providers = $5
      WHERE id = $1
      RETURNING *
    `,
    [existing.id, name || "", phone || "", provider, providers],
  );
  return toPublicUser(result.rows[0]);
}

async function getProfileByUserId(userId) {
  const result = await query("SELECT * FROM profiles WHERE user_id = $1", [
    userId,
  ]);
  return toProfile(result.rows[0]);
}

async function getProfileById(id) {
  const result = await query("SELECT * FROM profiles WHERE id = $1", [id]);
  return toProfile(result.rows[0]);
}

function buildProfileAssignments(payload, startIndex = 1) {
  const fields = Object.keys(payload).filter((field) => profileColumns[field]);
  const columns = fields.map((field) => profileColumns[field]);
  const values = fields.map((field) => profileDbValue(field, payload[field]));
  const assignments = columns.map(
    (column, index) => `${column} = $${startIndex + index}`,
  );
  return { fields, columns, values, assignments };
}

async function upsertUserProfile(userId, payload) {
  const existing = await getProfileByUserId(userId);
  const built = buildProfileAssignments(payload);

  if (existing) {
    if (!built.assignments.length) {
      return existing;
    }

    const result = await query(
      `
        UPDATE profiles
        SET ${built.assignments.join(", ")}, updated_at = now()
        WHERE user_id = $${built.values.length + 1}
        RETURNING *
      `,
      [...built.values, userId],
    );
    return toProfile(result.rows[0]);
  }

  const id = randomUUID();
  const columns = ["id", "user_id", ...built.columns];
  const values = [id, userId, ...built.values];
  const placeholders = values.map((_, index) => `$${index + 1}`);
  const result = await query(
    `
      INSERT INTO profiles (${columns.join(", ")})
      VALUES (${placeholders.join(", ")})
      RETURNING *
    `,
    values,
  );
  return toProfile(result.rows[0]);
}

async function createStandaloneProfile(payload) {
  const built = buildProfileAssignments(payload);
  const id = randomUUID();
  const columns = ["id", ...built.columns];
  const values = [id, ...built.values];
  const placeholders = values.map((_, index) => `$${index + 1}`);
  const result = await query(
    `
      INSERT INTO profiles (${columns.join(", ")})
      VALUES (${placeholders.join(", ")})
      RETURNING *
    `,
    values,
  );
  return toProfile(result.rows[0]);
}

async function updateProfileById(profileId, payload) {
  const built = buildProfileAssignments(payload);
  if (!built.assignments.length) {
    return getProfileById(profileId);
  }
  const result = await query(
    `
      UPDATE profiles
      SET ${built.assignments.join(", ")}, updated_at = now()
      WHERE id = $${built.values.length + 1}
      RETURNING *
    `,
    [...built.values, profileId],
  );
  return toProfile(result.rows[0]);
}

async function setProfileLock(profileId, isLocked, reason = "") {
  const result = await query(
    `
      UPDATE profiles
      SET is_locked = $2,
          locked_at = CASE WHEN $2 THEN now() ELSE NULL END,
          locked_reason = CASE WHEN $2 THEN NULLIF($3, '') ELSE NULL END,
          updated_at = now()
      WHERE id = $1
      RETURNING *
    `,
    [profileId, Boolean(isLocked), reason],
  );
  return toProfile(result.rows[0]);
}

async function setProfileVerification(profileId, isVerified) {
  const result = await query(
    `
      UPDATE profiles
      SET is_verified = $2,
          verified_at = CASE WHEN $2 THEN now() ELSE NULL END,
          updated_at = now()
      WHERE id = $1
      RETURNING *
    `,
    [profileId, Boolean(isVerified)],
  );
  return toProfile(result.rows[0]);
}

async function addProfilePhotos(profileId, photos) {
  const existing = await getProfileById(profileId);
  if (!existing) {
    return null;
  }
  const nextPhotos = [...(existing.photos || []), ...photos].slice(-5);
  const result = await query(
    `
      UPDATE profiles
      SET photos = $2::jsonb, updated_at = now()
      WHERE id = $1
      RETURNING *
    `,
    [profileId, JSON.stringify(nextPhotos)],
  );
  return toProfile(result.rows[0]);
}

async function listProfiles(filters = {}) {
  const clauses = [];
  const params = [];

  const addParam = (value) => {
    params.push(value);
    return `$${params.length}`;
  };

  if (filters.search) {
    const token = `%${String(filters.search).toLowerCase()}%`;
    const placeholder = addParam(token);
    clauses.push(`
      lower(concat_ws(' ',
        full_name, caste, sub_caste, education, occupation, work_location,
        city, state, country, residence, complexion, diet, hobbies, about,
        partner_preferences
      )) LIKE ${placeholder}
    `);
  }

  [
    ["profile_type", filters.profileType],
    ["gender", filters.gender],
    ["complexion", filters.complexion],
    ["marital_status", filters.maritalStatus],
    ["diet", filters.diet],
  ].forEach(([column, value]) => {
    if (value) {
      clauses.push(`lower(${column}) = lower(${addParam(value)})`);
    }
  });

  if (filters.location) {
    const placeholder = addParam(`%${String(filters.location).toLowerCase()}%`);
    clauses.push(`
      (
        lower(coalesce(city, '')) LIKE ${placeholder}
        OR lower(coalesce(state, '')) LIKE ${placeholder}
        OR lower(coalesce(country, '')) LIKE ${placeholder}
        OR lower(coalesce(residence, '')) LIKE ${placeholder}
      )
    `);
  }

  if (filters.caste) {
    clauses.push(
      `lower(coalesce(caste, '')) LIKE ${addParam(`%${String(filters.caste).toLowerCase()}%`)}`,
    );
  }

  if (filters.minAge) {
    clauses.push(
      `date_of_birth IS NOT NULL AND date_part('year', age(date_of_birth)) >= ${addParam(Number(filters.minAge))}`,
    );
  }

  if (filters.maxAge) {
    clauses.push(
      `date_of_birth IS NOT NULL AND date_part('year', age(date_of_birth)) <= ${addParam(Number(filters.maxAge))}`,
    );
  }

  if (filters.minIncome) {
    clauses.push(
      `annual_income IS NOT NULL AND annual_income >= ${addParam(Number(filters.minIncome))}`,
    );
  }

  if (filters.maxIncome) {
    clauses.push(
      `annual_income IS NOT NULL AND annual_income <= ${addParam(Number(filters.maxIncome))}`,
    );
  }

  if (!filters.includeUnverified) {
    clauses.push("is_verified = true");
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const result = await query(
    `
      SELECT *
      FROM profiles
      ${where}
      ORDER BY updated_at DESC, created_at DESC
    `,
    params,
  );
  return result.rows.map(toProfile);
}

async function listUsersWithProfiles() {
  const result = await query(`
    SELECT
      u.*,
      p.id AS profile_id,
      p.full_name AS profile_full_name,
      p.is_locked AS profile_is_locked,
      p.updated_at AS profile_updated_at,
      row_to_json(p) AS profile_json
    FROM users u
    LEFT JOIN profiles p ON p.user_id = u.id
    ORDER BY u.created_at DESC
  `);

  return result.rows.map((row) => {
    const profile = toProfile(row.profile_json);
    return {
      ...withoutPasswordHash(toPublicUser(row)),
      profileId: row.profile_id,
      profileName: row.profile_full_name,
      profileLocked: Boolean(row.profile_is_locked),
      profileUpdatedAt: row.profile_updated_at,
      completion: calculateProfileCompletion(profile),
    };
  });
}

async function updateUserAdminSettings(userId, payload) {
  const current = await findUserById(userId);
  if (!current) {
    return null;
  }

  const nextRole = payload.role || current.role;
  const nextPermissions =
    nextRole === "admin" ? payload.permissions || current.permissions : {};
  const updatesPermissions =
    payload.permissions !== undefined || payload.role === "user";
  const removesAccessManager =
    current.role === "admin" &&
    current.permissions?.[Permissions.USERS_MANAGE_ACCESS] === true &&
    (nextRole !== "admin" ||
      nextPermissions[Permissions.USERS_MANAGE_ACCESS] !== true);

  if (removesAccessManager) {
    const countResult = await query(
      `SELECT count(*)::int AS count
       FROM users
       WHERE role = 'admin' AND permissions ->> $1 = 'true'`,
      [Permissions.USERS_MANAGE_ACCESS],
    );
    if (countResult.rows[0].count <= 1) {
      const err = new Error("The last access-managing admin cannot be removed");
      err.status = 409;
      throw err;
    }
  }

  const result = await query(
    `
      UPDATE users
      SET can_edit_bio = COALESCE($2, can_edit_bio),
          permissions = COALESCE($3::jsonb, permissions),
          role = COALESCE($4, role)
      WHERE id = $1
      RETURNING *
    `,
    [
      userId,
      typeof payload.canEditBio === "boolean" ? payload.canEditBio : null,
      updatesPermissions ? JSON.stringify(nextPermissions) : null,
      payload.role || null,
    ],
  );
  return withoutPasswordHash(toPublicUser(result.rows[0]));
}

async function createAdminAuditLog({
  actorUserId,
  action,
  targetType,
  targetId,
  beforeState,
  afterState,
}) {
  await query(
    `
      INSERT INTO admin_audit_log
        (id, actor_user_id, action, target_type, target_id, before_state, after_state)
      VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb)
    `,
    [
      randomUUID(),
      actorUserId,
      action,
      targetType,
      targetId || null,
      beforeState ? JSON.stringify(beforeState) : null,
      afterState ? JSON.stringify(afterState) : null,
    ],
  );
}

async function createNotification({
  userId,
  channel,
  title,
  message,
  status = "queued",
}) {
  const result = await query(
    `
      INSERT INTO notifications (id, user_id, channel, title, message, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
    [randomUUID(), userId, channel, title, message, status],
  );
  return toNotification(result.rows[0]);
}

async function listNotificationsForUser(userId) {
  const result = await query(
    `
      SELECT *
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 50
    `,
    [userId],
  );
  return result.rows.map(toNotification);
}

async function adminStats() {
  const result = await query(`
    SELECT
      (SELECT count(*)::int FROM users) AS users,
      (SELECT count(*)::int FROM profiles) AS profiles,
      (SELECT count(*)::int FROM profiles WHERE is_verified) AS verified_profiles,
      (SELECT count(*)::int FROM profiles WHERE NOT is_verified) AS unverified_profiles,
      (SELECT count(*)::int FROM profiles WHERE is_locked) AS locked_profiles,
      (SELECT count(*)::int FROM notifications) AS notifications
  `);
  return result.rows[0];
}

module.exports = {
  addProfilePhotos,
  adminStats,
  calculateProfileCompletion,
  createAdminAuditLog,
  createNotification,
  createStandaloneProfile,
  createUser,
  findUserByEmailOrPhone,
  findUserById,
  findUserByIdentifier,
  getProfileById,
  getProfileByUserId,
  initDb,
  listNotificationsForUser,
  listProfiles,
  listUsersWithProfiles,
  pool,
  setProfileLock,
  setProfileVerification,
  toPublicUser,
  updateProfileById,
  updateUserAdminSettings,
  upsertSocialUser,
  upsertUserProfile,
};
