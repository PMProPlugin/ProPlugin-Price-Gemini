type Handlers = {
  onAddItem?: () => void;
  onFocusBarcode?: () => void;
  onDiscount?: () => void;
  onOpenPayment?: () => void;
  onHold?: () => void;
  onHelp?: () => void;
};

export function registerHotkeys(h: Handlers) {
  const handler = (e: KeyboardEvent) => {
    // Ctrl+/
    if (e.ctrlKey && e.key === '/') {
      e.preventDefault();
      h.onHelp?.();
      return;
    }
    switch (e.key) {
      case 'F2':
        e.preventDefault();
        h.onAddItem?.();
        break;
      case 'F3':
        e.preventDefault();
        h.onFocusBarcode?.();
        break;
      case 'F4':
        e.preventDefault();
        h.onDiscount?.();
        break;
      case 'F8':
        e.preventDefault();
        h.onOpenPayment?.();
        break;
      case 'F9':
        e.preventDefault();
        h.onHold?.();
        break;
      case 'Escape':
        // Let modals listen themselves; no-op here.
        break;
    }
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}
