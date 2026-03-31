import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={S.footer}>
      <div style={S.inner}>
        <div>
          <div style={S.logo}>🏘️ <span style={S.logoText}>LocalLoop</span></div>
          <p style={S.tagline}>Building stronger communities,<br />one exchange at a time.</p>
        </div>
        <div style={S.links}>
          <div>
            <div style={S.linkHead}>Platform</div>
            <Link to="/listings" style={S.link}>Browse Items</Link>
            <Link to="/services" style={S.link}>Services</Link>
            <Link to="/create-listing" style={S.link}>List Item</Link>
          </div>
          <div>
            <div style={S.linkHead}>Account</div>
            <Link to="/dashboard" style={S.link}>Dashboard</Link>
            <Link to="/wallet" style={S.link}>Wallet</Link>
            <Link to="/messages" style={S.link}>Messages</Link>
          </div>
        </div>
      </div>
      <div style={S.bottom}>
        <span>© {new Date().getFullYear()} LocalLoop — Built with ❤️ for the community</span>
        <span style={{color:'#94a3b8'}}>Made by Sivam Rajput</span>
      </div>
    </footer>
  );
}

const S = {
  footer: { background:'#0f172a', color:'#cbd5e1', paddingTop:40 },
  inner: { maxWidth:1200, margin:'0 auto', padding:'0 20px 32px', display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:32 },
  logo: { display:'flex', alignItems:'center', gap:8, fontSize:20, marginBottom:8 },
  logoText: { fontFamily:'Sora,sans-serif', fontWeight:800, color:'#16a34a', fontSize:'1.1rem' },
  tagline: { fontSize:'0.85rem', color:'#64748b', lineHeight:1.6 },
  links: { display:'flex', gap:48 },
  linkHead: { fontFamily:'Sora,sans-serif', fontWeight:700, color:'#e2e8f0', marginBottom:12, fontSize:'0.85rem', textTransform:'uppercase', letterSpacing:'0.05em' },
  link: { display:'block', color:'#64748b', fontSize:'0.88rem', marginBottom:8, textDecoration:'none' },
  bottom: { borderTop:'1px solid #1e293b', padding:'16px 20px', maxWidth:1200, margin:'0 auto', display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:8, fontSize:'0.82rem' },
};
