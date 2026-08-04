import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";

import {
  adminCreateReviewedProfiles,
  adminListProfiles,
  adminListUsers,
  adminModerateProfile,
  adminNotifyUser,
  adminPreviewBulkProfiles,
  adminStats,
  adminUpdateUser,
  extractProfile,
  listNotifications,
  listProfiles,
  getMyProfile,
  saveMyProfile,
  uploadMyProfilePhotos,
} from "../services/api";
import type {
  AdminStats,
  AdminUser,
  ExtractionConfidence,
  NotificationRecord,
  Profile,
  ProfileDraft,
  ProfileFilters,
} from "../types/domain";

interface ApiError {
  message: string;
}

function errorResult(error: unknown) {
  return {
    error: {
      message: error instanceof Error ? error.message : "Request failed",
    },
  };
}

export function apiErrorMessage(error: unknown, fallback: string) {
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
  return fallback;
}

export const api = createApi({
  reducerPath: "api",
  baseQuery: fakeBaseQuery<ApiError>(),
  tagTypes: [
    "AdminProfiles",
    "AdminStats",
    "AdminUsers",
    "MyProfile",
    "Notifications",
    "Profiles",
  ],
  endpoints: (builder) => ({
    profiles: builder.query<Profile[], ProfileFilters>({
      async queryFn(filters) {
        try {
          return { data: (await listProfiles(filters)).profiles };
        } catch (error) {
          return errorResult(error);
        }
      },
      providesTags: ["Profiles"],
    }),
    myProfile: builder.query<Profile | null, void>({
      async queryFn() {
        try {
          return { data: (await getMyProfile()).profile };
        } catch (error) {
          return errorResult(error);
        }
      },
      providesTags: ["MyProfile"],
    }),
    notifications: builder.query<NotificationRecord[], void>({
      async queryFn() {
        try {
          return { data: (await listNotifications()).notifications };
        } catch (error) {
          return errorResult(error);
        }
      },
      providesTags: ["Notifications"],
    }),
    adminStats: builder.query<AdminStats, void>({
      async queryFn() {
        try {
          return { data: (await adminStats()).stats };
        } catch (error) {
          return errorResult(error);
        }
      },
      providesTags: ["AdminStats"],
    }),
    adminUsers: builder.query<AdminUser[], void>({
      async queryFn() {
        try {
          return { data: (await adminListUsers()).users };
        } catch (error) {
          return errorResult(error);
        }
      },
      providesTags: ["AdminUsers"],
    }),
    adminProfiles: builder.query<Profile[], ProfileFilters | void>({
      async queryFn(filters) {
        try {
          return { data: (await adminListProfiles(filters ?? {})).profiles };
        } catch (error) {
          return errorResult(error);
        }
      },
      providesTags: ["AdminProfiles"],
    }),
    saveMyProfile: builder.mutation<Profile, ProfileDraft>({
      async queryFn(draft) {
        try {
          return { data: (await saveMyProfile(draft)).profile };
        } catch (error) {
          return errorResult(error);
        }
      },
      invalidatesTags: [
        "MyProfile",
        "Profiles",
        "AdminProfiles",
        "AdminStats",
        "AdminUsers",
      ],
    }),
    uploadProfilePhotos: builder.mutation<Profile, File[]>({
      async queryFn(files) {
        try {
          return { data: (await uploadMyProfilePhotos(files)).profile };
        } catch (error) {
          return errorResult(error);
        }
      },
      invalidatesTags: ["MyProfile", "Profiles", "AdminProfiles"],
    }),
    importProfile: builder.mutation<
      {
        aiUsed: boolean;
        confidence: ExtractionConfidence;
        draft: ProfileDraft;
        sourceType: string;
      },
      { files?: File[]; text?: string }
    >({
      async queryFn({ files, text }) {
        try {
          return { data: await extractProfile(files, text) };
        } catch (error) {
          return errorResult(error);
        }
      },
    }),
    updateAdminUser: builder.mutation<
      AdminUser,
      Parameters<typeof adminUpdateUser>
    >({
      async queryFn([userId, changes]) {
        try {
          return { data: (await adminUpdateUser(userId, changes)).user };
        } catch (error) {
          return errorResult(error);
        }
      },
      invalidatesTags: ["AdminUsers"],
    }),
    notifyAdminUser: builder.mutation<
      NotificationRecord[],
      Parameters<typeof adminNotifyUser>
    >({
      async queryFn([userId, payload]) {
        try {
          return {
            data: (await adminNotifyUser(userId, payload)).notifications,
          };
        } catch (error) {
          return errorResult(error);
        }
      },
      invalidatesTags: ["Notifications"],
    }),
    moderateProfile: builder.mutation<
      Profile,
      Parameters<typeof adminModerateProfile>
    >({
      async queryFn(args) {
        try {
          return { data: (await adminModerateProfile(...args)).profile };
        } catch (error) {
          return errorResult(error);
        }
      },
      invalidatesTags: [
        "AdminProfiles",
        "AdminStats",
        "AdminUsers",
        "MyProfile",
        "Profiles",
      ],
    }),
    previewBulkProfiles: builder.mutation<
      Awaited<ReturnType<typeof adminPreviewBulkProfiles>>,
      Parameters<typeof adminPreviewBulkProfiles>
    >({
      async queryFn(args) {
        try {
          return { data: await adminPreviewBulkProfiles(...args) };
        } catch (error) {
          return errorResult(error);
        }
      },
    }),
    createReviewedProfiles: builder.mutation<Profile[], ProfileDraft[]>({
      async queryFn(profiles) {
        try {
          return {
            data: (await adminCreateReviewedProfiles(profiles)).created,
          };
        } catch (error) {
          return errorResult(error);
        }
      },
      invalidatesTags: ["AdminProfiles", "AdminStats", "Profiles"],
    }),
  }),
});

export const {
  useAdminProfilesQuery,
  useAdminStatsQuery,
  useAdminUsersQuery,
  useCreateReviewedProfilesMutation,
  useImportProfileMutation,
  useModerateProfileMutation,
  useMyProfileQuery,
  useNotificationsQuery,
  useNotifyAdminUserMutation,
  usePreviewBulkProfilesMutation,
  useProfilesQuery,
  useSaveMyProfileMutation,
  useUpdateAdminUserMutation,
  useUploadProfilePhotosMutation,
} = api;
