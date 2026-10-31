// Number formatting shared across FinSight views (B/M/K suffixes, unit-aware).

export function formatNumber(value: number | null, unit: string = 'USD'): string {
  if (value === null) return 'N/A';

  // Normalize unit: "pure" → "%" for percentages
  const normalizedUnit = unit === 'pure' ? '%' : unit;

  // Format large numbers with B/M/K suffix
  const absValue = Math.abs(value);
  let formatted: string;
  if (absValue >= 1e9) {
    formatted = `${(value / 1e9).toFixed(2)}B`;
  } else if (absValue >= 1e6) {
    formatted = `${(value / 1e6).toFixed(2)}M`;
  } else if (absValue >= 1e3) {
    formatted = `${(value / 1e3).toFixed(2)}K`;
  } else {
    formatted = `${value.toFixed(2)}`;
  }

  // Always append unit after the number
  return `${formatted} ${normalizedUnit}`;
}
