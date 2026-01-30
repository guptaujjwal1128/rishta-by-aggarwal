// NPM
import { Routes, Route } from "react-router";

// Local
import AdminDashboard from "../pages/admin/AdminDashboard";
import Queries from "../pages/admin/Queries";
import UserDetails from "../pages/admin/UserDetails";
import Users from "../pages/admin/Users";

import Register from "../pages/public/Register";
import Home from "../pages/public/Home";
import Login from "../pages/public/Login";
import ContactUs from "../pages/public/ContactUs";

import Dashboard from "../pages/user/Dashboard";
import Profile from "../pages/user/Profile";

import Settings from "../pages/common/Settings";

const AppRoutes = () => {
  return (
    <Routes>
      {/** Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<ContactUs />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/** Admin Routes */}
      <Route path="/users" element={<Users />} />
      <Route path="/users/:userId/profile" element={<UserDetails />} />
      <Route path="/queries" element={<Queries />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />

      {/** User Routes */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />

      {/** Common Routes */}
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
};

export default AppRoutes;
