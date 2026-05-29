import { Link } from 'react-router-dom';
import LoadingState from '../ui/LoadingState.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingState message="Loading…" />;
  }

  if (user?.role !== 'admin') {
    return (
      <main className="page page--workspace">
        <header className="page-header">
          <h1>Admin</h1>
        </header>
        <p className="page__lead">Admin access required</p>
        <p>
          <Link to="/dashboard">Back to dashboard</Link>
        </p>
      </main>
    );
  }

  return children;
}
