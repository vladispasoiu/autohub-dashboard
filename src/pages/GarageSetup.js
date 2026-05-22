import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API = 'https://web-production-72bd.up.railway.app';

export default function GarageSetup() {
  const [form, setForm] = useState({ name:'', owner_name:'', email:'', phone:'', address:'', city:'București', description:'', price_from:'' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [garageId, setGarageId] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('owner_user') || '{}');
  const token = localStorage.getItem('owner_token');
  const CITIES = ['București','Cluj-Napoca','Timișoara','Iași','Constanța','Craiova','Brașov','Galați','Ploiești','Oradea','Sibiu','Bacău','Arad','Pitești','Târgu Mureș'];

  useEffect(() => { fetchGarage(); }, []);

  const fetchGarage = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/garages/`);
      const mine = res.data.find(g => g.email === user.email);
      if (mine) {
        setGarageId(mine.id);
        setForm({ name:mine.name||'', owner_name:mine.owner_name||'', email:mine.email||'', phone:mine.phone||'', address:mine.address||'', city:mine.city||'București', description:mine.description||'', price_from:mine.price_from||'' });
      } else {
        setForm(f => ({ ...f, email:user.email, owner_name:user.full_name }));
      }
    } catch(e) { console.log(e); }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = { ...form, price_from: parseFloat(form.price_from)||0 };
      if (garageId) {
        await axios.patch(`${API}/garages/${garageId}`, payload, { headers: { Authorization:`Bearer ${token}` } });
      } else {
        await axios.post(`${API}/garages/`, payload, { headers: { Authorization:`Bearer ${token}` } });
      }
      setSuccess('Garajul a fost salvat cu succes! ✅');
      fetchGarage();
    } catch(err) { setError(err.response?.data?.detail || 'Ceva a mers greșit.'); }
    setSaving(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.sidebar}>
        <div style={styles.sidebarLogo}><span style={styles.logoText}>AutoHub</span><span style={styles.logoBadge}>Business</span></div>
        <nav style={styles.nav}>
          <Link to="/" style={styles.navItem}>📊 Dashboard</Link>
          <Link to="/garage-setup" style={{...styles.navItem,...styles.navActive}}>🏪 Garajul meu</Link>
          <Link to="/services" style={styles.navItem}>🔧 Servicii</Link>
          <Link to="/bookings" style={styles.navItem}>📅 Programări</Link>
        </nav>
        <div style={styles.sidebarBottom}>
          <div style={styles.userInfo}>
            <div style={styles.avatar}>{user.full_name?.[0]||'U'}</div>
            <div><div style={styles.userName}>{user.full_name}</div><div style={styles.userEmail}>{user.email}</div></div>
          </div>
          <button style={styles.logoutBtn} onClick={() => { localStorage.clear(); navigate('/login'); }}>Ieși din cont</button>
        </div>
      </div>
      <div style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>🏪 Garajul meu</h1>
          <p style={styles.headerSub}>{garageId ? 'Editează informațiile service-ului tău' : 'Configurează service-ul tău pentru prima dată'}</p>
        </div>
        {loading ? <div style={styles.loading}>Se încarcă...</div> : (
          <div style={styles.card}>
            {error && <div style={styles.error}>{error}</div>}
            {success && <div style={styles.successMsg}>{success}</div>}
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Informații generale</h3>
                <div style={styles.grid2}>
                  <div style={styles.field}><label style={styles.label}>Numele service-ului *</label><input style={styles.input} placeholder="Ex: AutoFix Express" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required /></div>
                  <div style={styles.field}><label style={styles.label}>Numele proprietarului *</label><input style={styles.input} placeholder="Ion Popescu" value={form.owner_name} onChange={e=>setForm({...form,owner_name:e.target.value})} required /></div>
                  <div style={styles.field}><label style={styles.label}>Email *</label><input style={styles.input} type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required /></div>
                  <div style={styles.field}><label style={styles.label}>Telefon *</label><input style={styles.input} placeholder="07xx xxx xxx" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} required /></div>
                </div>
              </div>
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Locație</h3>
                <div style={styles.grid2}>
                  <div style={styles.field}><label style={styles.label}>Oraș *</label><select style={styles.input} value={form.city} onChange={e=>setForm({...form,city:e.target.value})}>{CITIES.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                  <div style={styles.field}><label style={styles.label}>Preț de la (RON) *</label><input style={styles.input} type="number" placeholder="50" value={form.price_from} onChange={e=>setForm({...form,price_from:e.target.value})} required /></div>
                  <div style={{...styles.field,gridColumn:'1 / -1'}}><label style={styles.label}>Adresă *</label><input style={styles.input} placeholder="Str. Exemplu nr. 1" value={form.address} onChange={e=>setForm({...form,address:e.target.value})} required /></div>
                </div>
              </div>
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Despre service</h3>
                <div style={styles.field}><label style={styles.label}>Descriere</label><textarea style={{...styles.input,minHeight:'100px',resize:'vertical'}} placeholder="Descrie pe scurt service-ul tău..." value={form.description} onChange={e=>setForm({...form,description:e.target.value})} /></div>
              </div>
              <button style={{...styles.btn,opacity:saving?0.7:1}} type="submit" disabled={saving}>{saving?'Se salvează...':garageId?'💾 Salvează modificările':'🚀 Creează garajul'}</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page:{display:'flex',minHeight:'100vh',background:'#f8f9fa'},
  sidebar:{width:'260px',background:'#1a1a2e',display:'flex',flexDirection:'column',padding:'24px',position:'fixed',height:'100vh'},
  sidebarLogo:{display:'flex',alignItems:'center',gap:'10px',marginBottom:'40px'},
  logoText:{fontSize:'22px',fontWeight:'900',color:'#fff'},
  logoBadge:{background:'#e63946',color:'#fff',fontSize:'10px',fontWeight:'700',padding:'3px 8px',borderRadius:'6px'},
  nav:{display:'flex',flexDirection:'column',gap:'4px',flex:1},
  navItem:{padding:'12px 16px',borderRadius:'10px',color:'#ffffff88',fontSize:'14px',fontWeight:'600',textDecoration:'none'},
  navActive:{background:'#ffffff15',color:'#fff'},
  sidebarBottom:{borderTop:'1px solid #ffffff15',paddingTop:'20px'},
  userInfo:{display:'flex',alignItems:'center',gap:'12px',marginBottom:'16px'},
  avatar:{width:'40px',height:'40px',borderRadius:'50%',background:'#e63946',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:'700',fontSize:'16px'},
  userName:{color:'#fff',fontSize:'14px',fontWeight:'600'},
  userEmail:{color:'#ffffff66',fontSize:'12px'},
  logoutBtn:{width:'100%',padding:'10px',background:'#ffffff15',color:'#ffffff88',borderRadius:'8px',fontSize:'13px',fontWeight:'600',cursor:'pointer',border:'none'},
  main:{marginLeft:'260px',flex:1,padding:'32px'},
  header:{marginBottom:'32px'},
  headerTitle:{fontSize:'28px',fontWeight:'800',color:'#1a1a2e'},
  headerSub:{fontSize:'15px',color:'#888',marginTop:'4px'},
  loading:{textAlign:'center',padding:'60px',color:'#888'},
  card:{background:'#fff',borderRadius:'16px',padding:'32px',boxShadow:'0 2px 8px rgba(0,0,0,0.06)'},
  error:{background:'#fff0f1',border:'1px solid #ffcdd2',color:'#e63946',padding:'12px 16px',borderRadius:'10px',fontSize:'14px',marginBottom:'20px'},
  successMsg:{background:'#E1F5EE',border:'1px solid #b2dfdb',color:'#085041',padding:'12px 16px',borderRadius:'10px',fontSize:'14px',marginBottom:'20px'},
  form:{display:'flex',flexDirection:'column',gap:'32px'},
  section:{display:'flex',flexDirection:'column',gap:'16px'},
  sectionTitle:{fontSize:'16px',fontWeight:'700',color:'#1a1a2e',paddingBottom:'12px',borderBottom:'1px solid #f0f0f0'},
  grid2:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'},
  field:{display:'flex',flexDirection:'column',gap:'8px'},
  label:{fontSize:'14px',fontWeight:'600',color:'#1a1a2e'},
  input:{border:'1.5px solid #e9ecef',borderRadius:'12px',padding:'14px 16px',fontSize:'15px',color:'#1a1a2e',width:'100%'},
  btn:{background:'#e63946',color:'#fff',border:'none',borderRadius:'12px',padding:'16px',fontSize:'16px',fontWeight:'700',cursor:'pointer'},
};
