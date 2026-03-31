import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const [form, setForm] = useState({ email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await login(form);
      loginUser(data, data.token);
      toast.success(`Welcome back, ${data.name}! 👋`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{minHeight:'80vh',display:'flex',alignItems:'center',justifyContent:'center',padding:20,background:'linear-gradient(135deg,#f0fdf4,#dcfce7)'}}>
      <div style={{background:'#fff',borderRadius:20,padding:40,width:'100%',maxWidth:420,boxShadow:'0 20px 60px rgba(22,163,74,0.12)'}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{fontSize:40,marginBottom:8}}>🏘️</div>
          <h1 style={{fontFamily:'Sora,sans-serif',fontSize:'1.6rem',fontWeight:800}}>Welcome Back</h1>
          <p style={{color:'#64748b',marginTop:6}}>Sign in to your LocalLoop account</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input className="form-control" type="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/>
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="form-control" type="password" placeholder="••••••••" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required/>
          </div>
          <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>
        <p style={{textAlign:'center',marginTop:20,color:'#64748b',fontSize:'0.9rem'}}>
          Don't have an account? <Link to="/register" style={{color:'#16a34a',fontWeight:700}}>Sign up free</Link>
        </p>
      </div>
    </div>
  );
}