/**
 * Indian Rupee (INR) currency formatting utilities.
 * Conforms to the Indian numbering system: ₹299, ₹1,499, ₹12,999, ₹1,50,000, etc.
 */

export function formatINR(val: number): string {
  if (isNaN(val) || val === null || val === undefined) return "0";
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(Math.round(val));
}

export function formatINRCurrency(val: number): string {
  return `₹${formatINR(val)}`;
}
