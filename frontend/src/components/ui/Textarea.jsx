/**
 * @param {{
 *   id: string,
 *   label: string,
 *   value: string,
 *   onChange: (value: string) => void,
 *   error?: string | null,
 *   required?: boolean,
 *   rows?: number,
 * }} props
 */
export default function Textarea({
  id,
  label,
  value,
  onChange,
  error = null,
  required = false,
  rows = 8,
}) {
  return (
    <label htmlFor={id} style={{ display: 'block' }}>
      {label}
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        style={{
          display: 'block',
          width: '100%',
          marginTop: '0.25rem',
          padding: '0.5rem',
          boxSizing: 'border-box',
          fontFamily: 'inherit',
        }}
      />
      {error && (
        <span id={`${id}-error`} role="alert" style={{ color: '#b00020', fontSize: '0.875rem' }}>
          {error}
        </span>
      )}
    </label>
  );
}
