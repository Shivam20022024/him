import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";

// Views
import Home from "./views/Home";

import Hiring from "./views/Hiring";
import Jobs from "./views/Jobs";
import Analytics from "./views/Analytics";
import Login from "./views/auth/Login";
import ForgotPassword from "./views/auth/ForgotPassword";
import ResetPassword from "./views/auth/ResetPassword";

// Super Admin Views
import SuperAdminLayout from "./components/superadmin/SuperAdminLayout";
import Overview from "./views/superadmin/Overview";
import Companies from "./views/superadmin/Companies";
import Users from "./views/superadmin/Users";

function App() {
  const location = useLocation();
  const isSuperAdminRoute = location.pathname.startsWith('/superadmin');

  return (
    <div className={`min-h-screen ${isSuperAdminRoute ? 'bg-slate-50' : 'bg-[#f8fafc]'} text-slate-900`}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home onNavigate={() => {}} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Organization Routes */}
        <Route path="/dashboard" element={<Navigate to="/jobs" replace />} />
        <Route 
          path="/jobs" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <Jobs onNavigate={() => {}} />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/hiring" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <Hiring />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <Analytics />
              </MainLayout>
            </ProtectedRoute>
          } 
        />

        {/* Protected Super Admin Routes */}
          <Route 
            path="/superadmin" 
            element={
              <ProtectedRoute requiredRole="SUPER_ADMIN">
                <SuperAdminLayout />
              </ProtectedRoute>
            } 
          >
            <Route index element={<Navigate to="/superadmin/dashboard" replace />} />
            <Route path="dashboard" element={<Overview />} />
            <Route path="companies" element={<Companies />} />
            <Route path="users" element={<Users />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    </div>
  );
}

export default App;
