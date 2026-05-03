import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, updateUser, toggleTheme, theme } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    language: user?.language || 'en',
  });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      const res = await api.patch('/user/profile', { name: form.name, language: form.language });
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('New password min 6 characters');
      return;
    }
    setChangingPass(true);
    try {
      await api.patch('/user/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirm: '' });
      toast.success('Password changed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Password change failed');
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <div className="page-container">
      <div style={{ maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Profile */}
        <motion.div className="card" style={{ padding: '24px' }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Profile Settings</h3>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" value={user?.email} disabled style={{ opacity: 0.6 }} />
            <span className="form-hint">Email cannot be changed</span>
          </div>

          <div className="form-group">
            <label className="form-label">Default Language</label>
            <select className="form-input" value={form.language}
              onChange={e => setForm(p => ({ ...p, language: e.target.value }))}
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
            </select>
          </div>

          <button className="btn btn-primary" onClick={handleProfileSave} disabled={saving}>
            {saving ? 'Saving...' : '💾 Save Profile'}
          </button>
        </motion.div>

        {/* Theme */}
        <motion.div className="card" style={{ padding: '24px' }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Appearance</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Theme</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                Currently: {theme === 'dark' ? '🌙 Dark' : '☀️ Light'} mode
              </div>
            </div>
            <button className="btn btn-ghost" onClick={toggleTheme}>
              {theme === 'dark' ? '☀️ Switch to Light' : '🌙 Switch to Dark'}
            </button>
          </div>
        </motion.div>

        {/* Change Password */}
        <motion.div className="card" style={{ padding: '24px' }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Change Password</h3>

          {['currentPassword', 'newPassword', 'confirm'].map((field, i) => (
            <div className="form-group" key={field}>
              <label className="form-label">
                {field === 'currentPassword' ? 'Current Password' :
                  field === 'newPassword' ? 'New Password' : 'Confirm New Password'}
              </label>
              <input type="password" className="form-input"
                placeholder="••••••••"
                value={passwordForm[field]}
                onChange={e => setPasswordForm(p => ({ ...p, [field]: e.target.value }))}
              />
            </div>
          ))}

          <button className="btn btn-primary" onClick={handlePasswordChange} disabled={changingPass}>
            {changingPass ? 'Changing...' : '🔑 Change Password'}
          </button>
        </motion.div>

        {/* Account Info */}
        <motion.div className="card" style={{ padding: '24px' }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Account Info</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'User ID', value: user?._id },
              { label: 'Plan', value: user?.plan?.toUpperCase() },
              { label: 'Credits', value: user?.plan === 'unlimited' ? '∞' : user?.credits },
              { label: 'Total Queries', value: user?.usageCount },
              { label: 'Member Since', value: new Date(user?.createdAt).toLocaleDateString('en-IN') },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                <span style={{ fontWeight: 600 }}>{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
