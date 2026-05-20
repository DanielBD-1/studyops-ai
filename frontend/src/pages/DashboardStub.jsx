import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function DashboardStub() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: 640, margin: '0 auto' }}>
      <h1>Dashboard</h1>
      <p style={{ color: '#555' }}>Phase 1D — authenticated area (stub only)</p>
      {user && (
        <section style={{ marginTop: '1rem' }}>
          <p>
            Signed in as <strong>{user.email}</strong> ({user.role})
          </p>
        </section>
      )}
      <button type="button" onClick={handleLogout} style={{ marginTop: '1rem' }}>
        Log out
      </button>
    </main>
  );
}
