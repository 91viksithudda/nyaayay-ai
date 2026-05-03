import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-overlay">
        <div style={{ textAlign: 'center' }}>
          <div className="sidebar-logo-icon" style={{ width: 48, height: 48, margin: '0 auto 16px', fontSize: 22 }}>⚖️</div>
          <div style={{ color: 'var(--gold-400)', fontWeight: 600, fontSize: 18, marginBottom: 8 }}>NyayaAI</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading...</div>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}
