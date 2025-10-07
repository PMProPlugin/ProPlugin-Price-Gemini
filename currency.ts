export function formatCurrency(amount: number, currency: { code: 'THB'; symbol: '฿'; decimals: number }) {
  const f = new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals
  });
  return f.format(amount || 0);
}
