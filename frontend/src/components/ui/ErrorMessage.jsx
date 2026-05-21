/**
 * @param {{ message: string }} props
 */
export default function ErrorMessage({ message }) {
  return (
    <p role="alert" style={{ color: '#b00020', margin: '0 0 0.75rem' }}>
      {message}
    </p>
  );
}
