import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Copy, Check, RefreshCw, Globe, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../context/AuthContext';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';

const DRAFT_TYPES = [
  { id: 'fir', label: 'FIR (First Information Report)', icon: '🚨' },
  { id: 'complaint', label: 'Legal Complaint / Petition', icon: '⚖️' },
  { id: 'agreement', label: 'Agreement / Contract', icon: '🤝' },
  { id: 'notice', label: 'Legal Notice', icon: '📨' },
  { id: 'affidavit', label: 'Affidavit', icon: '📋' },
  { id: 'bail_application', label: 'Bail Application', icon: '🔓' },
  { id: 'power_of_attorney', label: 'Power of Attorney', icon: '✍️' },
];

const FORM_FIELDS = {
  fir: [
    { key: 'complainantName', label: 'Complainant Name', placeholder: 'Full name of the complainant' },
    { key: 'complainantAddress', label: 'Complainant Address', placeholder: 'Complete address' },
    { key: 'accusedName', label: 'Accused Name/Description', placeholder: 'Name or description of accused' },
    { key: 'incidentDate', label: 'Date of Incident', placeholder: 'DD/MM/YYYY', type: 'date' },
    { key: 'incidentPlace', label: 'Place of Incident', placeholder: 'Location where incident occurred' },
    { key: 'incidentDescription', label: 'Description of Incident', placeholder: 'Detailed description...', type: 'textarea' },
    { key: 'ipcSections', label: 'Applicable IPC Sections (if known)', placeholder: 'e.g., 420, 302, 376' },
    { key: 'policeStation', label: 'Police Station', placeholder: 'Name of nearest police station' },
  ],
  complaint: [
    { key: 'courtName', label: 'Court / Authority', placeholder: 'Name of the court or authority' },
    { key: 'complainantName', label: 'Complainant Name', placeholder: 'Full name' },
    { key: 'complainantAddress', label: 'Address', placeholder: 'Complete address' },
    { key: 'respondentName', label: 'Respondent/Opposite Party', placeholder: 'Name of respondent' },
    { key: 'caseType', label: 'Nature of Complaint', placeholder: 'e.g., Criminal, Civil, Consumer' },
    { key: 'facts', label: 'Brief Facts', placeholder: 'State the facts of the case...', type: 'textarea' },
    { key: 'prayer', label: 'Relief/Prayer Sought', placeholder: 'What relief do you seek?', type: 'textarea' },
  ],
  agreement: [
    { key: 'party1Name', label: 'Party 1 Name', placeholder: 'First party full name' },
    { key: 'party1Address', label: 'Party 1 Address', placeholder: 'Complete address' },
    { key: 'party2Name', label: 'Party 2 Name', placeholder: 'Second party full name' },
    { key: 'party2Address', label: 'Party 2 Address', placeholder: 'Complete address' },
    { key: 'agreementType', label: 'Type of Agreement', placeholder: 'e.g., Sale, Lease, Service, Employment' },
    { key: 'terms', label: 'Key Terms & Conditions', placeholder: 'Describe the main terms...', type: 'textarea' },
    { key: 'consideration', label: 'Consideration / Payment', placeholder: 'Amount or consideration involved' },
    { key: 'startDate', label: 'Start Date', type: 'date' },
    { key: 'endDate', label: 'End Date (if applicable)', type: 'date' },
  ],
  notice: [
    { key: 'senderName', label: 'Sender Name', placeholder: 'Your full name / advocate name' },
    { key: 'senderAddress', label: 'Sender Address', placeholder: 'Complete address' },
    { key: 'recipientName', label: 'Recipient Name', placeholder: 'Noticee full name' },
    { key: 'recipientAddress', label: 'Recipient Address', placeholder: 'Complete address' },
    { key: 'subject', label: 'Subject of Notice', placeholder: 'Brief subject line' },
    { key: 'demand', label: 'Demand / Grievance', placeholder: 'What are you demanding?', type: 'textarea' },
    { key: 'timeLimit', label: 'Time Limit for Response', placeholder: 'e.g., 15 days, 30 days' },
    { key: 'legalBasis', label: 'Legal Basis', placeholder: 'Applicable law/section', type: 'textarea' },
  ],
  affidavit: [
    { key: 'deponentName', label: 'Deponent Name', placeholder: 'Name of person swearing' },
    { key: 'deponentAddress', label: 'Deponent Address', placeholder: 'Permanent address' },
    { key: 'deponentAge', label: 'Age', placeholder: 'Age of deponent' },
    { key: 'statements', label: 'Statements to Affirm', placeholder: 'List the facts being affirmed...', type: 'textarea' },
    { key: 'purpose', label: 'Purpose of Affidavit', placeholder: 'What is this affidavit for?' },
  ],
  bail_application: [
    { key: 'applicantName', label: 'Applicant Name', placeholder: 'Name of accused/applicant' },
    { key: 'caseNumber', label: 'Case Number / FIR Number', placeholder: 'FIR No. or Case No.' },
    { key: 'policeStation', label: 'Police Station', placeholder: 'Station where FIR registered' },
    { key: 'offence', label: 'Offence Charged', placeholder: 'IPC sections / charge' },
    { key: 'groundsForBail', label: 'Grounds for Bail', placeholder: 'Reasons bail should be granted...', type: 'textarea' },
    { key: 'courtName', label: 'Court', placeholder: 'Name of the court' },
    { key: 'dateSince', label: 'Date of Arrest / Custody', type: 'date' },
  ],
  power_of_attorney: [
    { key: 'grantorName', label: 'Grantor (Principal) Name', placeholder: 'Person giving authority' },
    { key: 'grantorAddress', label: 'Grantor Address', placeholder: 'Complete address' },
    { key: 'granteeName', label: 'Grantee (Attorney) Name', placeholder: 'Person receiving authority' },
    { key: 'granteeAddress', label: 'Grantee Address', placeholder: 'Complete address' },
    { key: 'scope', label: 'Scope of Authority', placeholder: 'What powers are being granted?', type: 'textarea' },
    { key: 'limitations', label: 'Limitations / Restrictions', placeholder: 'Any restrictions on authority' },
    { key: 'duration', label: 'Duration / Validity', placeholder: 'e.g., 1 year, until revoked' },
  ],
};

export default function DraftsPage() {
  const { user, updateUser } = useAuth();
  const [selectedType, setSelectedType] = useState('fir');
  const [formData, setFormData] = useState({});
  const [language, setLanguage] = useState('en');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    const fields = FORM_FIELDS[selectedType] || [];
    const required = fields.slice(0, 3);
    for (const field of required) {
      if (!formData[field.key]?.trim()) {
        toast.error(`Please fill in: ${field.label}`);
        return;
      }
    }

    setGenerating(true);
    try {
      const res = await api.post('/drafts/generate', {
        type: selectedType,
        formData,
        language,
      });
      setGenerated(res.data.draft);
      setEditContent(res.data.draft.content);
      updateUser({ credits: user.credits - 2 });
      toast.success('Draft generated successfully! ✅');
    } catch (err) {
      const msg = err.response?.data?.error || 'Generation failed. Check API key or credits.';
      toast.error(msg);
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generated) return;
    try {
      await api.patch(`/drafts/${generated._id}`, { editedContent: editContent });
      toast.success('Draft saved!');
    } catch (err) {
      toast.error('Failed to save');
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', format: 'a4' });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');

    const content = editContent || generated?.content || '';
    const lines = doc.splitTextToSize(content, 170);
    let y = 20;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(generated?.title || 'Legal Document', 20, y);
    y += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`Generated by NyayaAI on ${new Date().toLocaleDateString('en-IN')}`, 20, y);
    y += 10;

    doc.setLineWidth(0.3);
    doc.line(20, y, 190, y);
    y += 8;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    for (const line of lines) {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(line, 20, y);
      y += 6;
    }

    doc.save(`${generated?.title || 'legal-draft'}.pdf`);
    toast.success('Downloaded as PDF!');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(editContent || generated?.content || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard!');
  };

  const currentFields = FORM_FIELDS[selectedType] || [];

  return (
    <div className="page-container">
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, height: '100%' }}>

        {/* ─── Left Panel: Form ───────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Document Type Select */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Document Type</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {DRAFT_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => { setSelectedType(type.id); setFormData({}); setGenerated(null); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 12px', borderRadius: 8,
                    border: selectedType === type.id ? '1px solid rgba(246,201,14,0.4)' : '1px solid transparent',
                    background: selectedType === type.id ? 'rgba(246,201,14,0.08)' : 'transparent',
                    cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
                    color: selectedType === type.id ? 'var(--gold-400)' : 'var(--text-secondary)',
                    fontWeight: selectedType === type.id ? 600 : 400,
                    fontSize: 13,
                  }}
                >
                  <span>{type.icon}</span>
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div className="card" style={{ padding: '16px' }}>
            <label className="form-label">Output Language</label>
            <select
              className="form-input"
              value={language}
              onChange={e => setLanguage(e.target.value)}
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
            </select>
          </div>
        </div>

        {/* ─── Right Panel: Form + Output ─────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, overflow: 'auto' }}>

          {/* Form Inputs */}
          {!generated && (
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <FileText size={18} color="var(--gold-400)" />
                <h2 style={{ fontSize: 16, fontWeight: 700 }}>
                  {DRAFT_TYPES.find(t => t.id === selectedType)?.label}
                </h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {currentFields.map(field => (
                  <div
                    key={field.key}
                    className="form-group"
                    style={{
                      marginBottom: 0,
                      gridColumn: (field.type === 'textarea') ? '1 / -1' : 'auto',
                    }}
                  >
                    <label className="form-label">{field.label}</label>
                    {field.type === 'textarea' ? (
                      <textarea
                        className="form-input"
                        placeholder={field.placeholder}
                        rows={3}
                        value={formData[field.key] || ''}
                        onChange={e => setFormData(p => ({ ...p, [field.key]: e.target.value }))}
                      />
                    ) : (
                      <input
                        type={field.type || 'text'}
                        className="form-input"
                        placeholder={field.placeholder}
                        value={formData[field.key] || ''}
                        onChange={e => setFormData(p => ({ ...p, [field.key]: e.target.value }))}
                      />
                    )}
                  </div>
                ))}
              </div>

              <button
                className="btn btn-primary"
                style={{ marginTop: 24 }}
                onClick={handleGenerate}
                disabled={generating}
                id="generate-draft-btn"
              >
                {generating ? (
                  <>
                    <div style={{
                      width: 16, height: 16, border: '2px solid #0a192f',
                      borderTopColor: 'transparent', borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite',
                    }} />
                    Generating...
                  </>
                ) : (
                  <>✨ Generate {DRAFT_TYPES.find(t => t.id === selectedType)?.label}</>
                )}
              </button>

              {!user?.useOwnApiKey && (
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                  💳 This will use 2 credits. Remaining: {user?.credits}
                </p>
              )}
            </div>
          )}

          {/* Skeleton loader */}
          {generating && (
            <div className="card" style={{ padding: '24px' }}>
              <div className="skeleton" style={{ height: 24, width: '60%', marginBottom: 16 }} />
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 16, marginBottom: 10, width: `${70 + Math.random() * 30}%` }} />
              ))}
            </div>
          )}

          {/* Generated Draft */}
          {generated && !generating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
              style={{ padding: '24px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700 }}>{generated.title}</h3>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setGenerated(null)}>
                    <RefreshCw size={14} /> Regenerate
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={copyToClipboard}>
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={downloadPDF}>
                    <Download size={14} /> Download PDF
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={handleSave}>
                    💾 Save
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                ✏️ You can edit the content below before downloading:
              </div>

              <textarea
                className="draft-editor"
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                style={{ width: '100%', minHeight: 500 }}
              />
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
