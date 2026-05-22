import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API = 'https://web-production-72bd.up.railway.app';

export default function Bookings() {
  const [garage, setGarage] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('owner_user') || '{}');
  const token = localStorage.getItem('owner_token');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/garages/`);
      const mine = res.data.find(g => g.email === user.email);
      if (mine) {
        setGarage(mine);
        const bRes = await axios.get(`${API}/bookings/garage/${mine.id}`, { headers:{ Authorization:`Bearer ${token}` } });
        setBookings(bRes.data);
      }
    } catch(e) { console.log(e); }
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`${API}/bookings/${id}`, { status }, { headers:{ Authorization:`Bearer ${token}` } });
      fetchData();
    } catch(e) { console.log(e); }
  };

  const getStatusColor = (s) => {
    if (!s || s === 'pending') return { bg:'#FFF8E1', text:'#BA7517' };
    if (s === 'confirmed') return { bg:'#E1F5EE', text:'#085041' };
    if (s === 'completed') return { bg:'#E1F5EE', text:'#085041' };
    if (s === 'cancelled') return { bg:'#FDECEA', text:'#A32D2D' };
    return { bg:'#f0f0f0', text:'#888' };
  };

  const getStatusLabel = (s) => {
    if (!s || s === 'pending') return 'În așteptare';
    if (s === 'confirmed') return 'Confirmat';
    if (s === 'completed') return 'Finalizat';
    if (s === 'cancelled') return 'Anulat';
    return s;
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => (b.status || 'pending') === filter);

  return (
    <div style={styles.page}>
      <div style={styles.sidebar}>
        <div style={styles.sidebarLogo}><span style={styles.logoText}>AutoHub</span><span style={styles.logoBadge}>Business</span></div>
        <nav style={styles.nav}>
          <Link to="/" style={styles.navItem}>📊 Dashboard</Link>
          <Link to="/garage-setup" style={styles.navItem}>🏪 Garajul meu</Link>
          <Link to="/services" style={styles.navItem}>🔧 Servicii</Link>
          <Link to="/bookings" style={{...styles.navItem,...styles.navActive}}>📅 Programări</Link>
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
          <h1 style={styles.headerTitle}>📅 Programări</h1>
          <p style={styles.headerSub}>{bookings.length} programări totale</p>
        </div>
        <div style={styles.filters}>
          {['all','pending','confirmed','completed','cancelled'].map(f => (
            <button key={f} style={{...styles.filterBtn,...(filter===f?styles.filterBtnActive:{})}} onClick={() => setFilter(f)}>
              {f==='all'?'Toate':getStatusLabel(f)}
              <span style={styles.filterCount}>{f==='all'?bookings.length:bookings.filter(b=>(b.status||'pending')===f).length}</span>
            </button>
          ))}
        </div>
        {loading ? <div style={styles.loading}>Se încarcă...</div> : filtered.length === 0 ? (
          <div style={styles.empty}><p>Nicio programare {filter!=='all'?`cu status "${getStatusLabel(filter)}"`:''}</p></div>
        ) : (
          <div style={styles.table}>
            <div style={styles.tableHeader}>
              <span style={{flex:2}}>Serviciu</span>
              <span style={{flex:1}}>Data</span>
              <span style={{flex:1}}>Ora</span>
              <span style={{flex:1}}>Status</span>
              <span style={{flex:1.5}}>Acțiuni</span>
            </div>
            {filtered.map(b => {
              const sc = getStatusColor(b.status);
              return (
                <div key={b.id} style={styles.tableRow}>
                  <div style={{flex:2}}><div style={styles.serviceText}>{b.service}</div><div style={styles.idText}>#{b.id}</div></div>
                  <span style={{flex:1,fontSize:'14px',color:'#555'}}>{b.date}</span>
                  <span style={{flex:1,fontSize:'14px',color:'#555'}}>{b.time_slot}</span>
                  <span style={{flex:1}}><span style={{...styles.statusBadge,background:sc.bg,color:sc.text}}>{getStatusLabel(b.status)}</span></span>
                  <div style={{flex:1.5,display:'flex',gap:'8px'}}>
                    {(b.status==='pending'||!b.status) && <>
                      <button style={styles.confirmBtn} onClick={() => updateStatus(b.id,'confirmed')}>✅ Confirmă</button>
                      <button style={styles.cancelBtn} onClick={() => updateStatus(b.id,'cancelled')}>❌</button>
                    </>}
                    {b.status==='confirmed' && <>
                      <button style={styles.completeBtn} onClick={() => updateStatus(b.id,'completed')}>✔ Finalizat</button>
                      <button style={styles.cancelBtn} onClick={() => updateStatus(b.id,'cancelled')}>❌</button>
                    </>}
                  </div>
                </div>
              );
            })}
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
  header:{marginBottom:'24px'},
  headerTitle:{fontSize:'28px',fontWeight:'800',color:'#1a1a2e'},
  headerSub:{fontSize:'15px',color:'#888',marginTop:'4px'},
  filters:{display:'flex',gap:'10px',marginBottom:'24px',flexWrap:'wrap'},
  filterBtn:{background:'#fff',border:'1.5px solid #e9ecef',borderRadius:'10px',padding:'8px 16px',fontSize:'13px',fontWeight:'600',color:'#888',cursor:'pointer',display:'flex',alignItems:'center',gap:'8px'},
  filterBtnActive:{background:'#1a1a2e',color:'#fff',borderColor:'#1a1a2e'},
  filterCount:{background:'#ffffff22',borderRadius:'6px',padding:'2px 7px',fontSize:'12px'},
  loading:{textAlign:'center',padding:'60px',color:'#888'},
  empty:{background:'#fff',borderRadius:'16px',padding:'60px',textAlign:'center',color:'#888'},
  table:{background:'#fff',borderRadius:'16px',overflow:'hidden',boxShadow:'0 2px 8px rgba(0,0,0,0.06)'},
  tableHeader:{display:'flex',padding:'16px 24px',background:'#f8f9fa',fontSize:'12px',fontWeight:'700',color:'#888',textTransform:'uppercase',letterSpacing:'0.5px'},
  tableRow:{display:'flex',alignItems:'center',padding:'16px 24px',borderBottom:'1px solid #f0f0f0'},
  serviceText:{fontSize:'15px',fontWeight:'600',color:'#1a1a2e'},
  idText:{fontSize:'12px',color:'#aaa',marginTop:'2px'},
  statusBadge:{padding:'4px 12px',borderRadius:'8px',fontSize:'12px',fontWeight:'700'},
  confirmBtn:{background:'#E1F5EE',color:'#085041',border:'none',borderRadius:'8px',padding:'6px 12px',fontSize:'12px',fontWeight:'600',cursor:'pointer'},
  completeBtn:{background:'#f0f4ff',color:'#1a1a2e',border:'none',borderRadius:'8px',padding:'6px 12px',fontSize:'12px',fontWeight:'600',cursor:'pointer'},
  cancelBtn:{background:'#FDECEA',color:'#A32D2D',border:'none',borderRadius:'8px',padding:'6px 12px',fontSize:'12px',fontWeight:'600',cursor:'pointer'},
};
