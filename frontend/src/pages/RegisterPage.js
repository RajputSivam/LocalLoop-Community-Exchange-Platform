import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function RegisterPage() {
  const [form, setForm] = useState({ name:'', email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await register(form);
      loginUser(data, data.token);
      toast.success(`Welcome to LocalLoop, ${data.name}! 🎉`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{minHeight:'80vh',display:'flex',alignItems:'center',justifyContent:'center',padding:20,background:'linear-gradient(135deg,#f0fdf4,#dcfce7)'}}>
      <div style={{background:'#fff',borderRadius:20,padding:40,width:'100%',maxWidth:440,boxShadow:'0 20px 60px rgba(22,163,74,0.12)'}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{fontSize:40,marginBottom:8}}>🏘️</div>
          <h1 style={{fontFamily:'Sora,sans-serif',fontSize:'1.6rem',fontWeight:800}}>Join LocalLoop</h1>
          <p style={{color:'#64748b',marginTop:6}}>Create your free community account</p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:20}}>
          {[['📦','List Items','Earn from what you own'],['🤝','Borrow','Save money locally'],['💰','Wallet','Secure deposits'],['⭐','Trust Score','Build reputation']].map(([i,t,d])=>(
            <div key={t} style={{background:'#f0fdf4',borderRadius:10,padding:12,textAlign:'center'}}>
              <div style={{fontSize:20}}>{i}</div>
              <div style={{fontFamily:'Sora,sans-serif',fontWeight:700,fontSize:'0.78rem',marginTop:4}}>{t}</div>
              <div style={{fontSize:'0.72rem',color:'#64748b'}}>{d}</div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input className="form-control" placeholder="Sivam Rajput" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/>
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input className="form-control" type="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/>
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="form-control" type="password" placeholder="Min 6 characters" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required minLength={6}/>
          </div>
          <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Free Account 🚀'}
          </button>
        </form>
        <p style={{textAlign:'center',marginTop:20,color:'#64748b',fontSize:'0.9rem'}}>
          Already have an account? <Link to="/login" style={{color:'#16a34a',fontWeight:700}}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}