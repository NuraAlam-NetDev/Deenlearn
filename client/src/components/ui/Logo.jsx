import { Link } from 'react-router-dom';

export function Logo({ className = 'h-9 w-9' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#136446" />
      <path d="M40 14a18 18 0 1 0 0 36 14 14 0 1 1 0-36z" fill="#d4af37" />
    </svg>
  );
}

// tone="light" for dark backgrounds, "dark" for white ones
export function BrandLink({ tone = 'light', className = '' }) {
  const text = tone === 'light' ? 'text-gold-300' : 'text-brand-700';
  return (
    <Link to="/" className={`inline-flex items-center gap-2 ${className}`}>
      <Logo />
      <span className={`font-display text-2xl font-bold ${text}`}>Deenlearn</span>
    </Link>
  );
}
