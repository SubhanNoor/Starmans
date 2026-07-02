import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type {
  Article, Client, Production, Expense, Bill,
  ChemPurchase, ChemUsage, Payment, Slip, SlipItem
} from '@/types';

/* ──────────────────── demo data ──────────────────── */

const demoArticles: Article[] = [
  { id: 'a2', name: 'Rubber Sole', price: 380, stock: 80, color: 'Brown', size: '9-10' },
  { id: 'a3', name: 'TPR Sole', price: 520, stock: 200, color: 'White', size: '6-7' },
  { id: 'a4', name: 'Leather Sole', price: 850, stock: 45, color: 'Tan', size: '8-9' },
  { id: 'a5', name: 'EVA Foam Sole', price: 290, stock: 15, color: 'Grey', size: 'Unisex' },
  { id: 'a6', name: 'Crepe Sole', price: 670, stock: 60, color: 'Natural', size: '8-9' },
  { id: 'a7', name: 'PU Sole', price: 490, stock: 90, color: 'Black', size: '10-11' },
];

const slipItems: Record<string, SlipItem[]> = {
  sl1035: [
    { name: 'PVC Sole', qty: 20, price: 450, subtotal: 9000, discountType: null, discountAmount: 0, discountPct: 0, amount: 9000, desc: '', size: '42-44', color: 'Black' },
    { name: 'Rubber Sole', qty: 15, price: 380, subtotal: 5700, discountType: '%', discountAmount: 570, discountPct: 10, amount: 5130, desc: 'Regular order', size: '40-42', color: 'Brown' },
  ],
  sl1036: [
    { name: 'TPR Sole', qty: 30, price: 520, subtotal: 15600, discountType: 'Rs', discountAmount: 600, discountPct: 0, amount: 15000, desc: '', size: '41-43', color: 'Black' },
  ],
  sl1037: [
    { name: 'Leather Sole', qty: 10, price: 850, subtotal: 8500, discountType: null, discountAmount: 0, discountPct: 0, amount: 8500, desc: 'Premium quality', size: '42-44', color: 'Tan' },
    { name: 'PVC Sole', qty: 25, price: 450, subtotal: 11250, discountType: '%', discountAmount: 1125, discountPct: 10, amount: 10125, desc: '', size: '42-44', color: 'Black' },
  ],
  sl1038: [
    { name: 'PU Sole', qty: 18, price: 490, subtotal: 8820, discountType: null, discountAmount: 0, discountPct: 0, amount: 8820, desc: '', size: '40-42', color: 'Black' },
  ],
  sl1039: [
    { name: 'Crepe Sole', qty: 12, price: 670, subtotal: 8040, discountType: 'Rs', discountAmount: 500, discountPct: 0, amount: 7540, desc: 'Export quality', size: '41-43', color: 'Natural' },
  ],
  sl1040: [
    { name: 'Rubber Sole', qty: 40, price: 380, subtotal: 15200, discountType: '%', discountAmount: 1520, discountPct: 10, amount: 13680, desc: 'Bulk order', size: '40-42', color: 'Brown' },
    { name: 'TPR Sole', qty: 20, price: 520, subtotal: 10400, discountType: null, discountAmount: 0, discountPct: 0, amount: 10400, desc: '', size: '41-43', color: 'Black' },
  ],
  sl1041: [
    { name: 'EVA Foam Sole', qty: 50, price: 290, subtotal: 14500, discountType: 'Rs', discountAmount: 1000, discountPct: 0, amount: 13500, desc: '', size: '38-40', color: 'White' },
  ],
  sl1042: [
    { name: 'PVC Sole', qty: 35, price: 450, subtotal: 15750, discountType: '%', discountAmount: 1575, discountPct: 10, amount: 14175, desc: 'Regular supply', size: '42-44', color: 'Black' },
  ],
  sl1043: [
    { name: 'Leather Sole', qty: 8, price: 850, subtotal: 6800, discountType: null, discountAmount: 0, discountPct: 0, amount: 6800, desc: 'Handmade', size: '42-44', color: 'Tan' },
    { name: 'PU Sole', qty: 22, price: 490, subtotal: 10780, discountType: '%', discountAmount: 1078, discountPct: 10, amount: 9702, desc: '', size: '40-42', color: 'Black' },
  ],
  sl1044: [
    { name: 'Crepe Sole', qty: 15, price: 670, subtotal: 10050, discountType: null, discountAmount: 0, discountPct: 0, amount: 10050, desc: '', size: '41-43', color: 'Natural' },
  ],
  sl1045: [
    { name: 'TPR Sole', qty: 28, price: 520, subtotal: 14560, discountType: 'Rs', discountAmount: 800, discountPct: 0, amount: 13760, desc: 'Seasonal order', size: '41-43', color: 'Black' },
  ],
  sl1046: [
    { name: 'Rubber Sole', qty: 45, price: 380, subtotal: 17100, discountType: '%', discountAmount: 1710, discountPct: 10, amount: 15390, desc: '', size: '40-42', color: 'Brown' },
    { name: 'PVC Sole', qty: 20, price: 450, subtotal: 9000, discountType: null, discountAmount: 0, discountPct: 0, amount: 9000, desc: '', size: '42-44', color: 'Black' },
  ],
};

const demoClients: Client[] = [
  {
    id: 'c1', name: 'Ahmed Footwear', phone: '0300-1234567',
    slips: [
      { id: 'sl1035', no: 'SL-1035', date: '2026-06-01', time: '10:30 AM', items: slipItems.sl1035, total: 14130 },
      { id: 'sl1040', no: 'SL-1040', date: '2026-06-15', time: '02:15 PM', items: slipItems.sl1040, total: 24080 },
    ]
  },
  {
    id: 'c2', name: 'Khan Shoe House', phone: '0312-9876543',
    slips: [
      { id: 'sl1036', no: 'SL-1036', date: '2026-06-03', time: '11:45 AM', items: slipItems.sl1036, total: 15000 },
      { id: 'sl1042', no: 'SL-1042', date: '2026-06-18', time: '09:00 AM', items: slipItems.sl1042, total: 14175 },
      { id: 'sl1045', no: 'SL-1045', date: '2026-06-28', time: '04:30 PM', items: slipItems.sl1045, total: 13760 },
    ]
  },
  {
    id: 'c3', name: 'Malik Traders', phone: '0333-4567890',
    slips: [
      { id: 'sl1037', no: 'SL-1037', date: '2026-06-05', time: '01:20 PM', items: slipItems.sl1037, total: 18625 },
      { id: 'sl1043', no: 'SL-1043', date: '2026-06-22', time: '03:45 PM', items: slipItems.sl1043, total: 16502 },
    ]
  },
  {
    id: 'c4', name: 'Bilal Shoe Mart', phone: '0301-7890123',
    slips: [
      { id: 'sl1038', no: 'SL-1038', date: '2026-06-08', time: '12:00 PM', items: slipItems.sl1038, total: 8820 },
      { id: 'sl1044', no: 'SL-1044', date: '2026-06-25', time: '10:10 AM', items: slipItems.sl1044, total: 10050 },
    ]
  },
  {
    id: 'c5', name: 'Raza Brothers', phone: '0321-3456789',
    slips: [
      { id: 'sl1039', no: 'SL-1039', date: '2026-06-10', time: '05:00 PM', items: slipItems.sl1039, total: 7540 },
      { id: 'sl1041', no: 'SL-1041', date: '2026-06-20', time: '11:30 AM', items: slipItems.sl1041, total: 13500 },
      { id: 'sl1046', no: 'SL-1046', date: '2026-06-29', time: '01:00 PM', items: slipItems.sl1046, total: 24390 },
    ]
  },
];

const demoProductions: Production[] = [
  { id: 'p1', date: '2026-06-23', entries: [{ articleId: 'a1', articleName: 'PVC Sole', qty: 30 }, { articleId: 'a2', articleName: 'Rubber Sole', qty: 20 }, { articleId: 'a3', articleName: 'TPR Sole', qty: 15 }] },
  { id: 'p2', date: '2026-06-24', entries: [{ articleId: 'a4', articleName: 'Leather Sole', qty: 10 }, { articleId: 'a6', articleName: 'Crepe Sole', qty: 12 }, { articleId: 'a7', articleName: 'PU Sole', qty: 25 }] },
  { id: 'p3', date: '2026-06-25', entries: [{ articleId: 'a1', articleName: 'PVC Sole', qty: 40 }, { articleId: 'a5', articleName: 'EVA Foam Sole', qty: 50 }] },
  { id: 'p4', date: '2026-06-26', entries: [{ articleId: 'a2', articleName: 'Rubber Sole', qty: 35 }, { articleId: 'a3', articleName: 'TPR Sole', qty: 22 }, { articleId: 'a7', articleName: 'PU Sole', qty: 18 }] },
  { id: 'p5', date: '2026-06-27', entries: [{ articleId: 'a4', articleName: 'Leather Sole', qty: 8 }, { articleId: 'a6', articleName: 'Crepe Sole', qty: 15 }] },
  { id: 'p6', date: '2026-06-28', entries: [{ articleId: 'a1', articleName: 'PVC Sole', qty: 25 }, { articleId: 'a2', articleName: 'Rubber Sole', qty: 30 }] },
  { id: 'p7', date: '2026-06-29', entries: [{ articleId: 'a3', articleName: 'TPR Sole', qty: 28 }, { articleId: 'a7', articleName: 'PU Sole', qty: 20 }] },
];

const demoExpenses: Expense[] = [
  { id: 'e1', date: '2026-06-01', time: '09:00 AM', rows: [{ desc: 'Shop Rent', price: 25000 }, { desc: 'Labour Wages', price: 18000 }] },
  { id: 'e2', date: '2026-06-05', time: '10:30 AM', rows: [{ desc: 'Machine Maintenance', price: 5000 }, { desc: 'Packaging Material', price: 3500 }] },
  { id: 'e3', date: '2026-06-10', time: '02:00 PM', rows: [{ desc: 'Transportation', price: 4200 }, { desc: 'Office Supplies', price: 1800 }] },
  { id: 'e4', date: '2026-06-15', time: '11:00 AM', rows: [{ desc: 'Security Services', price: 8000 }, { desc: 'Cleaning Services', price: 2500 }] },
  { id: 'e5', date: '2026-06-20', time: '03:30 PM', rows: [{ desc: 'Tool Replacement', price: 6500 }, { desc: 'Miscellaneous', price: 1200 }] },
];

const demoBills: Bill[] = [
  { id: 'b1', date: '2026-05-01', month: 'May 2026', entries: [{ name: 'Electricity', amount: 12500 }, { name: 'Gas', amount: 3800 }] },
  { id: 'b2', date: '2026-06-01', month: 'June 2026', entries: [{ name: 'Electricity', amount: 15200 }, { name: 'Gas', amount: 4200 }, { name: 'Water', amount: 1800 }] },
  { id: 'b3', date: '2026-06-05', month: 'June 2026', entries: [{ name: 'Internet', amount: 2500 }] },
  { id: 'b4', date: '2026-06-10', month: 'June 2026', entries: [{ name: 'Shop Rent', amount: 45000 }] },
  { id: 'b5', date: '2026-06-15', month: 'June 2026', entries: [{ name: 'Electricity (AC)', amount: 3200 }] },
];

const demoChemPurchases: ChemPurchase[] = [
  { id: 'cp1', date: '2026-06-01', qty: 50, cost: 45000 },
  { id: 'cp2', date: '2026-06-15', qty: 30, cost: 28000 },
];

const demoChemUsage: ChemUsage[] = [
  { id: 'cu1', date: '2026-06-23', qty: 5 },
  { id: 'cu2', date: '2026-06-24', qty: 4 },
  { id: 'cu3', date: '2026-06-25', qty: 6 },
  { id: 'cu4', date: '2026-06-26', qty: 3 },
  { id: 'cu5', date: '2026-06-27', qty: 5 },
  { id: 'cu6', date: '2026-06-28', qty: 4 },
  { id: 'cu7', date: '2026-06-29', qty: 3 },
];

const demoPayments: Payment[] = [];

/* ──────────────────── state ──────────────────── */

interface State {
  isLoggedIn: boolean;
  currentPage: string;
  selectedClientId: string | null;
  selectedSlipId: string | null;
  articles: Article[];
  clients: Client[];
  productions: Production[];
  expenses: Expense[];
  bills: Bill[];
  chemPurchases: ChemPurchase[];
  chemUsage: ChemUsage[];
  payments: Payment[];
  settings: { username: string; password: string };
}

type Action =
  | { type: 'LOGIN'; payload: { username: string; password: string } }
  | { type: 'LOGOUT' }
  | { type: 'NAVIGATE'; page: string }
  | { type: 'SELECT_CLIENT'; clientId: string }
  | { type: 'SELECT_SLIP'; slipId: string }
  | { type: 'SET_ARTICLES'; articles: Article[] }
  | { type: 'ADD_ARTICLE'; article: Article }
  | { type: 'DELETE_ARTICLE'; id: string }
  | { type: 'SET_CLIENTS'; clients: Client[] }
  | { type: 'ADD_SLIP'; clientId: string; slip: Slip }
  | { type: 'UPDATE_SLIP'; clientId: string; slipId: string; slip: Slip }
  | { type: 'DELETE_SLIP'; clientId: string; slipId: string }
  | { type: 'SET_PRODUCTIONS'; productions: Production[] }
  | { type: 'ADD_PRODUCTION'; production: Production }
  | { type: 'SET_EXPENSES'; expenses: Expense[] }
  | { type: 'ADD_EXPENSE'; expense: Expense }
  | { type: 'SET_BILLS'; bills: Bill[] }
  | { type: 'ADD_BILL'; bill: Bill }
  | { type: 'SET_CHEM_PURCHASES'; chemPurchases: ChemPurchase[] }
  | { type: 'ADD_CHEM_PURCHASE'; purchase: ChemPurchase }
  | { type: 'SET_CHEM_USAGE'; chemUsage: ChemUsage[] }
  | { type: 'ADD_CHEM_USAGE'; usage: ChemUsage }
  | { type: 'SET_PAYMENTS'; payments: Payment[] }
  | { type: 'ADD_PAYMENT'; payment: Payment }
  | { type: 'UPDATE_SETTINGS'; settings: { username: string; password: string } };

const initialState: State = {
  isLoggedIn: false,
  currentPage: 'login',
  selectedClientId: null,
  selectedSlipId: null,
  articles: demoArticles,
  clients: demoClients,
  productions: demoProductions,
  expenses: demoExpenses,
  bills: demoBills,
  chemPurchases: demoChemPurchases,
  chemUsage: demoChemUsage,
  payments: demoPayments,
  settings: { username: 'admin', password: 'admin' },
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOGIN': {
      const { username, password } = action.payload;
      if (username === state.settings.username && password === state.settings.password) {
        return { ...state, isLoggedIn: true, currentPage: 'new-sale' };
      }
      return state;
    }
    case 'LOGOUT':
      return { ...state, isLoggedIn: false, currentPage: 'login' };
    case 'NAVIGATE':
      return { ...state, currentPage: action.page };
    case 'SELECT_CLIENT':
      return { ...state, selectedClientId: action.clientId, selectedSlipId: null };
    case 'SELECT_SLIP':
      return { ...state, selectedSlipId: action.slipId };
    case 'SET_ARTICLES':
      return { ...state, articles: action.articles };
    case 'ADD_ARTICLE':
      return { ...state, articles: [...state.articles, action.article] };
    case 'DELETE_ARTICLE': {
      const newArticles = state.articles.filter(a => a.id !== action.id);
      // Also remove from productions entries
      const newProductions = state.productions.map(p => ({
        ...p,
        entries: p.entries.filter(e => e.articleId !== action.id)
      })).filter(p => p.entries.length > 0);
      return { ...state, articles: newArticles, productions: newProductions };
    }
    case 'SET_CLIENTS':
      return { ...state, clients: action.clients };
    case 'ADD_SLIP': {
      const newClients = state.clients.map(c =>
        c.id === action.clientId
          ? { ...c, slips: [...c.slips, action.slip] }
          : c
      );
      // Deduct stock
      const newArticles = state.articles.map(a => {
        const soldQty = action.slip.items
          .filter(i => i.name === a.name)
          .reduce((total, item) => total + item.qty, 0);
        if (soldQty > 0) {
          return { ...a, stock: Math.max(0, a.stock - soldQty) };
        }
        return a;
      });
      return { ...state, clients: newClients, articles: newArticles };
    }
    case 'UPDATE_SLIP': {
      const client = state.clients.find(c => c.id === action.clientId);
      if (!client) return state;
      const oldSlip = client.slips.find(s => s.id === action.slipId);
      // Restore old stock
      let restoredArticles = state.articles.map(a => {
        if (!oldSlip) return a;
        const oldItem = oldSlip.items.find(i => i.name === a.name);
        if (oldItem) {
          return { ...a, stock: a.stock + oldItem.qty };
        }
        return a;
      });
      // Deduct new stock
      const newArticles = restoredArticles.map(a => {
        const newItem = action.slip.items.find(i => i.name === a.name);
        if (newItem) {
          return { ...a, stock: Math.max(0, a.stock - newItem.qty) };
        }
        return a;
      });
      const newClients = state.clients.map(c =>
        c.id === action.clientId
          ? { ...c, slips: c.slips.map(s => s.id === action.slipId ? action.slip : s) }
          : c
      );
      return { ...state, clients: newClients, articles: newArticles };
    }
    case 'DELETE_SLIP': {
      const client = state.clients.find(c => c.id === action.clientId);
      if (!client) return state;
      const slip = client.slips.find(s => s.id === action.slipId);
      // Restore stock
      const newArticles = state.articles.map(a => {
        if (!slip) return a;
        const item = slip.items.find(i => i.name === a.name);
        if (item) {
          return { ...a, stock: a.stock + item.qty };
        }
        return a;
      });
      const newClients = state.clients.map(c =>
        c.id === action.clientId
          ? { ...c, slips: c.slips.filter(s => s.id !== action.slipId) }
          : c
      );
      return { ...state, clients: newClients, articles: newArticles };
    }
    case 'SET_PRODUCTIONS':
      return { ...state, productions: action.productions };
    case 'ADD_PRODUCTION': {
      // Add stock
      const newArticles = state.articles.map(a => {
        const prodEntry = action.production.entries.find(e => e.articleId === a.id);
        if (prodEntry) {
          return { ...a, stock: a.stock + prodEntry.qty };
        }
        return a;
      });
      return { ...state, productions: [...state.productions, action.production], articles: newArticles };
    }
    case 'SET_EXPENSES':
      return { ...state, expenses: action.expenses };
    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, action.expense] };
    case 'SET_BILLS':
      return { ...state, bills: action.bills };
    case 'ADD_BILL':
      return { ...state, bills: [...state.bills, action.bill] };
    case 'SET_CHEM_PURCHASES':
      return { ...state, chemPurchases: action.chemPurchases };
    case 'ADD_CHEM_PURCHASE':
      return { ...state, chemPurchases: [...state.chemPurchases, action.purchase] };
    case 'SET_CHEM_USAGE':
      return { ...state, chemUsage: action.chemUsage };
    case 'ADD_CHEM_USAGE':
      return { ...state, chemUsage: [...state.chemUsage, action.usage] };
    case 'SET_PAYMENTS':
      return { ...state, payments: action.payments };
    case 'ADD_PAYMENT':
      return { ...state, payments: [...state.payments, action.payment] };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: action.settings };
    default:
      return state;
  }
}

/* ──────────────────── context ──────────────────── */

interface ContextType {
  state: State;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<ContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

/* ──────────────────── helpers ──────────────────── */

export function formatCurrency(value: number): string {
  return '\u20A8 ' + value.toLocaleString('en-US');
}

export function getCurrentWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(now.setDate(diff));
}

export function getCurrentWeekEnd(): Date {
  const start = getCurrentWeekStart();
  return new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
}

export function isDateInCurrentWeek(dateStr: string): boolean {
  const date = new Date(dateStr);
  return date >= getCurrentWeekStart() && date <= getCurrentWeekEnd();
}

export function isDateInCurrentMonth(dateStr: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}

export function isDateInMonth(dateStr: string, month: number, year: number): boolean {
  const date = new Date(dateStr);
  return date.getMonth() === month && date.getFullYear() === year;
}

export function getMonthName(m: number): string {
  const names = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  return names[m];
}

export function getPairsSold(slip: Slip): number {
  return slip.items.reduce((sum, item) => sum + item.qty, 0);
}

export function getWeekRange(): string {
  const start = getCurrentWeekStart();
  const end = getCurrentWeekEnd();
  return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
}
