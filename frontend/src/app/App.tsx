// NPM

// Local
import AppProviders from "./AppProviders";
import AppRoutes from "./AppRoutes";

const App = () => {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
};

export default App;
