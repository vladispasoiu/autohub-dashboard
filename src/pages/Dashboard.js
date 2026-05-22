import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API = 'https://web-production-72bd.up.railway.app';

export default function Dashboard() {
  const [garage, setGarage] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('owner_user') || '{}');
  const token = localStorage.getItem('owner_token');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API}/garages/`);
      const myGarage = res.data.find(g => g.email === user.email);
      if (myGarage) {
        setGarage(myGarage);
        const bRes = await axios.get(`${API}/bookings/garage/${myGarage.id}`, { headers: { Authorization: `Bearer ${token}` } });
        setBookings(bRes.data);
      }
    } catch (e) { console.log(e); }
    setLoading(false);
  };

  const logout = () => { localStorage.clear(); navigate('/login'); };

  const getStatusColor = (s) => {
    if (!s || s === 'pending') return { bg: '#FFF8E1', text: '#BA7517' };
    if (s === 'confirmed') return { bg: '#E1F5EE', text: '#085041' };
    if (s === 'completed') return { bg: '#E1F5EE', text: '#085041' };
    if (s === 'cancelled') return { bg: '#FDECEA', text: '#A32D2D' };
    return { bg: '#f0f0f0', text: '#888' };
  };

  const getStatusLabel = (s) => {
    if (!s || s === 'pending') return 'În așteptare';
    if (s === 'confirmed') return 'Confirmat';
    if (s === 'completed') return 'Finalizat';
    if (s === 'cancelled') return 'Anulat';
    return s;
  };

  const updateStatus = async (bookingId, status) => {
    try {
      await axios.patch(`${API}/bookings/${bookingId}`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (e) { console.log(e); }
  };

  const pending = bookings.filter(b => b.status === 'pending' || !b.status);
  const confirmed = bookings.filter(b => b.status === 'confirmed');
  const completed = bookings.filter(b => b.status === 'completed');

  return (
    <div style={styles.page}>
      <div style={styles.sidebar}>
        <div style={styles.sidebarLogo}>
          <span style={styles.logoText}>AutoHub</span>
          <span style={styles.logoBadge}>Business</span>
        </div>
        <nav style={styles.nav}>
          <Link to="/" style={{...styles.navItem, ...styles.navActive}}>📊 Dashboard</Link>
          <Link to="/garage-setup" style={styles.navItem}>🏪 Garajul meu</Link>
          <Link to="/services" style={styles.navItem}>🔧 Servicii</Link>
          <Link to="/bookings" style={styles.navItem}>📅 Programări</Link>
        </nav>
        <div style={styles.sidebarBottom}>
          <div style={styles.userInfo}>
            <div style={styles.avatar}>{user.full_name?.[0] || 'U'}</div>
            <div>
              <div style={styles.userName}>{user.full_name}</div>
              <div style={styles.userEmail}>{user.email}</div>
            </div>
          </div>
          <button style={styles.logoutBtn} onClick={logout}>Ieși din cont</button>
        </div>
      </div>
      <div style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.headerTitle}>Bună ziua, {user.full_name?.split(' ')[0]}! 👋</h1>
            <p style={styles.headerSub}>{garage ? garage.name : 'Nu ai configurat încă garajul'}</p>
          </div>
          {!garage && <Link to="/garage-setup" style={styles.setupBtn}>+ Configurează garajul</Link>}
        </div>
        {loading ? <div style={styles.loading}>Se încarcă...</div> : (
          <>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}><div style={styles.statNumber}>{bookings.length}</div><div style={styles.statLabel}>Total programări</div></div>
              <div style={{...styles.statCard, borderTop: '4px solid #f4a261'}}><div style={styles.statNumber}>{pending.length}</div><div style={styles.statLabel}>În așteptare</div></div>
              <div style={{...styles.statCard, borderTop: '4px solid #2a9d8f'}}><div style={styles.statNumber}>{confirmed.length}</div><div style={styles.statLabel}>Confirmate</div></div>
              <div style={{...styles.statCard, borderTop: '4px solid #e63946'}}><div style={styles.statNumber}>{completed.length}</div><div style={styles.statLabel}>Finalizate</div></div>
            </div>
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Programări recente</h2>
                <Link to="/bookings" style={styles.seeAll}>Vezi toate →</Link>
              </div>
              {bookings.length === 0 ? (
                <div style={styles.empty}><p>Nicio programare încă.</p><p style={{fontSize:'14px',color:'#aaa',marginTop:'8px'}}>Programările clienților vor apărea aici.</p></div>
              ) : (
                <div style={styles.bookingsList}>
                  {bookings.slice(0, 5).map(b => {
                    const sc = getStatusColor(b.status);
                    return (
                      <div key={b.id} style={styles.bookingRow}>
                        <div style={styles.bookingInfo}>
                          <div style={styles.bookingService}>{b.service}</div>
                          <div style={styles.bookingMeta}>{b.date} · {b.time_slot}</div>
                        </div>
                        <div style={{...styles.statusBadge, background: sc.bg, color: sc.text}}>{getStatusLabel(b.status)}</div>
                        {(b.status === 'pending' || !b.status) && (
                          <div style={styles.actions}>
                            <button style={styles.confirmBtn} onClick={() => updateStatus(b.id, 'confirmed')}>Confirmă</button>
                            <button style={styles.cancelBtn} onClick={() => updateStatus(b.id, 'cancelled')}>Anulează</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {garage && (
              <div style={styles.section}>
                <div style={styles.sectionHeader}>
                  <h2 style={styles.sectionTitle}>Informații garaj</h2>
                  <Link to="/garage-setup" style={styles.seeAll}>Editează →</Link>
                </div>
                <div style={styles.garageInfo}>
                  <div style={styles.garageRow}><span style={styles.garageLabel}>Nume</span><span>{garage.name}</span></div>
                  <div style={styles.garageRow}><span style={styles.garageLabel}>Adresă</span><span>{garage.address}</span></div>
                  <div style={styles.garageRow}><span style={styles.garageLabel}>Telefon</span><span>{garage.phone}</span></div>
                  <div style={styles.garageRow}><span style={styles.garageLabel}>Preț de la</span><span>{garage.price_from} RON</span></div>
                  <div style={styles.garageRow}><span style={styles.garageLabel}>Status</span><span style={{color: garage.is_verified ? '#2a9d8f' : '#f4a261', fontWeight:'600'}}>{garage.is_verified ? '✅ Verificat' : '⏳ În așteptare verificare'}</span></div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { display:'flex', minHeight:'100vh', background:'#f8f9fa' },
  sidebar: { width:'260px', background:'#1a1a2e', display:'flex', flexDirection:'column', padding:'24px', position:'fixed', height:'100vh' },
  sidebarLogo: { display:'flex', alignItems:'center', gap:'10px', marginBottom:'40px' },
  logoText: { fontSize:'22px', fontWeight:'900', color:'#fff' },
  logoBadge: { background:'#e63946', color:'#fff', fontSize:'10px', fontWeight:'700', padding:'3px 8px', borderRadius:'6px' },
  nav: { display:'flex', flexDirection:'column', gap:'4px', flex:1 },
  navItem: { padding:'12px 16px', borderRadius:'10px', color:'#ffffff88', fontSize:'14px', fontWeight:'600', textDecoration:'none' },
  navActive: { background:'#ffffff15', color:'#fff' },
  sidebarBottom: { borderTop:'1px solid #ffffff15', paddingTop:'20px' },
  userInfo: { display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px' },
  avatar: { width:'40px', height:'40px', borderRadius:'50%', background:'#e63946', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'700', fontSize:'16px' },
  userName: { color:'#fff', fontSize:'14px', fontWeight:'600' },
  userEmail: { color:'#ffffff66', fontSize:'12px' },
  logoutBtn: { width:'100%', padding:'10px', background:'#ffffff15', color:'#ffffff88', borderRadius:'8px', fontSize:'13px', fontWeight:'600', cursor:'pointer', border:'none' },
  main: { marginLeft:'260px', flex:1, padding:'32px' },
  header: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'32px' },
  headerTitle: { fontSize:'28px', fontWeight:'800', color:'#1a1a2e' },
  headerSub: { fontSize:'15px', color:'#888', marginTop:'4px' },
  setupBtn: { background:'#e63946', color:'#fff', padding:'12px 24px', borderRadius:'12px', fontWeight:'700', fontSize:'14px', textDecoration:'none' },
  loading: { textAlign:'center', padding:'60px', color:'#888' },
  statsGrid: { display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'20px', marginBottom:'32px' },
  statCard: { background:'#fff', borderRadius:'16px', padding:'24px', borderTop:'4px solid #1a1a2e', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' },
  statNumber: { fontSize:'36px', fontWeight:'800', color:'#1a1a2e' },
  statLabel: { fontSize:'13px', color:'#888', marginTop:'4px' },
  section: { background:'#fff', borderRadius:'16px', padding:'24px', marginBottom:'24px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' },
  sectionHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' },
  sectionTitle: { fontSize:'18px', fontWeight:'700', color:'#1a1a2e' },
  seeAll: { color:'#e63946', fontSize:'14px', fontWeight:'600', textDecoration:'none' },
  empty: { textAlign:'center', padding:'40px', color:'#888' },
  bookingsList: { display:'flex', flexDirection:'column', gap:'12px' },
  bookingRow: { display:'flex', alignItems:'center', gap:'16px', padding:'16px', background:'#f8f9fa', borderRadius:'12px' },
  bookingInfo: { flex:1 },
  bookingService: { fontSize:'15px', fontWeight:'600', color:'#1a1a2e' },
  bookingMeta: { fontSize:'13px', color:'#888', marginTop:'2px' },
  statusBadge: { padding:'4px 12px', borderRadius:'8px', fontSize:'12px', fontWeight:'700' },
  actions: { display:'flex', gap:'8px' },
  confirmBtn: { background:'#E1F5EE', color:'#085041', border:'none', borderRadius:'8px', padding:'6px 14px', fontSize:'13px', fontWeight:'600', cursor:'pointer' },
  cancelBtn: { background:'#FDECEA', color:'#A32D2D', border:'none', borderRadius:'8px', padding:'6px 14px', fontSize:'13px', fontWeight:'600', cursor:'pointer' },
  garageInfo: { display:'flex', flexDirection:'column' },
  garageRow: { display:'flex', justifyContent:'space-between', padding:'14px 0', borderBottom:'1px solid #f0f0f0', fontSize:'14px', color:'#1a1a2e' },
  garageLabel: { color:'#888', fontWeight:'500' },
};
