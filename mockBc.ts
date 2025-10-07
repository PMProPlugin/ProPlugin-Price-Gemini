import itemsData from '@mocks/items.json';
import customersData from '@mocks/customers.json';
import usersData from '@mocks/users.json';

export type Item = {
  id: string;
  sku: string;
  barcode?: string;
  name: string;
  brand?: string;
  category?: string;
  price: number;
  vatIncluded: boolean;
  stockQty?: number;
};

export type Customer = {
  id: string;
  name: string;
  phone?: string;
  taxId?: string;
  address?: string;
};

export type SaleLine = {
  id: string;
  itemId: string;
  sku: string;
  name: string;
  qty: number;
  unitPrice: number;
  discountAmt: number;
  lineTotal: number;
  lowStock?: boolean;
};

export type Payment = {
  id: string;
  type: 'CASH' | 'CARD' | 'TRANSFER' | 'EWALLET';
  amount: number;
  ref?: string;
};

export type Sale = {
  id: string;
  number?: string;
  datetime: string;
  cashierId: string;
  customerId?: string;
  customer?: Customer;
  lines: SaleLine[];
  subtotal: number;
  vat: number;
  grandTotal: number;
  payments: Payment[];
  note?: string;
  status: 'OPEN' | 'HELD' | 'PAID' | 'VOID';
  discountTotal?: number;
};

export type User = { id: string; name: string; role: 'CASHIER'|'SUPERVISOR'|'ADMIN'; pin: string };

const delay = (min=200,max=400)=> new Promise(r=>setTimeout(r, Math.floor(Math.random()*(max-min))+min));

let items = [...itemsData];
let customers = [...customersData];
let users = [...usersData];

export async function listAllItems(): Promise<Item[]> {
  await delay();
  return items;
}

export async function searchItems(term: string, filters?: {brand?: string; category?: string}): Promise<Item[]> {
  await delay();
  const t = term.toLowerCase();
  return items.filter(i =>
    (!term || i.name.toLowerCase().includes(t) || i.sku.toLowerCase().includes(t) || i.barcode?.includes(term)) &&
    (!filters?.brand || i.brand === filters.brand) &&
    (!filters?.category || i.category === filters.category)
  );
}

export async function getItemByBarcode(code: string): Promise<Item | undefined> {
  await delay();
  return items.find(i => i.barcode === code || i.sku === code);
}

export async function listCustomers(q?: string): Promise<Customer[]> {
  await delay();
  if (!q) return customers;
  const t = q.toLowerCase();
  return customers.filter(c => c.name.toLowerCase().includes(t) || c.phone?.includes(q));
}

export async function createCustomer(dto: Omit<Customer, 'id'>): Promise<Customer> {
  await delay();
  const c: Customer = { id: 'c' + (customers.length + 1), ...dto };
  customers.push(c);
  localStorage.setItem('mock_customers', JSON.stringify(customers));
  return c;
}

export async function listUsers(): Promise<User[]> {
  await delay();
  return users;
}

// Sales persistence (mock)
const salesKey = 'mock_sales';
function loadSales(): Sale[] {
  const raw = localStorage.getItem(salesKey);
  return raw ? JSON.parse(raw) : [];
}
function saveSales(all: Sale[]) {
  localStorage.setItem(salesKey, JSON.stringify(all));
}

export async function createSale(draft: Partial<Sale>): Promise<Sale> {
  await delay();
  const all = loadSales();
  const sale: Sale = {
    id: crypto.randomUUID(),
    number: String(100000 + all.length),
    datetime: new Date().toISOString(),
    cashierId: draft.cashierId || 'u1',
    customerId: draft.customerId,
    customer: draft.customer,
    lines: draft.lines || [],
    subtotal: draft.subtotal || 0,
    vat: draft.vat || 0,
    grandTotal: draft.grandTotal || 0,
    payments: [],
    note: draft.note,
    status: 'OPEN',
    discountTotal: draft.discountTotal || 0
  };
  all.push(sale);
  saveSales(all);
  return sale;
}

export async function finalizeSale(id: string, payments: Payment[]): Promise<Sale> {
  await delay();
  const all = loadSales();
  const idx = all.findIndex(s => s.id === id);
  if (idx === -1) throw new Error('sale not found');
  const updated = { ...all[idx], payments, status: 'PAID' as const };
  all[idx] = updated;
  saveSales(all);
  return updated;
}

export async function findSaleByNumber(n: string): Promise<Sale | undefined> {
  await delay();
  return loadSales().find(s => s.number === n);
}
