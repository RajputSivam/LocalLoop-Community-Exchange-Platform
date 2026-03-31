import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyBorrowRequests, getMyListings, getMyServices } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = {
  Pending:'badge-orange',Active:'badge-green',Completed:'badge-gray',
  Rejected:'badge-red',Overdue:'badge-red',Disputed:'badge-red',
  Accepted:'badge-blue',ReturnProofUploaded:'badge-blue',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');
  const [borrows, setBorrows] = useState({ asBorrower:[], asOwner:[] });
  const [listings, setListings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyBorrowRequests(), getMyListings(), getMyServices()])
      .then(([b,l,s]) => { setBorrows(b.data); setListings(l.data); setServices(s.data); })
      .finally(() => setLoading(false));
  }, []);

  const active = borrows.asBorrower.filter(b=>b.status==='Active').length;
  const pending = borrows.asOwner.filter(b=>b.status==='Pending').length;

  if (loading) return <div className="loading-screen"><div className="spinner"/></div>;

  return (
    <div className="page">
      <div style={{background:'linear-gradient(135deg,#16a34a,#15803d)',borderRadius:20,padding:'28px 32px',color:'#fff',marginBottom:32}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:16}}>
          <div>
            <h1 style={{fontFamily:'Sora,sans-serif',fontSize:'1.6rem',fontWeight:800}}>Welcome, {user?.name?.split(' ')[0]}! 👋</h1>
            <p style={{color:'#86efac',marginTop:4}}>Trust Level: <strong>{user?.trustLevel}</strong> • Score: <strong>{user?.trustScore}/100</strong></p>
          </div>
          <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
            <Link to="/create-listing" className="btn btn-sm" style={{background:'rgba(255,255,255,0.2)',color:'#fff',border:'1px solid rgba(255,255,255,0.3)'}}>+ List Item</Link>
            <Link to="/wallet" className="btn btn-sm" style={{background:'#fff',color:'#16a34a'}}>💰 Wallet</Link>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginTop:24}}>
          {[
            ['📦',listings.length,'My Listings'],
            ['🔄',active,'Active Borrows'],
            ['🔔',pending,'Pending Requests'],
            ['⭐',user?.rating||'0','Rating'],
          ].map(([icon,val,label])=>(
            <div key={label} style={{background:'rgba(255,255,255,0.15)',borderRadius:12,padding:'14px 16px',backdropFilter:'blur(10px)'}}>
              <div style={{fontSize:22}}>{icon}</div>
              <div style={{fontFamily:'Sora,sans-serif',fontWeight:800,fontSize:'1.4rem',marginTop:4}}>{val}</div>
              <div style={{fontSize:'0.78rem',color:'#86efac',marginTop:2}}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="tabs">
        {[['overview','Overview'],['borrowing','Borrowing'],['lending','Lending'],['listings','My Listings']].map(([k,l])=>(
          <button key={k} className={`tab-btn${tab===k?' active':''}`} onClick={()=>setTab(k)}>{l}</button>
        ))}
      </div>

      {tab==='overview' && (
        <div className="grid-2">
          <div className="card" style={{padding:24}}>
            <h3 style={{fontFamily:'Sora,sans-serif',fontWeight:700,marginBottom:16}}>Recent Borrow Requests</h3>
            {borrows.asBorrower.slice(0,4).map(b=>(
              <Link to={`/borrow/${b._id}`} key={b._id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid #f1f5f9',textDecoration:'none'}}>
                <div>
                  <div style={{fontFamily:'Sora,sans-serif',fontWeight:600,fontSize:'0.88rem'}}>{b.listing?.title}</div>
                  <div style={{fontSize:'0.75rem',color:'#64748b'}}>{new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}</div>
                </div>
                <span className={`badge ${STATUS_COLORS[b.status]||'badge-gray'}`}>{b.status}</span>
              </Link>
            ))}
            {borrows.asBorrower.length===0 && <p style={{color:'#94a3b8',fontSize:'0.88rem'}}>No borrow requests yet.</p>}
          </div>
          <div className="card" style={{padding:24}}>
            <h3 style={{fontFamily:'Sora,sans-serif',fontWeight:700,marginBottom:16}}>Incoming Requests</h3>
            {borrows.asOwner.slice(0,4).map(b=>(
              <Link to={`/borrow/${b._id}`} key={b._id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid #f1f5f9',textDecoration:'none'}}>
                <div>
                  <div style={{fontFamily:'Sora,sans-serif',fontWeight:600,fontSize:'0.88rem'}}>{b.listing?.title}</div>
                  <div style={{fontSize:'0.75rem',color:'#64748b'}}>From: {b.borrower?.name}</div>
                </div>
                <span className={`badge ${STATUS_COLORS[b.status]||'badge-gray'}`}>{b.status}</span>
              </Link>
            ))}
            {borrows.asOwner.length===0 && <p style={{color:'#94a3b8',fontSize:'0.88rem'}}>No incoming requests.</p>}
          </div>
        </div>
      )}

      {tab==='borrowing' && (
        <div>
          <h3 style={{fontFamily:'Sora,sans-serif',fontWeight:700,marginBottom:16}}>Items I'm Borrowing</h3>
          {borrows.asBorrower.length===0 ? <div className="empty-state"><div className="icon">🔍</div><h3>No borrow requests yet</h3><p><Link to="/listings" style={{color:'#16a34a'}}>Browse items</Link></p></div>
          : borrows.asBorrower.map(b=>(
            <Link to={`/borrow/${b._id}`} key={b._id} style={{display:'block',textDecoration:'none'}}>
              <div className="card" style={{padding:16,marginBottom:12,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
                <div>
                  <div style={{fontFamily:'Sora,sans-serif',fontWeight:700}}>{b.listing?.title}</div>
                  <div style={{fontSize:'0.8rem',color:'#64748b',marginTop:4}}>
                    {new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()} • Deposit: ₹{b.depositAmount}
                  </div>
                </div>
                <span className={`badge ${STATUS_COLORS[b.status]||'badge-gray'}`}>{b.status}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {tab==='lending' && (
        <div>
          <h3 style={{fontFamily:'Sora,sans-serif',fontWeight:700,marginBottom:16}}>Requests for My Items</h3>
          {borrows.asOwner.length===0 ? <div className="empty-state"><div className="icon">📭</div><h3>No incoming requests</h3></div>
          : borrows.asOwner.map(b=>(
            <Link to={`/borrow/${b._id}`} key={b._id} style={{display:'block',textDecoration:'none'}}>
              <div className="card" style={{padding:16,marginBottom:12,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
                <div>
                  <div style={{fontFamily:'Sora,sans-serif',fontWeight:700}}>{b.listing?.title}</div>
                  <div style={{fontSize:'0.8rem',color:'#64748b',marginTop:4}}>From: {b.borrower?.name} • ⭐ {b.borrower?.trustLevel}</div>
                </div>
                <span className={`badge ${STATUS_COLORS[b.status]||'badge-gray'}`}>{b.status}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {tab==='listings' && (
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <h3 style={{fontFamily:'Sora,sans-serif',fontWeight:700}}>My Listings</h3>
            <Link to="/create-listing" className="btn btn-primary btn-sm">+ Add Listing</Link>
          </div>
          {listings.length===0 ? <div className="empty-state"><div className="icon">📦</div><h3>No listings yet</h3><Link to="/create-listing" className="btn btn-primary" style={{marginTop:12}}>Create First Listing</Link></div>
          : <div className="grid-3">{listings.map(l=>(
            <div key={l._id} className="card" style={{padding:16}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                <h4 style={{fontFamily:'Sora,sans-serif',fontWeight:700,fontSize:'0.95rem'}}>{l.title}</h4>
                <span className={`badge ${l.isAvailable?'badge-green':'badge-orange'}`}>{l.isAvailable?'Available':'Lent Out'}</span>
              </div>
              <p style={{fontSize:'0.8rem',color:'#64748b'}}>{l.isFree?'Free':` ₹${l.pricePerDay}/day`} • {l.condition}</p>
              <p style={{fontSize:'0.8rem',color:'#94a3b8',marginTop:4}}>Deposit: ₹{l.depositAmount}</p>
            </div>
          ))}</div>}
        </div>
      )}
    </div>
  );
}