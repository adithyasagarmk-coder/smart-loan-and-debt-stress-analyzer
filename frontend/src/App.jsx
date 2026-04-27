import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DashboardProvider } from "./context/DashboardContext";
import Layout from "./components/Layout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Loans from "./pages/Loans";
import Simulation from "./pages/Simulation";
import StressAnalysis from "./pages/StressAnalysis";
import AdminPanel from "./pages/AdminPanel";
import PrivateRoute from "./pages/PrivateRoute";
import Vault from "./pages/Vault";
import Discover from "./pages/Discover";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DashboardProvider>
          <Routes>
            {/* Public */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />

            {/* Protected */}
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index element={<Navigate to="/dashboard" />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="loans" element={<Loans />} />
              <Route path="simulation" element={<Simulation />} />
              <Route path="analysis" element={<StressAnalysis />} />
              <Route path="admin" element={<AdminPanel />} />
              <Route path="vault" element={<Vault />} />
              <Route path="discover" element={<Discover />} />
            </Route>

            {/* SAFE DEFAULT */}
            <Route path="*" element={<Navigate to="/auth/login" />} />
          </Routes>
        </DashboardProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
