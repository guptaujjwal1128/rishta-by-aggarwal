import { Navigate, Outlet } from "react-router";

import { useAuth } from "../../../context/AuthContext";
import { AppRoutes } from "../../../constants/routes";

export interface RequireRoleProps {
  role: string;
}

const RequireRole = ({ role }: RequireRoleProps) => {
  const { user } = useAuth();

  if (!user || user.role !== role) {
    return <Navigate to={AppRoutes.DASHBOARD} replace />;
  }

  return <Outlet />;
};

export default RequireRole;
