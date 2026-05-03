import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function AuthPage({ mode = 'login' }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const isLogin = mode === 'login';

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!isLogin && !form.name.trim()) errs.name = 'Name is required';
    if (!form.email.match(/^\S+@\S+\.\S+$/)) errs.email = 'Valid email required';
    if (form.password.length < 6) errs.password = 'Password min 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      if (isLogin) {
        await login(form.email, form.password);
        toast.success('Welcome back! 👋');
      } else {
        await register(form.name, form.email, form.password);
        toast.success('Account created! 20 free credits added 🎉');
      }
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Something went wrong';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--navy-950)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background effect */}
      <div style={{
        position: 'absolute', top: -200, right: -200,
        width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(246,201,14,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -200, left: -200,
        width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(100,255,218,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'rgba(17, 34, 64, 0.7)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          padding: '40px 36px',
          backdropFilter: 'blur(20px)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div className="sidebar-logo-icon" style={{ width: 36, height: 36, fontSize: 16 }}>⚖️</div>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#e6f1ff' }}>NyayaAI</span>
          </Link>
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>
          {isLogin ? 'Welcome back' : 'Create account'}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>
          {isLogin ? 'Sign in to your NyayaAI account' : 'Start your free legal AI journey'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {!isLogin && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }} />
                <input
                  id="name-input"
                  type="text"
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  style={{ paddingLeft: 40 }}
                  placeholder="Adv. Priya Sharma"
                  value={form.name}
                  onChange={e => updateForm('name', e.target.value)}
                  autoComplete="name"
                />
              </div>
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>
          )}

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }} />
              <input
                id="email-input"
                type="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                style={{ paddingLeft: 40 }}
                placeholder="you@lawfirm.com"
                value={form.email}
                onChange={e => updateForm('email', e.target.value)}
                autoComplete="email"
              />
            </div>
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }} />
              <input
                id="password-input"
                type={showPass ? 'text' : 'password'}
                className={`form-input ${errors.password ? 'error' : ''}`}
                style={{ paddingLeft: 40, paddingRight: 44 }}
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={e => updateForm('password', e.target.value)}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', display: 'flex',
                }}
                onClick={() => setShowPass(p => !p)}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          <button
            id="auth-submit-btn"
            type="submit"
            className="btn btn-primary full-width"
            style={{ justifyContent: 'center', marginTop: 8, padding: '14px' }}
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 16, height: 16, border: '2px solid #0a192f',
                  borderTopColor: 'transparent', borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite',
                }} />
                {isLogin ? 'Signing in...' : 'Creating account...'}
              </span>
            ) : (
              <>
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: 'var(--text-muted)' }}>
          {isLogin ? (
            <>Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--gold-400)', fontWeight: 600, textDecoration: 'none' }}>
                Sign up free
              </Link>
            </>
          ) : (
            <>Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--gold-400)', fontWeight: 600, textDecoration: 'none' }}>
                Sign in
              </Link>
            </>
          )}
        </div>

        {!isLogin && (
          <p style={{ marginTop: 16, fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
            By signing up you agree to our Terms of Service and Privacy Policy.
            Legal disclaimer: NyayaAI does not constitute legal advice.
          </p>
        )}
      </motion.div>

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
