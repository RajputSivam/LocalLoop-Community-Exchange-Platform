import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createListing } from '../services/api';
import { toast } from 'react-toastify';

export default function CreateListingPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title:'',description:'',category:'Tools',pricePerDay:'',isFree:false,condition:'Good',estimatedValue:'',maxBorrowDays:'7',damageRules:'',rentalTerms:'',address:'' });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.estimatedValue) { toast.error('Estimated value is required for deposit calculation'); return; }
    const fd = new FormData();
    Object.entries(form).forEach(([k,v])=>fd.append(k,v));
    images.forEach(img=>fd.append('images',img));
    setLoading(true);
    try { await createListing(fd); toast.success('Listing created! 🎉'); navigate('/listings'); }
    catch (err) { toast.error(err.response?.data?.message||'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="page" style={{maxWidth:720}}>
      <h1 style={{fontFamily:'Sora,sans-serif',fontSize:'1.8rem',fontWeight:800,marginBottom:8}}>📦 List an Item</h1>
      <p style={{color:'#64748b',marginBottom:32}}>Share your item with the community</p>
      <form onSubmit={handleSubmit} className="card" style={{padding:32}}>
        <div className="form-group"><label>Item Title *</label><input className="form-control" placeholder="e.g. Bosch Power Drill" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required/></div>
        <div className="form-group"><label>Description *</label><textarea className="form-control" rows={3} placeholder="Describe condition, features, included accessories..." value={form.description} onChange={e=>setForm({...form,description:e.target.value})} required/></div>
        <div className="grid-2">
          <div className="form-group"><label>Category *</label>
            <select className="form-control" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
              {['Tools','Electronics','Books','Sports','Clothing','Kitchen','Garden','Toys','Furniture','Other'].map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Condition *</label>
            <select className="form-control" value={form.condition} onChange={e=>setForm({...form,condition:e.target.value})}>
              {['New','Like New','Good','Fair','Poor'].map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="grid-2">
          <div className="form-group"><label>Estimated Item Value (₹) *</label><input className="form-control" type="number" min={0} placeholder="e.g. 5000" value={form.estimatedValue} onChange={e=>setForm({...form,estimatedValue:e.target.value})} required/></div>
          <div className="form-group"><label>Max Borrow Days</label><input className="form-control" type="number" min={1} max={90} value={form.maxBorrowDays} onChange={e=>setForm({...form,maxBorrowDays:e.target.value})}/></div>
        </div>
        <div style={{background:'#fffbeb',border:'1px solid #fcd34d',borderRadius:10,padding:14,marginBottom:20,fontSize:'0.85rem'}}>
          💡 Deposit is auto-calculated based on estimated value and condition. This protects you if the item is damaged.
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20}}>
          <input type="checkbox" id="free" checked={form.isFree} onChange={e=>setForm({...form,isFree:e.target.checked})}/>
          <label htmlFor="free" style={{fontWeight:600,fontFamily:'Sora,sans-serif',cursor:'pointer'}}>This item is free to borrow (no rental fee)</label>
        </div>
        {!form.isFree && <div className="form-group"><label>Price Per Day (₹)</label><input className="form-control" type="number" min={0} placeholder="0" value={form.pricePerDay} onChange={e=>setForm({...form,pricePerDay:e.target.value})}/></div>}
        <div className="form-group"><label>Damage Rules (optional)</label><textarea className="form-control" rows={2} placeholder="What happens if the item is damaged?" value={form.damageRules} onChange={e=>setForm({...form,damageRules:e.target.value})}/></div>
        <div className="form-group"><label>Your Location / Area</label><input className="form-control" placeholder="e.g. Sector 14, Noida" value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/></div>
        <div className="form-group"><label>Photos (at least 1) *</label><input className="form-control" type="file" multiple accept="image/*" onChange={e=>setImages([...e.target.files])}/></div>
        {images.length>0 && <div style={{marginBottom:16,fontSize:'0.85rem',color:'#16a34a',fontWeight:600}}>✅ {images.length} photo(s) selected</div>}
        <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>{loading?'Creating...':'Create Listing 🚀'}</button>
      </form>
    </div>
  );
}