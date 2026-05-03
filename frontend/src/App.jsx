import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import AuthPage from './pages/AuthPage';
import DashboardLayout from './pages/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import ChatPage from './pages/ChatPage';
import DraftsPage from './pages/DraftsPage';
import StrategyPage from './pages/StrategyPage';
import ApiKeysPage from './pages/ApiKeysPage';
import BillingPage from './pages/BillingPage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />

          {/* Protected Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="drafts" element={<DraftsPage />} />
            <Route path="strategy" element={<StrategyPage />} />
            <Route path="api-keys" element={<ApiKeysPage />} />
            <Route path="billing" element={<BillingPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="admin" element={<AdminPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#112240',
              color: '#e6f1ff',
              border: '1px solid rgba(255,255,255,0.08)',
              fontSize: '14px',
              borderRadius: '10px',
              fontFamily: 'Inter, sans-serif',
            },
            success: {
              iconTheme: { primary: '#f6c90e', secondary: '#0a192f' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
