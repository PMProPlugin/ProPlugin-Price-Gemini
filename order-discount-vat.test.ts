import { computeTotals } from '@utils/vat';

test('VAT-included order discount computes correctly', () => {
  const lineTotals = [100, 100]; // 200 incl VAT
  const vatRate = 0.07;
  const out = computeTotals(lineTotals, vatRate, true, 0);
  // subtotal should be 200/1.07
  expect(Number(out.subtotal.toFixed(2))).toBe(186.92);
  expect(Number(out.vat.toFixed(2))).toBe(13.08);
  expect(Number(out.grandTotal.toFixed(2))).toBe(200.0);
});
