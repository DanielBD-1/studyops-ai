/**
 * @param {{
 *   children: import('react').ReactNode,
 *   type?: 'button' | 'submit' | 'reset',
 *   variant?: 'primary' | 'secondary' | 'danger',
 *   disabled?: boolean,
 *   onClick?: () => void,
 *   className?: string,
 * }} props
 */
export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  disabled = false,
  onClick,
  className = '',
}) {
  const variantClass =
    variant === 'danger' ? 'btn--danger' : variant === 'secondary' ? 'btn--secondary' : 'btn--primary';

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`btn ${variantClass} ${className}`.trim()}
    >
      {children}
    </button>
  );
}
