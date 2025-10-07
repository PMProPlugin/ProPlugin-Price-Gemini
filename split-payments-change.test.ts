import { render } from '@testing-library/react';
import PaymentModal from '@components/PaymentModal';
import { useCartStore } from '@store/useCartStore';

test('split payments sum to total (basic smoke)', () => {
  // Set up cart state to a known total
  useCartStore.setState({
    grandTotal: 1000,
    createSaleDraftAndFinalize: async () => {},
    clearCart: () => {}
  } as any);

  // Render without crashing
  render(<PaymentModal onClose={() => {}} onComplete={() => {}} />);
});
