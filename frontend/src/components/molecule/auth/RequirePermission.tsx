import { Navigate, Outlet } from "react-router";

import { AppRoutes } from "../../../constants/routes";
import { hasPermission, type Permission } from "../../../constants/permissions";
import { useAuth } from "../../../context/AuthContext";

interface RequirePermissionProps {
  permissions: Permission[];
}

const RequirePermission = ({ permissions }: RequirePermissionProps) => {
  const { user } = useAuth();

  if (!permissions.every((permission) => hasPermission(user, permission))) {
    return <Navigate to={AppRoutes.DASHBOARD} replace />;
  }

  return <Outlet />;
};

export default RequirePermission;
