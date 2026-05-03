import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Check, X, Trash2, ToggleLeft, ToggleRight, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ApiKeysPage() {
  const { user, updateUser } = useAuth();
  const [keyData, setKeyData] = useState({ hasApiKey: false, maskedKey: null, useOwnApiKey: false, provider: 'openai' });
  const [newKey, setNewKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [provider, setProvider] = useState('openai');

  useEffect(() => {
    api.get('/apikeys').then(res => {
      setKeyData(res.data);
      setProvider(res.data.apiKeyProvider || 'openai');
    }).catch(console.error);
  }, []);

  const handleTest = async () => {
    if (!newKey.trim()) {
      toast.error('Enter an API key to test');
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.post('/apikeys/test', { apiKey: newKey, provider });
      setTestResult({ valid: res.data.valid, message: res.data.message });
    } catch (err) {
      setTestResult({ valid: false, message: err.response?.data?.error || 'Test failed' });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!newKey.trim()) {
      toast.error('Enter an API key first');
      return;
    }
    setSaving(true);
    try {
      await api.post('/apikeys', { apiKey: newKey, provider });
      const res = await api.get('/apikeys');
      setKeyData(res.data);
      setNewKey('');
      setTestResult(null);
      toast.success('API key saved and encrypted!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save key');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Remove your API key? You will use platform credits instead.')) return;
    try {
      await api.delete('/apikeys');
      setKeyData({ hasApiKey: false, maskedKey: null, useOwnApiKey: false });
      updateUser({ useOwnApiKey: false });
      toast.success('API key removed');
    } catch (err) {
      toast.error('Failed to remove key');
    }
  };

  const handleToggle = async (value) => {
    try {
      const res = await api.patch('/apikeys/toggle', { useOwnApiKey: value });
      setKeyData(prev => ({ ...prev, useOwnApiKey: value }));
      updateUser({ useOwnApiKey: value });
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to toggle');
    }
  };

  return (
    <div className="page-container">
      <div style={{ maxWidth: 700 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: 14 }}>
            Use your own OpenAI API key for unlimited usage. Your key is encrypted with AES-256 before storage.
          </p>

          {/* BYOK Toggle */}
          <div className="card" style={{ padding: '24px', marginBottom: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>API Source</h3>

            <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
              <button
                onClick={() => handleToggle(false)}
                style={{
                  flex: 1, padding: '14px',
                  borderRadius: 10,
                  border: !keyData.useOwnApiKey ? '2px solid var(--gold-400)' : '1px solid var(--border-color)',
                  background: !keyData.useOwnApiKey ? 'rgba(246,201,14,0.08)' : 'var(--bg-tertiary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 6 }}>⚡</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: !keyData.useOwnApiKey ? 'var(--gold-400)' : 'var(--text-secondary)' }}>
                  Platform API
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Uses your credits</div>
              </button>

              <button
                onClick={() => keyData.hasApiKey ? handleToggle(true) : toast.error('Save an API key first')}
                style={{
                  flex: 1, padding: '14px',
                  borderRadius: 10,
                  border: keyData.useOwnApiKey ? '2px solid var(--gold-400)' : '1px solid var(--border-color)',
                  background: keyData.useOwnApiKey ? 'rgba(246,201,14,0.08)' : 'var(--bg-tertiary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'center',
                  opacity: keyData.hasApiKey ? 1 : 0.5,
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 6 }}>🔑</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: keyData.useOwnApiKey ? 'var(--gold-400)' : 'var(--text-secondary)' }}>
                  My API Key
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Unlimited usage</div>
              </button>
            </div>

            <div style={{
              padding: '12px 16px',
              background: keyData.useOwnApiKey ? 'rgba(16,185,129,0.08)' : 'rgba(59,130,246,0.08)',
              border: `1px solid ${keyData.useOwnApiKey ? 'rgba(16,185,129,0.25)' : 'rgba(59,130,246,0.25)'}`,
              borderRadius: 8,
              fontSize: 13,
              color: keyData.useOwnApiKey ? '#10b981' : '#3b82f6',
            }}>
              {keyData.useOwnApiKey
                ? '✅ Using your own API key — no credits deducted'
                : `⚡ Using platform API — ${user?.credits} credits remaining`}
            </div>
          </div>

          {/* Current key */}
          {keyData.hasApiKey && (
            <div className="card" style={{ padding: '20px', marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700 }}>Saved API Key</h3>
                <span className="badge badge-green">Encrypted ✓</span>
              </div>
              <div className="api-key-field">
                <span className="api-key-input" style={{ letterSpacing: 3, color: 'var(--text-muted)' }}>
                  {keyData.maskedKey}
                </span>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={handleDelete}
                  style={{ marginLeft: 'auto' }}
                >
                  <Trash2 size={13} /> Remove
                </button>
              </div>
            </div>
          )}

          {/* Add / update key */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
              {keyData.hasApiKey ? 'Update API Key' : 'Add Your API Key'}
            </h3>

            <div className="form-group">
              <label className="form-label">API Provider</label>
              <select
                className="form-input"
                value={provider}
                onChange={e => setProvider(e.target.value)}
              >
                <option value="openai">OpenAI (GPT-4o, GPT-4o-mini)</option>
                <option value="gemini">Google Gemini (1.5 Flash/Pro — Free Tier)</option>
                <option value="xai">Grok (xAI — High Performance)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">API Key</label>
              <div className="api-key-field">
                <input
                  type={showKey ? 'text' : 'password'}
                  className="api-key-input"
                  placeholder="sk-proj-••••••••••••••••••••"
                  value={newKey}
                  onChange={e => { setNewKey(e.target.value); setTestResult(null); }}
                  id="api-key-input"
                />
                <button
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '8px' }}
                  onClick={() => setShowKey(p => !p)}
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <span className="form-hint" style={{ marginTop: 6, display: 'block' }}>
                Your key is encrypted with AES-256 before storage. We never read or expose it.
              </span>
            </div>

            {/* Test result */}
            {testResult && (
              <div style={{
                padding: '12px 16px',
                borderRadius: 8,
                marginBottom: 16,
                background: testResult.valid ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${testResult.valid ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                display: 'flex', alignItems: 'center', gap: 8, fontSize: 13,
                color: testResult.valid ? '#10b981' : '#ef4444',
              }}>
                {testResult.valid ? <Check size={16} /> : <X size={16} />}
                {testResult.message}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn btn-ghost"
                onClick={handleTest}
                disabled={testing || !newKey}
                id="test-api-key-btn"
              >
                {testing ? '⏳ Testing...' : '🔍 Test Key'}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving || !newKey}
                id="save-api-key-btn"
              >
                {saving ? 'Saving...' : '💾 Save Key'}
              </button>
            </div>
          </div>

          {/* Security info */}
          <div style={{
            padding: '16px',
            background: 'rgba(59,130,246,0.06)',
            border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: 10,
            marginTop: 16,
            display: 'flex', gap: 12, alignItems: 'flex-start',
          }}>
            <Info size={18} color="#3b82f6" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#3b82f6', marginBottom: 4 }}>
                About Security
              </div>
              <ul style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.8, paddingLeft: 16 }}>
                <li>Keys are encrypted using AES-256 before database storage</li>
                <li>Keys are never exposed in API responses or frontend code</li>
                <li>Your key is only decrypted server-side when making AI requests</li>
                <li>You can remove your key at any time</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
