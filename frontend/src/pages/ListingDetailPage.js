import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getListing, createBorrowRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function ListingDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [borrowForm, setBorrowForm] = useState({ startDate:'', endDate:'', message:'' });
  const [submitting, setSubmitting] = useState(false);
  const [showBorrow, setShowBorrow] = useState(false);

  useEffect(() => {
    getListing(id).then(({data})=>setListing(data)).finally(()=>setLoading(false));
  }, [id]);

  const days = borrowForm.startDate && borrowForm.endDate
    ? Math.ceil((new Date(borrowForm.endDate)-new Date(borrowForm.startDate))/(86400000)) : 0;

  const handleBorrow = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (days < 1) { toast.error('Select valid dates'); return; }
    setSubmitting(true);
    try {
      const { data } = await createBorrowRequest({ listingId: id, startDate: borrowForm.startDate, endDate: borrowForm.endDate, requestMessage: borrowForm.message });
      toast.success('Borrow request sent! 🎉');
      navigate(`/borrow/${data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Request failed');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner"/></div>;
  if (!listing) return <div className="page"><div className="empty-state"><h3>Listing not found</h3></div></div>;

  const isOwner = user && listing.owner._id === user._id;

  return (
    <div className="page">
      <div className="grid-2" style={{gap:40,alignItems:'start'}}>
        <div>
          <div style={{borderRadius:16,overflow:'hidden',marginBottom:12}}>
            {listing.images?.[imgIdx]
              ? <img src={`${API}${listing.images[imgIdx]}`} alt="" style={{width:'100%',height:380,objectFit:'cover'}}/>
              : <div style={{width:'100%',height:380,background:'#f0fdf4',display:'flex',alignItems:'center',justifyContent:'center',fontSize:64}}>📦</div>}
          </div>
          {listing.images?.length > 1 && (
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {listing.images.map((img,i)=>(
                <img key={i} src={`${API}${img}`} alt="" onClick={()=>setImgIdx(i)}
                  style={{width:60,height:60,objectFit:'cover',borderRadius:8,cursor:'pointer',border:i===imgIdx?'2px solid #16a34a':'2px solid transparent'}}/>
              ))}
            </div>
          )}
        </div>

        <div>
          <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap'}}>
            <span className="badge badge-gray">{listing.category}</span>
            <span className={`badge ${listing.isAvailable?'badge-green':'badge-red'}`}>{listing.isAvailable?'Available':'Unavailable'}</span>
            <span className="badge badge-blue">{listing.condition}</span>
          </div>
          <h1 style={{fontFamily:'Sora,sans-serif',fontSize:'1.8rem',fontWeight:800,marginBottom:12}}>{listing.title}</h1>
          <div style={{fontSize:'1.6rem',fontWeight:800,color:'#16a34a',marginBottom:6,fontFamily:'Sora,sans-serif'}}>
            {listing.isFree ? 'Free to Borrow' : `₹${listing.pricePerDay}/day`}
          </div>
          <p style={{color:'#64748b',marginBottom:20,lineHeight:1.7}}>{listing.description}</p>

          <div style={{background:'#f0fdf4',borderRadius:12,padding:16,marginBottom:20}}>
            <h4 style={{fontFamily:'Sora,sans-serif',fontWeight:700,marginBottom:12}}>Borrow Details</h4>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              {[['💰','Deposit',`₹${listing.depositAmount}`],['📅','Max Days',`${listing.maxBorrowDays} days`],['💎','Est. Value',`₹${listing.estimatedValue}`],[listing.damageRules?'⚠️':null,listing.damageRules?'Damage Rules':null,listing.damageRules]].filter(([i])=>i).map(([icon,label,val])=>(
                <div key={label} style={{background:'#fff',borderRadius:8,padding:10}}>
                  <div style={{fontSize:14,marginBottom:4}}>{icon}</div>
                  <div style={{fontSize:'0.75rem',color:'#64748b',fontWeight:600}}>{label}</div>
                  <div style={{fontFamily:'Sora,sans-serif',fontWeight:700,fontSize:'0.9rem'}}>{val}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,padding:16,marginBottom:20}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:44,height:44,borderRadius:'50%',background:'#dcfce7',color:'#16a34a',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Sora,sans-serif',fontWeight:800,fontSize:18}}>
                {listing.owner?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{fontFamily:'Sora,sans-serif',fontWeight:700}}>{listing.owner?.name}</div>
                <div style={{fontSize:'0.8rem',color:'#64748b'}}>⭐ {listing.owner?.rating||'New'} • {listing.owner?.trustLevel} • {listing.owner?.reviewCount||0} reviews</div>
              </div>
            </div>
          </div>

          {!isOwner && listing.isAvailable && user && (
            <div>
              {!showBorrow ? (
                <button className="btn btn-primary btn-block btn-lg" onClick={()=>setShowBorrow(true)}>
                  📋 Request to Borrow
                </button>
              ) : (
                <form onSubmit={handleBorrow} style={{background:'#f8fafc',borderRadius:12,padding:20,border:'1px solid #e2e8f0'}}>
                  <h4 style={{fontFamily:'Sora,sans-serif',fontWeight:700,marginBottom:16}}>Borrow Request</h4>
                  <div className="grid-2">
                    <div className="form-group">
                      <label>Start Date</label>
                      <input className="form-control" type="date" value={borrowForm.startDate} min={new Date().toISOString().split('T')[0]}
                        onChange={e=>setBorrowForm({...borrowForm,startDate:e.target.value})} required/>
                    </div>
                    <div className="form-group">
                      <label>End Date</label>
                      <input className="form-control" type="date" value={borrowForm.endDate} min={borrowForm.startDate}
                        onChange={e=>setBorrowForm({...borrowForm,endDate:e.target.value})} required/>
                    </div>
                  </div>
                  {days > 0 && (
                    <div style={{background:'#dcfce7',borderRadius:8,padding:12,marginBottom:12,fontFamily:'Sora,sans-serif',fontWeight:700,fontSize:'0.9rem',color:'#15803d'}}>
                      📅 {days} days • Total: ₹{listing.isFree?0:days*listing.pricePerDay} + ₹{listing.depositAmount} deposit
                    </div>
                  )}
                  <div className="form-group">
                    <label>Message to Owner (optional)</label>
                    <textarea className="form-control" rows={2} placeholder="Why do you need this item?" value={borrowForm.message}
                      onChange={e=>setBorrowForm({...borrowForm,message:e.target.value})}/>
                  </div>
                  <div style={{display:'flex',gap:10}}>
                    <button className="btn btn-primary" type="submit" disabled={submitting||days<1}>{submitting?'Sending...':'Send Request 🚀'}</button>
                    <button className="btn btn-secondary" type="button" onClick={()=>setShowBorrow(false)}>Cancel</button>
                  </div>
                </form>
              )}
            </div>
          )}
          {!user && <div className="alert alert-info">Please <a href="/login" style={{color:'#1d4ed8',fontWeight:700}}>login</a> to borrow this item.</div>}
          {isOwner && <div className="alert alert-success">✅ This is your listing</div>}
        </div>
      </div>
    </div>
  );
}