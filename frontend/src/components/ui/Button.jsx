const baseStyle = {
  padding: '0.5rem 1rem',
  fontSize: '1rem',
  cursor: 'pointer',
  borderRadius: '4px',
  border: '1px solid transparent',
};

const variants = {
  primary: {
    backgroundColor: '#1a56db',
    color: '#fff',
    borderColor: '#1a56db',
  },
  secondary: {
    backgroundColor: '#fff',
    color: '#333',
    borderColor: '#ccc',
  },
  danger: {
    backgroundColor: '#b00020',
    color: '#fff',
    borderColor: '#b00020',
  },
};

/**
 * @param {{
 *   children: import('react').ReactNode,
 *   type?: 'button' | 'submit' | 'reset',
 *   variant?: 'primary' | 'secondary' | 'danger',
 *   disabled?: boolean,
 *   onClick?: () => void,
 * }} props
 */
export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  disabled = false,
  onClick,
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        ...baseStyle,
        ...variants[variant],
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {children}
    </button>
  );
}
