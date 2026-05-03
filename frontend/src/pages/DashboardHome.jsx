import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, FileText, Key, TrendingUp, ArrowRight, Zap, Clock, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../context/AuthContext';

const LEGAL_TIPS = [
  'Under IPC Section 420, cheating carries imprisonment up to 7 years.',
  'A legal notice must be responded to within 30 days to avoid default.',
  'CrPC Section 482 grants inherent powers to High Courts to quash FIRs.',
  'Under CPC Order 7 Rule 11, a plaint can be rejected for legal insufficiency.',
  'Article 21 guarantees right to life and personal liberty — broadest interpretation.',
  'Limitation Act: suits for contract must be filed within 3 years.',
];

const quickActions = [
  { label: 'New Chat', desc: 'Ask a legal question', href: '/dashboard/chat', icon: MessageSquare, color: '#f6c90e' },
  { label: 'Draft FIR', desc: 'Generate instantly', href: '/dashboard/drafts', icon: FileText, color: '#64ffda' },
  { label: 'Case Strategy', desc: 'AI-powered insights', href: '/dashboard/strategy', icon: BookOpen, color: '#f6c90e' },
  { label: 'API Keys', desc: 'Use your own key', href: '/dashboard/api-keys', icon: Key, color: '#64ffda' },
];

export default function DashboardHome() {
  const { user, updateUser } = useAuth();
  const [stats, setStats] = useState({ chatCount: 0, draftCount: 0 });
  const [recentChats, setRecentChats] = useState([]);
  const [tip] = useState(() => LEGAL_TIPS[Math.floor(Math.random() * LEGAL_TIPS.length)]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, chatsRes] = await Promise.all([
          api.get('/user/profile'),
          api.get('/chat'),
        ]);
        setStats(profileRes.data.stats);
        setRecentChats(chatsRes.data.chats.slice(0, 4));
        updateUser(profileRes.data.user);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchData();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="page-container">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: 32 }}
      >
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>
          {greeting()}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          AI Legal Assistant ready. {user?.credits > 0 ? `${user.credits} credits remaining.` : 'Upgrade to continue.'}
        </p>
      </motion.div>

      {/* Stats Bar */}
      <div className="stats-bar stagger-children" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', marginBottom: 32 }}>
        {[
          { value: user?.credits === 999999 ? '∞' : user?.credits ?? 0, label: 'Credits Left', icon: '⚡' },
          { value: user?.usageCount ?? 0, label: 'Queries Made', icon: '🔍' },
          { value: loadingStats ? '...' : stats.chatCount, label: 'Conversations', icon: '💬' },
          { value: loadingStats ? '...' : stats.draftCount, label: 'Drafts', icon: '📄' },
          { value: user?.plan?.charAt(0).toUpperCase() + user?.plan?.slice(1), label: 'Current Plan', icon: '⭐' },
        ].map(item => (
          <div key={item.label} className="stat-card">
            <div style={{ fontSize: 20, marginBottom: 6 }}>{item.icon}</div>
            <div className="stat-value" style={{ fontSize: '1.6rem' }}>{item.value}</div>
            <div className="stat-label">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--text-secondary)' }}>
          Quick Actions
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {quickActions.map((action, i) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Link
                to={action.href}
                className="card"
                style={{
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  width: 44, height: 44,
                  borderRadius: 10,
                  background: `${action.color}18`,
                  border: `1px solid ${action.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: action.color, flexShrink: 0,
                }}>
                  <action.icon size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                    {action.label}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{action.desc}</div>
                </div>
                <ArrowRight size={16} color="var(--text-muted)" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Recent Conversations */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Recent Conversations</h3>
            <Link to="/dashboard/chat" style={{ fontSize: 12, color: 'var(--gold-400)', textDecoration: 'none' }}>
              View all
            </Link>
          </div>

          {recentChats.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <MessageSquare size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No conversations yet</p>
              <Link to="/dashboard/chat" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
                Start Chatting
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentChats.map(chat => (
                <Link
                  key={chat._id}
                  to={`/dashboard/chat?id=${chat._id}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: 'var(--bg-tertiary)',
                    textDecoration: 'none',
                    transition: 'var(--transition)',
                  }}
                >
                  <MessageSquare size={14} color="var(--gold-400)" />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div className="truncate" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {chat.title}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {chat.messageCount} messages
                    </div>
                  </div>
                  <Clock size={12} color="var(--text-muted)" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Legal Tip of the Day */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 18 }}>💡</span>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Legal Tip of the Day</h3>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, fontStyle: 'italic' }}>
              "{tip}"
            </p>
          </div>

          {user?.plan === 'free' && (
            <div style={{
              padding: '20px',
              background: 'linear-gradient(135deg, rgba(246,201,14,0.12), rgba(246,201,14,0.04))',
              border: '1px solid rgba(246,201,14,0.3)',
              borderRadius: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Zap size={16} color="var(--gold-400)" />
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--gold-400)' }}>
                  Upgrade to Pro
                </span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.5 }}>
                Get 1000 queries/month, case strategy AI, and PDF export.
              </p>
              <Link to="/dashboard/billing" className="btn btn-primary btn-sm full-width" style={{ justifyContent: 'center' }}>
                View Plans <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
