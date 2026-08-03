import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import UploadFileIcon from "@mui/icons-material/UploadFile";

import {
  PrimaryButton,
  SecondaryButton,
} from "../../components/atom/button/Button";
import Header from "../../components/molecule/layout/header/Header";
import { useAuth } from "../../context/AuthContext";
import {
  assetUrl,
  fetchProfilePdf,
  getMyProfile,
  importBiodataWithAi,
  listNotifications,
  saveMyProfile,
  uploadProfilePhotos,
} from "../../services/api";
import { Content, ContentContainer } from "../../styles/Layout.styled";
import type {
  NotificationRecord,
  Profile as ProfileRecord,
  ProfileDraft,
} from "../../types/domain";

const steps = ["Personal", "Career", "Family", "Photos"];

const selectOptions = {
  profileType: ["bride", "groom"],
  gender: ["Female", "Male", "Other"],
  complexion: ["Fair", "Wheatish", "Dusky", "Very Fair", "Medium"],
  maritalStatus: ["Never Married", "Divorced", "Widowed", "Awaiting Divorce"],
  manglik: ["No", "Yes", "Partial", "Do not know"],
  familyType: ["Nuclear", "Joint"],
  familyValues: ["Traditional", "Moderate", "Liberal"],
  diet: ["Vegetarian", "Eggetarian", "Non-Vegetarian", "Vegan"],
  yesNo: ["No", "Yes", "Occasionally"],
};

const inputGridSx = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
  gap: 2,
};

const draftFields: (keyof ProfileDraft)[] = [
  "profileType",
  "fullName",
  "gender",
  "dateOfBirth",
  "timeOfBirth",
  "placeOfBirth",
  "height",
  "complexion",
  "caste",
  "subCaste",
  "gotra",
  "manglik",
  "rashi",
  "nakshatra",
  "maritalStatus",
  "motherTongue",
  "religion",
  "education",
  "occupation",
  "annualIncome",
  "workLocation",
  "fatherName",
  "fatherOccupation",
  "motherName",
  "motherOccupation",
  "siblings",
  "familyType",
  "familyValues",
  "residence",
  "city",
  "state",
  "country",
  "diet",
  "smoking",
  "drinking",
  "hobbies",
  "about",
  "partnerPreferences",
  "contactEmail",
  "contactPhone",
];

const requiredFields: (keyof ProfileDraft)[] = [
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

function emptyDraft(
  userName?: string,
  email?: string,
  phone?: string,
): ProfileDraft {
  return {
    profileType: "bride",
    fullName: userName || "",
    gender: "",
    religion: "Hindu",
    motherTongue: "Hindi",
    country: "India",
    diet: "Vegetarian",
    maritalStatus: "Never Married",
    manglik: "No",
    contactEmail: email || "",
    contactPhone: phone || "",
  };
}

function toDraft(profile: ProfileRecord): ProfileDraft {
  const draft: ProfileDraft = {};
  draftFields.forEach((field) => {
    const value = profile[field];
    if (value !== undefined) {
      (draft as Record<string, unknown>)[field] = value;
    }
  });
  return draft;
}

function fileSafeName(value: string) {
  return value
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

const Profile = () => {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState<ProfileDraft>(() =>
    emptyDraft(user?.name, user?.email, user?.phone),
  );
  const [savedProfile, setSavedProfile] = useState<ProfileRecord | null>(null);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void getMyProfile()
      .then(({ profile }) => {
        if (profile) {
          setSavedProfile(profile);
          setForm(toDraft(profile));
          setIsEditing(false);
          return;
        }
        setForm(emptyDraft(user?.name, user?.email, user?.phone));
        setIsEditing(true);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Could not load profile");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user?.email, user?.name, user?.phone]);

  useEffect(() => {
    void listNotifications()
      .then(({ notifications: nextNotifications }) => {
        setNotifications(
          nextNotifications.filter((item) => item.channel === "app"),
        );
      })
      .catch(() => {
        setNotifications([]);
      });
  }, []);

  const completion = useMemo(() => {
    const filled = requiredFields.filter((field) => Boolean(form[field]));
    return Math.round((filled.length / requiredFields.length) * 100);
  }, [form]);

  const visibleNotifications = useMemo(
    () =>
      notifications.filter((notification) => {
        const isCompletionReminder =
          /complete.*biodata|complete.*profile/i.test(
            `${notification.title} ${notification.message}`,
          );
        return !isCompletionReminder || completion < 100;
      }),
    [completion, notifications],
  );

  const updateField = (field: keyof ProfileDraft, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const renderText = (
    field: keyof ProfileDraft,
    label: string,
    options?: { multiline?: boolean; type?: string; fullWidth?: boolean },
  ) => (
    <TextField
      label={label}
      required={requiredFields.includes(field)}
      type={options?.type}
      value={form[field] ?? ""}
      slotProps={
        options?.type === "date" || options?.type === "time"
          ? { inputLabel: { shrink: true } }
          : undefined
      }
      onChange={(event) => {
        updateField(field, event.target.value);
      }}
      multiline={options?.multiline}
      minRows={options?.multiline ? 3 : undefined}
      sx={options?.fullWidth ? { gridColumn: "1 / -1" } : undefined}
    />
  );

  const renderSelect = (
    field: keyof ProfileDraft,
    label: string,
    values: string[],
  ) => (
    <FormControl required={requiredFields.includes(field)}>
      <InputLabel>{label}</InputLabel>
      <Select
        label={label}
        value={String(form[field] ?? "")}
        onChange={(event) => {
          updateField(field, event.target.value);
        }}
      >
        {values.map((value) => (
          <MenuItem key={value} value={value}>
            {value}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) {
      return;
    }

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    setError("");
    setMessage("");
    setImporting(true);
    try {
      const { draft, aiUsed, confidence, sourceType } =
        await importBiodataWithAi(files);
      setForm((current) => ({ ...current, ...draft }));
      if (imageFiles.length) {
        setPhotoFiles((current) => [...current, ...imageFiles].slice(0, 5));
      }
      setActiveStep(0);
      setIsEditing(true);
      setMessage(
        `${aiUsed ? "AI extracted" : "Imported"} ${files.length} file${
          files.length === 1 ? "" : "s"
        } (${sourceType}, ${Math.round(confidence.score * 100)}% confidence${confidence.secondaryUsed ? ", secondary model used" : ""}). ${
          imageFiles.length
            ? `${imageFiles.length} image file${imageFiles.length === 1 ? "" : "s"} added as photos. `
            : ""
        }Review the filled details and save.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not import biodata");
    } finally {
      setImporting(false);
    }
  };

  const handlePhotos = (event: ChangeEvent<HTMLInputElement>) => {
    setPhotoFiles(Array.from(event.target.files ?? []).slice(0, 5));
  };

  const saveProfile = async () => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const { profile } = await saveMyProfile(form);
      let latest = profile;
      if (profile.id && photoFiles.length) {
        const uploaded = await uploadProfilePhotos(profile.id, photoFiles);
        latest = uploaded.profile;
      }
      setSavedProfile(latest);
      setForm(toDraft(latest));
      setPhotoFiles([]);
      setIsEditing(false);
      setMessage("Biodata saved successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save biodata");
    } finally {
      setSaving(false);
    }
  };

  const downloadPdf = async () => {
    if (!savedProfile?.id) {
      return;
    }
    setError("");
    try {
      const blob = await fetchProfilePdf(savedProfile.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${fileSafeName(savedProfile.fullName || "profile")}-biodata.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not download PDF");
    }
  };

  const personalStep = (
    <Box sx={inputGridSx}>
      {renderSelect("profileType", "Profile type", selectOptions.profileType)}
      {renderSelect("gender", "Gender", selectOptions.gender)}
      {renderText("fullName", "Name")}
      {renderText("dateOfBirth", "Date of birth", { type: "date" })}
      {renderText("timeOfBirth", "Time of birth", { type: "time" })}
      {renderText("placeOfBirth", "Place of birth")}
      {renderText("height", "Height")}
      {renderSelect("complexion", "Complexion", selectOptions.complexion)}
      {renderText("caste", "Caste")}
      {renderText("subCaste", "Sub-caste")}
      {renderText("gotra", "Gotra")}
      {renderSelect("manglik", "Manglik", selectOptions.manglik)}
      {renderText("rashi", "Rashi")}
      {renderText("nakshatra", "Nakshatra")}
      {renderSelect(
        "maritalStatus",
        "Marital status",
        selectOptions.maritalStatus,
      )}
      {renderText("motherTongue", "Mother tongue")}
      {renderText("religion", "Religion")}
    </Box>
  );

  const careerStep = (
    <Box sx={inputGridSx}>
      {renderText("education", "Education", {
        multiline: true,
        fullWidth: true,
      })}
      {renderText("occupation", "Occupation")}
      {renderText("annualIncome", "Annual income", { type: "number" })}
      {renderText("workLocation", "Work location")}
      {renderText("about", "About the candidate", {
        multiline: true,
        fullWidth: true,
      })}
    </Box>
  );

  const familyStep = (
    <Box sx={inputGridSx}>
      {renderText("fatherName", "Father's name")}
      {renderText("fatherOccupation", "Father's occupation")}
      {renderText("motherName", "Mother's name")}
      {renderText("motherOccupation", "Mother's occupation")}
      {renderText("siblings", "Siblings", { fullWidth: true })}
      {renderSelect("familyType", "Family type", selectOptions.familyType)}
      {renderSelect(
        "familyValues",
        "Family values",
        selectOptions.familyValues,
      )}
      {renderText("residence", "Residence", { fullWidth: true })}
      {renderText("city", "City")}
      {renderText("state", "State")}
      {renderText("country", "Country")}
      {renderSelect("diet", "Food preference", selectOptions.diet)}
      {renderSelect("smoking", "Smoking", selectOptions.yesNo)}
      {renderSelect("drinking", "Drinking", selectOptions.yesNo)}
      {renderText("hobbies", "Hobbies", { multiline: true, fullWidth: true })}
    </Box>
  );

  const photoStep = (
    <Stack gap={3}>
      <Box sx={inputGridSx}>
        {renderText("partnerPreferences", "Partner preferences", {
          multiline: true,
          fullWidth: true,
        })}
        {renderText("contactEmail", "Contact email")}
        {renderText("contactPhone", "Contact phone")}
      </Box>

      <Stack direction={{ xs: "column", sm: "row" }} gap={2}>
        <Button
          variant="outlined"
          component="label"
          startIcon={<UploadFileIcon />}
        >
          Upload photos
          <input
            hidden
            multiple
            type="file"
            accept="image/*"
            onChange={handlePhotos}
          />
        </Button>
      </Stack>

      <Stack gap={1}>
        <Typography variant="body2Bold">Photos</Typography>
        <Stack direction="row" gap={1.5} flexWrap="wrap">
          {(savedProfile?.photos ?? []).map((photo) => (
            <Box
              key={photo.id}
              component="img"
              src={assetUrl(photo.url)}
              alt={photo.originalName}
              sx={{
                width: 96,
                height: 116,
                objectFit: "cover",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "border.secondary",
              }}
            />
          ))}
          {photoFiles.map((file) => (
            <Chip
              key={`${file.name}-${file.lastModified}`}
              label={file.name}
              onDelete={() => {
                setPhotoFiles((current) =>
                  current.filter((item) => item !== file),
                );
              }}
            />
          ))}
          {!savedProfile?.photos?.length && !photoFiles.length ? (
            <Typography variant="body2" color="text.secondary">
              Add up to five clear candidate photos for the gallery and PDF.
            </Typography>
          ) : null}
        </Stack>
      </Stack>
    </Stack>
  );

  const stepContent = [personalStep, careerStep, familyStep, photoStep][
    activeStep
  ];
  const editLocked = Boolean(
    savedProfile?.isLocked || user?.canEditBio === false,
  );

  const readableGroups = [
    {
      title: "Personal",
      rows: [
        ["Name", form.fullName],
        ["Profile", form.profileType],
        ["Date of birth", form.dateOfBirth],
        ["Place of birth", form.placeOfBirth],
        ["Height", form.height],
        ["Complexion", form.complexion],
        ["Caste", [form.caste, form.subCaste].filter(Boolean).join(" - ")],
        ["Manglik", form.manglik],
      ],
    },
    {
      title: "Career",
      rows: [
        ["Education", form.education],
        ["Occupation", form.occupation],
        [
          "Annual income",
          form.annualIncome
            ? `Rs ${Number(form.annualIncome).toLocaleString("en-IN")}`
            : "",
        ],
        ["Work location", form.workLocation],
      ],
    },
    {
      title: "Family",
      rows: [
        ["Father", form.fatherName],
        ["Mother", form.motherName],
        ["Siblings", form.siblings],
        ["Residence", form.residence],
        ["Food preference", form.diet],
      ],
    },
    {
      title: "Preferences",
      rows: [
        ["About", form.about],
        ["Partner preferences", form.partnerPreferences],
        [
          "Contact",
          [form.contactEmail, form.contactPhone].filter(Boolean).join(" | "),
        ],
      ],
    },
  ];

  return (
    <ContentContainer>
      <Content component="header">
        <Header />
      </Content>
      <Divider flexItem />
      <Content
        component="main"
        sx={{
          px: { xs: 2, sm: 4 },
          py: { xs: 4, md: 6 },
          pb: { xs: 11, md: 6 },
        }}
      >
        <Stack gap={3}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            gap={2}
          >
            <Box>
              <Typography variant="h3" component="h1">
                Bride/Groom Biodata
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Upload biodata first, then review the filled details before
                saving.
              </Typography>
            </Box>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              gap={1}
              alignItems={{ xs: "stretch", sm: "center" }}
            >
              <Chip label={`${completion}% complete`} color="primary" />
              <SecondaryButton
                disabled={!savedProfile?.id}
                startIcon={<DownloadIcon />}
                onClick={() => {
                  void downloadPdf();
                }}
              >
                Download PDF
              </SecondaryButton>
              {!isEditing ? (
                <SecondaryButton
                  disabled={editLocked}
                  startIcon={<EditIcon />}
                  onClick={() => {
                    setIsEditing(true);
                  }}
                >
                  Edit
                </SecondaryButton>
              ) : null}
            </Stack>
          </Stack>

          {editLocked && savedProfile ? (
            <Alert severity="info">
              Admin has locked biodata editing for this profile. You can still
              view and download it.
            </Alert>
          ) : null}

          {error ? <Alert severity="error">{error}</Alert> : null}
          {message ? <Alert severity="success">{message}</Alert> : null}
          {visibleNotifications.slice(0, 3).map((notification) => (
            <Alert key={notification.id} severity="info">
              <strong>{notification.title}</strong> {notification.message}
            </Alert>
          ))}

          <Paper
            className="soft-card page-rise"
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "border.secondary",
              borderRadius: 1,
              p: { xs: 2, md: 2.5 },
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,248,241,0.82))",
            }}
          >
            <Stack gap={2.25}>
              <Stack
                direction="row"
                gap={1}
                alignItems="center"
                flexWrap="wrap"
              >
                <Chip
                  icon={<UploadFileIcon />}
                  color="primary"
                  label="Upload document"
                />
                <Typography variant="body2" color="text.secondary">
                  AI can prefill the form. You can review and edit everything
                  below.
                </Typography>
              </Stack>

              {importing ? (
                <Alert
                  severity="info"
                  icon={<CircularProgress color="inherit" size={18} />}
                >
                  AI is extracting your biodata. Review the filled details after
                  it completes.
                </Alert>
              ) : null}

              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "stretch", sm: "center" }}
                gap={2}
              >
                <Box>
                  <Typography variant="body2Bold">
                    Upload and auto-fill
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Select one or more image, PDF, text, CSV, or JSON files.
                    Image files are also saved as photos.
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  component="label"
                  disabled={importing}
                  startIcon={
                    importing ? (
                      <CircularProgress color="inherit" size={18} />
                    ) : (
                      <UploadFileIcon />
                    )
                  }
                  sx={{ alignSelf: { xs: "stretch", sm: "center" } }}
                >
                  {importing ? "Extracting..." : "Upload biodata"}
                  <input
                    hidden
                    multiple
                    type="file"
                    accept=".json,.txt,.csv,.pdf,.png,.jpg,.jpeg,.webp,application/json,text/plain,text/csv,application/pdf,image/png,image/jpeg,image/webp"
                    onChange={(event) => {
                      void handleImport(event);
                    }}
                  />
                </Button>
              </Stack>
            </Stack>
          </Paper>

          <Paper
            className="soft-card"
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "border.secondary",
              borderRadius: 1,
              p: { xs: 2, md: 3 },
              backgroundColor: "rgba(255,255,255,0.92)",
            }}
          >
            {loading ? (
              <Box minHeight={360} display="grid" sx={{ placeItems: "center" }}>
                <CircularProgress />
              </Box>
            ) : !isEditing ? (
              <Stack gap={3}>
                <Stack direction={{ xs: "column", md: "row" }} gap={3}>
                  {savedProfile?.photos?.[0] ? (
                    <Box
                      component="img"
                      src={assetUrl(savedProfile.photos[0].url)}
                      alt={savedProfile.photos[0].originalName}
                      sx={{
                        width: { xs: "100%", md: 220 },
                        height: 280,
                        objectFit: "cover",
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "border.secondary",
                      }}
                    />
                  ) : null}
                  <Stack gap={2} flex={1}>
                    <Typography variant="h4">
                      {form.fullName || "Biodata"}
                    </Typography>
                    <Typography color="text.secondary">
                      {[form.profileType, form.caste, form.city, form.state]
                        .filter(Boolean)
                        .join(" | ")}
                    </Typography>
                    <Typography>
                      {form.about || "No introduction added yet."}
                    </Typography>
                  </Stack>
                </Stack>

                {readableGroups.map((group) => (
                  <Box key={group.title}>
                    <Typography variant="h6" mb={1}>
                      {group.title}
                    </Typography>
                    <Box sx={inputGridSx}>
                      {group.rows
                        .filter(([, value]) => Boolean(value))
                        .map(([label, value]) => (
                          <Box key={label}>
                            <Typography variant="body2" color="text.secondary">
                              {label}
                            </Typography>
                            <Typography>{value}</Typography>
                          </Box>
                        ))}
                    </Box>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Stack gap={3}>
                <Stepper activeStep={activeStep} alternativeLabel>
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>

                <Divider />
                {stepContent}
                <Divider />

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  gap={2}
                >
                  <SecondaryButton
                    disabled={activeStep === 0}
                    onClick={() => {
                      setActiveStep((step) => Math.max(step - 1, 0));
                    }}
                  >
                    Back
                  </SecondaryButton>
                  <Stack direction={{ xs: "column", sm: "row" }} gap={1.5}>
                    {activeStep < steps.length - 1 ? (
                      <PrimaryButton
                        onClick={() => {
                          setActiveStep((step) =>
                            Math.min(step + 1, steps.length - 1),
                          );
                        }}
                      >
                        Continue
                      </PrimaryButton>
                    ) : null}
                    <PrimaryButton
                      startIcon={<SaveIcon />}
                      disabled={saving}
                      onClick={() => {
                        void saveProfile();
                      }}
                    >
                      {saving ? "Saving..." : "Save Biodata"}
                    </PrimaryButton>
                  </Stack>
                </Stack>
              </Stack>
            )}
          </Paper>
        </Stack>
      </Content>
    </ContentContainer>
  );
};

export default Profile;
