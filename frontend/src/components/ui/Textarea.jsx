/**
 * @param {{
 *   id: string,
 *   label: string,
 *   value: string,
 *   onChange: (value: string) => void,
 *   error?: string | null,
 *   required?: boolean,
 *   rows?: number,
 *   reading?: boolean,
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
  reading = false,
}) {
  const textareaClass = reading ? 'field__textarea field__textarea--reading' : 'field__textarea';

  return (
    <label htmlFor={id} className="field">
      {label}
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={textareaClass}
      />
      {error && (
        <span id={`${id}-error`} role="alert" className="field__error">
          {error}
        </span>
      )}
    </label>
  );
}
