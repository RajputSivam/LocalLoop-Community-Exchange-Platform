import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getServices } from '../services/api';
import ItemCard from '../components/common/ItemCard';

const CATEGORIES = ['All','Tutoring','Repairs','Pet Care','Cleaning','Gardening','Cooking','Tech Help','Childcare','Moving Help','Other'];

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');

  useEffect(() => {
    setLoading(true);
    getServices(category!=='All'?{category}:{}).then(({data})=>setServices(data)).finally(()=>setLoading(false));
  }, [category]);

  return (
    <div className="page">
      <div className="flex-between" style={{marginBottom:24}}>
        <div>
          <h1 style={{fontFamily:'Sora,sans-serif',fontSize:'1.8rem',fontWeight:800}}>Community Services 🔧</h1>
          <p style={{color:'#64748b',marginTop:4}}>Skills and services offered by your neighbours</p>
        </div>
        <Link to="/create-service" className="btn btn-primary">+ Offer Service</Link>
      </div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:24}}>
        {CATEGORIES.map(c=>(
          <button key={c} onClick={()=>setCategory(c)} className={`btn btn-sm ${category===c?'btn-primary':'btn-secondary'}`}>{c}</button>
        ))}
      </div>
      {loading ? <div className="loading-screen"><div className="spinner"/></div>
        : services.length ? <div className="grid-4">{services.map(s=><ItemCard key={s._id} item={s} type="service"/>)}</div>
        : <div className="empty-state"><div className="icon">🔧</div><h3>No services in this category</h3></div>}
    </div>
  );
}