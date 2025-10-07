// Adapter seam: today we export mocks; later swap to real BC client here only.
export * as bc from './mockBc';
export type {
  Item,
  Customer,
  Sale,
  SaleLine,
  Payment,
  User
} from './mockBc';
