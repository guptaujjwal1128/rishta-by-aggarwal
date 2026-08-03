export type AuthProvider = "password" | "google" | "facebook";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "user" | "admin";
  authProvider: AuthProvider;
  canEditBio?: boolean;
  permissions: Record<string, boolean>;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ExtractionConfidence {
  score: number;
  level: "high" | "medium" | "low";
  fieldScores: Record<string, number>;
  threshold: number;
  modelTier: "primary" | "secondary" | "none";
  secondaryUsed: boolean;
  secondaryAttempted?: boolean;
  primaryScore?: number;
  secondaryFailed?: boolean;
}

export interface ProfilePhoto {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  url: string;
  uploadedAt: string;
}

export interface Profile {
  id?: string;
  userId?: string;
  profileType?: "bride" | "groom";
  fullName?: string;
  gender?: string;
  dateOfBirth?: string;
  timeOfBirth?: string;
  placeOfBirth?: string;
  height?: string;
  complexion?: string;
  caste?: string;
  subCaste?: string;
  gotra?: string;
  manglik?: string;
  rashi?: string;
  nakshatra?: string;
  maritalStatus?: string;
  motherTongue?: string;
  religion?: string;
  education?: string;
  occupation?: string;
  annualIncome?: number | string;
  workLocation?: string;
  fatherName?: string;
  fatherOccupation?: string;
  motherName?: string;
  motherOccupation?: string;
  siblings?: string;
  familyType?: string;
  familyValues?: string;
  residence?: string;
  city?: string;
  state?: string;
  country?: string;
  diet?: string;
  smoking?: string;
  drinking?: string;
  hobbies?: string;
  about?: string;
  partnerPreferences?: string;
  contactEmail?: string;
  contactPhone?: string;
  photos?: ProfilePhoto[];
  photoUrls?: string[];
  age?: number | null;
  isLocked?: boolean;
  lockedAt?: string | null;
  lockedReason?: string | null;
  isVerified?: boolean;
  verifiedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type ProfileDraft = Omit<
  Profile,
  "id" | "userId" | "photos" | "photoUrls" | "age" | "createdAt" | "updatedAt"
>;

export interface ProfileFilters {
  search?: string;
  profileType?: string;
  gender?: string;
  location?: string;
  caste?: string;
  complexion?: string;
  maritalStatus?: string;
  diet?: string;
  minAge?: string;
  maxAge?: string;
  minIncome?: string;
  maxIncome?: string;
}

export interface AdminUser extends User {
  profileId?: string;
  profileName?: string;
  profileLocked?: boolean;
  profileUpdatedAt?: string;
  completion: number;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  channel: "app" | "email" | "whatsapp";
  title: string;
  message: string;
  status: string;
  createdAt: string;
  readAt?: string | null;
}

export interface AdminStats {
  users: number;
  profiles: number;
  verified_profiles: number;
  unverified_profiles: number;
  locked_profiles: number;
  notifications: number;
}
