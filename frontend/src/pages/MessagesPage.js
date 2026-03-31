import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getConversations, getChatMessages, sendMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function MessagesPage() {
  const { chatId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const [convos, setConvos] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(chatId || null);
  const [activePerson, setActivePerson] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    getConversations()
      .then(({ data }) => { setConvos(data); if (chatId && data.length) { const c = data.find(c => c.chatId === chatId); if (c) setActivePerson(c.otherUser); } })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeChat) {
      getChatMessages(activeChat).then(({ data }) => setMessages(data));
    }
  }, [activeChat]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openChat = (convo) => {
    setActiveChat(convo.chatId);
    setActivePerson(convo.otherUser);
    navigate(`/messages/${convo.chatId}`, { replace: true });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeChat || !activePerson) return;
    setSending(true);
    try {
      const receiverId = activePerson._id;
      const { data } = await sendMessage({ receiverId, content: text.trim() });
      setMessages(prev => [...prev, data]);
      setText('');
      getConversations().then(({ data }) => setConvos(data));
    } catch { } finally { setSending(false); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page" style={{ paddingTop: 'calc(var(--navbar-h) + 16px)', paddingBottom: 0 }}>
      <div style={{ display: 'flex', height: 'calc(100vh - var(--navbar-h) - 32px)', background: 'var(--surface)', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>

        {/* Sidebar */}
        <div style={{ width: 300, flexShrink: 0, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1.1rem' }}>💬 Messages</h2>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {convos.length === 0
              ? <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>No conversations yet.<br />Start by messaging a listing owner.</div>
              : convos.map(c => (
                <div key={c.chatId} onClick={() => openChat(c)}
                  style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border)', background: activeChat === c.chatId ? 'var(--surface-2)' : 'transparent', transition: 'background 0.15s' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontFamily: 'Syne,sans-serif', flexShrink: 0 }}>
                      {c.otherUser?.name?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 13 }}>{c.otherUser?.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.lastMessage?.content}</div>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        {/* Chat Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {!activeChat
            ? <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 52 }}>💬</div>
                <h3 style={{ fontFamily: 'Syne,sans-serif' }}>Select a conversation</h3>
                <p style={{ fontSize: 14 }}>Choose from the left or start by messaging an item owner.</p>
              </div>
            : <>
                {/* Chat Header */}
                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {activePerson?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700 }}>{activePerson?.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--success)' }}>● Active</div>
                  </div>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {messages.map(m => {
                    const isMe = m.sender?._id === user?._id || m.sender === user?._id;
                    return (
                      <div key={m._id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                        <div style={{ maxWidth: '70%', padding: '10px 14px', borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: isMe ? 'var(--primary)' : 'var(--surface-2)', color: isMe ? '#fff' : 'var(--text)', fontSize: 14, lineHeight: 1.5 }}>
                          <div>{m.content}</div>
                          <div style={{ fontSize: 10, marginTop: 4, opacity: 0.65, textAlign: 'right' }}>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
                  <input
                    style={{ flex: 1, padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 24, fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
                    placeholder="Type a message..."
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                  <button className="btn btn-primary" type="submit" disabled={!text.trim() || sending} style={{ borderRadius: 24, padding: '10px 18px' }}>
                    {sending ? '...' : '➤'}
                  </button>
                </form>
              </>
          }
        </div>
      </div>
    </div>
  );
}
