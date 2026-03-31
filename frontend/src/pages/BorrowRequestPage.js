import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getBorrowRequest, respondToBorrow, activateBorrow, uploadReturnProof, completeReturn } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const STATUS_INFO = {
  Pending:{ color:'#f59e0b', bg:'#fffbeb', label:'⏳ Awaiting Owner Response' },
  Accepted:{ color:'#0ea5e9', bg:'#eff6ff', label:'✅ Accepted — Activate Exchange' },
  Active:{ color:'#16a34a', bg:'#f0fdf4', label:'🔄 Active Exchange' },
  ReturnProofUploaded:{ color:'#7c3aed', bg:'#f5f3ff', label:'📸 Return Proof Submitted' },
  Completed:{ color:'#16a34a', bg:'#f0fdf4', label:'🏁 Exchange Complete' },
  Rejected:{ color:'#ef4444', bg:'#fef2f2', label:'❌ Request Rejected' },
  Overdue:{ color:'#ef4444', bg:'#fef2f2', label:'⚠️ OVERDUE' },
  Disputed:{ color:'#ef4444', bg:'#fef2f2', label:'⚖️ Disputed' },
};

export default function BorrowRequestPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [returnNotes, setReturnNotes] = useState('');
  const [condition, setCondition] = useState('Same');

  const refresh = () => getBorrowRequest(id).then(({data})=>setRequest(data)).finally(()=>setLoading(false));

  useEffect(() => { refresh(); }, [id]);

  const isOwner = user && request?.owner?._id === user._id;
  const isBorrower = user && request?.borrower?._id === user._id;

  const handleAccept = async () => {
    setSubmitting(true);
    try { await respondToBorrow(id, { action:'accept' }); toast.success('Request accepted! Deposit locked 🔒'); refresh(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleReject = async () => {
    setSubmitting(true);
    try { await respondToBorrow(id, { action:'reject', rejectionReason:'Not available at this time' }); toast.info('Request rejected'); refresh(); }
    catch (err) { toast.error('Failed'); }
    finally { setSubmitting(false); }
  };

  const handleActivate = async () => {
    setSubmitting(true);
    try { await activateBorrow(id, {}); toast.success('Exchange activated! 🤝'); refresh(); }
    catch (err) { toast.error('Failed'); }
    finally { setSubmitting(false); }
  };

  const handleReturnProof = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData();
    fd.append('returnNotes', returnNotes);
    fd.append('conditionOnReturn', condition);
    try { await uploadReturnProof(id, fd); toast.success('Return proof submitted! 📸'); refresh(); }
    catch (err) { toast.error('Failed'); }
    finally { setSubmitting(false); }
  };

  const handleComplete = async () => {
    setSubmitting(true);
    try { await completeReturn(id); toast.success('Return confirmed! Deposit released ✅'); refresh(); }
    catch (err) { toast.error('Failed'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner"/></div>;
  if (!request) return <div className="page"><div className="empty-state"><h3>Request not found</h3></div></div>;

  const info = STATUS_INFO[request.status] || { color:'#64748b', bg:'#f8fafc', label:request.status };

  return (
    <div className="page" style={{maxWidth:760}}>
      <h1 style={{fontFamily:'Sora,sans-serif',fontSize:'1.6rem',fontWeight:800,marginBottom:8}}>Borrow Request</h1>

      <div style={{background:info.bg,border:`1px solid ${info.color}40`,borderRadius:12,padding:'14px 20px',marginBottom:24,fontFamily:'Sora,sans-serif',fontWeight:700,color:info.color,fontSize:'1rem'}}>
        {info.label}
      </div>

      <div className="grid-2" style={{marginBottom:24,gap:16}}>
        <div className="card" style={{padding:20}}>
          <h3 style={{fontFamily:'Sora,sans-serif',fontWeight:700,marginBottom:12}}>📦 Item</h3>
          <div style={{fontFamily:'Sora,sans-serif',fontWeight:700,marginBottom:4}}>{request.listing?.title}</div>
          <div style={{fontSize:'0.85rem',color:'#64748b'}}>{request.listing?.category} • {request.listing?.condition}</div>
        </div>
        <div className="card" style={{padding:20}}>
          <h3 style={{fontFamily:'Sora,sans-serif',fontWeight:700,marginBottom:12}}>📅 Timeline</h3>
          <div style={{fontSize:'0.88rem'}}><strong>Start:</strong> {new Date(request.startDate).toLocaleDateString()}</div>
          <div style={{fontSize:'0.88rem'}}><strong>End:</strong> {new Date(request.endDate).toLocaleDateString()}</div>
          <div style={{fontSize:'0.88rem'}}><strong>Duration:</strong> {request.totalDays} days</div>
        </div>
        <div className="card" style={{padding:20}}>
          <h3 style={{fontFamily:'Sora,sans-serif',fontWeight:700,marginBottom:12}}>💰 Financials</h3>
          <div style={{fontSize:'0.88rem'}}><strong>Rental:</strong> ₹{request.totalPrice}</div>
          <div style={{fontSize:'0.88rem'}}><strong>Deposit:</strong> ₹{request.depositAmount} ({request.depositStatus})</div>
        </div>
        <div className="card" style={{padding:20}}>
          <h3 style={{fontFamily:'Sora,sans-serif',fontWeight:700,marginBottom:12}}>👥 Parties</h3>
          <div style={{fontSize:'0.88rem'}}><strong>Owner:</strong> {request.owner?.name} ({request.owner?.trustLevel})</div>
          <div style={{fontSize:'0.88rem',marginTop:4}}><strong>Borrower:</strong> {request.borrower?.name} ({request.borrower?.trustLevel})</div>
        </div>
      </div>

      {request.requestMessage && (
        <div className="alert alert-info" style={{marginBottom:20}}>
          💬 <strong>Borrower's message:</strong> {request.requestMessage}
        </div>
      )}

      <div className="card" style={{padding:24}}>
        <h3 style={{fontFamily:'Sora,sans-serif',fontWeight:700,marginBottom:16}}>Actions</h3>
        {isOwner && request.status==='Pending' && (
          <div style={{display:'flex',gap:10}}>
            <button className="btn btn-primary" onClick={handleAccept} disabled={submitting}>✅ Accept Request</button>
            <button className="btn btn-danger" onClick={handleReject} disabled={submitting}>❌ Reject</button>
          </div>
        )}
        {isBorrower && request.status==='Accepted' && (
          <div>
            <div className="alert alert-info" style={{marginBottom:12}}>Deposit of ₹{request.depositAmount} has been locked. Activate to start the exchange.</div>
            <button className="btn btn-primary" onClick={handleActivate} disabled={submitting}>🤝 Confirm Exchange Handover</button>
          </div>
        )}
        {isBorrower && request.status==='Active' && (
          <form onSubmit={handleReturnProof}>
            <h4 style={{fontFamily:'Sora,sans-serif',fontWeight:700,marginBottom:12}}>📸 Submit Return Proof</h4>
            <div className="form-group">
              <label>Item Condition on Return</label>
              <select className="form-control" value={condition} onChange={e=>setCondition(e.target.value)}>
                {['Same','Minor Damage','Major Damage','Destroyed'].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Notes (optional)</label>
              <textarea className="form-control" rows={2} value={returnNotes} onChange={e=>setReturnNotes(e.target.value)} placeholder="Any notes about the return..."/>
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting}>Submit Return Proof</button>
          </form>
        )}
        {isOwner && request.status==='ReturnProofUploaded' && (
          <div>
            <div className="alert alert-info" style={{marginBottom:12}}>Borrower says condition: <strong>{request.conditionOnReturn}</strong>. {request.returnNotes && `Note: ${request.returnNotes}`}</div>
            <button className="btn btn-primary" onClick={handleComplete} disabled={submitting}>✅ Confirm Return & Release Deposit</button>
          </div>
        )}
        {request.status==='Completed' && <div className="alert alert-success">🎉 This exchange is complete!</div>}
        {request.status==='Rejected' && <div className="alert alert-error">Reason: {request.rejectionReason||'Not specified'}</div>}
        {(request.status==='Active'||request.status==='Overdue') && isOwner && (
          <div style={{marginTop:16}}>
            <a href="/disputes" className="btn btn-danger btn-sm">⚖️ File Dispute</a>
          </div>
        )}
      </div>
    </div>
  );
}