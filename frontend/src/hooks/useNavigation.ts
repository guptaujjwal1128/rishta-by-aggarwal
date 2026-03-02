// External
import { useNavigate } from "react-router";
import type { NavigateOptions } from "react-router";

// Internal
import { AppRoutes } from "../constants/routes";

const useNavigation = () => {
  const navigate = useNavigate();

  // Generic navigation helper
  const goTo = (route: AppRoutes, options?: NavigateOptions) =>
    navigate(route, options);

  return {
    goTo,
  };
};

export default useNavigation;
