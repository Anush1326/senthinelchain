import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import EvidenceList from './pages/EvidenceList';
import UploadEvidence from './pages/UploadEvidence';
import EvidenceDetail from './pages/EvidenceDetail';
import IpfsVault from './pages/IpfsVault';
import AttackSimulator from './pages/AttackSimulator';
import VerifyEvidence from './pages/VerifyEvidence';
import Analytics from './pages/Analytics';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Unauthorized from './pages/Unauthorized';

function App() {
  return (
    <BrowserRouter>
      {/* Global Cyber Styled Toast Notifications */}
      <Toaster 
        position="top-right" 
        toastOptions={{ 
          duration: 4000,
          style: {
            background: 'rgba(7, 13, 25, 0.9)',
            color: '#e2e8f0',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            boxShadow: '0 0 20px rgba(0, 240, 255, 0.25)',
            backdropFilter: 'blur(16px)',
            borderRadius: '0.75rem',
            fontFamily: 'monospace',
            fontSize: '0.825rem',
          },
          success: {
            iconTheme: {
              primary: '#00f0ff',
              secondary: '#070d19',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#070d19',
            },
            style: {
              border: '1px solid rgba(239, 68, 68, 0.4)',
              boxShadow: '0 0 20px rgba(239, 68, 68, 0.25)',
            }
          }
        }} 
      />
      
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
            <Route path="/ipfs" element={<IpfsVault />} />
            <Route path="/simulator" element={<AttackSimulator />} />
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

            {/* Admin Panel restricted to Admin */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminPanel />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
