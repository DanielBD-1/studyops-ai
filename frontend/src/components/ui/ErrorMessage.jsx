/**
 * @param {{ message: string }} props
 */
export default function ErrorMessage({ message }) {
  return (
    <p role="alert" className="alert alert--error">
      {message}
    </p>
  );
}
