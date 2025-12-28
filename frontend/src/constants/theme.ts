import type { ThemeOptions } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    tertiary?: Palette["primary"];
  }
  interface PaletteOptions {
    tertiary?: PaletteOptions["primary"];
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
    // adjusts the lightness/darkness of colors
    tonalOffset: 0.2, // default is 0.2
    // defines thresholds for contrast text colors
    contrastThreshold: 3, // default is 3
  },
};
