import React from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { THEME_OPTIONS } from "../constants/theme";

interface AppContainerProps {
  children: React.ReactNode;
}

const AppContainer: React.FC<AppContainerProps> = ({ children }) => {
  // Create theme
  const theme = createTheme(THEME_OPTIONS);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default AppContainer;
