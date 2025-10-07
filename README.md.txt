# POS BC Mock (Front-end)

Modern, keyboard-first POS mock ready to integrate with Dynamics 365 Business Central (BC). Uses mocks and localStorage now; swap `services/bcClient.ts` later to integrate.

## Tech
- Vite + React + TypeScript
- Tailwind CSS
- Zustand (state) + React Query (data)
- React Router
- React Hook Form + Zod (in Customer modal)
- dayjs (date/time), Intl.NumberFormat (THB)
- Vitest + Testing Library
- Print CSS (80mm, A4)

## Quick Start
```bash
npm i
npm run dev
