import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getListings } from '../services/api';
import ItemCard from '../components/common/ItemCard';

const CATEGORIES = ['All','Tools','Electronics','Books','Sports','Clothing','Kitchen','Garden','Toys','Furniture','Other'];

export default function ListingsPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [freeOnly, setFreeOnly] = useState(false);

  const fetchListings = () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (category !== 'All') params.category = category;
    if (freeOnly) params.isFree = true;
    getListings(params).then(({data})=>setListings(data)).finally(()=>setLoading(false));
  };

  useEffect(() => { fetchListings(); }, [category, freeOnly]);

  return (
    <div className="page">
      <div className="flex-between" style={{marginBottom:24}}>
        <div>
          <h1 style={{fontFamily:'Sora,sans-serif',fontSize:'1.8rem',fontWeight:800}}>Browse Items 📦</h1>
          <p style={{color:'#64748b',marginTop:4}}>Find items to borrow from your community</p>
        </div>
        <Link to="/create-listing" className="btn btn-primary">+ List Item</Link>
      </div>

      <div style={{display:'flex',gap:10,marginBottom:20,flexWrap:'wrap',alignItems:'center'}}>
        <input className="form-control" style={{flex:1,minWidth:200,maxWidth:360}} placeholder="🔍 Search listings..." value={search}
          onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&fetchListings()}/>
        <button className="btn btn-primary btn-sm" onClick={fetchListings}>Search</button>
        <label style={{display:'flex',alignItems:'center',gap:6,cursor:'pointer',fontWeight:600,fontSize:'0.88rem',fontFamily:'Sora,sans-serif'}}>
          <input type="checkbox" checked={freeOnly} onChange={e=>setFreeOnly(e.target.checked)}/> Free Only
        </label>
      </div>

      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:24}}>
        {CATEGORIES.map(c=>(
          <button key={c} onClick={()=>setCategory(c)}
            className={`btn btn-sm ${category===c?'btn-primary':'btn-secondary'}`}>{c}</button>
        ))}
      </div>

      {loading ? <div className="loading-screen"><div className="spinner"/></div>
        : listings.length ? <div className="grid-4">{listings.map(l=><ItemCard key={l._id} item={l}/>)}</div>
        : <div className="empty-state"><div className="icon">📭</div><h3>No listings found</h3><p>Try a different search or category</p></div>}
    </div>
  );
}