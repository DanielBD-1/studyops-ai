/**
 * @param {{ message?: string }} props
 */
export default function LoadingState({ message = 'Loading…' }) {
  return <p style={{ color: '#555', margin: '1rem 0' }}>{message}</p>;
}
