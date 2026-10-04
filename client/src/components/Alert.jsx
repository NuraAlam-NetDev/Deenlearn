const styles = {
  error: 'border-red-200 bg-red-50 text-red-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  info: 'border-sky-200 bg-sky-50 text-sky-800',
};

export default function Alert({ type = 'error', children }) {
  return (
    <div className={`rounded-md border px-3 py-2 text-sm ${styles[type]}`} role="alert">
      {children}
    </div>
  );
}