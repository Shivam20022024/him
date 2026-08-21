import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Views
import Home from "./views/Home";
import Hiring from "./views/Hiring";
import Jobs from "./views/Jobs";
import Login from "./views/auth/Login";
import Companies from "./views/superadmin/Companies";

function App() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#eef3f8_100%)] text-slate-900">
      <Navbar />
      <main className="relative pt-28">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Organization Routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Home onNavigate={() => {}} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/jobs" 
            element={
              <ProtectedRoute>
                <Jobs onNavigate={() => {}} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/hiring" 
            element={
              <ProtectedRoute>
                <Hiring />
              </ProtectedRoute>
            } 
          />

          {/* Protected Super Admin Routes */}
          <Route 
            path="/superadmin/dashboard" 
            element={
              <ProtectedRoute requiredRole="SUPER_ADMIN">
                <Companies />
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
