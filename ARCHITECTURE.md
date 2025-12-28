# Rishta By Aggarwal – Architecture & Implementation Guide

## Project Overview

A **matrimonial web platform** with admin-controlled profile management and offline bio-data distribution. Based on Figma designs covering:

- Landing page
- User authentication (email/phone + Social SSO)
- Profile creation form
- Admin bio-data dashboard & approval queue
- **No direct messaging** – Admin shows profiles offline to end users

### Key Business Logic

- Users create profiles → status: `pending`
- Admin reviews & approves → status: `approved by admin`
- Admin can reject or suspend → status: `rejected by admin` / `suspended by admin`
- Users can delete their own profile → status: `deleted by user`
- Admin can delete → status: `deleted by admin`

---

## Database Selection: Relational (PostgreSQL) Recommended

### Why PostgreSQL over MongoDB?

✅ **Relational DB (PostgreSQL)**

- Strong data integrity with foreign keys
- ACID transactions for user auth & status changes
- Better for structured matrimonial data
- Easier to query profiles by filters (age, religion, location)
- Better performance for admin queries

❌ **NoSQL (MongoDB)**

- Denormalization leads to sync issues (social login duplication)
- JSON blob approach gets messy with complex queries
- Harder to maintain data consistency

**Recommendation: Use PostgreSQL + optional JSON columns for flexible fields (hobbies, preferences array)**

---

## Single Table vs. Separate Tables

### Recommended: Hybrid Approach (2 Tables)

#### Table 1: **users** (Authentication & Account)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(15) UNIQUE,
  password_hash VARCHAR(255),  -- NULL if SSO only
  status VARCHAR(50) DEFAULT 'pending',
  -- pending, completed by user, approved by admin, rejected by admin, suspended by admin, deleted by admin, deleted by user
  role VARCHAR(20) DEFAULT 'user',  -- 'user' or 'admin'

  -- Audit Trail
  created_by UUID REFERENCES users(id),  -- Admin who created this user (NULL if self-registered)
  updated_by UUID REFERENCES users(id),  -- Last admin who updated this user
  deleted_by UUID REFERENCES users(id),  -- Admin who deleted this user
  deletion_reason TEXT,  -- Why admin deleted account

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP  -- Soft delete timestamp
);
```

### Timestamps Explained

- **created_at**: When user first registered (email/phone signup or SSO)
- **updated_at**: Last time user modified their profile or status changed
- **deleted_at**: When user/admin deleted account (soft delete)
- **verified_at** (in social_accounts): When this social account was verified/linked (proves user owns this account)

#### Table 2: **profiles** (Bio-Data)

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  profile_photo VARCHAR(500),
  bio TEXT,
  age INT,
  height VARCHAR(10),  -- "5'8\""
  religion VARCHAR(50),
  caste VARCHAR(100),
  mother_tongue VARCHAR(50),
  education VARCHAR(100),
  profession VARCHAR(100),
  income VARCHAR(50),  -- "50L-100L"
  location VARCHAR(100),
  smoking BOOLEAN,
  drinking BOOLEAN,
  family_status VARCHAR(50),
  has_children BOOLEAN,
  hobbies JSONB,  -- Array: ["Music", "Travel", "Sports"]
  preferences JSONB,  -- {age_range: {min: 25, max: 35}, religion: ["Hindu", "Sikh"]}
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Why This Approach?

✅ Keeps auth separate from bio-data (cleaner queries)  
✅ Profiles can be created independently (step-by-step flow)  
✅ Easy to filter profiles by status  
✅ JSONB columns allow flexibility for hobbies/preferences  
✅ Simple to add new bio-data fields without schema migration

---

## Social Login & SSO Integration

### New Table: **social_accounts** (Account Linking)

```sql
CREATE TABLE social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50),  -- 'google', 'facebook', 'apple', 'phone'
  provider_id VARCHAR(255) UNIQUE,  -- Google ID, Facebook ID, etc.
  provider_email VARCHAR(255),
  provider_phone VARCHAR(15),
  verified_at TIMESTAMP,what is verified at means ?
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, provider)  -- One account per provider per user
);
```

### Implementation Pattern: Account Merging/Linking

#### Flow 1: First-Time Google Login

```
Google ID: "google_12345"
→ Check social_accounts.provider_id
→ NOT found
→ Create users row (no password)
→ Create social_accounts row
→ Redirect to /profile/create
```

#### Flow 2: Email/Phone Login, Then Google Login with Same Email

```
Phone: "+91-9999999999"
→ Login creates users row with status='pending'
→ Later: Google login attempts with same email
→ Check users.email
→ FOUND (existing user)
→ Link Google account to existing user
→ Create social_accounts row
→ Update social_accounts.verified_at = NOW()
→ Redirect to /profile
```

#### Flow 3: Multiple SSO (Google + Apple with Same Email)

```
User logged in via Google (already has user record)
→ Now tries Apple login with same email
→ Check social_accounts WHERE provider='apple'
→ NOT found, but users.email exists
→ Link Apple account to same user
→ Create social_accounts row for Apple
→ user_id stays same
```

### Backend Logic (Node.js/Express Example)

```typescript
// POST /auth/google-callback
async function googleLogin(googleIdToken: string) {
  const payload = verifyGoogleIdToken(googleIdToken);
  const { sub: googleId, email, name, picture } = payload;

  // 1. Check if social account exists
  let socialAccount = await SocialAccount.findOne({ provider_id: googleId });

  if (socialAccount) {
    // SSO already linked, authenticate user
    const user = await User.findById(socialAccount.user_id);
    return generateJWT(user);
  }

  // 2. Check if email exists (phone user trying Google)
  let user = await User.findOne({ email });

  if (!user) {
    // 3a. New user → create account
    user = await User.create({
      email,
      phone: null,
      status: "pending",
    });
  }

  // 3b. Link social account
  await SocialAccount.create({
    user_id: user.id,
    provider: "google",
    provider_id: googleId,
    provider_email: email,
    verified_at: new Date(),
  });

  return generateJWT(user);
}

// POST /auth/phone-login
async function phoneLogin(phone: string, otp: string) {
  verifyOTP(phone, otp);

  let user = await User.findOne({ phone });

  if (!user) {
    user = await User.create({
      phone,
      email: null,
      status: "pending",
    });
  }

  await SocialAccount.create({
    user_id: user.id,
    provider: "phone",
    provider_id: phone,
    provider_phone: phone,
    verified_at: new Date(),
  });

  return generateJWT(user);
}
```

---

## User Status Lifecycle

```
                    ┌─────────────────┐
                    │ pending (new)    │
                    └────────┬─────────┘
                             │
                    (User completes profile)
                             │
                    ┌────────▼──────────┐
                    │ completed by user │
                    └────────┬──────────┘
                             │
                    (Sent to admin queue)
                             │
                ┌────────────┴────────────┐
                │                         │
         (Approve)              (Reject/Review)
                │                         │
    ┌───────────▼────────────┐  ┌────────▼──────────────┐
    │ approved by admin      │  │ rejected by admin    │
    │ (visible to offline)   │  │ (user notified)      │
    └───────────┬────────────┘  └────────┬──────────────┘
                │                         │
                │              (User can resubmit)
                │                         │
                │        ┌────────────────┘
                │        │
                │    ┌───▼─────────────────┐
                │    │ completed by user   │
                │    │ (resubmission)      │
                │    └────────┬────────────┘
                │             │
                │        (Admin review again)
                │             │
                │    ┌────────▼────────────┐
                │    │ approved by admin   │
                │    └────────┬────────────┘
                │             │
                └─────────┬───┘
                          │
                ┌─────────▼─────────────┐
                │ suspended by admin    │  (Admin action)
                │ (hidden temporarily) │
                └─────────┬─────────────┘
                          │
                ┌─────────▼─────────────┐
                │ deleted by admin      │  (Admin hard/soft delete)
                └───────────────────────┘

                User can self-delete:
                approved by admin → deleted by user
```

### Status Updates Logic

```typescript
interface User {
  status:
    | "pending"
    | "completed by user"
    | "approved by admin"
    | "rejected by admin"
    | "suspended by admin"
    | "deleted by admin"
    | "deleted by user";
}

// Allow transitions:
const statusTransitions: Record<string, string[]> = {
  pending: ["completed by user", "deleted by user"],
  "completed by user": [
    "approved by admin",
    "rejected by admin",
    "deleted by user",
  ],
  "approved by admin": [
    "suspended by admin",
    "deleted by admin",
    "deleted by user",
  ],
  "rejected by admin": ["completed by user", "deleted by user"], // Resubmit
  "suspended by admin": [
    "approved by admin",
    "deleted by admin",
    "deleted by user",
  ],
  "deleted by admin": [], // Terminal state
  "deleted by user": [], // Terminal state
};
```

---

## Redux Toolkit Store Structure

```
store/
├── slices/
│   ├── authSlice.ts           # Login, register, SSO, logout, user session
│   ├── profileSlice.ts        # Create, edit, view own profile
│   └── adminSlice.ts          # Admin queue, user management, logs
├── api/
│   └── apiSlice.ts            # RTK Query base setup
└── store.ts                    # Configure store
```

### Slices to Create

#### 1. authSlice.ts

```typescript
{
  user: { id, email, phone, role, status },
  token: string | null,
  loading: boolean,
  error: string | null,
}
```

#### 2. profileSlice.ts

```typescript
{
  currentProfile: Profile | null,
  loading: boolean,
  error: string | null,
  lastUpdated: Date | null,
}
```

#### 3. adminSlice.ts

```typescript
{
  queue: User[],  // status='completed by user'
  allProfiles: Profile[],
  selectedUser: User | null,
  filters: { status, location, age_range },
  loading: boolean,
  error: string | null,
}
```

---

## Component Structure

```
src/components/
├── atom/                       # Smallest, reusable UI blocks
│   ├── Button.tsx
│   ├── TextField.tsx
│   ├── Avatar.tsx
│   ├── Badge.tsx
│   └── Chip.tsx
├── molecule/                   # Combination of atoms
│   ├── ProfileCard.tsx         # Profile preview card
│   ├── MessageItem.tsx         # Single message
│   ├── ConnectionRequest.tsx   # Like/request card
│   ├── SearchFilters.tsx       # Filter panel
│   └── TopAppBar.tsx
└── organism/                   # Complex, feature-complete components
    ├── ProfileForm.tsx         # Create/edit profile
    ├── MessageThread.tsx       # Chat conversation
    ├── ProfileGrid.tsx         # Search results grid
    └── AdminTable.tsx          # Dashboard table
```

---

## Pages Structure

```
src/pages/
├── auth/
│   ├── LoginPage.tsx           # /login (email/phone + SSO buttons)
│   └── RegisterPage.tsx        # /register (create account)
├── public/
│   ├── LandingPage.tsx         # /
│   └── NotFoundPage.tsx        # /404
├── user/
│   ├── ProfilePage.tsx         # /profile/:id (view own profile)
│   ├── CreateProfilePage.tsx   # /profile/create (bio-data form)
│   ├── EditProfilePage.tsx     # /profile/edit (update profile)
│   └── AccountPage.tsx         # /account (settings, delete account)
└── admin/
    ├── DashboardPage.tsx       # /admin (overview stats)
    ├── ApprovalQueuePage.tsx   # /admin/queue (pending approvals)
    ├── ProfilesPage.tsx        # /admin/profiles (all profiles with filters)
    ├── UserLogsPage.tsx        # /admin/logs (audit trail)
    └── SettingsPage.tsx        # /admin/settings
```

---

## API Integration (RTK Query - Recommended)

```
src/api/
├── apiSlice.ts                 # Base API setup
├── auth.api.ts                 # Login, register, SSO, phone OTP
├── profile.api.ts              # CRUD profiles, get profile by ID
└── admin.api.ts                # Approval, rejection, suspension, list profiles
```

### Example (auth.api.ts)

```typescript
import { apiSlice } from "./apiSlice";

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    register: builder.mutation<LoginResponse, RegisterRequest>({
      query: (data) => ({
        url: "/auth/register",
        method: "POST",
        body: data,
      }),
    }),
    verifyToken: builder.query<User, void>({
      query: () => "/auth/verify",
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useVerifyTokenQuery } =
  authApi;
```

---

## Data Flow & Workflows

### 1. **Email/Phone Registration Flow**

```
User enters email/phone → RegisterPage → OTP verification (phone) or email link
→ Create users row (status='pending') → Create social_accounts row
→ Redirect /profile/create
```

### 2. **Social SSO Flow (Google/Apple/Facebook)**

```
User clicks "Sign in with Google" → Google consent → Get Google ID token
→ Backend validates token → Check social_accounts.provider_id
  ├─ If exists: Authenticate user, return JWT
  └─ If not exists:
    ├─ Check users.email (in case phone user linking Google)
    ├─ If exists: Link social account to user
    └─ If not exists: Create new user, create social_accounts, redirect /profile/create
```

### 3. **Profile Creation Flow**

```
CreateProfilePage (form) → Validate data → profileSlice.createProfile
→ API POST /profile/create → Update users.status='completed by user'
→ Profile sent to admin queue → Redirect /profile (view mode)
```

### 4. **Admin Approval Flow**

```
Admin views ApprovalQueuePage → Lists users with status='completed by user'
→ Admin reviews profile → Click "Approve" → API PATCH /admin/users/:id/approve
→ Update users.status='approved by admin' → Profile visible offline
→ Send notification to user
```

### 5. **Admin Rejection Flow**

```
Admin reviews profile → Click "Reject" with reason → API PATCH /admin/users/:id/reject
→ Update users.status='rejected by admin' → Profile returned to user
→ User can edit & resubmit (status → 'completed by user')
```

### 6. **User Self-Delete Flow**

```
User settings → "Delete my profile" → Confirm with reason
→ API DELETE /profile/:id → Update users.status='deleted by user'
→ All profile data soft-deleted (or anonymized)
→ User can re-register later with same email/phone
```

### 7. **Admin Suspend Flow**

```
Admin sees suspicious profile → Click "Suspend" → API PATCH /admin/users/:id/suspend
→ Update users.status='suspended by admin' → Profile hidden from offline list
→ User cannot login, profile data preserved
→ Admin can un-suspend or hard delete later
```

---

## Notifications (No Real-Time Chat Needed)

### Admin Actions Generate Notifications

```typescript
// When admin approves profile:
sendEmailNotification(userId, {
  subject: "Your profile has been approved!",
  body: "Your matrimonial profile is now visible in our offline bio-data list.",
});

// When admin rejects profile:
sendEmailNotification(userId, {
  subject: "Profile needs revision",
  body: `Your profile was rejected. Reason: ${rejectionReason}\n\nPlease update and resubmit.`,
});
```

---

## Routing Architecture

```typescript
// src/routes/index.tsx (React Router v6)
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected User Routes */}
        <Route element={<ProtectedRoute requiredRole="user" />}>
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/profile/create" element={<CreateProfilePage />} />
          <Route path="/profile/edit" element={<EditProfilePage />} />
          <Route path="/account" element={<AccountPage />} />
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute requiredRole="admin" />}>
          <Route path="/admin" element={<DashboardPage />} />
          <Route path="/admin/queue" element={<ApprovalQueuePage />} />
          <Route path="/admin/profiles" element={<ProfilesPage />} />
          <Route path="/admin/logs" element={<UserLogsPage />} />
          <Route path="/admin/settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};
```

---

## Environment Variables

```bash
# .env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_ENV=development
```

---

## Implementation Priority

### Phase 1 (MVP - Core Functionality)

- [ ] Database schema (PostgreSQL)
- [ ] Backend auth endpoints (email/phone + Google SSO)
- [ ] Social account linking logic
- [ ] User registration & profile creation
- [ ] Profile CRUD endpoints
- [ ] Admin approval/rejection endpoints

### Phase 2 (Admin Features)

- [ ] Admin dashboard overview
- [ ] Approval queue page
- [ ] Profile filtering & search (admin)
- [ ] Audit logs

### Phase 3 (Polish & Security)

- [ ] Email notifications
- [ ] Admin suspension/deletion
- [ ] Account deletion (user self-service)
- [ ] Password reset (email)
- [ ] Rate limiting & security

---

## Key Dependencies to Install

```bash
# Core
npm install redux @reduxjs/toolkit react-redux
npm install react-router-dom
npm install axios

# Auth & Security
npm install jsonwebtoken bcryptjs
npm install google-auth-library

# Forms & Validation
npm install react-hook-form zod @hookform/resolvers

# Admin Components
npm install @mui/x-data-grid

# Email
npm install nodemailer  # Backend

# Database (Backend)
npm install pg sequelize  # PostgreSQL
# OR
npm install pg-promise    # Query builder
```

---

---

## File & Image Management

### Image Upload Storage Strategy

**Option 1: Cloud Storage (Recommended for Production)**

```
AWS S3 / Google Cloud Storage / Azure Blob Storage
├─ profiles/{userId}/photo.jpg
├─ documents/{userId}/aadhar.pdf
└─ documents/{userId}/degree.pdf

Benefits:
✅ Scalable, no server storage limits
✅ CDN for fast delivery
✅ Automatic backups
✅ Better security (pre-signed URLs)
```

**Option 2: Server Storage (Development)**

```
/uploads/
├─ profiles/{userId}/photo.jpg
└─ documents/{userId}/document.pdf

Cons:
❌ Limited by server disk space
❌ Need backup strategy
❌ Slower for large files
```

### Backend Implementation (Node.js + Express)

```typescript
// routes/upload.routes.ts
import multer from "multer";
import AWS from "aws-sdk";

const s3 = new AWS.S3();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "application/pdf"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

// POST /upload/profile-photo
router.post(
  "/upload/profile-photo",
  upload.single("photo"),
  async (req, res) => {
    const userId = req.user.id;
    const file = req.file;

    const params = {
      Bucket: "rishta-by-aggarwal",
      Key: `profiles/${userId}/${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "private",
    };

    const result = await s3.upload(params).promise();

    // Save URL to database
    await db.profiles.update(
      { user_id: userId },
      { profile_photo: result.Location }
    );

    res.json({ url: result.Location });
  }
);

// POST /upload/document
router.post("/upload/document", upload.single("document"), async (req, res) => {
  const userId = req.user.id;
  const file = req.file;

  const params = {
    Bucket: "rishta-by-aggarwal",
    Key: `documents/${userId}/${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  const result = await s3.upload(params).promise();

  // Save document record
  await db.documents.create({
    user_id: userId,
    file_name: file.originalname,
    file_url: result.Location,
    file_type: file.mimetype,
  });

  res.json({ url: result.Location });
});
```

### Frontend Implementation (React)

```typescript
// components/ImageUploader.tsx
import { FC, useState } from "react";
import { Box, Button, CircularProgress } from "@mui/material";
import axios from "axios";

const ImageUploader: FC = () => {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("photo", file);

    try {
      const { data } = await axios.post("/api/upload/profile-photo", formData);
      setPreview(data.url);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <input type="file" accept="image/*" onChange={handleUpload} />
      {loading && <CircularProgress />}
      {preview && <img src={preview} alt="preview" />}
    </Box>
  );
};

export default ImageUploader;
```

---

## Social Login Conflict Handling

### Scenario: User Logs in with Google, Then Tries Email Login

```
User Flow:
1. User: "Sign in with Google" → Google account created
   → users.email = "john@gmail.com" (from Google)
   → social_accounts: { provider: 'google', verified_at: NOW() }

2. User: "Sign in with Email" → Tries email "john@gmail.com"
   → Check users.email → FOUND (from Google)
   → ERROR: "Account exists with Google. Set a password to enable email login."
```

### Backend Implementation

```typescript
// POST /auth/email-login
async function emailLogin(email: string, password: string) {
  const user = await User.findOne({ email });

  if (!user) {
    return { error: "User not found", code: "USER_NOT_FOUND" };
  }

  // Check if user has password (email/phone login)
  if (!user.password_hash) {
    const socialAccounts = await SocialAccount.findAll({ user_id: user.id });
    const providers = socialAccounts.map((s) => s.provider).join(", ");

    return {
      error: `Account exists with ${providers}. Please set a password to enable email login.`,
      code: "NO_PASSWORD",
      userId: user.id, // For frontend to show password setup form
      providers,
    };
  }

  // Verify password
  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    return { error: "Invalid password", code: "INVALID_PASSWORD" };
  }

  return { token: generateJWT(user) };
}

// POST /auth/set-password (for users who only have SSO)
async function setPassword(userId: string, newPassword: string) {
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await User.update({ id: userId }, { password_hash: hashedPassword });

  return { success: true };
}
```

### Frontend Implementation

```typescript
// pages/LoginPage.tsx
const [loginError, setLoginError] = useState<any>(null);
const [showPasswordSetup, setShowPasswordSetup] = useState(false);

const handleEmailLogin = async (email: string, password: string) => {
  const response = await authApi.emailLogin({ email, password });

  if (response.code === "NO_PASSWORD") {
    // Show modal to set password
    setLoginError(response);
    setShowPasswordSetup(true);
  } else if (response.error) {
    setLoginError(response);
  } else {
    // Successful login
    dispatch(setToken(response.token));
  }
};

const handleSetPassword = async (userId: string, password: string) => {
  await authApi.setPassword(userId, password);

  // Retry login
  handleEmailLogin(loginError.email, password);
};

return (
  <>
    {showPasswordSetup && (
      <SetPasswordModal
        email={loginError.email}
        providers={loginError.providers}
        onSubmit={handleSetPassword}
      />
    )}
  </>
);
```

---

## AI Document Extraction & Auto-Fill

### Use Cases

- Extract info from Aadhar, PAN, Degree certificates
- Auto-fill profile form fields
- Verify document authenticity

### Implementation Options

#### Option 1: Google Document AI (Recommended)

```typescript
// services/documentExtraction.ts
import vision from "@google-cloud/vision";

const client = new vision.ImageAnnotatorClient();

interface ExtractedData {
  firstName?: string;
  lastName?: string;
  dob?: string;
  address?: string;
  education?: string;
  [key: string]: string | undefined;
}

export async function extractFromDocument(
  imagePath: string
): Promise<ExtractedData> {
  const request = {
    image: { source: { imageUri: imagePath } },
  };

  const [result] = await client.textDetection(request);
  const text = result.fullTextAnnotation?.text || "";

  // Parse text with regex/NLP
  const data: ExtractedData = {
    firstName: extractName(text)?.first,
    lastName: extractName(text)?.last,
    dob: extractDOB(text),
    address: extractAddress(text),
  };

  return data;
}

// Helper functions
function extractName(text: string): { first: string; last: string } | null {
  // Use regex or ML model to extract names
  const nameMatch = text.match(/Name:\s*([A-Za-z]+)\s+([A-Za-z]+)/i);
  return nameMatch ? { first: nameMatch[1], last: nameMatch[2] } : null;
}

function extractDOB(text: string): string | undefined {
  const dobMatch = text.match(/DOB?:\s*(\d{2}\/\d{2}\/\d{4})/i);
  return dobMatch ? dobMatch[1] : undefined;
}

function extractAddress(text: string): string | undefined {
  const addressMatch = text.match(/Address:\s*(.+?)(?:\n|$)/i);
  return addressMatch ? addressMatch[1] : undefined;
}
```

#### Option 2: Tesseract OCR (Open Source)

```typescript
import Tesseract from "tesseract.js";

export async function extractWithTesseract(imagePath: string) {
  const {
    data: { text },
  } = await Tesseract.recognize(imagePath, "eng");

  // Parse extracted text
  return parseDocumentText(text);
}
```

### Frontend Integration

```typescript
// components/DocumentUploadForm.tsx
const [extractedData, setExtractedData] = useState<ExtractedData>({});
const [isExtracting, setIsExtracting] = useState(false);

const handleDocumentUpload = async (file: File) => {
  setIsExtracting(true);

  try {
    const formData = new FormData();
    formData.append("document", file);

    const response = await axios.post("/api/extract-document", formData);
    setExtractedData(response.data);

    // Auto-fill form
    Object.entries(response.data).forEach(([key, value]) => {
      form.setValue(key, value);
    });
  } finally {
    setIsExtracting(false);
  }
};

return (
  <form>
    <input
      type="file"
      onChange={(e) => handleDocumentUpload(e.target.files?.[0]!)}
    />
    {isExtracting && <CircularProgress />}
    <TextField {...form.register("firstName")} placeholder="First Name" />
    <TextField {...form.register("lastName")} placeholder="Last Name" />
    {/* Other fields */}
  </form>
);
```

---

## Biodata Export & Download (PDF, Excel, CSV)

### Export Formats

#### 1. PDF Export (Admin/User)

```typescript
// services/pdfExport.ts
import PDFDocument from "pdfkit";

export async function generateBiodataPDF(profile: Profile): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Header
    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("BIODATA", { align: "center" });
    doc.moveDown();

    // Profile Photo
    if (profile.profile_photo) {
      doc.image(profile.profile_photo, { width: 100, height: 100 });
    }

    doc.moveDown();

    // Personal Details
    doc.fontSize(12).font("Helvetica-Bold").text("PERSONAL DETAILS");
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`Name: ${profile.first_name} ${profile.last_name}`);
    doc.text(`Age: ${profile.age}`);
    doc.text(`Height: ${profile.height}`);
    doc.text(`Religion: ${profile.religion}`);
    doc.text(`Caste: ${profile.caste}`);

    doc.moveDown();

    // Education & Profession
    doc.fontSize(12).font("Helvetica-Bold").text("EDUCATION & CAREER");
    doc.fontSize(10).font("Helvetica").text(`Education: ${profile.education}`);
    doc.text(`Profession: ${profile.profession}`);
    doc.text(`Income: ${profile.income}`);

    doc.moveDown();

    // Location
    doc.fontSize(12).font("Helvetica-Bold").text("LOCATION");
    doc.fontSize(10).font("Helvetica").text(`City: ${profile.location}`);

    doc.moveDown();

    // Family
    doc.fontSize(12).font("Helvetica-Bold").text("FAMILY");
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`Family Status: ${profile.family_status}`);
    doc.text(`Has Children: ${profile.has_children ? "Yes" : "No"}`);

    doc.moveDown();

    // Lifestyle
    doc.fontSize(12).font("Helvetica-Bold").text("LIFESTYLE");
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`Smoking: ${profile.smoking ? "Yes" : "No"}`);
    doc.text(`Drinking: ${profile.drinking ? "Yes" : "No"}`);

    doc.moveDown();

    // Bio
    doc.fontSize(12).font("Helvetica-Bold").text("ABOUT");
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(profile.bio || "N/A");

    doc.end();
  });
}

// GET /api/biodata/:userId/download
router.get("/biodata/:userId/download", async (req, res) => {
  const profile = await db.profiles.findOne({ user_id: req.params.userId });
  const pdfBuffer = await generateBiodataPDF(profile);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="biodata-${profile.user_id}.pdf"`
  );
  res.send(pdfBuffer);
});
```

#### 2. Excel Export (Admin Bulk Export)

```typescript
// services/excelExport.ts
import ExcelJS from "exceljs";

export async function generateBiodataExcel(
  profiles: Profile[]
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Biodatas");

  // Headers
  worksheet.columns = [
    { header: "ID", key: "id" },
    { header: "Name", key: "name" },
    { header: "Age", key: "age" },
    { header: "Religion", key: "religion" },
    { header: "Caste", key: "caste" },
    { header: "Education", key: "education" },
    { header: "Profession", key: "profession" },
    { header: "Income", key: "income" },
    { header: "Location", key: "location" },
    { header: "Status", key: "status" },
    { header: "Created", key: "created_at" },
  ];

  // Add rows
  profiles.forEach((profile) => {
    worksheet.addRow({
      id: profile.id,
      name: `${profile.first_name} ${profile.last_name}`,
      age: profile.age,
      religion: profile.religion,
      caste: profile.caste,
      education: profile.education,
      profession: profile.profession,
      income: profile.income,
      location: profile.location,
      status: profile.user.status,
      created_at: profile.created_at,
    });
  });

  // Styling
  worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4472C4" },
  };

  return (await workbook.xlsx.writeBuffer()) as Buffer;
}

// GET /api/admin/biodatas/export
router.get("/admin/biodatas/export", async (req, res) => {
  const profiles = await db.profiles.findAll({
    include: [{ model: db.users, where: { status: "approved by admin" } }],
  });

  const excelBuffer = await generateBiodataExcel(profiles);

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="biodatas-${Date.now()}.xlsx"`
  );
  res.send(excelBuffer);
});
```

#### 3. CSV Export (Lightweight)

```typescript
// services/csvExport.ts
export function generateBiodataCSV(profiles: Profile[]): string {
  const headers = [
    "ID",
    "Name",
    "Age",
    "Religion",
    "Caste",
    "Education",
    "Profession",
    "Income",
    "Location",
    "Status",
  ];
  const rows = profiles.map((p) => [
    p.id,
    `${p.first_name} ${p.last_name}`,
    p.age,
    p.religion,
    p.caste,
    p.education,
    p.profession,
    p.income,
    p.location,
    p.user.status,
  ]);

  const csv = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  return csv;
}

// GET /api/admin/biodatas/export-csv
router.get("/admin/biodatas/export-csv", async (req, res) => {
  const profiles = await db.profiles.findAll({
    include: [{ model: db.users, where: { status: "approved by admin" } }],
  });

  const csv = generateBiodataCSV(profiles);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="biodatas-${Date.now()}.csv"`
  );
  res.send(csv);
});
```

### Frontend Download Integration

```typescript
// components/ExportButtons.tsx
const handleDownloadPDF = async (userId: string) => {
  const response = await axios.get(`/api/biodata/${userId}/download`, {
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(response.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = `biodata-${userId}.pdf`;
  a.click();
};

const handleExportExcel = async () => {
  const response = await axios.get("/api/admin/biodatas/export", {
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(response.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = `biodatas-${Date.now()}.xlsx`;
  a.click();
};

return (
  <>
    <Button onClick={() => handleDownloadPDF(userId)} variant="contained">
      Download PDF
    </Button>
    <Button onClick={handleExportExcel} variant="contained">
      Export to Excel
    </Button>
  </>
);
```

---

## Backend Dependencies to Add

```bash
npm install pdfkit
npm install exceljs
npm install multer
npm install aws-sdk
npm install @google-cloud/vision
npm install tesseract.js
npm install bcryptjs jsonwebtoken
```

---

1. **Backend Setup**

   - Create PostgreSQL database
   - Set up Node.js/Express server
   - Implement auth endpoints (email/phone + Google SSO)
   - Implement profile CRUD endpoints
   - Implement admin endpoints

2. **Frontend Setup**

   - Set up Redux store with slices
   - Create pages with routing
   - Build API integration layer (RTK Query or Axios)

3. **Authentication Flow**

   - Implement login/register pages
   - Implement SSO buttons (Google, Apple, Facebook)
   - Implement social account linking

4. **Profile Management**

   - Create profile form component
   - Implement profile creation/editing
   - Implement profile viewing

5. **Admin Dashboard**

   - Approval queue interface
   - Profile management interface
   - User management & filters

6. **Components & Styling**
   - Implement atom components (Button, TextField, etc.)
   - Implement molecule components (cards, forms)
   - Polish UI with MUI theme

---

## Backend Tech Stack Recommendations

**Node.js + Express**

- PostgreSQL (pg or Sequelize)
- JWT for authentication
- Nodemailer for email notifications
- Google OAuth 2.0 SDK

**Environment Variables** (.env)

```
DATABASE_URL=postgresql://user:pass@localhost:5432/rishta
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=app-password
NODE_ENV=development
```

---

**Last Updated**: 2025-12-03 | Matrimonial Platform - Admin-Controlled Bio-Data Distribution
