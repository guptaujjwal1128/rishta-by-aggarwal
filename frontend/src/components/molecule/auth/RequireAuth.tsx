import { Navigate, Outlet, useLocation } from "react-router";
import { Box, CircularProgress } from "@mui/material";

import { useAuth } from "../../../context/AuthContext";
import { AppRoutes } from "../../../constants/routes";

const RequireAuth = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box minHeight="60vh" display="grid" sx={{ placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to={AppRoutes.LOGIN} replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default RequireAuth;
