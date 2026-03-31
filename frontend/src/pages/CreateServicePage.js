import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createService } from '../services/api';
import { toast } from 'react-toastify';

export default function CreateServicePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title:'',description:'',category:'Tutoring',pricePerHour:'',isFree:false,availability:'Flexible',address:'' });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k,v])=>fd.append(k,v));
    images.forEach(img=>fd.append('images',img));
    setLoading(true);
    try { await createService(fd); toast.success('Service listed! 🎉'); navigate('/services'); }
    catch (err) { toast.error(err.response?.data?.message||'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="page" style={{maxWidth:720}}>
      <h1 style={{fontFamily:'Sora,sans-serif',fontSize:'1.8rem',fontWeight:800,marginBottom:8}}>🔧 Offer a Service</h1>
      <p style={{color:'#64748b',marginBottom:32}}>Share your skills with the community</p>
      <form onSubmit={handleSubmit} className="card" style={{padding:32}}>
        <div className="form-group"><label>Service Title *</label><input className="form-control" placeholder="e.g. Math Tutoring for Class 10" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required/></div>
        <div className="form-group"><label>Description *</label><textarea className="form-control" rows={3} placeholder="Describe your service, experience, what's included..." value={form.description} onChange={e=>setForm({...form,description:e.target.value})} required/></div>
        <div className="grid-2">
          <div className="form-group"><label>Category *</label>
            <select className="form-control" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
              {['Tutoring','Repairs','Pet Care','Cleaning','Gardening','Cooking','Tech Help','Childcare','Moving Help','Other'].map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Availability</label><input className="form-control" placeholder="e.g. Weekends, Evenings" value={form.availability} onChange={e=>setForm({...form,availability:e.target.value})}/></div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20}}>
          <input type="checkbox" id="free" checked={form.isFree} onChange={e=>setForm({...form,isFree:e.target.checked})}/>
          <label htmlFor="free" style={{fontWeight:600,fontFamily:'Sora,sans-serif',cursor:'pointer'}}>I'm offering this service for free</label>
        </div>
        {!form.isFree && <div className="form-group"><label>Price Per Hour (₹)</label><input className="form-control" type="number" min={0} placeholder="0" value={form.pricePerHour} onChange={e=>setForm({...form,pricePerHour:e.target.value})}/></div>}
        <div className="form-group"><label>Your Location / Area</label><input className="form-control" placeholder="e.g. Dadri, UP" value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/></div>
        <div className="form-group"><label>Photos (optional)</label><input className="form-control" type="file" multiple accept="image/*" onChange={e=>setImages([...e.target.files])}/></div>
        <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>{loading?'Listing...':'List Service 🚀'}</button>
      </form>
    </div>
  );
}