/**
 * @param {{
 *   id: string,
 *   label: string,
 *   value: string,
 *   onChange: (value: string) => void,
 *   error?: string | null,
 *   type?: string,
 *   autoComplete?: string,
 *   required?: boolean,
 * }} props
 */
export default function Input({
  id,
  label,
  value,
  onChange,
  error = null,
  type = 'text',
  autoComplete,
  required = false,
}) {
  return (
    <label htmlFor={id} style={{ display: 'block' }}>
      {label}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        style={{
          display: 'block',
          width: '100%',
          marginTop: '0.25rem',
          padding: '0.5rem',
          boxSizing: 'border-box',
        }}
      />
      {error && (
        <span id={`${id}-error`} style={{ color: '#b00020', fontSize: '0.875rem' }}>
          {error}
        </span>
      )}
    </label>
  );
}
