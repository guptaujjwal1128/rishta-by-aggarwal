// npm
import { BrowserRouter } from "react-router";
import {
  createTheme,
  CssBaseline,
  GlobalStyles,
  ThemeProvider,
} from "@mui/material";
import { Provider } from "react-redux";

// Local
import { THEME_OPTIONS } from "../constants/theme";
import { AuthProvider } from "../context/AuthContext";
import { store } from "../store";

const theme = createTheme(THEME_OPTIONS);

const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles
        styles={(theme) => ({
          "@keyframes riseIn": {
            from: { opacity: 0, transform: "translateY(14px)" },
            to: { opacity: 1, transform: "translateY(0)" },
          },
          "@keyframes softSheen": {
            from: { transform: "translateX(-120%)" },
            to: { transform: "translateX(120%)" },
          },
          html: {
            scrollBehavior: "smooth",
          },
          body: {
            background:
              "linear-gradient(180deg, #FFF8F1 0%, #FFFDFC 38%, #F7ECE1 100%)",
          },
          "::selection": {
            backgroundColor: theme.palette.tertiary.main,
            color: theme.palette.text.primary,
          },
          ".link-styling": {
            color: "inherit",
            textDecoration: "none",
          },
          ".page-rise": {
            animation: "riseIn 360ms ease both",
          },
          ".soft-card": {
            boxShadow: "0 18px 45px rgba(83, 45, 25, 0.08)",
          },
          ".soft-card:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 22px 55px rgba(83, 45, 25, 0.12)",
          },
          "@media (prefers-reduced-motion: reduce)": {
            html: { scrollBehavior: "auto" },
            "*, *::before, *::after": {
              animationDuration: "0.001ms !important",
              animationIterationCount: "1 !important",
              scrollBehavior: "auto !important",
              transitionDuration: "0.001ms !important",
            },
          },
        })}
      />
      <Provider store={store}>
        <BrowserRouter>
          <AuthProvider>{children}</AuthProvider>
        </BrowserRouter>
      </Provider>
    </ThemeProvider>
  );
};

export default AppProviders;
