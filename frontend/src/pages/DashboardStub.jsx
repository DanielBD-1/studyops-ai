import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import FormCard from '../components/ui/FormCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function DashboardStub() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <main className="page page--workspace">
      <h1>Dashboard</h1>
      <p className="page__lead">Authenticated area — courses are available.</p>
      <FormCard>
        {user && (
          <section className="dashboard-identity">
            <p>
              Signed in as <strong>{user.email}</strong> ({user.role})
            </p>
          </section>
        )}
        <p className="dashboard-actions">
          <Link to="/courses">My courses</Link>
        </p>
        <Button variant="secondary" onClick={handleLogout}>
          Log out
        </Button>
      </FormCard>
    </main>
  );
}
