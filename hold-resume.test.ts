import { useCartStore } from '@store/useCartStore';

test('hold/resume round-trip', () => {
  useCartStore.setState({
    lines: [{ id: 'l1', itemId: 'i1', sku: 'SKU', name: 'Test', qty: 1, unitPrice: 100, discountAmt: 0, lineTotal: 100 }],
    customer: undefined,
    orderDiscount: undefined
  } as any);
  useCartStore.getState().holdSale();
  useCartStore.setState({ lines: [] } as any);
  const ok = useCartStore.getState().resumeSaleIfAny();
  expect(ok).toBe(true);
  expect(useCartStore.getState().lines.length).toBe(1);
});
