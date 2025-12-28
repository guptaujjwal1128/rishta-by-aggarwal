// NPM
import { CssBaseline, createTheme, ThemeProvider, Button } from "@mui/material";

// Local
import "./App.css";
import { THEME_OPTIONS } from "./constants/theme";

const theme = createTheme(THEME_OPTIONS);
function App() {
  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <h1>Hello World !</h1>
        <Button variant="contained">Hello world</Button>
      </ThemeProvider>
    </>
  );
}

export default App;
