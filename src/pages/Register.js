import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API = 'https://web-production-72bd.up.railway.app';

export default function Register() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Parolele nu coincid.'); return; }
    if (form.password.length < 6) { setError('Parola trebuie să aibă minim 6 caractere.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API}/users/owner/register`, {
        full_name: form.full_name, email: form.email, password: form.password, phone: form.phone,
      });
      localStorage.setItem('owner_token', res.data.access_token);
      localStorage.setItem('owner_user', JSON.stringify(res.data.user));
      navigate('/garage-setup');
    } catch (err) {
      setError(err.response?.data?.detail || 'Ceva a mers greșit.');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <span style={styles.logoText}>AutoHub</span>
          <span style={styles.logoBadge}>Business</span>
        </div>
        <h1 style={styles.title}>Înregistrează-ți service-ul</h1>
        <p style={styles.subtitle}>Creează un cont și începe să primești programări</p>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Nume complet</label>
            <input style={styles.input} type="text" placeholder="Ion Popescu" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input style={styles.input} type="email" placeholder="email@service.ro" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Telefon</label>
            <input style={styles.input} type="tel" placeholder="07xx xxx xxx" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          </div>
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Parolă</label>
              <input style={styles.input} type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Confirmă parola</label>
              <input style={styles.input} type="password" placeholder="••••••••" value={form.confirm} onChange={e => setForm({...form, confirm: e.target.value})} required />
            </div>
          </div>
          <button style={{...styles.btn, opacity: loading ? 0.7 : 1}} type="submit" disabled={loading}>
            {loading ? 'Se creează contul...' : 'Creează cont gratuit'}
          </button>
        </form>
        <p style={styles.footer}>Ai deja cont? <Link to="/login" style={styles.link}>Intră în cont</Link></p>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  card: { background: '#fff', borderRadius: '24px', padding: '48px', width: '100%', maxWidth: '520px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  logo: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' },
  logoText: { fontSize: '24px', fontWeight: '900', color: '#1a1a2e' },
  logoBadge: { background: '#e63946', color: '#fff', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px' },
  title: { fontSize: '26px', fontWeight: '800', color: '#1a1a2e', marginBottom: '8px' },
  subtitle: { fontSize: '15px', color: '#888', marginBottom: '32px' },
  error: { background: '#fff0f1', border: '1px solid #ffcdd2', color: '#e63946', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', marginBottom: '20px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '14px', fontWeight: '600', color: '#1a1a2e' },
  input: { border: '1.5px solid #e9ecef', borderRadius: '12px', padding: '14px 16px', fontSize: '15px', color: '#1a1a2e' },
  btn: { background: '#e63946', color: '#fff', border: 'none', borderRadius: '12px', padding: '16px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', marginTop: '8px' },
  footer: { textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#888' },
  link: { color: '#e63946', fontWeight: '600' },
};
