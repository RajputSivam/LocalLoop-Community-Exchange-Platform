import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUserProfile, getUserReviews } from '../services/api';
import { useAuth } from '../context/AuthContext';

const TRUST_COLOR = { New:'#94a3b8', Bronze:'#CD7F32', Silver:'#A8A9AD', Gold:'#F4A228', Platinum:'#6CB4E4' };

export default function ProfilePage() {
  const { id } = useParams();
  const { user: me } = useAuth();
  const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [tab, setTab] = useState('about');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getUserProfile(id), getUserReviews(id)])
      .then(([p, r]) => { setProfile(p.data); setReviews(r.data); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!profile) return <div className="page"><div className="empty-state"><h3>User not found</h3></div></div>;

  const trustColor = TRUST_COLOR[profile.trustLevel] || '#94a3b8';
  const isMe = me && me._id === id;

  return (
    <div className="page">
      {/* Hero Header */}
      <div style={{ background: 'linear-gradient(135deg,#1B4332,#2D6A4F)', borderRadius: 20, padding: '32px', color: '#fff', marginBottom: 32 }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {profile.avatar
            ? <img src={`${API}${profile.avatar}`} alt="" style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.3)' }} />
            : <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, fontFamily: 'Syne,sans-serif', fontWeight: 800, flexShrink: 0 }}>
                {profile.name?.[0]?.toUpperCase()}
              </div>}
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.7rem', marginBottom: 6 }}>{profile.name}</h1>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ background: trustColor, color: '#fff', padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{profile.trustLevel}</span>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>⭐ {profile.rating > 0 ? Number(profile.rating).toFixed(1) : 'New'} · {profile.reviewCount} reviews</span>
              {profile.location?.address && <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>📍 {profile.location.address}</span>}
            </div>
            {profile.bio && <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', maxWidth: 500 }}>{profile.bio}</p>}
          </div>
          {isMe && <Link to="/dashboard" className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', flexShrink: 0 }}>✏️ Edit</Link>}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginTop: 24 }}>
          {[['🛡️', profile.trustScore, 'Trust Score'], ['✨', profile.xpPoints || 0, 'XP Points'], ['📦', profile.reviewCount || 0, 'Exchanges'], ['🏅', (profile.badges || []).length, 'Badges']].map(([icon, val, label]) => (
            <div key={label} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '12px', textAlign: 'center', backdropFilter: 'blur(8px)' }}>
              <div style={{ fontSize: 20 }}>{icon}</div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: '1.25rem', marginTop: 4 }}>{val}</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {[['about','About'], ['reviews',`Reviews (${reviews.length})`], ['badges',`Badges (${(profile.badges||[]).length})`]].map(([k,l]) => (
          <button key={k} className={`tab-btn ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === 'about' && (
        <div className="grid-2" style={{ alignItems: 'start' }}>
          <div className="card card-body">
            <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, marginBottom: 16 }}>Account Info</h3>
            {[
              ['📅', 'Joined', new Date(profile.createdAt).toLocaleDateString('en-IN', { year:'numeric', month:'long' })],
              ['🏆', 'Trust Level', profile.trustLevel],
              ['🛡️', 'Trust Score', `${profile.trustScore}/100`],
              ['📍', 'Location', profile.location?.address || 'Not specified'],
            ].map(([icon, label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                <span style={{ color: 'var(--text-muted)' }}>{icon} {label}</span>
                <span style={{ fontWeight: 600 }}>{val}</span>
              </div>
            ))}
          </div>
          <div className="card card-body">
            <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, marginBottom: 16 }}>Trust Level Guide</h3>
            {[['New','#94a3b8','0-34'],['Bronze','#CD7F32','35-54'],['Silver','#A8A9AD','55-74'],['Gold','#F4A228','75-89'],['Platinum','#6CB4E4','90-100']].map(([level, color, range]) => (
              <div key={level} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                <span style={{ flex: 1, fontWeight: profile.trustLevel === level ? 800 : 500, fontSize: 14, color: profile.trustLevel === level ? 'var(--primary)' : 'inherit' }}>{level}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Score {range}</span>
                {profile.trustLevel === level && <span style={{ background: color, color: '#fff', fontSize: 10, padding: '2px 7px', borderRadius: 10 }}>You</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'reviews' && (
        <div>
          {reviews.length === 0
            ? <div className="empty-state"><div className="icon">⭐</div><h3>No reviews yet</h3><p>Reviews appear after completed exchanges.</p></div>
            : reviews.map(r => (
              <div key={r._id} className="card card-body" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontFamily: 'Syne,sans-serif', color: 'var(--primary)' }}>
                      {r.reviewer?.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontFamily: 'Syne,sans-serif', fontSize: 14 }}>{r.reviewer?.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div style={{ color: '#F4A228', fontSize: 16 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                </div>
                <p style={{ marginTop: 12, fontSize: 14, lineHeight: 1.6 }}>{r.comment}</p>
              </div>
            ))
          }
        </div>
      )}

      {tab === 'badges' && (
        <div>
          {(!profile.badges || profile.badges.length === 0)
            ? <div className="empty-state"><div className="icon">🏅</div><h3>No badges yet</h3><p>Complete exchanges and contribute to earn badges!</p></div>
            : <div className="grid-3">
                {profile.badges.map((b, i) => (
                  <div key={i} className="card card-body" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 42, marginBottom: 8 }}>{b.icon || '🏅'}</div>
                    <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700 }}>{b.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Earned {new Date(b.earnedAt).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
          }
        </div>
      )}
    </div>
  );
}
