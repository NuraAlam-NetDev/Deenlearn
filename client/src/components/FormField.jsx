export default function FormField({ label, hint, ...inputProps }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <input
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
        {...inputProps}
      />
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}