import { roundToStep } from './rounding';

export type Discount = { type: 'PERCENT' | 'AMOUNT'; value: number };

export function applyDiscount(amount: number, d?: Discount) {
  if (!d) return { amount, discountAmt: 0 };
  if (d.type === 'PERCENT') {
    const discountAmt = (amount * d.value) / 100;
    return { amount: amount - discountAmt, discountAmt };
  } else {
    const discountAmt = Math.min(d.value, amount);
    return { amount: amount - discountAmt, discountAmt };
  }
}

/** Compute VAT given VAT-included or excluded mode. */
export function computeTotals(
  lineTotals: number[],
  vatRate: number,
  vatIncluded: boolean,
  roundingStep = 0
) {
  const grand = lineTotals.reduce((s, n) => s + n, 0);
  let subtotal: number;
  let vat: number;
  if (vatIncluded) {
    subtotal = grand / (1 + vatRate);
    vat = grand - subtotal;
  } else {
    subtotal = grand;
    vat = grand * vatRate;
  }
  let grandTotal = vatIncluded ? grand : subtotal + vat;
  if (roundingStep > 0) {
    grandTotal = roundToStep(grandTotal, roundingStep);
    // Adjust VAT so subtotal + vat = grand
    if (vatIncluded) {
      subtotal = grandTotal / (1 + vatRate);
      vat = grandTotal - subtotal;
    } else {
      // subtotal stays, vat recomputed from grandTotal
      vat = grandTotal - subtotal;
    }
  }
  return { subtotal, vat, grandTotal };
}
