import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, MessageSquare, FileText, TrendingUp, Shield, RefreshCw, Search } from 'lucide-react';
import { api } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users);
    } catch (err) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const toggleBlock = async (userId, isBlocked) => {
    try {
      await api.patch(`/admin/users/${userId}/block`, { isBlocked: !isBlocked });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isBlocked: !isBlocked } : u));
      toast.success(isBlocked ? 'User unblocked' : 'User blocked');
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const planColors = { free: '#64748b', basic: '#3b82f6', pro: '#f6c90e', unlimited: '#10b981' };

  return (
    <div className="page-container">
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border-color)', paddingBottom: 0 }}>
        {['overview', 'users'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '10px 20px',
              border: 'none', background: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: 600, textTransform: 'capitalize',
              color: tab === t ? 'var(--gold-400)' : 'var(--text-muted)',
              borderBottom: tab === t ? '2px solid var(--gold-400)' : '2px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            {t === 'overview' ? '📊 Overview' : '👥 Users'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />
          ))}
        </div>
      ) : tab === 'overview' ? (
        <div>
          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
            {stats && [
              { icon: <Users size={20} />, label: 'Total Users', value: stats.totalUsers },
              { icon: <MessageSquare size={20} />, label: 'Total Chats', value: stats.totalChats },
              { icon: <FileText size={20} />, label: 'Total Drafts', value: stats.totalDrafts },
              { icon: <Shield size={20} />, label: 'Blocked Users', value: stats.blockedUsers },
              { icon: <TrendingUp size={20} />, label: 'Total Queries', value: stats.usageStats?.totalQueries || 0 },
            ].map(item => (
              <div key={item.label} className="card" style={{ padding: '20px', display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: 'rgba(246,201,14,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--gold-400)',
                }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--gold-400)' }}>{item.value}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Plan breakdown */}
          {stats?.planBreakdown && (
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Plan Distribution</h3>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {stats.planBreakdown.map(p => (
                  <div key={p._id} style={{
                    padding: '12px 20px', borderRadius: 10,
                    background: `${planColors[p._id] || '#64748b'}15`,
                    border: `1px solid ${planColors[p._id] || '#64748b'}30`,
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: planColors[p._id] || '#64748b' }}>{p.count}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{p._id}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent users */}
          {stats?.recentUsers && (
            <div className="card" style={{ padding: '24px', marginTop: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Recent Users</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Plan</th>
                    <th>Credits</th>
                    <th>Queries</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentUsers.map(u => (
                    <tr key={u._id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className="badge" style={{
                          background: `${planColors[u.plan]}15`,
                          color: planColors[u.plan] || '#64748b',
                          border: `1px solid ${planColors[u.plan]}30`,
                        }}>
                          {u.plan}
                        </span>
                      </td>
                      <td>{u.credits}</td>
                      <td>{u.usageCount}</td>
                      <td>
                        <span className={`badge ${u.isBlocked ? 'badge-red' : 'badge-green'}`}>
                          {u.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: 38 }}
                placeholder="Search users..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button className="btn btn-ghost btn-icon" onClick={fetchData}>
              <RefreshCw size={16} />
            </button>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Plan</th>
                <th>Credits</th>
                <th>Queries</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users
                .filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
                .map(u => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.email}</div>
                    </td>
                    <td>
                      <span className="badge" style={{
                        background: `${planColors[u.plan]}15`,
                        color: planColors[u.plan] || '#64748b',
                        border: `1px solid ${planColors[u.plan]}30`,
                      }}>
                        {u.plan}
                      </span>
                    </td>
                    <td>{u.credits}</td>
                    <td>{u.usageCount}</td>
                    <td>
                      <span className={`badge ${u.isBlocked ? 'badge-red' : 'badge-green'}`}>
                        {u.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`btn ${u.isBlocked ? 'btn-secondary' : 'btn-danger'} btn-sm`}
                        onClick={() => toggleBlock(u._id, u.isBlocked)}
                      >
                        {u.isBlocked ? 'Unblock' : 'Block'}
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
