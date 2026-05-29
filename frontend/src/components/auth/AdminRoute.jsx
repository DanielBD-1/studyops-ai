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
      <main className="page page--workspace">
        <PageHeader title="Admin" lead="Admin access required" />
        <p>
          <Link to="/dashboard">Back to dashboard</Link>
        </p>
      </main>
    );
  }

  return children;
}
