// NPM
import { Routes, Route } from "react-router";

// Local
import AdminDashboard from "../pages/admin/AdminDashboard";
import Queries from "../pages/admin/Queries";
import UserDetails from "../pages/admin/UserDetails";
import Users from "../pages/admin/Users";
import AdminSettings from "../pages/admin/AdminSettings";

import Register from "../pages/public/Register";
import Home from "../pages/public/Home";
import Login from "../pages/public/Login";
import ContactUs from "../pages/public/ContactUs";
import PageNotFound from "../pages/public/PageNotFound";

import Dashboard from "../pages/user/Dashboard";
import Profile from "../pages/user/Profile";
import Settings from "../pages/user/Settings";

import RequireAuth from "../components/molecule/auth/RequireAuth";
import RequireRole from "../components/molecule/auth/RequireRole";

const AppRoutes = () => {
  return (
    <Routes>
      {/** Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<RequireAuth />}>
        {/** Admin Routes */}
        <Route path="/admin" element={<RequireRole role="admin" />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="users/:id" element={<UserDetails />} />
          <Route path="queries" element={<Queries />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/** User Routes */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Default route for 404 */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

export default AppRoutes;
