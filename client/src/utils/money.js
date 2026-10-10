const SYMBOLS = { BDT: '৳', USD: '$' };

function format(amount, currency) {
  const number = new Intl.NumberFormat('en', {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${SYMBOLS[currency] ?? `${currency} `}${number}`;
}

// Course price (normal units, 0 = free)
export const formatPrice = (price, currency = 'BDT') => (price > 0 ? format(price, currency) : 'Free');

// Payment amount (the server stores integer minor units: 50000 = 500.00)
export const formatMinor = (minor, currency = 'BDT') => format(minor / 100, currency);

export const isPaid = (course) => Number(course?.price) > 0;
