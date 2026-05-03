import { Sun, Moon, Menu, Bell, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function TopNav({ title, onMenuClick }) {
  const { user, theme, toggleTheme } = useAuth();

  return (
    <header className="topnav">
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button className="btn btn-ghost btn-icon" onClick={onMenuClick} id="menu-toggle">
          <Menu size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            {title}
          </h1>
        </div>
      </div>

      <div className="topnav-actions">
        {/* Credits badge */}
        {user && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 12px',
            background: 'rgba(246,201,14,0.08)',
            border: '1px solid rgba(246,201,14,0.2)',
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--gold-400)',
          }}>
            <span>⚡</span>
            <span>{user.plan === 'unlimited' ? '∞' : user.credits}</span>
            <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>credits</span>
          </div>
        )}

        {/* Theme toggle */}
        <button
          className="btn btn-ghost btn-icon"
          onClick={toggleTheme}
          id="theme-toggle"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button className="btn btn-ghost btn-icon" id="notifications-btn">
            <Bell size={18} />
          </button>
          <div className="notification-dot" style={{ position: 'absolute', top: 6, right: 6 }} />
        </div>
      </div>
    </header>
  );
}
