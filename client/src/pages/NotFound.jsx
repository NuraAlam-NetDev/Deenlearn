import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="py-10 text-center">
      <h1 className="text-3xl font-bold">404</h1>
      <p className="mt-1 text-slate-600">This page does not exist.</p>
      <Link to="/" className="mt-3 inline-block text-brand-600 underline">
        Back home
      </Link>
    </div>
  );
}