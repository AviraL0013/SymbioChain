export function formatNear(value: string, precision = 4): string {
  const n = BigInt(value),
    unit = 10n ** 24n;
  return (
    (n / unit).toLocaleString("en-US") +
    "." +
    (n % unit).toString().padStart(24, "0").slice(0, precision)
  );
}
