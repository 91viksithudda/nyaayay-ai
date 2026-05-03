import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../context/AuthContext';
import toast from 'react-hot-toast';

const PLANS = [
  {
    id: 'free',
    name: 'Free Trial',
    price: 0,
    credits: 20,
    color: '#64748b',
    features: [
      '20 AI queries',
      'Basic legal chat',
      'FIR & Complaint drafts',
      'Email support',
    ],
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 499,
    credits: 200,
    color: '#3b82f6',
    features: [
      '200 AI queries/month',
      'All 7 draft types',
      'Conversation history',
      'PDF export',
      'Priority support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 999,
    credits: 1000,
    color: '#f6c90e',
    featured: true,
    badge: 'Most Popular',
    features: [
      '1,000 AI queries/month',
      'Case strategy AI',
      'Multi-language (EN + HI)',
      'BYOK support',
      'Usage analytics',
      'WhatsApp support',
    ],
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    price: 1999,
    credits: 999999,
    color: '#10b981',
    features: [
      'Unlimited AI queries',
      'Admin panel access',
      'Bulk draft generation',
      'API access',
      'White-label option',
      '24/7 dedicated support',
    ],
  },
];

export default function BillingPage() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(null);

  const handleUpgrade = async (plan) => {
    if (plan.id === 'free' || plan.id === user?.plan) return;

    setLoading(plan.id);
    try {
      const res = await api.post('/payments/create-order', { plan: plan.id });
      const { orderId, amount, currency, key } = res.data;

      const options = {
        key,
        amount,
        currency,
        name: 'NyayaAI',
        description: `${plan.name} Plan — Monthly Subscription`,
        image: '',
        order_id: orderId,
        handler: async (response) => {
          try {
            const verifyRes = await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: plan.id,
            });
            updateUser(verifyRes.data.user);
            toast.success(verifyRes.data.message);
          } catch (err) {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: { color: '#f6c90e' },
        modal: {
          ondismiss: () => { setLoading(null); },
        },
      };

      if (typeof window.Razorpay === 'undefined') {
        toast.error('Razorpay not loaded. Contact support.');
        setLoading(null);
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create order');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="page-container">
      <p style={{ color: 'var(--text-muted)', marginBottom: 8, fontSize: 14 }}>
        Current plan: <strong style={{ color: 'var(--gold-400)', textTransform: 'capitalize' }}>{user?.plan}</strong>
        {' · '} Credits: <strong style={{ color: 'var(--gold-400)' }}>
          {user?.plan === 'unlimited' ? '∞' : user?.credits}
        </strong>
      </p>
      <p style={{ color: 'var(--text-muted)', marginBottom: 40, fontSize: 13 }}>
        All plans are billed monthly. Cancel anytime.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 20,
        alignItems: 'start',
      }}>
        {PLANS.map((plan) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`pricing-card ${plan.featured ? 'featured' : ''}`}
            style={{ position: 'relative' }}
          >
            {plan.badge && (
              <div style={{
                position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, var(--gold-400), var(--gold-500))',
                color: '#0a192f', fontSize: 11, fontWeight: 800,
                padding: '4px 14px', borderRadius: 20,
              }}>
                {plan.badge}
              </div>
            )}

            {user?.plan === plan.id && (
              <div className="badge badge-green" style={{ position: 'absolute', top: 20, right: 20 }}>
                Current
              </div>
            )}

            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: `${plan.color}20`,
              border: `1px solid ${plan.color}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 14, fontSize: 18,
            }}>
              ⚡
            </div>

            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
              {plan.name}
            </div>

            <div className="pricing-price">
              {plan.price === 0 ? 'Free' : `₹${plan.price}`}
              {plan.price > 0 && <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>/mo</span>}
            </div>

            <div style={{ fontSize: 13, color: plan.color, marginBottom: 20, marginTop: 4 }}>
              {plan.credits === 999999 ? 'Unlimited queries' : `${plan.credits.toLocaleString()} queries/month`}
            </div>

            <ul style={{ listStyle: 'none', marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {plan.features.map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <CheckCircle size={14} color={plan.color} />
                  {f}
                </li>
              ))}
            </ul>

            <button
              className={`btn full-width ${plan.featured ? 'btn-primary' : 'btn-ghost'}`}
              style={{ justifyContent: 'center' }}
              disabled={plan.id === user?.plan || loading === plan.id || plan.id === 'free'}
              onClick={() => handleUpgrade(plan)}
              id={`upgrade-${plan.id}-btn`}
            >
              {loading === plan.id ? '⏳ Processing...' :
                plan.id === user?.plan ? '✓ Current Plan' :
                  plan.id === 'free' ? 'Free Plan' :
                    `Upgrade to ${plan.name}`}
            </button>
          </motion.div>
        ))}
      </div>

      <div style={{
        marginTop: 40,
        padding: '20px 24px',
        background: 'rgba(246,201,14,0.05)',
        border: '1px solid rgba(246,201,14,0.15)',
        borderRadius: 12,
        fontSize: 13,
        color: 'var(--text-muted)',
        lineHeight: 1.7,
      }}>
        <strong style={{ color: 'var(--text-primary)' }}>💳 Secure Payments:</strong> All payments are processed by Razorpay
        with bank-grade security. We don't store card details.
        For any billing issues, contact us at billing@nyayaai.com
      </div>

      {/* Load Razorpay SDK */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" />
    </div>
  );
}
