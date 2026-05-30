import { Link } from 'react-router-dom';
import LoadingState from '../ui/LoadingState.jsx';
import PageHeader from '../layout/PageHeader.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingState message="Loading…" />;
  }

  if (user?.role !== 'admin') {
    return (
      <main className="page page--workspace page--admin-forbidden">
        <PageHeader
          intro
          title="Admin"
          lead="Admin access required"
          note="This area is restricted to platform administrators."
        />
        <div className="admin-forbidden-card">
          <p className="admin-forbidden-card__text">
            You do not have permission to view the admin dashboard.
          </p>
          <p>
            <Link to="/dashboard">Back to dashboard</Link>
          </p>
        </div>
      </main>
    );
  }

  return children;
}
