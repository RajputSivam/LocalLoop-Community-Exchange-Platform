import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getListings, getServices } from '../services/api';
import ItemCard from '../components/common/ItemCard';

export default function HomePage() {
  const [listings, setListings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getListings(), getServices()])
      .then(([l, s]) => { setListings(l.data.slice(0,4)); setServices(s.data.slice(0,4)); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section style={{background:'linear-gradient(135deg,#f0fdf4,#dcfce7,#bbf7d0)',padding:'80px 20px',display:'flex',alignItems:'center',justifyContent:'center',gap:48,flexWrap:'wrap',minHeight:560}}>
        <div style={{maxWidth:560}}>
          <div style={{display:'inline-block',background:'#fff',color:'#16a34a',padding:'6px 14px',borderRadius:99,fontSize:'0.82rem',fontWeight:700,fontFamily:'Sora,sans-serif',marginBottom:20,border:'1px solid #86efac'}}>🏘️ Community Exchange Platform</div>
          <h1 style={{fontFamily:'Sora,sans-serif',fontSize:'clamp(2rem,5vw,3.2rem)',fontWeight:800,lineHeight:1.15,marginBottom:18,color:'#0f172a'}}>
            Share More.<br/><span style={{color:'#16a34a'}}>Spend Less.</span><br/>Build Community.
          </h1>
          <p style={{fontSize:'1.05rem',color:'#475569',marginBottom:28,lineHeight:1.7}}>Borrow items from neighbours, offer your skills, and build trust — secured by deposits and AI dispute resolution.</p>
          <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
            <Link to="/listings" className="btn btn-primary btn-lg">Browse Items 📦</Link>
            <Link to="/register" className="btn btn-secondary btn-lg">Join Free →</Link>
          </div>
          <div style={{display:'flex',gap:24,marginTop:36,flexWrap:'wrap'}}>
            {[['🔐','Deposit Protected'],['⭐','Trust Scoring'],['🤖','AI Disputes'],['🗺️','Safe Zones']].map(([icon,label])=>(
              <div key={label} style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:20}}>{icon}</span>
                <span style={{fontSize:'0.82rem',fontWeight:600,fontFamily:'Sora,sans-serif',color:'#475569'}}>{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{display:'flex',gap:16,flexWrap:'wrap',justifyContent:'center'}}>
          {[['🔧','Power Drill','₹50/day'],['📚','Books','Free'],['🧰','Tool Kit','₹80/day']].map(([icon,name,price],i)=>(
            <div key={name} style={{background:'#fff',borderRadius:16,padding:20,boxShadow:'0 8px 32px rgba(22,163,74,0.12)',width:130,textAlign:'center',transform:`rotate(${i%2===0?-3:3}deg) translateY(${i===1?-10:0}px)`}}>
              <div style={{fontSize:32,marginBottom:8}}>{icon}</div>
              <div style={{fontFamily:'Sora,sans-serif',fontWeight:700,fontSize:'0.88rem',marginBottom:4}}>{name}</div>
              <div style={{fontSize:'0.75rem',color:'#16a34a',fontWeight:600}}>{price}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{padding:'60px 20px'}}>
        <div className="container">
          <h2 style={{fontFamily:'Sora,sans-serif',fontSize:'1.6rem',fontWeight:800,marginBottom:32}}>How It Works</h2>
          <div className="grid-4">
            {[['1','List Item','Add photos, set price, define deposit rules.'],['2','Deposit Locked','Borrower wallet deposit secured instantly.'],['3','Exchange','Meet safely, sign digitally, photo proof.'],['4','Return & Release','Confirm return, deposit auto-released.']].map(([n,t,d])=>(
              <div key={n} style={{background:'#fff',borderRadius:14,padding:24,border:'1px solid #e2e8f0',textAlign:'center'}}>
                <div style={{width:40,height:40,borderRadius:'50%',background:'#dcfce7',color:'#16a34a',fontFamily:'Sora,sans-serif',fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px'}}>{n}</div>
                <h3 style={{fontFamily:'Sora,sans-serif',fontWeight:700,marginBottom:8}}>{t}</h3>
                <p style={{fontSize:'0.85rem',color:'#64748b',lineHeight:1.6}}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{padding:'60px 20px',background:'#f8fafc'}}>
        <div className="container">
          <div className="flex-between" style={{marginBottom:24}}>
            <h2 style={{fontFamily:'Sora,sans-serif',fontSize:'1.6rem',fontWeight:800}}>Featured Items</h2>
            <Link to="/listings" className="btn btn-secondary btn-sm">View All →</Link>
          </div>
          {loading ? <div className="loading-screen"><div className="spinner"/></div>
            : listings.length ? <div className="grid-4">{listings.map(l=><ItemCard key={l._id} item={l}/>)}</div>
            : <div className="empty-state"><div className="icon">📦</div><h3>No listings yet</h3><p>Be the first to list!</p></div>}
        </div>
      </section>

      <section style={{padding:'60px 20px'}}>
        <div className="container">
          <div className="flex-between" style={{marginBottom:24}}>
            <h2 style={{fontFamily:'Sora,sans-serif',fontSize:'1.6rem',fontWeight:800}}>Community Services</h2>
            <Link to="/services" className="btn btn-secondary btn-sm">View All →</Link>
          </div>
          {loading ? <div className="loading-screen"><div className="spinner"/></div>
            : services.length ? <div className="grid-4">{services.map(s=><ItemCard key={s._id} item={s} type="service"/>)}</div>
            : <div className="empty-state"><div className="icon">🔧</div><h3>No services yet</h3></div>}
        </div>
      </section>

      <section style={{background:'linear-gradient(135deg,#16a34a,#15803d)',padding:'70px 20px',textAlign:'center'}}>
        <div className="container">
          <h2 style={{fontFamily:'Sora,sans-serif',fontSize:'2rem',color:'#fff',marginBottom:12}}>Ready to join your community?</h2>
          <p style={{color:'#86efac',marginBottom:28}}>List your first item in under 2 minutes — it's free!</p>
          <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
            <Link to="/register" className="btn btn-lg" style={{background:'#fff',color:'#16a34a'}}>Get Started Free</Link>
            <Link to="/listings" className="btn btn-lg" style={{background:'rgba(255,255,255,0.15)',color:'#fff',border:'1.5px solid rgba(255,255,255,0.3)'}}>Browse Items</Link>
          </div>
        </div>
      </section>
    </div>
  );
}