import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import CakeIcon from "@mui/icons-material/Cake";
import DownloadIcon from "@mui/icons-material/Download";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SearchIcon from "@mui/icons-material/Search";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import WorkIcon from "@mui/icons-material/Work";

import {
  PrimaryButton,
  SecondaryButton,
} from "../../components/atom/button/Button";
import Header from "../../components/molecule/layout/header/Header";
import { assetUrl, fetchProfilePdf, listProfiles } from "../../services/api";
import { Content, ContentContainer } from "../../styles/Layout.styled";
import type { Profile, ProfileFilters } from "../../types/domain";

const blankFilters: ProfileFilters = {
  search: "",
  profileType: "",
  gender: "",
  location: "",
  caste: "",
  complexion: "",
  maritalStatus: "",
  diet: "",
  minAge: "",
  maxAge: "",
  minIncome: "",
  maxIncome: "",
};

const options = {
  profileType: ["bride", "groom"],
  gender: ["Female", "Male", "Other"],
  complexion: ["Fair", "Wheatish", "Dusky", "Very Fair", "Medium"],
  maritalStatus: ["Never Married", "Divorced", "Widowed", "Awaiting Divorce"],
  diet: ["Vegetarian", "Eggetarian", "Non-Vegetarian", "Vegan"],
};

function fileSafeName(value: string) {
  return value
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function formatIncome(value: Profile["annualIncome"]) {
  if (!value) {
    return "Income not shared";
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return String(value);
  }
  return `INR ${new Intl.NumberFormat("en-IN").format(numeric)}`;
}

function profileInitial(profile: Profile) {
  return (profile.fullName || "P").slice(0, 1).toUpperCase();
}

const Dashboard = () => {
  const [draftFilters, setDraftFilters] =
    useState<ProfileFilters>(blankFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<ProfileFilters>(blankFilters);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [viewMode, setViewMode] = useState<"gallery" | "list">("gallery");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    void listProfiles(appliedFilters)
      .then(({ profiles: nextProfiles }) => {
        setProfiles(nextProfiles);
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Could not load profiles",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [appliedFilters]);

  const activeFilterCount = useMemo(
    () => Object.values(appliedFilters).filter(Boolean).length,
    [appliedFilters],
  );

  const activeFilterChips = useMemo(() => {
    const labels: Partial<Record<keyof ProfileFilters, string>> = {
      search: "Search",
      profileType: "Profile",
      gender: "Gender",
      location: "Location",
      caste: "Caste",
      complexion: "Complexion",
      maritalStatus: "Marital",
      diet: "Food",
      minAge: "Min age",
      maxAge: "Max age",
      minIncome: "Min income",
      maxIncome: "Max income",
    };

    return Object.entries(appliedFilters)
      .filter(([, value]) => Boolean(value))
      .map(([key, value]) => ({
        key: key as keyof ProfileFilters,
        label: `${labels[key as keyof ProfileFilters] || key}: ${value}`,
      }));
  }, [appliedFilters]);

  const updateFilter = (field: keyof ProfileFilters, value: string) => {
    setDraftFilters((current) => ({ ...current, [field]: value }));
  };

  const resetFilters = () => {
    setDraftFilters(blankFilters);
    setAppliedFilters(blankFilters);
  };

  const removeAppliedFilter = (field: keyof ProfileFilters) => {
    setDraftFilters((current) => ({ ...current, [field]: "" }));
    setAppliedFilters((current) => ({ ...current, [field]: "" }));
  };

  const downloadPdf = async (profile: Profile) => {
    if (!profile.id) {
      return;
    }
    setError("");
    try {
      const blob = await fetchProfilePdf(profile.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${fileSafeName(profile.fullName || "profile")}-biodata.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not download PDF");
    }
  };

  const renderSelect = (
    field: keyof ProfileFilters,
    label: string,
    values: string[],
  ) => (
    <FormControl size="small">
      <InputLabel>{label}</InputLabel>
      <Select
        label={label}
        value={draftFilters[field] || ""}
        onChange={(event) => {
          updateFilter(field, event.target.value);
        }}
      >
        <MenuItem value="">Any</MenuItem>
        {values.map((value) => (
          <MenuItem key={value} value={value}>
            {value}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

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
                Profile Gallery
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Search and filter bride/groom biodata by location, age, caste,
                complexion, food preference, work, and income.
              </Typography>
            </Box>
            <Button
              variant={filtersOpen ? "contained" : "outlined"}
              startIcon={<FilterAltIcon />}
              onClick={() => setFiltersOpen((current) => !current)}
              sx={{ alignSelf: { xs: "stretch", md: "center" } }}
            >
              {filtersOpen
                ? "Hide filters"
                : `Filters${activeFilterCount ? ` (${activeFilterCount})` : ""}`}
            </Button>
          </Stack>

          {error ? <Alert severity="error">{error}</Alert> : null}

          <Paper
            className="soft-card page-rise"
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "border.secondary",
              borderRadius: 1,
              p: { xs: 2, md: 3 },
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,248,241,0.78))",
            }}
          >
            <Stack gap={2}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "1fr auto",
                  },
                  gap: 1.5,
                  alignItems: "center",
                }}
              >
                <TextField
                  size="small"
                  label="Search name, education, occupation"
                  value={draftFilters.search}
                  onChange={(event) => {
                    updateFilter("search", event.target.value);
                  }}
                  InputProps={{
                    startAdornment: (
                      <SearchIcon color="action" sx={{ mr: 1 }} />
                    ),
                  }}
                />
                <PrimaryButton
                  startIcon={<SearchIcon />}
                  onClick={() => {
                    setAppliedFilters(draftFilters);
                  }}
                >
                  Search
                </PrimaryButton>
              </Box>

              {activeFilterChips.length ? (
                <Stack direction="row" gap={1} flexWrap="wrap">
                  {activeFilterChips.map((filter) => (
                    <Chip
                      key={filter.key}
                      label={filter.label}
                      color="primary"
                      variant="outlined"
                      onDelete={() => removeAppliedFilter(filter.key)}
                    />
                  ))}
                  <Chip label="Clear all" onClick={resetFilters} />
                </Stack>
              ) : null}

              <Collapse in={filtersOpen} timeout="auto" unmountOnExit>
                <Stack gap={2} sx={{ pt: 1 }}>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, minmax(0, 1fr))",
                        md: "repeat(4, minmax(0, 1fr))",
                      },
                      gap: 1.5,
                    }}
                  >
                    {renderSelect(
                      "profileType",
                      "Profile",
                      options.profileType,
                    )}
                    {renderSelect(
                      "complexion",
                      "Complexion",
                      options.complexion,
                    )}
                    {renderSelect("diet", "Food", options.diet)}
                    {renderSelect("gender", "Gender", options.gender)}
                    <TextField
                      size="small"
                      label="Location"
                      value={draftFilters.location}
                      onChange={(event) => {
                        updateFilter("location", event.target.value);
                      }}
                    />
                    <TextField
                      size="small"
                      label="Caste"
                      value={draftFilters.caste}
                      onChange={(event) => {
                        updateFilter("caste", event.target.value);
                      }}
                    />
                    <TextField
                      size="small"
                      type="number"
                      label="Min age"
                      value={draftFilters.minAge}
                      onChange={(event) => {
                        updateFilter("minAge", event.target.value);
                      }}
                    />
                    <TextField
                      size="small"
                      type="number"
                      label="Max age"
                      value={draftFilters.maxAge}
                      onChange={(event) => {
                        updateFilter("maxAge", event.target.value);
                      }}
                    />
                    {renderSelect(
                      "maritalStatus",
                      "Marital",
                      options.maritalStatus,
                    )}
                    <TextField
                      size="small"
                      type="number"
                      label="Min income"
                      value={draftFilters.minIncome}
                      onChange={(event) => {
                        updateFilter("minIncome", event.target.value);
                      }}
                    />
                    <TextField
                      size="small"
                      type="number"
                      label="Max income"
                      value={draftFilters.maxIncome}
                      onChange={(event) => {
                        updateFilter("maxIncome", event.target.value);
                      }}
                    />
                  </Box>

                  <Stack direction={{ xs: "column", sm: "row" }} gap={1.5}>
                    <PrimaryButton
                      startIcon={<FilterAltIcon />}
                      onClick={() => {
                        setAppliedFilters(draftFilters);
                        setFiltersOpen(false);
                      }}
                    >
                      Apply filters
                    </PrimaryButton>
                    <SecondaryButton onClick={resetFilters}>
                      Reset
                    </SecondaryButton>
                  </Stack>
                </Stack>
              </Collapse>
            </Stack>
          </Paper>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
            gap={1.5}
          >
            <Typography variant="body2" color="text.secondary">
              Showing verified profiles only
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={viewMode}
              onChange={(_, value: "gallery" | "list" | null) => {
                if (value) {
                  setViewMode(value);
                }
              }}
              sx={{
                alignSelf: { xs: "stretch", sm: "center" },
                borderRadius: 2,
                backgroundColor: "rgba(255,255,255,0.72)",
                p: 0.5,
                ".MuiToggleButton-root": {
                  flex: { xs: 1, sm: "initial" },
                  border: 0,
                  borderRadius: 1.5,
                  px: 2,
                  gap: 0.75,
                },
                ".Mui-selected": {
                  backgroundColor: "#FFFFFF !important",
                  color: "primary.main",
                  boxShadow: "0 6px 18px rgba(69, 42, 28, 0.12)",
                },
              }}
            >
              <ToggleButton value="gallery">
                <ViewModuleIcon fontSize="small" />
                Gallery
              </ToggleButton>
              <ToggleButton value="list">
                <ViewListIcon fontSize="small" />
                List
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          {loading ? (
            <Box minHeight={320} display="grid" sx={{ placeItems: "center" }}>
              <CircularProgress />
            </Box>
          ) : profiles.length ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs:
                    viewMode === "gallery"
                      ? "repeat(2, minmax(0, 1fr))"
                      : "1fr",
                  sm:
                    viewMode === "gallery"
                      ? "repeat(2, minmax(0, 1fr))"
                      : "1fr",
                  lg:
                    viewMode === "gallery"
                      ? "repeat(3, minmax(0, 1fr))"
                      : "1fr",
                },
                gap: 2,
              }}
            >
              {profiles.map((profile) => {
                const photo = profile.photos?.[0]?.url;
                return (
                  <Paper
                    className="soft-card"
                    key={profile.id}
                    elevation={0}
                    sx={{
                      border: "1px solid",
                      borderColor: "border.secondary",
                      borderRadius: 1,
                      overflow: "hidden",
                      backgroundColor: "rgba(255,255,255,0.9)",
                      display: viewMode === "list" ? { sm: "grid" } : "block",
                      gridTemplateColumns:
                        viewMode === "list" ? { sm: "220px 1fr" } : undefined,
                    }}
                  >
                    <Box
                      sx={{
                        height: {
                          xs: viewMode === "gallery" ? 170 : 220,
                          sm: viewMode === "gallery" ? 210 : "100%",
                        },
                        minHeight:
                          viewMode === "list" ? { sm: 220 } : undefined,
                        backgroundColor: "background.tertiary",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      {photo ? (
                        <Box
                          component="img"
                          src={assetUrl(photo)}
                          alt={profile.fullName}
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition: "transform 260ms ease",
                            ".soft-card:hover &": { transform: "scale(1.025)" },
                          }}
                        />
                      ) : (
                        <Avatar
                          sx={{
                            width: 92,
                            height: 92,
                            bgcolor: "primary.main",
                            fontSize: 36,
                          }}
                        >
                          {profileInitial(profile)}
                        </Avatar>
                      )}
                    </Box>
                    <Stack gap={1.5} sx={{ p: { xs: 1.5, sm: 2 } }}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        gap={1}
                      >
                        <Box>
                          <Typography
                            variant="h5"
                            component="h2"
                            sx={{ fontSize: { xs: "1rem", md: "1.375rem" } }}
                          >
                            {profile.fullName || "Unnamed profile"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {[profile.profileType, profile.caste]
                              .filter(Boolean)
                              .join(" | ")}
                          </Typography>
                        </Box>
                        {profile.age ? (
                          <Chip size="small" label={`${profile.age} yrs`} />
                        ) : null}
                      </Stack>

                      <Stack gap={0.75}>
                        <Typography variant="body2" color="text.secondary">
                          <LocationOnIcon fontSize="inherit" />{" "}
                          {[profile.city, profile.state, profile.country]
                            .filter(Boolean)
                            .join(", ") || "Location not shared"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <WorkIcon fontSize="inherit" />{" "}
                          {profile.occupation || "Occupation not shared"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <CakeIcon fontSize="inherit" />{" "}
                          {[profile.height, profile.complexion]
                            .filter(Boolean)
                            .join(" | ") || "Personal details pending"}
                        </Typography>
                      </Stack>

                      <Stack
                        direction="row"
                        gap={1}
                        flexWrap="wrap"
                        sx={{
                          display: {
                            xs: viewMode === "gallery" ? "none" : "flex",
                            sm: "flex",
                          },
                        }}
                      >
                        {profile.diet ? (
                          <Chip size="small" label={profile.diet} />
                        ) : null}
                        {profile.maritalStatus ? (
                          <Chip size="small" label={profile.maritalStatus} />
                        ) : null}
                        <Chip
                          size="small"
                          label={formatIncome(profile.annualIncome)}
                        />
                      </Stack>

                      <Stack direction={{ xs: "column", sm: "row" }} gap={1}>
                        <SecondaryButton
                          fullWidth
                          onClick={() => {
                            setSelectedProfile(profile);
                          }}
                        >
                          View
                        </SecondaryButton>
                        <PrimaryButton
                          fullWidth
                          startIcon={<DownloadIcon />}
                          onClick={() => {
                            void downloadPdf(profile);
                          }}
                        >
                          PDF
                        </PrimaryButton>
                      </Stack>
                    </Stack>
                  </Paper>
                );
              })}
            </Box>
          ) : (
            <Paper
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "border.secondary",
                borderRadius: 2,
                p: 4,
                textAlign: "center",
              }}
            >
              <Typography variant="h5">No profiles found</Typography>
              <Typography variant="body2" color="text.secondary">
                Adjust filters or add your own biodata from the profile page.
              </Typography>
            </Paper>
          )}
        </Stack>
      </Content>

      <Dialog
        open={Boolean(selectedProfile)}
        onClose={() => {
          setSelectedProfile(null);
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {selectedProfile?.fullName || "Profile details"}
        </DialogTitle>
        <DialogContent>
          {selectedProfile ? (
            <Stack gap={2}>
              <Typography variant="body1" color="text.secondary">
                {selectedProfile.about || "No introduction added yet."}
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                  },
                  gap: 1.5,
                }}
              >
                {[
                  ["Date of birth", selectedProfile.dateOfBirth],
                  ["Place of birth", selectedProfile.placeOfBirth],
                  ["Height", selectedProfile.height],
                  ["Complexion", selectedProfile.complexion],
                  ["Education", selectedProfile.education],
                  ["Occupation", selectedProfile.occupation],
                  ["Annual income", formatIncome(selectedProfile.annualIncome)],
                  ["Residence", selectedProfile.residence],
                  ["Father", selectedProfile.fatherName],
                  ["Mother", selectedProfile.motherName],
                  ["Siblings", selectedProfile.siblings],
                  ["Partner preference", selectedProfile.partnerPreferences],
                ].map(([label, value]) => (
                  <Box key={label}>
                    <Typography variant="body3Bold" color="primary">
                      {label}
                    </Typography>
                    <Typography variant="body2">{value || "-"}</Typography>
                  </Box>
                ))}
              </Box>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => {
                  void downloadPdf(selectedProfile);
                }}
              >
                Download biodata PDF
              </Button>
            </Stack>
          ) : null}
        </DialogContent>
      </Dialog>
    </ContentContainer>
  );
};

export default Dashboard;
