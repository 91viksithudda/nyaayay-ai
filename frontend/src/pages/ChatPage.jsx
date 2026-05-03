import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Plus, Trash2, MessageSquare, Copy, Check,
  Globe, ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../context/AuthContext';
import toast from 'react-hot-toast';

const PROMPT_SUGGESTIONS = [
  'What are the key elements of a valid contract under Indian Contract Act?',
  'Explain IPC Section 302 and applicable defences',
  'What are grounds for filing a writ petition under Article 226?',
  'Draft a bail application for a non-bailable offence',
  'What is the limitation period for filing a civil suit?',
  'Explain the difference between cognizable and non-cognizable offences',
  'What are the rights of an accused under CrPC?',
  'When can a court grant an ex-parte injunction?',
];

function TypingIndicator() {
  return (
    <div className="chat-message">
      <div className="chat-avatar ai-avatar">⚖️</div>
      <div className="chat-bubble ai" style={{ display: 'flex', alignItems: 'center' }}>
        <div className="typing-dots">
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg }) {
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();

  const copy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <motion.div
      className={`chat-message ${msg.role === 'user' ? 'user' : ''}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {msg.role === 'assistant' && (
        <div className="chat-avatar ai-avatar">⚖️</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: '75%' }}>
        <div className={`chat-bubble ${msg.role === 'user' ? 'user' : 'ai'}`}>
          {msg.content}
        </div>

        {msg.role === 'assistant' && (
          <button
            onClick={copy}
            style={{
              alignSelf: 'flex-start',
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 11, color: 'var(--text-muted)',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '2px 6px', borderRadius: 4,
            }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        )}
      </div>

      {msg.role === 'user' && (
        <div className="chat-avatar user-avatar">{initials}</div>
      )}
    </motion.div>
  );
}

export default function ChatPage() {
  const { user, updateUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [language, setLanguage] = useState('en');
  const [sidebarWidth] = useState(280);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  // Load conversations
  useEffect(() => {
    loadConversations();
  }, []);

  // Load chat from URL param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const chatId = params.get('id');
    if (chatId && chatId !== activeChatId) {
      loadChat(chatId);
    }
  }, [location.search]);

  const loadConversations = async () => {
    try {
      const res = await api.get('/chat');
      setConversations(res.data.chats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingConvs(false);
    }
  };

  const loadChat = async (chatId) => {
    try {
      const res = await api.get(`/chat/${chatId}`);
      setActiveChatId(chatId);
      setMessages(res.data.chat.messages);
    } catch (err) {
      toast.error('Could not load conversation');
    }
  };

  const startNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
    navigate('/dashboard/chat');
  };

  const sendMessage = async (messageText = input) => {
    if (!messageText.trim() || sending) return;
    if (!user?.useOwnApiKey && user?.credits <= 0) {
      toast.error('No credits remaining. Please upgrade your plan.');
      return;
    }

    const userMsg = { role: 'user', content: messageText, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const res = await api.post('/chat', {
        message: messageText,
        chatId: activeChatId,
        language,
      });

      if (!activeChatId) {
        setActiveChatId(res.data.chatId);
        navigate(`/dashboard/chat?id=${res.data.chatId}`, { replace: true });
      }

      setMessages(prev => [...prev, res.data.message]);
      updateUser({ credits: res.data.credits });
      loadConversations();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to send message';
      toast.error(msg);
      setMessages(prev => prev.slice(0, -1)); // Remove optimistic message
    } finally {
      setSending(false);
    }
  };

  const deleteConversation = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/chat/${id}`);
      setConversations(prev => prev.filter(c => c._id !== id));
      if (activeChatId === id) startNewChat();
      toast.success('Conversation deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const autoResize = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>

      {/* ─── Conversation Sidebar ──────────────────────────────────────── */}
      <div style={{
        width: sidebarWidth,
        borderRight: '1px solid var(--border-color)',
        background: 'var(--navy-950)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
          <button className="btn btn-primary full-width" style={{ justifyContent: 'center' }} onClick={startNewChat}>
            <Plus size={16} /> New Conversation
          </button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
          {loadingConvs ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 52, margin: '4px 0', borderRadius: 8 }} />
            ))
          ) : conversations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <MessageSquare size={28} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No conversations yet</p>
            </div>
          ) : (
            conversations.map(conv => (
              <div
                key={conv._id}
                onClick={() => { setActiveChatId(conv._id); loadChat(conv._id); navigate(`/dashboard/chat?id=${conv._id}`); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 10px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  background: activeChatId === conv._id ? 'rgba(246,201,14,0.08)' : 'transparent',
                  border: activeChatId === conv._id ? '1px solid rgba(246,201,14,0.2)' : '1px solid transparent',
                  transition: 'all 0.2s',
                  marginBottom: 2,
                }}
              >
                <MessageSquare size={14} style={{ color: 'var(--gold-400)', flexShrink: 0 }} />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div className="truncate" style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                    {conv.title}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                    {conv.messageCount} messages
                  </div>
                </div>
                <button
                  onClick={(e) => deleteConversation(conv._id, e)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', padding: 4, borderRadius: 4,
                    opacity: 0, transition: 'opacity 0.2s',
                    flexShrink: 0,
                  }}
                  className="delete-btn"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ─── Main Chat Area ────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Messages */}
        <div className="chat-messages" style={{ flex: 1 }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 24px' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⚖️</div>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
                How can NyayaAI help you today?
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 32, maxWidth: 500, margin: '0 auto 32px' }}>
                Ask any legal question. Get expert answers on Indian law, case strategy, and legal procedure.
              </p>
              <div className="prompt-chips" style={{ justifyContent: 'center', maxWidth: 700, margin: '0 auto' }}>
                {PROMPT_SUGGESTIONS.slice(0, 6).map(p => (
                  <button key={p} className="prompt-chip" onClick={() => sendMessage(p)}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} />
          ))}

          {sending && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="chat-input-area">
          {/* Language toggle */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <Globe size={13} color="var(--text-muted)" />
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                style={{
                  background: 'none', border: 'none', color: 'var(--text-muted)',
                  fontSize: 12, cursor: 'pointer', outline: 'none',
                }}
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
              </select>
            </div>
          </div>

          <div className="chat-input-wrapper" style={{ maxWidth: '100%' }}>
            <textarea
              ref={textareaRef}
              className="chat-textarea"
              placeholder="Ask a legal question... (Enter to send, Shift+Enter for newline)"
              value={input}
              onChange={e => { setInput(e.target.value); autoResize(e); }}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={sending}
            />
            <button
              className="chat-send-btn"
              onClick={() => sendMessage()}
              disabled={!input.trim() || sending}
              id="send-message-btn"
            >
              <Send size={18} />
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
            NyayaAI can make mistakes. Verify important legal information with a qualified advocate.
          </div>
        </div>
      </div>

      <style>{`
        .delete-btn { opacity: 0 !important; }
        div:hover > .delete-btn { opacity: 1 !important; }
      `}</style>
    </div>
  );
}
