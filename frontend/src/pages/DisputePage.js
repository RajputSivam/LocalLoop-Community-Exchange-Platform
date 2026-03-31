import { useEffect, useState } from 'react';
import { getMyDisputes, getMyBorrowRequests, fileDispute } from '../services/api';
import { toast } from 'react-toastify';

const STATUS_COLORS = {
  Open: 'badge-orange', ResponsePending: 'badge-orange',
  UnderAIReview: 'badge-blue', AdminReview: 'badge-blue',
  Resolved: 'badge-green', Appealed: 'badge-gold', Closed: 'badge-gray',
};

const STATUS_ICONS = {
  Open: '📂', ResponsePending: '⏳', UnderAIReview: '🤖',
  AdminReview: '👨‍⚖️', Resolved: '✅', Appealed: '📣', Closed: '🏁',
};

const DAMAGE_COLORS = { None: '#22c55e', Minor: '#f59e0b', Moderate: '#f97316', Major: '#ef4444', Destroyed: '#7f1d1d' };

export default function DisputePage() {
  const [tab, setTab] = useState('my');
  const [disputes, setDisputes] = useState([]);
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ borrowRequestId: '', reason: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([getMyDisputes(), getMyBorrowRequests()])
      .then(([d, b]) => {
        setDisputes(d.data);
        // Only show active/overdue borrows as owner for dispute
        const disputeable = b.data.asOwner.filter(r => ['Active', 'Overdue', 'ReturnProofUploaded'].includes(r.status));
        setBorrows(disputeable);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.borrowRequestId || !form.reason || !form.description) {
      toast.error('Please fill all fields');
      return;
    }
    setSubmitting(true);
    try {
      await fileDispute(form);
      toast.success('Dispute filed successfully. We will review it shortly.');
      setShowForm(false);
      setForm({ borrowRequestId: '', reason: '', description: '' });
      getMyDisputes().then(({ data }) => setDisputes(data));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to file dispute');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: '1.8rem', fontWeight: 800, marginBottom: 4 }}>⚖️ Disputes</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your dispute cases</p>
        </div>
        <button className="btn btn-danger" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '⚖️ File New Dispute'}
        </button>
      </div>

      {/* File Dispute Form */}
      {showForm && (
        <div className="card card-body" style={{ marginBottom: 28, border: '2px solid var(--error)', borderRadius: 16 }}>
          <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, marginBottom: 16, color: 'var(--error)' }}>📋 File a Dispute</h3>
          <div className="alert alert-warning" style={{ marginBottom: 16 }}>
            ⚠️ Only file a dispute if there is a genuine issue. False claims may result in trust score deductions.
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Select Borrow Request *</label>
              <select className="form-control" value={form.borrowRequestId} onChange={e => setForm({ ...form, borrowRequestId: e.target.value })} required>
                <option value="">-- Select an active exchange --</option>
                {borrows.map(b => (
                  <option key={b._id} value={b._id}>{b.listing?.title} — {b.borrower?.name} ({b.status})</option>
                ))}
              </select>
              {borrows.length === 0 && <small style={{ color: 'var(--text-muted)', fontSize: 12 }}>No eligible exchanges found. Disputes can only be filed for Active or Overdue items.</small>}
            </div>
            <div className="form-group">
              <label className="form-label">Reason *</label>
              <select className="form-control" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} required>
                <option value="">-- Select reason --</option>
                <option>Item not returned</option>
                <option>Item returned damaged</option>
                <option>Item not returned on time</option>
                <option>Item returned in worse condition</option>
                <option>Borrower not responsive</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Detailed Description *</label>
              <textarea className="form-control" rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Describe what happened in detail. Include dates, condition issues, communication breakdown etc." required />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-danger" type="submit" disabled={submitting}>{submitting ? 'Filing...' : 'Submit Dispute'}</button>
              <button className="btn btn-outline" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Disputes List */}
      {disputes.length === 0
        ? <div className="empty-state"><div className="icon">⚖️</div><h3>No disputes</h3><p>You have no active or past disputes. Keep up the good exchanges!</p></div>
        : disputes.map(d => (
          <div key={d._id} className="card" style={{ marginBottom: 16, padding: 20, borderLeft: `4px solid ${d.status === 'Resolved' ? 'var(--success)' : d.status === 'Open' ? 'var(--warning)' : 'var(--primary)'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
              <div>
                <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '1.05rem', marginBottom: 4 }}>
                  {STATUS_ICONS[d.status]} {d.listing?.title || 'Item'}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Reason: <strong>{d.reason}</strong></div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>Filed: {new Date(d.createdAt).toLocaleDateString()}</div>
              </div>
              <span className={`badge ${STATUS_COLORS[d.status] || 'badge-gray'}`}>{d.status}</span>
            </div>

            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 12 }}>{d.description}</p>

            {/* AI Assessment */}
            {d.aiDamageScore !== undefined && d.aiDamageScore !== null && (
              <div style={{ background: 'var(--surface-2)', borderRadius: 10, padding: '12px 14px', marginBottom: 12 }}>
                <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: 13, marginBottom: 8 }}>🤖 AI Assessment</div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13 }}>
                  <span>Damage Score: <strong style={{ color: DAMAGE_COLORS[d.aiDamageLevel] || '#888' }}>{d.aiDamageScore}/100</strong></span>
                  <span>Level: <strong>{d.aiDamageLevel}</strong></span>
                  {d.aiConfidenceScore && <span>Confidence: <strong>{d.aiConfidenceScore}%</strong></span>}
                </div>
                {d.aiRecommendedOutcome && <div style={{ marginTop: 8, fontSize: 13 }}>Recommendation: <strong>{d.aiRecommendedOutcome}</strong></div>}
              </div>
            )}

            {/* Resolution */}
            {d.resolution && (
              <div className="alert alert-success" style={{ marginBottom: 0 }}>
                <strong>Resolution:</strong> {d.resolution}
                {d.faultAssigned && <span> · Fault: <strong>{d.faultAssigned}</strong></span>}
                {d.depositOutcome && <span> · Deposit: <strong>{d.depositOutcome}</strong></span>}
              </div>
            )}

            {/* Appeal window */}
            {d.status === 'Resolved' && d.appealDeadline && new Date(d.appealDeadline) > new Date() && (
              <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                📣 Appeal window open until {new Date(d.appealDeadline).toLocaleDateString()}
              </div>
            )}
          </div>
        ))
      }
    </div>
  );
}
