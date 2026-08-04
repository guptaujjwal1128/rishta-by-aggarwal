import { useEffect, useState, type ChangeEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import VerifiedIcon from "@mui/icons-material/Verified";
import RemoveDoneIcon from "@mui/icons-material/RemoveDone";

import Header from "../../components/molecule/layout/header/Header";
import { hasPermission, Permissions } from "../../constants/permissions";
import { useAuth } from "../../context/AuthContext";
import {
  apiErrorMessage,
  useAdminProfilesQuery,
  useAdminStatsQuery,
  useCreateReviewedProfilesMutation,
  useModerateProfileMutation,
  usePreviewBulkProfilesMutation,
} from "../../store/api";
import { Content, ContentContainer } from "../../styles/Layout.styled";
import type {
  ExtractionConfidence,
  Profile,
  ProfileDraft,
} from "../../types/domain";

const completionFields: (keyof ProfileDraft)[] = [
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

function completionFor(profile: ProfileDraft | Profile) {
  const filled = completionFields.filter((field) => Boolean(profile[field]));
  return Math.round((filled.length / completionFields.length) * 100);
}

interface ReviewProfile {
  clientId: string;
  profile: ProfileDraft;
  confidence?: ExtractionConfidence;
}

const EMPTY_PROFILES: Profile[] = [];

const AdminDashboard = () => {
  const { user } = useAuth();
  const statsQuery = useAdminStatsQuery();
  const profilesQuery = useAdminProfilesQuery();
  const stats = statsQuery.data;
  const profiles = profilesQuery.data ?? EMPTY_PROFILES;
  const [previewBulkProfiles] = usePreviewBulkProfilesMutation();
  const [createReviewedProfiles] = useCreateReviewedProfilesMutation();
  const [moderateProfile] = useModerateProfileMutation();
  const canImport = hasPermission(user, Permissions.PROFILES_IMPORT);
  const canLock = hasPermission(user, Permissions.PROFILES_LOCK);
  const canVerify = hasPermission(user, Permissions.PROFILES_VERIFY);
  const [selectedProfileIds, setSelectedProfileIds] = useState<string[]>([]);
  const [bulkText, setBulkText] = useState("");
  const [reviewProfiles, setReviewProfiles] = useState<ReviewProfile[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);

  useEffect(() => {
    setSelectedProfileIds((current) => {
      const next = current.filter((id) =>
        profiles.some((profile) => profile.id === id),
      );
      return next.length === current.length ? current : next;
    });
  }, [profiles]);

  const handleBulkFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) {
      return;
    }
    setExtracting(true);
    setError("");
    setMessage("");
    try {
      const { drafts, extractions, sourceType } = await previewBulkProfiles([
        files,
      ]).unwrap();
      setReviewProfiles(
        drafts.map((profile, index) => ({
          clientId: crypto.randomUUID(),
          profile,
          confidence: extractions?.[index],
        })),
      );
      const fallbackCount = extractions?.filter(
        (item) => item.secondaryUsed,
      ).length;
      setMessage(
        `Extracted ${drafts.length} profile${drafts.length === 1 ? "" : "s"} for review (${sourceType}).${fallbackCount ? ` Secondary model used for ${fallbackCount}.` : ""} Nothing has been saved yet.`,
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not extract profiles",
      );
    } finally {
      setExtracting(false);
    }
  };

  const handleBulkText = async () => {
    setExtracting(true);
    setError("");
    setMessage("");
    try {
      const { drafts, extractions, sourceType } = await previewBulkProfiles([
        undefined,
        bulkText,
      ]).unwrap();
      setBulkText("");
      setReviewProfiles(
        drafts.map((profile, index) => ({
          clientId: crypto.randomUUID(),
          profile,
          confidence: extractions?.[index],
        })),
      );
      const score = extractions?.[0]?.score;
      setMessage(
        `Extracted ${drafts.length} profile${drafts.length === 1 ? "" : "s"} for review (${sourceType})${score === undefined ? "" : ` at ${Math.round(score * 100)}% confidence`}. Nothing has been saved yet.`,
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not extract profiles",
      );
    } finally {
      setExtracting(false);
    }
  };

  const updateReviewProfile = (
    index: number,
    field: keyof ProfileDraft,
    value: string,
  ) => {
    setReviewProfiles((current) =>
      current.map((reviewProfile, profileIndex) =>
        profileIndex === index
          ? {
              ...reviewProfile,
              profile: { ...reviewProfile.profile, [field]: value },
            }
          : reviewProfile,
      ),
    );
  };

  const removeReviewProfile = (index: number) => {
    setReviewProfiles((current) =>
      current.filter((_, profileIndex) => profileIndex !== index),
    );
  };

  const saveReviewedProfiles = async () => {
    if (!reviewProfiles.length) {
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const created = await createReviewedProfiles(
        reviewProfiles.map(({ profile }) => profile),
      ).unwrap();
      setReviewProfiles([]);
      setMessage(
        `Saved ${created.length} reviewed profile${created.length === 1 ? "" : "s"} as unverified.`,
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save reviewed profiles",
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleLock = async (profile: Profile) => {
    if (!profile.id) {
      return;
    }
    setError("");
    try {
      await moderateProfile([
        profile.id,
        {
          isLocked: !profile.isLocked,
          lockedReason: "Locked from admin dashboard",
        },
      ]).unwrap();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update profile lock",
      );
    }
  };

  const allProfileIds = profiles
    .map((profile) => profile.id)
    .filter(Boolean) as string[];
  const allSelected =
    allProfileIds.length > 0 &&
    selectedProfileIds.length === allProfileIds.length;
  const selectedProfiles = profiles.filter(
    (profile) => profile.id && selectedProfileIds.includes(profile.id),
  );
  const selectedAllLocked =
    selectedProfiles.length > 0 &&
    selectedProfiles.every((profile) => profile.isLocked);
  const selectedAllVerified =
    selectedProfiles.length > 0 &&
    selectedProfiles.every((profile) => profile.isVerified);

  const toggleProfileSelection = (profileId?: string) => {
    if (!profileId) {
      return;
    }
    setSelectedProfileIds((current) =>
      current.includes(profileId)
        ? current.filter((id) => id !== profileId)
        : [...current, profileId],
    );
  };

  const toggleAllProfiles = () => {
    setSelectedProfileIds(allSelected ? [] : allProfileIds);
  };

  const bulkSetLock = async (isLocked: boolean) => {
    if (!selectedProfileIds.length) {
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await Promise.all(
        selectedProfileIds.map((profileId) =>
          moderateProfile([
            profileId,
            {
              isLocked,
              lockedReason: isLocked ? "Bulk locked from admin dashboard" : "",
            },
          ]).unwrap(),
        ),
      );
      setMessage(
        `${isLocked ? "Locked" : "Unlocked"} ${selectedProfileIds.length} selected profile${
          selectedProfileIds.length === 1 ? "" : "s"
        }.`,
      );
      setSelectedProfileIds([]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not update selected profiles",
      );
    } finally {
      setLoading(false);
    }
  };

  const setVerification = async (profile: Profile, isVerified: boolean) => {
    if (!profile.id) {
      return;
    }
    setError("");
    try {
      await moderateProfile([profile.id, { isVerified }]).unwrap();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not update profile verification",
      );
    }
  };

  const bulkSetVerification = async (isVerified: boolean) => {
    if (!selectedProfileIds.length) {
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await Promise.all(
        selectedProfileIds.map((profileId) =>
          moderateProfile([profileId, { isVerified }]).unwrap(),
        ),
      );
      setMessage(
        `${isVerified ? "Verified" : "Marked unverified"} ${selectedProfileIds.length} selected profile${
          selectedProfileIds.length === 1 ? "" : "s"
        }.`,
      );
      setSelectedProfileIds([]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not update selected profiles",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ContentContainer>
      <Content component="header">
        <Header />
      </Content>
      <Divider flexItem />
      <Content
        component="main"
        sx={{ px: { xs: 2, sm: 4 }, py: 4, pb: { xs: 11, md: 4 } }}
      >
        <Stack gap={3}>
          <Box>
            <Typography variant="h3">Admin Dashboard</Typography>
            <Typography color="text.secondary">
              Profiles, locks, uploads, and platform health.
            </Typography>
          </Box>

          {error || statsQuery.error || profilesQuery.error ? (
            <Alert severity="error">
              {error ||
                apiErrorMessage(
                  statsQuery.error ?? profilesQuery.error,
                  "Could not load admin dashboard",
                )}
            </Alert>
          ) : null}
          {message ? <Alert severity="success">{message}</Alert> : null}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, minmax(0, 1fr))",
                md: "repeat(4, minmax(0, 1fr))",
              },
              gap: 2,
            }}
          >
            {[
              ["Users", stats?.users],
              ["Profiles", stats?.profiles],
              ["Verified", stats?.verified_profiles],
              ["Unverified", stats?.unverified_profiles],
              ["Locked", stats?.locked_profiles],
              ["Notifications", stats?.notifications],
            ].map(([label, value]) => (
              <Paper
                key={label}
                className="soft-card"
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: "border.secondary",
                  borderRadius: 1,
                  p: { xs: 1.5, md: 2 },
                }}
              >
                <Typography color="text.secondary">{label}</Typography>
                <Typography variant="h4">{value ?? "-"}</Typography>
              </Paper>
            ))}
          </Box>

          <Paper
            className="soft-card"
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "border.secondary",
              borderRadius: 1,
              p: 2,
            }}
          >
            <Stack gap={1.75}>
              <Stack direction="row" gap={1} alignItems="center">
                <SmartToyIcon color="primary" />
                <Box>
                  <Typography variant="h5">Admin Panel AI</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upload files, review extracted profiles, then save.
                  </Typography>
                </Box>
              </Stack>
              {extracting ? (
                <Alert
                  severity="info"
                  icon={<CircularProgress color="inherit" size={18} />}
                >
                  AI is extracting biodata. This can take a few seconds for PDFs
                  or images.
                </Alert>
              ) : null}
              <Stack
                direction={{ xs: "column", md: "row" }}
                gap={1.5}
                alignItems="stretch"
              >
                <Button
                  variant="contained"
                  component="label"
                  startIcon={<UploadFileIcon />}
                  disabled={!canImport || extracting || loading}
                  sx={{ minHeight: 44 }}
                >
                  {extracting ? "Extracting..." : "AI extract files"}
                  <input
                    hidden
                    multiple
                    type="file"
                    accept=".json,.txt,.csv,.pdf,.png,.jpg,.jpeg,.webp,application/json,text/plain,text/csv,application/pdf,image/*"
                    onChange={(event) => {
                      void handleBulkFile(event);
                    }}
                  />
                </Button>
                <TextField
                  label="Paste biodata text"
                  value={bulkText}
                  onChange={(event) => setBulkText(event.target.value)}
                  multiline
                  minRows={1}
                  maxRows={2}
                  fullWidth
                  placeholder="Optional: paste raw biodata text"
                  disabled={!canImport}
                />
                <Button
                  variant="outlined"
                  disabled={
                    !canImport || extracting || loading || !bulkText.trim()
                  }
                  onClick={() => void handleBulkText()}
                  sx={{ minHeight: 44, whiteSpace: "nowrap" }}
                >
                  Extract
                </Button>
              </Stack>
              {reviewProfiles.length ? (
                <Stack gap={2}>
                  <Divider />
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    justifyContent="space-between"
                    gap={2}
                  >
                    <Box>
                      <Typography variant="h6">Review before saving</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Edit or remove extracted profiles. Saving adds them to
                        the app as unverified.
                      </Typography>
                    </Box>
                    <Stack direction={{ xs: "column", sm: "row" }} gap={1}>
                      <Button
                        variant="outlined"
                        onClick={() => setReviewProfiles([])}
                      >
                        Clear review
                      </Button>
                      <Button
                        variant="contained"
                        disabled={!canImport || loading}
                        onClick={() => void saveReviewedProfiles()}
                      >
                        Save reviewed profiles
                      </Button>
                    </Stack>
                  </Stack>
                  {reviewProfiles.map(
                    ({ clientId, profile, confidence }, index) => (
                      <Paper
                        key={clientId}
                        elevation={0}
                        sx={{
                          border: "1px solid",
                          borderColor: "border.secondary",
                          borderRadius: 1,
                          p: 2,
                        }}
                      >
                        <Stack gap={2}>
                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            justifyContent="space-between"
                            gap={1}
                          >
                            <Box flex={1}>
                              <Stack
                                direction="row"
                                gap={1}
                                alignItems="center"
                                flexWrap="wrap"
                              >
                                <Typography variant="body2Bold">
                                  Review profile {index + 1}
                                </Typography>
                                <Chip
                                  size="small"
                                  color={
                                    completionFor(profile) < 80
                                      ? "warning"
                                      : "success"
                                  }
                                  label={`${completionFor(profile)}% complete`}
                                />
                                {confidence ? (
                                  <Chip
                                    size="small"
                                    color={
                                      confidence.level === "high"
                                        ? "success"
                                        : confidence.level === "medium"
                                          ? "warning"
                                          : "error"
                                    }
                                    label={`${Math.round(confidence.score * 100)}% extraction confidence${confidence.secondaryUsed ? " · fallback used" : ""}`}
                                  />
                                ) : null}
                              </Stack>
                              <LinearProgress
                                variant="determinate"
                                value={completionFor(profile)}
                                sx={{
                                  mt: 1,
                                  height: 6,
                                  borderRadius: 3,
                                  maxWidth: 320,
                                }}
                              />
                            </Box>
                            <Button
                              color="error"
                              size="small"
                              onClick={() => removeReviewProfile(index)}
                            >
                              Remove
                            </Button>
                          </Stack>
                          <Box
                            sx={{
                              display: "grid",
                              gridTemplateColumns: {
                                xs: "1fr",
                                md: "repeat(3, minmax(0, 1fr))",
                              },
                              gap: 1.5,
                            }}
                          >
                            {[
                              ["fullName", "Name"],
                              ["profileType", "Profile"],
                              ["dateOfBirth", "DOB"],
                              ["height", "Height"],
                              ["complexion", "Complexion"],
                              ["caste", "Caste"],
                              ["education", "Education"],
                              ["occupation", "Occupation"],
                              ["annualIncome", "Annual income"],
                              ["residence", "Residence"],
                              ["city", "City"],
                              ["contactPhone", "Phone"],
                            ].map(([field, label]) => (
                              <TextField
                                key={field}
                                size="small"
                                label={label}
                                value={String(
                                  profile[field as keyof ProfileDraft] ?? "",
                                )}
                                error={
                                  confidence?.fieldScores[field] !==
                                    undefined &&
                                  confidence.fieldScores[field] < 0.65
                                }
                                helperText={
                                  confidence?.fieldScores[field] === undefined
                                    ? undefined
                                    : `${Math.round(confidence.fieldScores[field] * 100)}% confidence`
                                }
                                onChange={(event) =>
                                  updateReviewProfile(
                                    index,
                                    field as keyof ProfileDraft,
                                    event.target.value,
                                  )
                                }
                              />
                            ))}
                          </Box>
                        </Stack>
                      </Paper>
                    ),
                  )}
                </Stack>
              ) : null}
            </Stack>
          </Paper>

          <Paper
            className="soft-card"
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "border.secondary",
              borderRadius: 1,
              p: 2,
            }}
          >
            <Stack gap={2}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "stretch", md: "center" }}
                gap={2}
              >
                <Box>
                  <Typography variant="h5">All Profiles</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Select profiles for bulk lock or unlock actions.
                  </Typography>
                </Box>
                <Stack direction={{ xs: "column", sm: "row" }} gap={1}>
                  <Button
                    variant="outlined"
                    disabled={loading}
                    onClick={toggleAllProfiles}
                  >
                    {allSelected ? "Clear selection" : "Select all"}
                  </Button>
                  {canLock ? (
                    <Button
                      variant="outlined"
                      disabled={loading || !selectedProfileIds.length}
                      startIcon={
                        selectedAllLocked ? <LockOpenIcon /> : <LockIcon />
                      }
                      onClick={() => void bulkSetLock(!selectedAllLocked)}
                    >
                      {selectedAllLocked ? "Unlock selected" : "Lock selected"}
                    </Button>
                  ) : null}
                  {canVerify ? (
                    <Button
                      variant="contained"
                      disabled={loading || !selectedProfileIds.length}
                      startIcon={
                        selectedAllVerified ? (
                          <RemoveDoneIcon />
                        ) : (
                          <VerifiedIcon />
                        )
                      }
                      onClick={() =>
                        void bulkSetVerification(!selectedAllVerified)
                      }
                    >
                      {selectedAllVerified
                        ? "Unverify selected"
                        : "Verify selected"}
                    </Button>
                  ) : null}
                </Stack>
              </Stack>
              {profiles.map((profile) => (
                <Stack
                  key={profile.id}
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  gap={2}
                  sx={{
                    borderTop: "1px solid",
                    borderColor: "border.secondary",
                    pt: 2,
                  }}
                >
                  <Stack direction="row" gap={1.5} alignItems="flex-start">
                    <Checkbox
                      checked={Boolean(
                        profile.id && selectedProfileIds.includes(profile.id),
                      )}
                      onChange={() => toggleProfileSelection(profile.id)}
                      inputProps={{
                        "aria-label": `Select ${profile.fullName || "profile"}`,
                      }}
                    />
                    <Box>
                      <Typography variant="body2Bold">
                        {profile.fullName || "Unnamed profile"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {[
                          profile.profileType,
                          profile.caste,
                          profile.city,
                          profile.occupation,
                        ]
                          .filter(Boolean)
                          .join(" | ")}
                      </Typography>
                      <Stack
                        direction="row"
                        gap={1}
                        alignItems="center"
                        sx={{ mt: 1, maxWidth: 280 }}
                      >
                        <LinearProgress
                          variant="determinate"
                          value={completionFor(profile)}
                          sx={{ height: 6, borderRadius: 3, flex: 1 }}
                        />
                        <Typography variant="body3Bold" color="text.secondary">
                          {completionFor(profile)}%
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    gap={1}
                    alignItems={{ xs: "stretch", sm: "center" }}
                    flexWrap="wrap"
                  >
                    {profile.isVerified ? (
                      <Chip label="Verified" color="success" />
                    ) : (
                      <Chip label="Unverified" color="default" />
                    )}
                    {profile.isLocked ? (
                      <Chip label="Locked" color="warning" />
                    ) : (
                      <Chip label="Editable" />
                    )}
                    {canVerify ? (
                      <Button
                        size="small"
                        variant={profile.isVerified ? "outlined" : "contained"}
                        startIcon={
                          profile.isVerified ? (
                            <RemoveDoneIcon />
                          ) : (
                            <VerifiedIcon />
                          )
                        }
                        onClick={() =>
                          void setVerification(profile, !profile.isVerified)
                        }
                      >
                        {profile.isVerified ? "Unverify" : "Verify"}
                      </Button>
                    ) : null}
                    {canLock ? (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={
                          profile.isLocked ? <LockOpenIcon /> : <LockIcon />
                        }
                        onClick={() => void toggleLock(profile)}
                      >
                        {profile.isLocked ? "Unlock" : "Lock"}
                      </Button>
                    ) : null}
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Paper>
        </Stack>
      </Content>
    </ContentContainer>
  );
};

export default AdminDashboard;
