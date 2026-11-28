export function formatCredits(value: number): string {
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}
