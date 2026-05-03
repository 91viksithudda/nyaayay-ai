import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, ChevronRight, Lightbulb } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STRATEGY_TEMPLATES = [
  { label: 'Criminal Case Defence', placeholder: 'e.g., cheating case under IPC 420, accused has alibi' },
  { label: 'Civil Property Dispute', placeholder: 'e.g., ancestral property dispute between siblings' },
  { label: 'Matrimonial Case', placeholder: 'e.g., divorce petition with domestic violence allegations' },
  { label: 'Consumer Case', placeholder: 'e.g., builder not delivering flat, refund dispute' },
  { label: 'Employment Dispute', placeholder: 'e.g., wrongful termination, salary non-payment' },
  { label: 'Bail Strategy', placeholder: 'e.g., accused under NDPS Act, first-time offender' },
];

export default function StrategyPage() {
  const { user } = useAuth();
  const [caseType, setCaseType] = useState('');
  const [caseFacts, setCaseFacts] = useState('');
  const [partyRole, setPartyRole] = useState('defence');
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState('');

  const generateStrategy = async () => {
    if (!caseType.trim() || !caseFacts.trim()) {
      toast.error('Please fill in case type and facts');
      return;
    }

    setLoading(true);
    setStrategy('');

    try {
      const prompt = `Provide a comprehensive case strategy for a ${caseType} case.

Role: ${partyRole === 'defence' ? 'Defence Advocate' : 'Prosecution/Plaintiff Advocate'}

Case Facts:
${caseFacts}

Please provide:
1. Key legal issues involved
2. Applicable sections of law (IPC/CrPC/CPC as relevant)
3. Strengths of the case
4. Weaknesses and risks
5. Evidence required
6. Step-by-step strategy
7. Relevant landmark judgments to cite
8. Timeline and procedural steps
9. Settlement possibilities (if applicable)
10. Overall recommendation`;

      const res = await api.post('/chat', {
        message: prompt,
        language: 'en',
      });

      setStrategy(res.data.message.content);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Strategy generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: 14 }}>
        Get AI-powered case strategy insights, applicable legal sections, landmark judgments, and step-by-step plans.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24 }}>
        {/* Input Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Case Details</h3>

            <div className="form-group">
              <label className="form-label">Case Type</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Cheating under IPC 420"
                value={caseType}
                onChange={e => setCaseType(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Quick Templates</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {STRATEGY_TEMPLATES.map(t => (
                  <button
                    key={t.label}
                    onClick={() => { setCaseType(t.label); setCaseFacts(t.placeholder); }}
                    style={{
                      textAlign: 'left', fontSize: 12, padding: '8px 10px',
                      borderRadius: 6, border: '1px solid var(--border-color)',
                      background: 'transparent', cursor: 'pointer',
                      color: 'var(--text-secondary)', transition: 'all 0.2s',
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Your Role</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { val: 'defence', label: '🛡️ Defence' },
                  { val: 'prosecution', label: '⚔️ Prosecution' },
                ].map(role => (
                  <button
                    key={role.val}
                    onClick={() => setPartyRole(role.val)}
                    style={{
                      flex: 1, padding: '10px',
                      borderRadius: 8,
                      border: partyRole === role.val ? '1px solid var(--gold-400)' : '1px solid var(--border-color)',
                      background: partyRole === role.val ? 'rgba(246,201,14,0.08)' : 'transparent',
                      cursor: 'pointer', transition: 'all 0.2s',
                      fontSize: 13, fontWeight: partyRole === role.val ? 700 : 400,
                      color: partyRole === role.val ? 'var(--gold-400)' : 'var(--text-muted)',
                    }}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Case Facts & Background</label>
              <textarea
                className="form-input"
                rows={6}
                placeholder="Describe the facts of the case in detail..."
                value={caseFacts}
                onChange={e => setCaseFacts(e.target.value)}
              />
            </div>

            <button
              className="btn btn-primary full-width"
              style={{ justifyContent: 'center' }}
              onClick={generateStrategy}
              disabled={loading}
              id="generate-strategy-btn"
            >
              {loading ? (
                <>
                  <div style={{
                    width: 16, height: 16, border: '2px solid #0a192f',
                    borderTopColor: 'transparent', borderRadius: '50%',
                    animation: 'spin 0.6s linear infinite',
                  }} />
                  Generating Strategy...
                </>
              ) : (
                <><Brain size={16} /> Generate Strategy</>
              )}
            </button>
          </div>
        </div>

        {/* Strategy Output */}
        <div className="card" style={{ padding: '24px', minHeight: 400 }}>
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="skeleton" style={{ height: 24, width: '50%' }} />
              <div className="skeleton" style={{ height: 18, width: '80%' }} />
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 16, width: `${60 + Math.random() * 40}%` }} />
              ))}
            </div>
          )}

          {!loading && !strategy && (
            <div style={{ textAlign: 'center', paddingTop: 80 }}>
              <Brain size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
                AI Case Strategy
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Fill in the case details and click Generate Strategy to get comprehensive legal insights.
              </p>
            </div>
          )}

          {!loading && strategy && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Brain size={18} color="var(--gold-400)" />
                  Case Strategy: {caseType}
                </h3>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => { navigator.clipboard.writeText(strategy); toast.success('Copied!'); }}
                >
                  📋 Copy
                </button>
              </div>
              <div style={{
                whiteSpace: 'pre-wrap',
                fontSize: 14,
                lineHeight: 1.8,
                color: 'var(--text-secondary)',
                maxHeight: 600,
                overflowY: 'auto',
              }}>
                {strategy}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
