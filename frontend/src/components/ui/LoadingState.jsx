/**
 * @param {{ message?: string }} props
 */
export default function LoadingState({ message = 'Loading…' }) {
  return <p className="loading">{message}</p>;
}
