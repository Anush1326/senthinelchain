import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import EvidenceList from './pages/EvidenceList';
import UploadEvidence from './pages/UploadEvidence';
import EvidenceDetail from './pages/EvidenceDetail';
import VerifyEvidence from './pages/VerifyEvidence';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Unauthorized from './pages/Unauthorized';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected App Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            {/* Accessible by any authenticated role */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/evidence" element={<EvidenceList />} />
            <Route path="/evidence/:id" element={<EvidenceDetail />} />
            <Route path="/verify" element={<VerifyEvidence />} />

            {/* Role-Based Protected Routes */}
            {/* Upload Evidence restricted to Admin and Investigator */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'investigator']} />}>
              <Route path="/evidence/upload" element={<UploadEvidence />} />
            </Route>

            {/* Analytics restricted to Admin, Investigator, Analyst */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'investigator', 'analyst']} />}>
              <Route path="/analytics" element={<Analytics />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

