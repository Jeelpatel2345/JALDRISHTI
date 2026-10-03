import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AppShell } from './components/layout/AppShell';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { WatershedsPage } from './pages/WatershedsPage';
import { WatershedDetailPage } from './pages/WatershedDetailPage';
import { InterventionsPage } from './pages/InterventionsPage';
import { EvidencePage } from './pages/EvidencePage';
import { FieldVisitsPage } from './pages/FieldVisitsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { OutcomesPage } from './pages/OutcomesPage';
import { VerificationPage } from './pages/VerificationPage';
import { AlertsPage } from './pages/AlertsPage';
import { ReportsPage } from './pages/ReportsPage';
import { MethodologyPage } from './pages/MethodologyPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Landing & Methodology */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Application Shell Routes */}
            <Route element={<AppShell />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/watersheds" element={<WatershedsPage />} />
              <Route path="/watersheds/:id" element={<WatershedDetailPage />} />
              <Route path="/interventions" element={<InterventionsPage />} />
              <Route path="/interventions/:id" element={<InterventionsPage />} />
              <Route path="/evidence" element={<EvidencePage />} />
              <Route path="/evidence/:id" element={<EvidencePage />} />
              <Route path="/field-visits" element={<FieldVisitsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/outcomes" element={<OutcomesPage />} />
              <Route path="/verification" element={<VerificationPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/methodology" element={<MethodologyPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
