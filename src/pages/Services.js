import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API = 'https://web-production-72bd.up.railway.app';
const SUGGESTIONS = ['Diagnoză motor','Schimb ulei','Reparații frâne','Service AC','Inspecție Tehnică Periodică','Schimb anvelope','Geometrie roți','Testare baterie','Suspensie','Transmisie','Diagnoză electrică','Sistem evacuare','Radiator','Curea distribuție','Ambreiaj'];

export default function Services() {
  const [garage, setGarage] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editService, setEditService] = useState(null);
  const [form, setForm] = useState({ name:'', description:'', price_min:'', price_max:'', duration_minutes:'' });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('owner_user') || '{}');
  const token = localStorage.getItem('owner_token');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/garages/`);
      const mine = res.data.find(g => g.email === user.email);
      if (mine) { setGarage(mine); setServices(mine.services || []); }
    } catch(e) { console.log(e); }
    setLoading(false);
  };

  const openAdd = () => { setEditService(null); setForm({name:'',description:'',price_min:'',price_max:'',duration_minutes:''}); setShowForm(true); };
  const openEdit = (s) => { setEditService(s); setForm({name:s.name,description:s.description||'',price_min:s.price_min||'',price_max:s.price_max||'',duration_minutes:s.duration_minutes||''}); setShowForm(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!garage) return;
    setSaving(true);
    try {
      const payload = { garage_id:garage.id, name:form.name, description:form.description, price_min:parseFloat(form.price_min)||null, price_max:parseFloat(form.price_max)||null, duration_minutes:parseInt(form.duration_minutes)||null };
      if (editService) {
        await axios.put(`${API}/services/${editService.id}`, payload, { headers:{ Authorization:`Bearer ${token}` } });
      } else {
        await axios.post(`${API}/services/`, payload, { headers:{ Authorization:`Bearer ${token}` } });
      }
      setShowForm(false);
      fetchData();
    } catch(e) { console.log(e); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Ștergi acest serviciu?')) return;
    try {
      await axios.delete(`${API}/services/${id}`, { headers:{ Authorization:`Bearer ${token}` } });
      fetchData();
    } catch(e) { console.log(e); }
  };

  return (
    <div style={styles.page}>
      <div style={styles.sidebar}>
        <div style={styles.sidebarLogo}><span style={styles.logoText}>AutoHub</span><span style={styles.logoBadge}>Business</span></div>
        <nav style={styles.nav}>
          <Link to="/" style={styles.navItem}>📊 Dashboard</Link>
          <Link to="/garage-setup" style={styles.navItem}>🏪 Garajul meu</Link>
          <Link to="/services" style={{...styles.navItem,...styles.navActive}}>🔧 Servicii</Link>
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
          <div><h1 style={styles.headerTitle}>🔧 Servicii</h1><p style={styles.headerSub}>Gestionează serviciile oferite</p></div>
          {garage && <button style={styles.addBtn} onClick={openAdd}>+ Adaugă serviciu</button>}
        </div>
        {!garage && !loading && <div style={styles.noGarage}><p>Trebuie să configurezi mai întâi garajul.</p><Link to="/garage-setup" style={styles.setupLink}>Configurează garajul →</Link></div>}
        {loading ? <div style={styles.loading}>Se încarcă...</div> : (
          <>
            <div style={styles.grid}>
              {services.length === 0 && garage && <div style={styles.empty}><p style={{fontSize:'16px',fontWeight:'600',color:'#888'}}>Niciun serviciu adăugat încă.</p></div>}
              {services.map(s => (
                <div key={s.id} style={styles.serviceCard}>
                  <div style={styles.serviceHeader}>
                    <h3 style={styles.serviceName}>{s.name}</h3>
                    <div style={styles.serviceActions}>
                      <button style={styles.editBtn} onClick={() => openEdit(s)}>✏️</button>
                      <button style={styles.deleteBtn} onClick={() => handleDelete(s.id)}>🗑️</button>
                    </div>
                  </div>
                  {s.description && <p style={styles.serviceDesc}>{s.description}</p>}
                  <div style={styles.serviceMeta}>
                    {(s.price_min || s.price_max) && <span style={styles.metaChip}>💰 {s.price_min||0} — {s.price_max||'?'} RON</span>}
                    {s.duration_minutes && <span style={styles.metaChip}>⏱ {s.duration_minutes} min</span>}
                  </div>
                </div>
              ))}
            </div>
            {garage && services.length < 3 && (
              <div style={styles.suggestions}>
                <h3 style={styles.suggestionsTitle}>Sugestii rapide</h3>
                <div style={styles.suggestionsGrid}>
                  {SUGGESTIONS.filter(s => !services.find(sv => sv.name === s)).slice(0,6).map(s => (
                    <button key={s} style={styles.suggestionChip} onClick={() => { setEditService(null); setForm({name:s,description:'',price_min:'',price_max:'',duration_minutes:''}); setShowForm(true); }}>+ {s}</button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {showForm && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{editService ? 'Editează serviciul' : 'Adaugă serviciu'}</h2>
              <button style={styles.closeBtn} onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSave} style={styles.modalForm}>
              <div style={styles.field}><label style={styles.label}>Nume serviciu *</label><input style={styles.input} placeholder="Ex: Schimb ulei" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required /></div>
              <div style={styles.field}><label style={styles.label}>Descriere</label><textarea style={{...styles.input,minHeight:'80px',resize:'vertical'}} placeholder="Descrie serviciul..." value={form.description} onChange={e=>setForm({...form,description:e.target.value})} /></div>
              <div style={styles.row}>
                <div style={styles.field}><label style={styles.label}>Preț minim (RON)</label><input style={styles.input} type="number" placeholder="50" value={form.price_min} onChange={e=>setForm({...form,price_min:e.target.value})} /></div>
                <div style={styles.field}><label style={styles.label}>Preț maxim (RON)</label><input style={styles.input} type="number" placeholder="200" value={form.price_max} onChange={e=>setForm({...form,price_max:e.target.value})} /></div>
              </div>
              <div style={styles.field}><label style={styles.label}>Durată estimată (minute)</label><input style={styles.input} type="number" placeholder="60" value={form.duration_minutes} onChange={e=>setForm({...form,duration_minutes:e.target.value})} /></div>
              <div style={styles.modalBtns}>
                <button type="button" style={styles.cancelBtn} onClick={() => setShowForm(false)}>Anulează</button>
                <button type="submit" style={{...styles.saveBtn,opacity:saving?0.7:1}} disabled={saving}>{saving?'Se salvează...':editService?'Salvează':'Adaugă'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
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
  header:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px'},
  headerTitle:{fontSize:'28px',fontWeight:'800',color:'#1a1a2e'},
  headerSub:{fontSize:'15px',color:'#888',marginTop:'4px'},
  addBtn:{background:'#e63946',color:'#fff',border:'none',borderRadius:'12px',padding:'12px 24px',fontSize:'14px',fontWeight:'700',cursor:'pointer'},
  loading:{textAlign:'center',padding:'60px',color:'#888'},
  noGarage:{background:'#fff',borderRadius:'16px',padding:'40px',textAlign:'center',color:'#888'},
  setupLink:{color:'#e63946',fontWeight:'600',marginTop:'12px',display:'inline-block'},
  grid:{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))',gap:'20px',marginBottom:'32px'},
  empty:{gridColumn:'1/-1',textAlign:'center',padding:'60px',background:'#fff',borderRadius:'16px'},
  serviceCard:{background:'#fff',borderRadius:'16px',padding:'20px',boxShadow:'0 2px 8px rgba(0,0,0,0.06)'},
  serviceHeader:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'},
  serviceName:{fontSize:'16px',fontWeight:'700',color:'#1a1a2e'},
  serviceActions:{display:'flex',gap:'8px'},
  editBtn:{background:'#f0f4ff',border:'none',borderRadius:'8px',padding:'6px 10px',cursor:'pointer',fontSize:'14px'},
  deleteBtn:{background:'#fff0f1',border:'none',borderRadius:'8px',padding:'6px 10px',cursor:'pointer',fontSize:'14px'},
  serviceDesc:{fontSize:'13px',color:'#888',marginBottom:'12px'},
  serviceMeta:{display:'flex',gap:'8px',flexWrap:'wrap'},
  metaChip:{background:'#f0f4ff',borderRadius:'8px',padding:'4px 10px',fontSize:'12px',color:'#1a1a2e',fontWeight:'600'},
  suggestions:{background:'#fff',borderRadius:'16px',padding:'24px',boxShadow:'0 2px 8px rgba(0,0,0,0.06)'},
  suggestionsTitle:{fontSize:'16px',fontWeight:'700',color:'#1a1a2e',marginBottom:'16px'},
  suggestionsGrid:{display:'flex',flexWrap:'wrap',gap:'10px'},
  suggestionChip:{background:'#f0f4ff',border:'1.5px dashed #c5cff0',borderRadius:'10px',padding:'8px 16px',fontSize:'13px',color:'#1a1a2e',fontWeight:'600',cursor:'pointer'},
  overlay:{position:'fixed',inset:0,background:'#00000066',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000},
  modal:{background:'#fff',borderRadius:'20px',padding:'32px',width:'100%',maxWidth:'500px',boxShadow:'0 20px 60px rgba(0,0,0,0.3)'},
  modalHeader:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'},
  modalTitle:{fontSize:'20px',fontWeight:'800',color:'#1a1a2e'},
  closeBtn:{background:'#f0f0f0',border:'none',borderRadius:'8px',padding:'6px 12px',cursor:'pointer',fontSize:'16px'},
  modalForm:{display:'flex',flexDirection:'column',gap:'16px'},
  row:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'},
  field:{display:'flex',flexDirection:'column',gap:'8px'},
  label:{fontSize:'14px',fontWeight:'600',color:'#1a1a2e'},
  input:{border:'1.5px solid #e9ecef',borderRadius:'12px',padding:'12px 16px',fontSize:'15px',color:'#1a1a2e',width:'100%'},
  modalBtns:{display:'flex',gap:'12px',marginTop:'8px'},
  cancelBtn:{flex:1,background:'#f0f0f0',color:'#888',border:'none',borderRadius:'12px',padding:'14px',fontSize:'15px',fontWeight:'600',cursor:'pointer'},
  saveBtn:{flex:1,background:'#e63946',color:'#fff',border:'none',borderRadius:'12px',padding:'14px',fontSize:'15px',fontWeight:'700',cursor:'pointer'},
};
