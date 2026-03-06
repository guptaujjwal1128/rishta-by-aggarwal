// NPM

// Local
import { FloatingContact } from "../components/molecule/advertisement/floating-contact/FloatingContact";
import AppProviders from "./AppProviders";
import AppRoutes from "./AppRoutes";

const App = () => {
  return (
    <AppProviders>
      <AppRoutes />
      <FloatingContact />
    </AppProviders>
  );
};

export default App;
