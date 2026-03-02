import React from "react";

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
    body3: React.CSSProperties;
    body3Bold: React.CSSProperties;
  }
  interface TypographyVariantsOptions {
    h1Bold?: React.CSSProperties;
    body1Bold?: React.CSSProperties;
    body2Bold?: React.CSSProperties;
    body3?: React.CSSProperties;
    body3Bold?: React.CSSProperties;
  }
}

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    h1Bold: true;
    body1Bold: true;
    body2Bold: true;
    body3: true;
    body3Bold: true;
  }
}
