// Prices are stored on the course in normal units (500 = 500 BDT) with at most 2 decimals.
// Payments store INTEGER minor units (50000) so money is never compared as a float.
export const CURRENCIES = ['BDT', 'USD']; // all 2-decimal currencies; add more here (not JPY-style ones)

export const toMinor = (price) => Math.round(Number(price) * 100);
export const fromMinor = (minor) => minor / 100;
export const formatMinor = (minor) => (minor / 100).toFixed(2);

// "500.00" (what a gateway sends back) -> 50000. Returns NaN for garbage.
export const parseAmountToMinor = (value) => {
  const n = Number(String(value ?? '').trim());
  return Number.isFinite(n) ? Math.round(n * 100) : NaN;
};
