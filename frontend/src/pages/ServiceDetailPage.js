import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getService } from '../services/api';

export default function ServiceDetailPage() {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => { getService(id).then(({data})=>setService(data)).finally(()=>setLoading(false)); }, [id]);

  if (loading) return <div className="loading-screen"><div className="spinner"/></div>;
  if (!service) return <div className="page"><div className="empty-state"><h3>Not found</h3></div></div>;

  return (
    <div className="page">
      <div className="grid-2" style={{gap:40,alignItems:'start'}}>
        <div>
          {service.images?.[0]
            ? <img src={`${API}${service.images[0]}`} alt="" style={{width:'100%',height:340,objectFit:'cover',borderRadius:16}}/>
            : <div style={{width:'100%',height:340,background:'#f0fdf4',borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',fontSize:64}}>🔧</div>}
        </div>
        <div>
          <span className="badge badge-blue" style={{marginBottom:12}}>{service.category}</span>
          <h1 style={{fontFamily:'Sora,sans-serif',fontSize:'1.8rem',fontWeight:800,marginBottom:12}}>{service.title}</h1>
          <div style={{fontSize:'1.6rem',fontWeight:800,color:'#16a34a',marginBottom:12,fontFamily:'Sora,sans-serif'}}>
            {service.isFree ? 'Free' : `₹${service.pricePerHour}/hour`}
          </div>
          <p style={{color:'#64748b',lineHeight:1.7,marginBottom:20}}>{service.description}</p>
          <div style={{background:'#f0fdf4',borderRadius:12,padding:16,marginBottom:20}}>
            <div><strong>Availability:</strong> {service.availability}</div>
          </div>
          <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,padding:16}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:44,height:44,borderRadius:'50%',background:'#dcfce7',color:'#16a34a',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Sora,sans-serif',fontWeight:800,fontSize:18}}>
                {service.provider?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{fontFamily:'Sora,sans-serif',fontWeight:700}}>{service.provider?.name}</div>
                <div style={{fontSize:'0.8rem',color:'#64748b'}}>⭐ {service.provider?.rating||'New'} • {service.provider?.trustLevel}</div>
              </div>
            </div>
          </div>
          <a href={`/messages`} className="btn btn-primary btn-block btn-lg" style={{marginTop:20}}>💬 Contact Provider</a>
        </div>
      </div>
    </div>
  );
}