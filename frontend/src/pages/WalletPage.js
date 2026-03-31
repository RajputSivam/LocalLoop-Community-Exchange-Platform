import { useEffect, useState } from 'react';
import { getWallet, addFunds, confirmDeposit } from '../services/api';
import { toast } from 'react-toastify';

const TYPE_ICONS = { Deposit:'💳', Withdrawal:'💸', LockDeposit:'🔒', ReleaseDeposit:'✅', ForfeitDeposit:'❌', PartialDeduction:'⚠️', Compensation:'💰', Refund:'↩️' };
const TYPE_COLORS = { Deposit:'badge-green', Withdrawal:'badge-red', LockDeposit:'badge-orange', ReleaseDeposit:'badge-green', ForfeitDeposit:'badge-red', PartialDeduction:'badge-orange' };

export default function WalletPage() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchWallet = () => {
    getWallet().then(({data})=>{ setWallet(data.wallet); setTransactions(data.transactions); }).finally(()=>setLoading(false));
  };

  useEffect(() => { fetchWallet(); }, []);

  const handleAddFunds = async () => {
    if (!amount || Number(amount) < 100) { toast.error('Minimum ₹100 required'); return; }
    setAdding(true);
    try {
      await confirmDeposit({ amount: Number(amount), paymentIntentId: `demo_${Date.now()}` });
      toast.success(`₹${amount} added to wallet!`);
      setAmount('');
      fetchWallet();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setAdding(false); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner"/></div>;

  return (
    <div className="page">
      <h1 style={{fontFamily:'Sora,sans-serif',fontSize:'1.8rem',fontWeight:800,marginBottom:8}}>💰 My Wallet</h1>
      <p style={{color:'#64748b',marginBottom:32}}>Manage your balance and security deposits</p>

      <div className="grid-3" style={{marginBottom:32}}>
        {[
          ['💰','Available Balance', `₹${(wallet?.balance||0).toFixed(2)}`, '#16a34a', '#f0fdf4'],
          ['🔒','Locked Deposits',   `₹${(wallet?.locked||0).toFixed(2)}`,  '#f59e0b', '#fffbeb'],
          ['💳','Total Balance',     `₹${((wallet?.balance||0)+(wallet?.locked||0)).toFixed(2)}`, '#0ea5e9', '#eff6ff'],
        ].map(([icon,label,val,color,bg])=>(
          <div key={label} style={{background:bg,borderRadius:16,padding:24,border:`1px solid ${color}30`}}>
            <div style={{fontSize:28,marginBottom:8}}>{icon}</div>
            <div style={{fontSize:'0.8rem',color:'#64748b',fontWeight:600,fontFamily:'Sora,sans-serif',marginBottom:4}}>{label}</div>
            <div style={{fontFamily:'Sora,sans-serif',fontWeight:800,fontSize:'1.5rem',color}}>{val}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{alignItems:'start'}}>
        <div className="card" style={{padding:24}}>
          <h3 style={{fontFamily:'Sora,sans-serif',fontWeight:700,marginBottom:16}}>Add Funds</h3>
          <p style={{fontSize:'0.85rem',color:'#64748b',marginBottom:16}}>Add money to your wallet to use as security deposits when borrowing items.</p>
          <div className="form-group">
            <label>Amount (₹)</label>
            <input className="form-control" type="number" min={100} placeholder="Minimum ₹100" value={amount} onChange={e=>setAmount(e.target.value)}/>
          </div>
          <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
            {[100,250,500,1000].map(n=>(
              <button key={n} className="btn btn-secondary btn-sm" onClick={()=>setAmount(String(n))}>₹{n}</button>
            ))}
          </div>
          <button className="btn btn-primary btn-block" onClick={handleAddFunds} disabled={adding}>
            {adding ? 'Adding...' : `Add ₹${amount||'0'} to Wallet`}
          </button>
          <p style={{fontSize:'0.75rem',color:'#94a3b8',marginTop:10,textAlign:'center'}}>⚠️ Demo mode — no real payment in development</p>
        </div>

        <div className="card" style={{padding:24}}>
          <h3 style={{fontFamily:'Sora,sans-serif',fontWeight:700,marginBottom:16}}>Transaction History</h3>
          {transactions.length===0 ? <div className="empty-state" style={{padding:'20px 0'}}><div className="icon">📊</div><h3>No transactions yet</h3></div>
          : transactions.map(t=>(
            <div key={t._id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid #f1f5f9'}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <span style={{fontSize:18}}>{TYPE_ICONS[t.type]||'💰'}</span>
                <div>
                  <div style={{fontFamily:'Sora,sans-serif',fontWeight:600,fontSize:'0.85rem'}}>{t.description}</div>
                  <div style={{fontSize:'0.75rem',color:'#94a3b8'}}>{new Date(t.createdAt).toLocaleString()}</div>
                </div>
              </div>
              <div style={{textAlign:'right'}}>
                <span className={`badge ${TYPE_COLORS[t.type]||'badge-gray'}`}>
                  {['Deposit','ReleaseDeposit','Refund','Compensation'].includes(t.type)?'+':'-'}₹{t.amount}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}