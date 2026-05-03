import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Scale, FileText, Brain, Shield, ChevronRight, Star,
  MessageSquare, Zap, Globe, Lock, CheckCircle, ArrowRight
} from 'lucide-react';

const TYPING_PHRASES = [
  'Your AI Legal Assistant',
  'Draft Legal Notices Instantly',
  'Get Case Strategy Insights',
  'Generate FIRs in Seconds',
  'Research Indian Law with AI',
];

function TypewriterText() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [text, setText] = useState('');

  useEffect(() => {
    const current = TYPING_PHRASES[phraseIndex];
    let timeout;

    if (!deleting && charIndex < current.length) {
      timeout = setTimeout(() => {
        setText(current.slice(0, charIndex + 1));
        setCharIndex(c => c + 1);
      }, 60);
    } else if (!deleting && charIndex === current.length) {
      timeout = setTimeout(() => setDeleting(true), 2000);
    } else if (deleting && charIndex > 0) {
      timeout = setTimeout(() => {
        setText(current.slice(0, charIndex - 1));
        setCharIndex(c => c - 1);
      }, 35);
    } else if (deleting && charIndex === 0) {
      setDeleting(false);
      setPhraseIndex(p => (p + 1) % TYPING_PHRASES.length);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, deleting, phraseIndex]);

  return (
    <span>
      <span className="gradient-text">{text}</span>
      <span className="typewriter-cursor" />
    </span>
  );
}

const features = [
  {
    icon: <MessageSquare size={24} />,
    title: 'AI Legal Chat',
    desc: 'Ask any Indian law question — IPC, CrPC, CPC, Constitution — get expert answers instantly.',
    color: '#f6c90e',
  },
  {
    icon: <FileText size={24} />,
    title: 'Draft Generator',
    desc: 'Generate FIRs, Legal Notices, Agreements, and Complaints in seconds with proper legal formatting.',
    color: '#64ffda',
  },
  {
    icon: <Brain size={24} />,
    title: 'Case Strategy',
    desc: 'AI-powered insights for case preparation, precedent research, and winning strategy formulation.',
    color: '#f6c90e',
  },
  {
    icon: <Shield size={24} />,
    title: 'Secure BYOK',
    desc: 'Use your own OpenAI key. Your data stays yours — encrypted at rest, never shared.',
    color: '#64ffda',
  },
  {
    icon: <Globe size={24} />,
    title: 'Multi-Language',
    desc: 'Full support for English and Hindi. Generate drafts in your preferred language.',
    color: '#f6c90e',
  },
  {
    icon: <Zap size={24} />,
    title: 'Instant Results',
    desc: 'Stream AI responses in real-time. No waiting. Professional quality in under 30 seconds.',
    color: '#64ffda',
  },
];

const steps = [
  { num: '01', title: 'Create Account', desc: 'Sign up free. Get 20 queries instantly. No credit card needed.' },
  { num: '02', title: 'Ask or Draft', desc: 'Chat with AI for legal queries or pick a document type to generate.' },
  { num: '03', title: 'Download & Use', desc: 'Export as PDF, copy to clipboard, or continue editing in-app.' },
];

const testimonials = [
  {
    name: 'Adv. Priya Sharma',
    role: 'Senior Advocate, Delhi HC',
    text: 'NyayaAI reduced my draft preparation time by 70%. The FIR and legal notice templates are legally accurate and save hours of manual work.',
    rating: 5,
  },
  {
    name: 'Adv. Rahul Mehta',
    role: 'Criminal Law Specialist, Mumbai',
    text: 'The case strategy feature is outstanding. It references relevant sections and IPC provisions I might have missed. Highly recommended.',
    rating: 5,
  },
  {
    name: 'Adv. Kavitha Nair',
    role: 'Family Law Practitioner, Chennai',
    text: 'As a solo practitioner, NyayaAI is like having a junior associate available 24/7. The Hindi support is excellent for regional clients.',
    rating: 5,
  },
];

const plans = [
  {
    name: 'Free Trial',
    price: 0,
    credits: 20,
    features: ['20 AI queries', 'Basic legal chat', '2 draft types', 'Email support'],
    cta: 'Start Free',
    href: '/register',
  },
  {
    name: 'Basic',
    price: 499,
    credits: 200,
    features: ['200 AI queries/month', 'All 7 draft types', 'Chat history', 'PDF export', 'Priority support'],
    cta: 'Get Basic',
    href: '/register',
    featured: false,
  },
  {
    name: 'Pro',
    price: 999,
    credits: 1000,
    features: ['1000 AI queries/month', 'Case strategy AI', 'Multi-language', 'BYOK support', 'Analytics dashboard'],
    cta: 'Get Pro',
    href: '/register',
    featured: true,
    badge: 'Most Popular',
  },
  {
    name: 'Unlimited',
    price: 1999,
    credits: '∞',
    features: ['Unlimited queries', 'Admin panel access', 'Bulk draft generation', 'API access', 'White-label option'],
    cta: 'Get Unlimited',
    href: '/register',
  },
];

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ background: 'var(--navy-950)', color: 'var(--text-primary)', minHeight: '100vh' }}>

      {/* ─── Navbar ──────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 90,
        padding: '0 40px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: scrolled ? 'rgba(2,12,27,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="sidebar-logo-icon" style={{ width: 32, height: 32, fontSize: 14 }}>⚖️</div>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#e6f1ff' }}>NyayaAI</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Start Free ✦</Link>
        </div>
      </nav>

      {/* ─── Hero ────────────────────────────────────────────────────── */}
      <section className="landing-hero" style={{ paddingTop: 100 }}>
        <div className="hero-grid-bg" />
        <div className="hero-glow" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ position: 'relative', zIndex: 1, maxWidth: 900, width: '100%' }}
        >
          <div className="section-tag" style={{ margin: '0 auto 24px', width: 'fit-content' }}>
            ⚖️ Trusted by 2,000+ Legal Professionals
          </div>

          <h1 className="hero-headline">
            India's Most Powerful<br />
            <TypewriterText />
          </h1>

          <p className="hero-subtitle">
            Generate legal drafts, research case strategy, and chat with an AI trained on
            Indian law — IPC, CrPC, CPC, Constitution and more. Built for advocates & lawyers.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-xl">
              Start Free — 20 Queries <ArrowRight size={20} />
            </Link>
            <Link to="/login" className="btn btn-ghost btn-xl">
              Sign In <ChevronRight size={18} />
            </Link>
          </div>

          <div style={{ display: 'flex', gap: 32, justifyContent: 'center', marginTop: 40, flexWrap: 'wrap' }}>
            {[
              { val: '50K+', label: 'Drafts Generated' },
              { val: '2K+', label: 'Active Lawyers' },
              { val: '99.9%', label: 'Uptime' },
              { val: '4.9★', label: 'Rating' },
            ].map(item => (
              <div key={item.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--gold-400)' }}>{item.val}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ─── Features ────────────────────────────────────────────────── */}
      <section style={{ padding: '100px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div className="section-tag" style={{ margin: '0 auto 16px' }}>Features</div>
          <h2 className="section-headline">Everything a Lawyer Needs</h2>
          <p className="section-subtext" style={{ margin: '0 auto' }}>
            Powered by advanced AI with deep knowledge of Indian legal system
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="card"
              style={{ padding: '28px 24px' }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: `${f.color}18`,
                border: `1px solid ${f.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: f.color, marginBottom: 16,
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── How It Works ─────────────────────────────────────────────── */}
      <section style={{
        padding: '80px 40px',
        background: 'rgba(17,34,64,0.4)',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <div className="section-tag" style={{ margin: '0 auto 16px' }}>How it Works</div>
          <h2 className="section-headline">Three Steps to Legal Excellence</h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 40,
            marginTop: 60,
            position: 'relative',
          }}>
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                style={{ textAlign: 'center' }}
              >
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(246,201,14,0.2), rgba(246,201,14,0.05))',
                  border: '2px solid rgba(246,201,14,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: 20, fontWeight: 900, color: 'var(--gold-400)',
                }}>
                  {step.num}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ──────────────────────────────────────────────────── */}
      <section style={{ padding: '100px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div className="section-tag" style={{ margin: '0 auto 16px' }}>Pricing</div>
          <h2 className="section-headline">Simple, Transparent Pricing</h2>
          <p className="section-subtext" style={{ margin: '0 auto' }}>
            Start free. Upgrade when you need more power.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 24,
          alignItems: 'start',
        }}>
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`pricing-card ${plan.featured ? 'featured' : ''}`}
            >
              {plan.badge && (
                <div style={{
                  position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, var(--gold-400), var(--gold-500))',
                  color: '#0a192f', fontSize: 11, fontWeight: 800,
                  padding: '4px 14px', borderRadius: 20, letterSpacing: 0.5,
                }}>
                  {plan.badge}
                </div>
              )}

              <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>
                {plan.name}
              </div>
              <div className="pricing-price">
                {plan.price === 0 ? 'Free' : `₹${plan.price}`}
                {plan.price > 0 && <span>/month</span>}
              </div>
              <div style={{ fontSize: 13, color: 'var(--gold-400)', marginBottom: 24, marginTop: 4 }}>
                {plan.credits === '∞' ? '∞ queries' : `${plan.credits} queries/month`}
              </div>

              <ul style={{ listStyle: 'none', marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--text-secondary)' }}>
                    <CheckCircle size={15} color="var(--gold-400)" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to={plan.href}
                className={`btn ${plan.featured ? 'btn-primary' : 'btn-ghost'} full-width`}
                style={{ justifyContent: 'center' }}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Testimonials ─────────────────────────────────────────────── */}
      <section style={{
        padding: '80px 40px',
        background: 'rgba(17,34,64,0.3)',
        borderTop: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="section-tag" style={{ margin: '0 auto 16px' }}>Testimonials</div>
            <h2 className="section-headline">Loved by Legal Professionals</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card"
                style={{ padding: '28px 24px' }}
              >
                <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} size={14} fill="var(--gold-400)" color="var(--gold-400)" />
                  ))}
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
                  "{t.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="sidebar-avatar" style={{ width: 40, height: 40 }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ───────────────────────────────────────────────── */}
      <section style={{ padding: '100px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(246,201,14,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <h2 className="section-headline" style={{ marginBottom: 16 }}>
            Ready to Transform Your Legal Practice?
          </h2>
          <p className="section-subtext" style={{ margin: '0 auto 40px' }}>
            Join 2,000+ advocates already using NyayaAI to save time and deliver better results.
          </p>
          <Link to="/register" className="btn btn-primary btn-xl">
            Start Free Today — No Credit Card <ArrowRight size={20} />
          </Link>
        </motion.div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '40px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="sidebar-logo-icon" style={{ width: 28, height: 28, fontSize: 12 }}>⚖️</div>
          <span style={{ fontWeight: 700, color: '#e6f1ff' }}>NyayaAI</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', maxWidth: 500 }}>
          ⚠️ <strong>Legal Disclaimer:</strong> NyayaAI is an AI tool for legal research assistance.
          It does not constitute legal advice. Consult a qualified advocate for legal representation.
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} NyayaAI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
