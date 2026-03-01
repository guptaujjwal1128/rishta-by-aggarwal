import { Outlet } from "react-router";

export interface RequireRoleProps {
  role: string;
}

const RequireRole = ({ role }: RequireRoleProps) => {
  console.log("auth role todo", role);
  return <Outlet />;
};

export default RequireRole;
