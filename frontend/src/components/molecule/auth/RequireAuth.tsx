import { Outlet } from "react-router";

const RequireAuth = () => {
  console.log("auth todo");
  return <Outlet />;
};

export default RequireAuth;
