export default function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="toast-area">
      <div className="toast" role="alert">
        {message}
      </div>
    </div>
  );
}
