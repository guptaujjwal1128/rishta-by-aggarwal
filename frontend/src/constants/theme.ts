import type { ThemeOptions } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    tertiary: Palette["primary"];
    border: {
      primary: string;
      secondary: string;
    };
  }
  interface PaletteOptions {
    tertiary?: PaletteOptions["primary"];
    border?: {
      primary?: string;
      secondary?: string;
    };
  }

  interface TypographyVariants {
    h1Bold: React.CSSProperties;
    body1Bold: React.CSSProperties;
    body2Bold: React.CSSProperties;
    body3Bold: React.CSSProperties;
  }
  interface TypographyVariantsOptions {
    h1Bold?: React.CSSProperties;
    body1Bold?: React.CSSProperties;
    body2Bold?: React.CSSProperties;
    body3?: React.CSSProperties;
  }
}

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    h1Bold: true;
    body1Bold: true;
    body2Bold: true;
    body3Bold: true;
  }
}
export const THEME_OPTIONS: ThemeOptions = {
  palette: {
    primary: {
      main: "#fdaa84",
    },
    secondary: {
      main: "#ff80b7",
    },
    tertiary: {
      main: "#FFDE85",
    },
    text: {
      primary: "#333333",
    },
    background: {
      default: "#e5e7eb",
      paper: "#fafafa",
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
      fontSize: "2.25rem", // 36px
      fontWeight: 700,
    },
    h1Bold: {
      fontSize: "2.25rem", // 36px
      fontWeight: 800,
    },
    h2: {
      fontSize: "1.875rem", // 30px
      fontWeight: 700,
    },
    h3: {
      fontSize: "1.5rem", // 24px
      fontWeight: 700,
    },
    h4: {
      fontSize: "1.25rem", // 20px
      fontWeight: 700,
    },
    h5: {
      fontSize: "1.125rem", // 18px
      fontWeight: 700,
    },
    body1: {
      fontSize: "1rem", // 16px
      fontWeight: 400,
    },
    body1Bold: {
      fontSize: "1rem", // 16px
      fontWeight: 700,
    },
    body2: {
      fontSize: "0.875rem", // 14px
      fontWeight: 400,
    },
    body3: {
      fontSize: "0.75rem", // 12px
      fontWeight: 400,
    },
  },
  spacing: 8,
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },

  // global adjustments
  components: {
    MuiButton: {
      defaultProps: {
        disableFocusRipple: true, // Move this here
      },
    },
    MuiContainer: {
      defaultProps: {
        maxWidth: "xl",
      },
    },
  },
};
