import { create } from 'zustand';

type Currency = { code: 'THB'; symbol: '฿'; decimals: number };

type StoreProfile = { name: string; taxId?: string; address?: string; phone?: string };

type SettingsState = {
  storeProfile: StoreProfile;
  vatRate: number; // 0.07
  vatIncluded: boolean;
  roundingStep: number; // 0 or 0.25
  currency: Currency;
  setStoreProfile: (p: StoreProfile) => void;
  setVatRate: (r: number) => void;
  setVatIncluded: (v: boolean) => void;
  setRoundingStep: (r: number) => void;
  reset: () => void;
};

const key = 'settings';

const defaults: Omit<SettingsState, 'setStoreProfile' | 'setVatRate' | 'setVatIncluded' | 'setRoundingStep' | 'reset'> = {
  storeProfile: { name: 'My Music Store', taxId: '0105551234567', address: 'Bangkok' },
  vatRate: 0.07,
  vatIncluded: true,
  roundingStep: 0,
  currency: { code: 'THB', symbol: '฿', decimals: 2 }
};

export const useSettingsStore = create<SettingsState>((set) => {
  const persisted = localStorage.getItem(key);
  const initial = persisted ? { ...defaults, ...JSON.parse(persisted) } : defaults;

  function save(next: Partial<SettingsState>) {
    const merged = { ...initial, ...next };
    localStorage.setItem(key, JSON.stringify(merged));
  }

  return {
    ...initial,
    setStoreProfile: (p) => {
      save({ storeProfile: p });
      set({ storeProfile: p });
    },
    setVatRate: (r) => {
      save({ vatRate: r });
      set({ vatRate: r });
    },
    setVatIncluded: (v) => {
      save({ vatIncluded: v });
      set({ vatIncluded: v });
    },
    setRoundingStep: (r) => {
      save({ roundingStep: r });
      set({ roundingStep: r });
    },
    reset: () => {
      localStorage.setItem(key, JSON.stringify(defaults));
      set(defaults);
    }
  };
});
