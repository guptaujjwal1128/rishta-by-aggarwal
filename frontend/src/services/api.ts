import type {
  AuthResponse,
  AdminStats,
  AdminUser,
  NotificationRecord,
  ExtractionConfidence,
  Profile,
  ProfileDraft,
  ProfileFilters,
  User,
} from "../types/domain";

const API_BASE_URL =
  window.__APP_CONFIG__?.VITE_API_URL ||
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:4000/api";
const ASSET_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");
const TOKEN_KEY = "rishta_auth_token";

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

interface MessageResponse {
  message?: string;
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function assetUrl(url?: string) {
  if (!url) {
    return "";
  }
  if (url.startsWith("http")) {
    return url;
  }
  return `${ASSET_BASE_URL}${url}`;
}

async function parseMessage(response: Response) {
  try {
    const data = (await response.json()) as MessageResponse;
    return data.message;
  } catch {
    return undefined;
  }
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  const isFormData = options.body instanceof FormData;

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (!options.skipAuth) {
    const token = getStoredToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error((await parseMessage(response)) || "Request failed");
  }

  return (await response.json()) as T;
}

export async function register(payload: {
  name: string;
  email: string;
  phone: string;
  password: string;
}) {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify(payload),
  });
}

export async function login(payload: { identifier: string; password: string }) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify(payload),
  });
}

export async function socialLogin(payload: {
  provider: "google" | "facebook";
  name?: string;
  email?: string;
  phone?: string;
  credential?: string;
}) {
  return request<AuthResponse>("/auth/social", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify(payload),
  });
}

export async function getMe() {
  return request<{ user: User }>("/auth/me");
}

export async function listProfiles(filters: ProfileFilters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(
    ([key, value]: [string, string | undefined]) => {
      if (value !== undefined && value !== "") {
        params.set(key, value);
      }
    },
  );

  const query = params.toString();
  return request<{ profiles: Profile[] }>(
    `/profiles${query ? `?${query}` : ""}`,
  );
}

export async function getMyProfile() {
  return request<{ profile: Profile | null }>("/profiles/me");
}

export async function saveMyProfile(profile: ProfileDraft) {
  return request<{ profile: Profile }>("/profiles/me", {
    method: "PUT",
    body: JSON.stringify(profile),
  });
}

export async function importBiodata(file: File) {
  const formData = new FormData();
  formData.append("biodata", file);
  return request<{ draft: ProfileDraft }>("/profiles/import", {
    method: "POST",
    body: formData,
  });
}

export async function importBiodataWithAi(file?: File | File[], text?: string) {
  const formData = new FormData();
  if (Array.isArray(file)) {
    file.forEach((item) => formData.append("source", item));
  } else if (file) {
    formData.append("source", file);
  }
  if (text) {
    formData.append("text", text);
  }

  return request<{
    aiUsed: boolean;
    confidence: ExtractionConfidence;
    draft: ProfileDraft;
    extractedTextPreview?: string;
    sourceType: string;
  }>("/profiles/import-ai", {
    method: "POST",
    body: formData,
  });
}

export async function uploadProfilePhotos(profileId: string, files: File[]) {
  const formData = new FormData();
  files.forEach((file) => formData.append("photos", file));

  return request<{ profile: Profile }>(`/profiles/${profileId}/photos`, {
    method: "POST",
    body: formData,
  });
}

export async function fetchProfilePdf(profileId: string) {
  const token = getStoredToken();
  const response = await fetch(
    `${API_BASE_URL}/profiles/${profileId}/biodata.pdf`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    },
  );

  if (!response.ok) {
    throw new Error((await parseMessage(response)) || "Could not generate PDF");
  }

  return response.blob();
}

export async function listNotifications() {
  return request<{ notifications: NotificationRecord[] }>("/notifications");
}

export async function adminStats() {
  return request<{ stats: AdminStats }>("/admin/stats");
}

export async function adminListUsers() {
  return request<{ users: AdminUser[] }>("/admin/users");
}

export async function adminUpdateUser(
  userId: string,
  payload: {
    role?: "user" | "admin";
    canEditBio?: boolean;
    permissions?: Record<string, boolean>;
  },
) {
  return request<{ user: AdminUser }>(`/admin/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function adminNotifyUser(
  userId: string,
  payload: { channels: string[]; title?: string; message?: string },
) {
  return request<{ notifications: NotificationRecord[] }>(
    `/admin/users/${userId}/notify`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function adminListProfiles(filters: ProfileFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(
    ([key, value]: [string, string | undefined]) => {
      if (value !== undefined && value !== "") {
        params.set(key, value);
      }
    },
  );
  const query = params.toString();
  return request<{ profiles: Profile[] }>(
    `/admin/profiles${query ? `?${query}` : ""}`,
  );
}

export async function adminSetProfileLock(
  profileId: string,
  isLocked: boolean,
  reason?: string,
) {
  return request<{ profile: Profile }>(`/admin/profiles/${profileId}/lock`, {
    method: "PATCH",
    body: JSON.stringify({ isLocked, reason }),
  });
}

export async function adminSetProfileVerification(
  profileId: string,
  isVerified: boolean,
) {
  return request<{ profile: Profile }>(`/admin/profiles/${profileId}/verify`, {
    method: "PATCH",
    body: JSON.stringify({ isVerified }),
  });
}

export async function adminBulkUploadProfiles(
  file?: File | File[],
  text?: string,
) {
  const formData = new FormData();
  if (Array.isArray(file)) {
    file.forEach((item) => formData.append("source", item));
  } else if (file) {
    formData.append("source", file);
  }
  if (text) {
    formData.append("text", text);
  }
  return request<{
    created: Profile[];
    extractions?: ExtractionConfidence[];
    aiUsed?: boolean;
    sourceType?: string;
  }>("/admin/profiles/bulk-upload", {
    method: "POST",
    body: formData,
  });
}

export async function adminPreviewBulkProfiles(
  file?: File | File[],
  text?: string,
) {
  const formData = new FormData();
  if (Array.isArray(file)) {
    file.forEach((item) => formData.append("source", item));
  } else if (file) {
    formData.append("source", file);
  }
  if (text) {
    formData.append("text", text);
  }
  return request<{
    drafts: ProfileDraft[];
    confidence?: ExtractionConfidence;
    extractions?: ExtractionConfidence[];
    aiUsed?: boolean;
    sourceType?: string;
  }>("/admin/profiles/bulk-preview", {
    method: "POST",
    body: formData,
  });
}

export async function adminCreateReviewedProfiles(profiles: ProfileDraft[]) {
  return request<{ created: Profile[] }>("/admin/profiles/bulk-create", {
    method: "POST",
    body: JSON.stringify({ profiles }),
  });
}
