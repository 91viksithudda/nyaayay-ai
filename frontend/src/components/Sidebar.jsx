import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, FileText, Settings, Home, Star,
  Key, CreditCard, Shield, LogOut, Menu, X, ChevronRight,
  BookOpen, Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: Home },
  { path: '/dashboard/chat', label: 'AI Legal Chat', icon: MessageSquare },
  { path: '/dashboard/drafts', label: 'Legal Drafts', icon: FileText },
  { path: '/dashboard/strategy', label: 'Case Strategy', icon: BookOpen },
];

const settingItems = [
  { path: '/dashboard/api-keys', label: 'API Keys', icon: Key },
  { path: '/dashboard/billing', label: 'Billing & Plans', icon: CreditCard },
  { path: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const planColors = {
    free: 'text-muted',
    basic: 'text-blue-400',
    pro: 'text-accent',
    unlimited: 'text-gold',
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            style={{ zIndex: 49 }}
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">⚖️</div>
          <div className="sidebar-logo-text">
            <h2>NyayaAI</h2>
            <span>Legal Intelligence</span>
          </div>
          <button
            className="btn btn-ghost btn-icon"
            style={{ marginLeft: 'auto', display: 'none' }}
            onClick={() => setMobileOpen(false)}
          >
            <X size={16} />
          </button>
        </div>

        {/* Credits indicator */}
        {user?.plan === 'free' && (
          <div style={{
            margin: '12px 16px',
            padding: '10px 14px',
            background: 'rgba(246,201,14,0.08)',
            border: '1px solid rgba(246,201,14,0.2)',
            borderRadius: 8,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Free Credits</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold-400)' }}>
                {user.credits}/20
              </span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
              <div style={{
                height: '100%',
                width: `${(user.credits / 20) * 100}%`,
                background: 'linear-gradient(90deg, var(--gold-400), var(--gold-500))',
                borderRadius: 2,
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-title">Main</div>
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/dashboard'}
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <Icon className="icon" size={18} />
              {label}
            </NavLink>
          ))}

          <div className="sidebar-section-title" style={{ marginTop: 8 }}>Account</div>
          {settingItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <Icon className="icon" size={18} />
              {label}
            </NavLink>
          ))}

          {user?.role === 'admin' && (
            <>
              <div className="sidebar-section-title" style={{ marginTop: 8 }}>Admin</div>
              <NavLink
                to="/dashboard/admin"
                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <Shield className="icon" size={18} />
                Admin Panel
              </NavLink>
            </>
          )}
        </nav>

        {/* Upgrade CTA */}
        {user?.plan === 'free' && (
          <div style={{ padding: '0 12px 12px' }}>
            <NavLink
              to="/dashboard/billing"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 14px',
                background: 'linear-gradient(135deg, rgba(246,201,14,0.15), rgba(246,201,14,0.05))',
                border: '1px solid rgba(246,201,14,0.3)',
                borderRadius: 10,
                textDecoration: 'none',
                transition: 'var(--transition)',
              }}
              onClick={() => setMobileOpen(false)}
            >
              <Zap size={16} color="var(--gold-400)" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold-400)' }}>Upgrade Plan</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Get unlimited access</div>
              </div>
              <ChevronRight size={14} color="var(--gold-400)" style={{ marginLeft: 'auto' }} />
            </NavLink>
          </div>
        )}

        {/* User Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={logout}>
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-plan" style={{ textTransform: 'capitalize' }}>
                {user?.plan} plan
              </div>
            </div>
            <LogOut size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          </div>
        </div>
      </aside>
    </>
  );
}
