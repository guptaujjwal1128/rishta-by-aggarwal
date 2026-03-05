import type { ThemeOptions } from "@mui/material/styles";
import { BREAKPOINTS } from "./breakpoints";

export const THEME_OPTIONS: ThemeOptions = {
  palette: {
    primary: {
      main: "#FD9667",
    },
    secondary: {
      main: "#ff80b7",
    },
    tertiary: {
      main: "#FFDE85",
    },
    text: {
      primary: "#333333",
      secondary: "#636A77",
    },
    background: {
      default: "#FFFDFC",
      paper: "#FAFAFA",
      tertiary: "#F3F4F6",
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
      primary: "#D1D5DB",
      secondary: "#E5E7EB",
    },
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
  },
};
