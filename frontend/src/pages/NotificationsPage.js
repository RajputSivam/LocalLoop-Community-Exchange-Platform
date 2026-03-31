import { useEffect, useState } from 'react';
import { getNotifications, markNotificationsRead } from '../services/api';

const TYPE_ICONS = {
  BorrowRequest: '📋', RequestAccepted: '✅', RequestRejected: '❌',
  ItemDueSoon: '⏰', ItemOverdue: '🚨', ReturnProofUploaded: '📸',
  DisputeFiled: '⚖️', DisputeResolved: '🏁', AppealFiled: '📣',
  DepositLocked: '🔒', DepositReleased: '💰', TrustScoreChanged: '🛡️',
  BadgeEarned: '🏅', NewMessage: '💬', SystemAlert: '🔔',
};

const TYPE_COLORS = {
  BorrowRequest: 'badge-blue', RequestAccepted: 'badge-green', RequestRejected: 'badge-red',
  ItemDueSoon: 'badge-orange', ItemOverdue: 'badge-red', ReturnProofUploaded: 'badge-blue',
  DisputeFiled: 'badge-red', DisputeResolved: 'badge-green', DepositLocked: 'badge-orange',
  DepositReleased: 'badge-green', TrustScoreChanged: 'badge-gray', BadgeEarned: 'badge-gold',
  NewMessage: 'badge-blue', SystemAlert: 'badge-gray',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    getNotifications()
      .then(({ data }) => setNotifications(data))
      .finally(() => setLoading(false));
    markNotificationsRead().catch(() => {});
  }, []);

  const filtered = filter === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page" style={{ maxWidth: 700 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: '1.8rem', fontWeight: 800, marginBottom: 4 }}>🔔 Notifications</h1>
          <p style={{ color: 'var(--text-muted)' }}>{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'unread'].map(f => (
            <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : `Unread (${unreadCount})`}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0
        ? <div className="empty-state"><div className="icon">🔔</div><h3>{filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}</h3><p>We'll notify you when something happens!</p></div>
        : filtered.map(n => (
          <div key={n._id} className="card" style={{ marginBottom: 10, padding: '14px 18px', display: 'flex', gap: 14, alignItems: 'flex-start', background: n.isRead ? 'var(--surface)' : '#F0FDF4', borderLeft: n.isRead ? 'none' : '3px solid var(--primary)' }}>
            <div style={{ fontSize: 24, flexShrink: 0 }}>{TYPE_ICONS[n.type] || '🔔'}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 15 }}>{n.title}</div>
                <span className={`badge ${TYPE_COLORS[n.type] || 'badge-gray'}`} style={{ flexShrink: 0 }}>{n.type}</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>{n.message}</p>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>{new Date(n.createdAt).toLocaleString()}</div>
            </div>
          </div>
        ))
      }
    </div>
  );
}
