export default function ErrorMessage({ message }) {
  if (!message) return null;
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
      {message}
    </div>
  );
}
