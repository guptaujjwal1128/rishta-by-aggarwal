import type { ThemeOptions } from "@mui/material/styles";
import { BREAKPOINTS } from "./breakpoints";

export const THEME_OPTIONS: ThemeOptions = {
  palette: {
    primary: {
      main: "#B9471F",
    },
    secondary: {
      main: "#C65B7C",
    },
    tertiary: {
      main: "#F1B84B",
    },
    text: {
      primary: "#2D211C",
      secondary: "#6E625B",
    },
    background: {
      default: "#FFF8F1",
      paper: "#FFFFFF",
      tertiary: "#F7ECE1",
    },
    // for actions like hover, selected, etc.
    action: {},
    common: {
      black: "#000000",
      white: "#FFFFFF",
    },
    // adjusts the lightness/darkness of colors
    tonalOffset: 0.2, // default is 0.2
    // defines thresholds for contrast text colors
    contrastThreshold: 3, // default is 3

    // custom
    border: {
      primary: "#E2C8B5",
      secondary: "#F0DED0",
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: "Roboto, sans-serif",
    h1: {
      fontSize: "2rem", // 32px
      fontWeight: 700,
      [`@media (min-width:${BREAKPOINTS.md}px)`]: {
        fontSize: "3.5rem", // 56px
      },
    },
    h1Bold: {
      fontSize: "2rem", // 32px
      fontWeight: 800,
      [`@media (min-width:${BREAKPOINTS.md}px)`]: {
        fontSize: "3.5rem", // 56px
      },
    },
    h2: {
      fontSize: "1.75rem", // 28px
      fontWeight: 700,
      [`@media (min-width:${BREAKPOINTS.md}px)`]: {
        fontSize: "2.75rem", // 44px
      },
    },
    h3: {
      fontSize: "1.375rem", // 22px
      fontWeight: 700,
      [`@media (min-width:${BREAKPOINTS.md}px)`]: {
        fontSize: "2rem", // 32px
      },
    },
    h4: {
      fontSize: "1.25rem", // 20px
      fontWeight: 600,
      [`@media (min-width:${BREAKPOINTS.md}px)`]: {
        fontSize: "1.625rem", // 26px
      },
    },
    h5: {
      fontSize: "1.125rem", // 18px
      fontWeight: 600,
      [`@media (min-width:${BREAKPOINTS.md}px)`]: {
        fontSize: "1.375rem", // 22px
      },
    },
    body1: {
      fontSize: "1rem", // 16px
      [`@media (min-width:${BREAKPOINTS.md}px)`]: {
        fontSize: "1.125rem", // 18px
      },
    },
    body1Bold: {
      fontSize: "1rem", // 16px
      fontWeight: 600,
      [`@media (min-width:${BREAKPOINTS.md}px)`]: {
        fontSize: "1.125rem", // 18px
      },
    },
    body2: {
      fontSize: "0.875rem", // 14px
      [`@media (min-width:${BREAKPOINTS.md}px)`]: {
        fontSize: "1rem", // 16px
      },
    },
    body2Bold: {
      fontSize: "0.875rem", // 14px
      fontWeight: 600,
      [`@media (min-width:${BREAKPOINTS.md}px)`]: {
        fontSize: "1rem", // 16px
      },
    },
    body3: {
      fontSize: "0.75rem", // 12px
      [`@media (min-width:${BREAKPOINTS.md}px)`]: {
        fontSize: "0.875rem", // 14px
      },
    },
    body3Bold: {
      fontSize: "0.75rem", // 12px
      fontWeight: 600,
      [`@media (min-width:${BREAKPOINTS.md}px)`]: {
        fontSize: "0.875rem", // 14px
      },
    },
  },
  spacing: 8,
  breakpoints: {
    values: BREAKPOINTS,
  },

  // global adjustments
  components: {
    MuiAccordion: {
      defaultProps: {
        disableGutters: true,
        elevation: 0,
      },
      styleOverrides: {
        root: {
          "&:before": { display: "none" },
        },
      },
    },
    MuiList: {
      defaultProps: {
        disablePadding: true,
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          padding: 0,
        },
      },
    },
    MuiListItemAvatar: {
      styleOverrides: {
        root: {
          minWidth: "auto",
          marginRight: ".75rem",
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          cursor: "pointer",
          textDecoration: "none",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          transition: "border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          transition: "border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          transition: "box-shadow 180ms ease, border-color 180ms ease",
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#D7A687",
          },
          "&.Mui-focused": {
            boxShadow: "0 0 0 3px rgba(185, 71, 31, 0.12)",
          },
        },
        notchedOutline: {
          borderColor: "#E2C8B5",
        },
      },
    },
  },
};
