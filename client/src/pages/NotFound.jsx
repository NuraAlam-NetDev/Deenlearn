import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="py-10 text-center">
      <h1 className="text-3xl font-bold">404</h1>
      <Link to="/" className="text-brand-600 underline">Back home</Link>
    </div>
  );
}
