export function roundToStep(value: number, step: number) {
  if (step <= 0) return value;
  const m = Math.round(value / step) * step;
  return Math.round(m * 100) / 100;
}
