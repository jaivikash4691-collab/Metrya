import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Public Views
import { LandingPage } from '../pages/public/LandingPage';
import { PublicVerifyPage } from '../pages/public/PublicVerifyPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';

// Dashboard & Workspace Views
import { DashboardRouter } from '../pages/dashboard/DashboardRouter';
import { InstrumentListPage } from '../pages/instruments/InstrumentListPage';
import { InstrumentDetailPage } from '../pages/instruments/InstrumentDetailPage';
import { ApplicationListPage } from '../pages/applications/ApplicationListPage';
import { ApplicationDetailPage } from '../pages/applications/ApplicationDetailPage';
import { InspectionWorkspacePage } from '../pages/inspections/InspectionWorkspacePage';
import { CertificateListPage } from '../pages/certificates/CertificateListPage';
import { CertificateDetailPage } from '../pages/certificates/CertificateDetailPage';
import { SchedulingPage } from '../pages/scheduling/SchedulingPage';
import { RulesManagerPage } from '../pages/rules/RulesManagerPage';
import { AuditLogsPage } from '../pages/audit/AuditLogsPage';
import { ReportsPage } from '../pages/reports/ReportsPage';
import { ProfilePage } from '../pages/profile/ProfilePage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/verify" element={<PublicVerifyPage />} />
        <Route path="/verify/:identifier" element={<PublicVerifyPage />} />
      </Route>

      {/* Auth Pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Dashboard Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardRouter />} />

          {/* Instruments */}
          <Route path="/instruments" element={<InstrumentListPage />} />
          <Route path="/instruments/:id" element={<InstrumentDetailPage />} />

          {/* Applications */}
          <Route path="/applications" element={<ApplicationListPage />} />
          <Route path="/applications/:id" element={<ApplicationDetailPage />} />

          {/* Scheduling */}
          <Route path="/scheduling" element={<SchedulingPage />} />

          {/* Digital Inspection Module */}
          <Route path="/inspections" element={<InspectionWorkspacePage />} />

          {/* Certificates */}
          <Route path="/certificates" element={<CertificateListPage />} />
          <Route path="/certificates/:id" element={<CertificateDetailPage />} />

          {/* Admin & Officer Analytics */}
          <Route path="/analytics" element={<DashboardRouter />} />
          <Route path="/reports" element={<ReportsPage />} />

          {/* Super Admin Specifics */}
          <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
            <Route path="/rules" element={<RulesManagerPage />} />
            <Route path="/audit-logs" element={<AuditLogsPage />} />
            <Route path="/users" element={<ReportsPage />} />
          </Route>

          {/* Profile */}
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
