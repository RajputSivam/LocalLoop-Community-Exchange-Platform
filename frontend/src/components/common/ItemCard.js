import { useNavigate } from 'react-router-dom';

export default function ItemCard({ item, type = 'listing' }) {
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const img = item.images?.[0] ? `${API}${item.images[0]}` : null;
  const path = type === 'listing' ? `/listings/${item._id}` : `/services/${item._id}`;
  const price = type === 'listing'
    ? (item.isFree ? 'Free' : `₹${item.pricePerDay}/day`)
    : (item.isFree ? 'Free' : `₹${item.pricePerHour}/hr`);

  return (
    <div className="card item-card" onClick={() => navigate(path)}>
      <div style={{ position: 'relative' }}>
        {img
          ? <img src={img} alt={item.title} style={{ width:'100%', height:190, objectFit:'cover' }} />
          : <div style={{ width:'100%', height:190, background:'#f0fdf4', display:'flex', alignItems:'center', justifyContent:'center', fontSize:48 }}>
              {type === 'listing' ? '📦' : '🔧'}
            </div>
        }
        <span className={`badge ${item.isFree ? 'badge-green' : 'badge-blue'}`}
          style={{ position:'absolute', top:10, left:10 }}>
          {price}
        </span>
      </div>
      <div style={{ padding:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
          <h3 style={{ fontFamily:'Sora,sans-serif', fontSize:'0.95rem', fontWeight:700, flex:1, marginRight:8,
            whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.title}</h3>
          <span className="badge badge-gray" style={{ fontSize:'0.7rem', flexShrink:0 }}>{item.category}</span>
        </div>
        {item.condition && <span style={{ fontSize:'0.78rem', color:'#64748b' }}>Condition: {item.condition}</span>}
        {(item.owner || item.provider) && (
          <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:10 }}>
            <div style={{ width:22, height:22, borderRadius:'50%', background:'#dcfce7', color:'#16a34a',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, fontFamily:'Sora,sans-serif' }}>
              {(item.owner || item.provider)?.name?.[0]?.toUpperCase()}
            </div>
            <span style={{ fontSize:'0.78rem', color:'#64748b' }}>{(item.owner || item.provider)?.name}</span>
          </div>
        )}
      </div>
    </div>
  );
}
