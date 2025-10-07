import { create } from 'zustand';
import { computeTotals, applyDiscount, type Discount } from '@utils/vat';
import { useSettingsStore } from './useSettingsStore';
import type { Customer, Payment, SaleLine } from '@services/mockBc';
import { bc } from '@services/bcClient';
import dayjs from 'dayjs';
import { useAuthStore } from './useAuthStore';

type CartState = {
  lines: SaleLine[];
  customer?: Customer;
  orderDiscount?: Discount;
  subtotal: number;
  vat: number;
  grandTotal: number;
  lineCount: number;
  history: any[]; // last sales for receipts & reports
  addItemByBarcode: (code: string) => Promise<boolean>;
  addCustomItem: (name: string, price: number) => void;
  updateQty: (id: string, qty: number) => void;
  updateLineDiscount: (id: string, d: Discount) => void;
  setOrderDiscount: (d?: Discount) => void;
  removeLine: (id: string) => void;
  clearCart: () => void;
  attachCustomer: (c: Customer) => void;
  holdSale: () => void;
  resumeSaleIfAny: () => boolean;
  createSaleDraftAndFinalize: (payments: Payment[]) => Promise<void>;
  loadHistory: () => void;
};

const heldKey = 'held_sale';
const historyKey = 'sale_history';

function persistHistory(list: any[]) {
  localStorage.setItem(historyKey, JSON.stringify(list));
}

export const useCartStore = create<CartState>((set, get) => ({
  lines: [],
  customer: undefined,
  orderDiscount: undefined,
  subtotal: 0,
  vat: 0,
  grandTotal: 0,
  lineCount: 0,
  history: (() => {
    const raw = localStorage.getItem(historyKey);
    return raw ? JSON.parse(raw) : [];
  })(),

  async addItemByBarcode(code) {
    const item = await bc.getItemByBarcode(code);
    if (!item) return false;
    const exist = get().lines.find((l) => l.sku === item.sku);
    if (exist) {
      get().updateQty(exist.id, exist.qty + 1);
    } else {
      const line: SaleLine = {
        id: crypto.randomUUID(),
        itemId: item.id,
        sku: item.sku,
        name: item.name,
        qty: 1,
        unitPrice: item.price,
        discountAmt: 0,
        lineTotal: item.price,
        lowStock: (item.stockQty ?? 0) < 3
      };
      set({ lines: [...get().lines, line] });
      recalc(set, get);
    }
    return true;
  },

  addCustomItem(name, price) {
    const line: SaleLine = {
      id: crypto.randomUUID(),
      itemId: 'custom',
      sku: 'CUS',
      name,
      qty: 1,
      unitPrice: price,
      discountAmt: 0,
      lineTotal: price
    };
    set({ lines: [...get().lines, line] });
    recalc(set, get);
  },

  updateQty(id, qty) {
    qty = Math.max(1, Math.round(qty));
    set({ lines: get().lines.map((l) => (l.id === id ? { ...l, qty, lineTotal: (l.unitPrice * qty) - l.discountAmt } : l)) });
    recalc(set, get);
  },

  updateLineDiscount(id, d) {
    set({
      lines: get().lines.map((l) => {
        if (l.id !== id) return l;
        const before = l.unitPrice * l.qty;
        const { amount, discountAmt } = applyDiscount(before, d);
        return { ...l, discountAmt, lineTotal: amount };
      })
    });
    recalc(set, get);
  },

  setOrderDiscount(d) {
    set({ orderDiscount: d });
    recalc(set, get);
  },

  removeLine(id) {
    set({ lines: get().lines.filter((l) => l.id !== id) });
    recalc(set, get);
  },

  clearCart() {
    set({ lines: [], customer: undefined, orderDiscount: undefined, subtotal: 0, vat: 0, grandTotal: 0, lineCount: 0 });
  },

  attachCustomer(c) {
    set({ customer: c });
  },

  holdSale() {
    const state = get();
    localStorage.setItem(heldKey, JSON.stringify({ lines: state.lines, customer: state.customer, orderDiscount: state.orderDiscount }));
  },

  resumeSaleIfAny() {
    const raw = localStorage.getItem(heldKey);
    if (!raw) return false;
    const data = JSON.parse(raw);
    set({ lines: data.lines || [], customer: data.customer, orderDiscount: data.orderDiscount });
    localStorage.removeItem(heldKey);
    recalc(set, get);
    return true;
  },

  async createSaleDraftAndFinalize(payments) {
    const { user } = useAuthStore.getState();
    const state = get();
    const s = useSettingsStore.getState();
    const draft = await bc.createSale({
      cashierId: user?.id || 'u1',
      customerId: state.customer?.id,
      customer: state.customer,
      lines: state.lines,
      subtotal: state.subtotal,
      vat: state.vat,
      grandTotal: state.grandTotal,
      discountTotal: state.lines.reduce((a, l) => a + l.discountAmt, 0)
    });
    const finalized = await bc.finalizeSale(draft.id, payments);
    // append to history
    const history = [...get().history, finalized];
    persistHistory(history);
    set({ history });
  },

  loadHistory() {
    const raw = localStorage.getItem(historyKey);
    set({ history: raw ? JSON.parse(raw) : [] });
  }
}));

function recalc(set: any, get: any) {
  const s = useSettingsStore.getState();
  let lineTotals = get().lines.map((l: SaleLine) => l.lineTotal);
  let od = get().orderDiscount as Discount | undefined;

  if (od) {
    const sum = lineTotals.reduce((a: number, b: number) => a + b, 0);
    const { amount } = applyDiscount(sum, od);
    // reallocate order discount proportionally
    const totalBefore = sum;
    lineTotals = lineTotals.map((lt: number) => (lt / totalBefore) * amount);
  }

  const { subtotal, vat, grandTotal } = computeTotals(lineTotals, s.vatRate, s.vatIncluded, s.roundingStep);
  set({
    subtotal: round2(subtotal),
    vat: round2(vat),
    grandTotal: round2(grandTotal),
    lineCount: get().lines.reduce((a: number, l: SaleLine) => a + l.qty, 0)
  });
}

function round2(n: number) { return Math.round(n * 100) / 100; }
