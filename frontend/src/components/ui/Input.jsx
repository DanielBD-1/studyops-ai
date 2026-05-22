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
    <label htmlFor={id} className="field">
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
        className="field__input"
      />
      {error && (
        <span id={`${id}-error`} role="alert" className="field__error">
          {error}
        </span>
      )}
    </label>
  );
}
