export function maskNumber(value: string): string {
  const digits = value.match(/\d/g) ?? [];
  if (digits.length <= 4) return value;

  let seenDigits = 0;
  const digitsToMask = digits.length - 4;

  return value.replace(/\d/g, (digit) => {
    seenDigits += 1;
    if (seenDigits <= digitsToMask) return "*";
    return digit;
  });
}
