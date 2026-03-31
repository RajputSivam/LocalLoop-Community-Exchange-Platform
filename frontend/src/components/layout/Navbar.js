import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import { getNotifications, markNotificationsRead } from '../../services/api';
import './Navbar.css';

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (user) {
      getNotifications()
        .then(({ data }) => setUnread(data.filter(n => !n.isRead).length))
        .catch(() => {});
    }
  }, [user, location.pathname]);

  const handleLogout = () => { logoutUser(); navigate('/'); };

  const S = {
    nav: { background:'#fff', borderBottom:'1px solid #e2e8f0', position:'sticky', top:0, zIndex:100, height:64 },
    inner: { maxWidth:1200, margin:'0 auto', padding:'0 20px', height:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 },
    logo: { display:'flex', alignItems:'center', gap:8 },
    logoText: { fontFamily:'Sora,sans-serif', fontWeight:800, fontSize:'1.2rem', color:'#16a34a' },
    links: { display:'flex', gap:24 },
    link: { fontFamily:'Sora,sans-serif', fontWeight:600, fontSize:'0.88rem', color:'#475569' },
    actions: { display:'flex', alignItems:'center', gap:8 },
    walletBtn: { background:'#dcfce7', color:'#16a34a', padding:'6px 12px', borderRadius:8, fontSize:'0.85rem', fontWeight:700, fontFamily:'Sora,sans-serif' },
    iconBtn: { width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:8, background:'#f8fafc', border:'1px solid #e2e8f0', fontSize:16, cursor:'pointer', position:'relative', textDecoration:'none' },
    badge: { position:'absolute', top:-4, right:-4, background:'#ef4444', color:'#fff', borderRadius:'50%', width:16, height:16, fontSize:10, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 },
    avatarBtn: { width:36, height:36, borderRadius:'50%', border:'2px solid #16a34a', cursor:'pointer', background:'#dcfce7', color:'#16a34a', fontFamily:'Sora,sans-serif', fontWeight:700, fontSize:14 },
    dropdown: { position:'absolute', right:0, top:44, background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, boxShadow:'0 8px 32px rgba(0,0,0,0.12)', minWidth:180, zIndex:200, padding:8 },
    dropItem: { display:'block', padding:'8px 14px', borderRadius:8, fontSize:'0.88rem', fontWeight:600, fontFamily:'Sora,sans-serif', color:'#0f172a' },
    dropDivider: { height:1, background:'#e2e8f0', margin:'6px 0' },
    dropLogout: { display:'block', width:'100%', padding:'8px 14px', borderRadius:8, fontSize:'0.88rem', fontWeight:600, fontFamily:'Sora,sans-serif', color:'#ef4444', background:'none', border:'none', cursor:'pointer', textAlign:'left' },
  };

  return (
    <nav style={S.nav}>
      <div style={S.inner}>
        <Link to="/" style={S.logo}>
          <span style={{fontSize:24}}>🏘️</span>
          <span style={S.logoText}>LocalLoop</span>
        </Link>
        <div style={S.links}>
          <Link to="/listings" style={S.link}>Browse Items</Link>
          <Link to="/services" style={S.link}>Services</Link>
          {user && <Link to="/dashboard" style={S.link}>Dashboard</Link>}
        </div>
        <div style={S.actions}>
          {user ? (
            <>
              <Link to="/wallet" style={S.walletBtn}>💰 ₹{(user.walletBalance||0).toFixed(0)}</Link>
              <Link to="/notifications" style={S.iconBtn}>
                🔔{unread>0&&<span style={S.badge}>{unread}</span>}
              </Link>
              <Link to="/messages" style={S.iconBtn}>💬</Link>
              <div style={{position:'relative'}}>
                <button onClick={()=>setMenuOpen(o=>!o)} style={S.avatarBtn}>{user.name?.[0]?.toUpperCase()}</button>
                {menuOpen && (
                  <div style={S.dropdown}>
                    <Link to={`/profile/${user._id}`} style={S.dropItem} onClick={()=>setMenuOpen(false)}>👤 Profile</Link>
                    <Link to="/dashboard" style={S.dropItem} onClick={()=>setMenuOpen(false)}>📊 Dashboard</Link>
                    <Link to="/wallet" style={S.dropItem} onClick={()=>setMenuOpen(false)}>💰 Wallet</Link>
                    <Link to="/create-listing" style={S.dropItem} onClick={()=>setMenuOpen(false)}>➕ List Item</Link>
                    <div style={S.dropDivider}/>
                    <button onClick={handleLogout} style={S.dropLogout}>🚪 Logout</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
