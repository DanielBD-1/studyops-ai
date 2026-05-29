import { Link } from 'react-router-dom';

/**
 * @param {{
 *   title: string,
 *   lead?: string,
 *   note?: string,
 *   backTo?: { to: string, label: string },
 *   intro?: boolean,
 *   children?: import('react').ReactNode,
 * }} props
 */
export default function PageHeader({ title, lead, note, backTo, intro = false, children }) {
  const headerClass = intro ? 'page-header page-header--intro' : 'page-header';

  return (
    <>
      {backTo && (
        <p className="back-link">
          <Link to={backTo.to}>{backTo.label}</Link>
        </p>
      )}
      <header className={headerClass}>
        {intro ? (
          <div className="page-header__intro">
            <h1>{title}</h1>
            {lead && <p className="page-header__lead">{lead}</p>}
            {note && <p className="page-header__note">{note}</p>}
          </div>
        ) : (
          <>
            <h1>{title}</h1>
            {lead && <p className="page-header__lead">{lead}</p>}
          </>
        )}
        {children}
      </header>
    </>
  );
}
