// NPM
import { Routes, Route, useLocation } from "react-router";
import { useEffect } from "react";

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
import SuccessStories from "../pages/public/SuccessStories";
import PageNotFound from "../pages/public/PageNotFound";

import Dashboard from "../pages/user/Dashboard";
import Profile from "../pages/user/Profile";
import Settings from "../pages/user/Settings";

import RequireAuth from "../components/molecule/auth/RequireAuth";
import RequireRole from "../components/molecule/auth/RequireRole";
import { AppRoutes as AppRoutesEnum } from "../constants/routes";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AppRoutes = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/** Public Routes */}
        <Route path={AppRoutesEnum.HOME} element={<Home />} />
        <Route path={AppRoutesEnum.CONTACT} element={<ContactUs />} />
        <Route path={AppRoutesEnum.LOGIN} element={<Login />} />
        <Route path={AppRoutesEnum.REGISTER} element={<Register />} />
        <Route
          path={AppRoutesEnum.SUCCESS_STORIES}
          element={<SuccessStories />}
        />

        <Route element={<RequireAuth />}>
          {/** Admin Routes */}
          <Route
            path={AppRoutesEnum.ADMIN_ROOT}
            element={<RequireRole role="admin" />}
          >
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="users/:id" element={<UserDetails />} />
            <Route path="queries" element={<Queries />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/** User Routes */}
          <Route path={AppRoutesEnum.DASHBOARD} element={<Dashboard />} />
          <Route path={AppRoutesEnum.PROFILE} element={<Profile />} />
          <Route path={AppRoutesEnum.SETTINGS} element={<Settings />} />
        </Route>

        {/* Default route for 404 */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  );
};

export default AppRoutes;
