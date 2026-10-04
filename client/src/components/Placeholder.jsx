export default function Placeholder({ title }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
      <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">This page is coming next.</p>
    </div>
  );
}