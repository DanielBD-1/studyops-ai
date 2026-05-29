import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', end: true },
  { to: '/courses', label: 'Courses', end: false },
  { to: '/tasks', label: 'Tasks', end: true },
  { to: '/flashcards', label: 'Flashcards', end: true },
  { to: '/trello', label: 'Trello', end: true },
];

/**
 * @param {{ isActive: boolean }} state
 */
function navLinkClass({ isActive }) {
  return isActive ? 'app-shell__nav-link app-shell__nav-link--active' : 'app-shell__nav-link';
}

/**
 * @param {{ children: import('react').ReactNode }} props
 */
export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <div className="app-shell">
      <header className="app-shell__bar">
        <div className="app-shell__inner">
          <Link to="/dashboard" className="app-shell__brand">
            StudyOps AI
          </Link>
          <nav className="app-shell__nav" aria-label="Main">
            {NAV_ITEMS.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end} className={navLinkClass}>
                {label}
              </NavLink>
            ))}
            {user?.role === 'admin' && (
              <NavLink to="/admin" end className={navLinkClass}>
                Admin
              </NavLink>
            )}
          </nav>
          <div className="app-shell__actions">
            <button
              type="button"
              className="app-shell__logout btn btn--secondary"
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>
        </div>
      </header>
      <div className="app-shell__content">{children}</div>
    </div>
  );
}
