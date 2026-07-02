import { useState } from 'react';
import { useApp, formatCurrency, isDateInCurrentWeek, isDateInCurrentMonth } from '@/context/AppContext';
import AppLayout from '@/components/AppLayout';
import { Plus, Printer } from 'lucide-react';

type TabType = 'new' | 'weekly' | 'monthly' | 'alltime';

export default function ExpensesPage() {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('new');
  const [entries, setEntries] = useState([{ desc: '', price: 0 }]);
  const [successMsg, setSuccessMsg] = useState('');

  const runningTotal = entries.reduce((s, e) => s + (e.price || 0), 0);

  const weeklyExpenses = state.expenses.filter(e => isDateInCurrentWeek(e.date));
  const monthlyExpenses = state.expenses.filter(e => isDateInCurrentMonth(e.date));

  function addEntry() {
    setEntries([...entries, { desc: '', price: 0 }]);
  }

  function updateEntry(idx: number, updates: Partial<{ desc: string; price: number }>) {
    setEntries(entries.map((e, i) => i === idx ? { ...e, ...updates } : e));
  }

  function removeEntry(idx: number) {
    setEntries(entries.filter((_, i) => i !== idx));
  }

  function handleConfirm() {
    const valid = entries.filter(e => e.desc.trim() && e.price > 0);
    if (valid.length === 0) return;
    const now = new Date();
    dispatch({ type: 'ADD_EXPENSE', expense: {
      id: 'e' + Date.now(),
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      rows: valid.map(e => ({ desc: e.desc, price: e.price }))
    }});
    setEntries([{ desc: '', price: 0 }]);
    setSuccessMsg('Expenses recorded successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  }

  return (
    <AppLayout
      pageTitle="Expenses"
      headerAction={
        activeTab !== 'new' ? (
          <button onClick={() => window.print()} className="btn-navy flex items-center gap-2">
            <Printer size={16} />
            Print Expenses
          </button>
        ) : undefined
      }
    >
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div className="tab-pill-container mb-6">
          <button onClick={() => setActiveTab('new')} className={activeTab === 'new' ? 'tab-pill-active' : 'tab-pill-inactive'}>New Entry</button>
          <button onClick={() => setActiveTab('weekly')} className={activeTab === 'weekly' ? 'tab-pill-active' : 'tab-pill-inactive'}>Weekly</button>
          <button onClick={() => setActiveTab('monthly')} className={activeTab === 'monthly' ? 'tab-pill-active' : 'tab-pill-inactive'}>Monthly</button>
          <button onClick={() => setActiveTab('alltime')} className={activeTab === 'alltime' ? 'tab-pill-active' : 'tab-pill-inactive'}>All Time</button>
        </div>

        {activeTab === 'new' && (
          <>
            {successMsg && <div className="banner-success rounded-lg px-4 py-3 text-sm mb-4">{successMsg}</div>}
            <div className="card-white">
              <div className="grid gap-3 px-5 py-3 soleria-table-header" style={{ gridTemplateColumns: '1fr 140px 36px', background: 'var(--app-bg)' }}>
                <span>Description</span>
                <span className="text-right">Amount</span>
                <span />
              </div>
              {entries.map((entry, idx) => (
                <div key={idx} className="grid gap-3 px-5 py-2.5 items-center soleria-table-row" style={{ gridTemplateColumns: '1fr 140px 36px' }}>
                  <input type="text" value={entry.desc} onChange={e => updateEntry(idx, { desc: e.target.value })} placeholder="Description" className="soleria-input" />
                  <input type="number" min={0} value={entry.price || ''} onChange={e => updateEntry(idx, { price: parseInt(e.target.value) || 0 })} className="soleria-input text-right" />
                  {entries.length > 1 && <button onClick={() => removeEntry(idx)} style={{ color: 'var(--error)' }}>&times;</button>}
                </div>
              ))}
              <div className="px-5 py-3 flex items-center justify-between">
                <button onClick={addEntry} className="btn-dashed flex items-center gap-1 text-xs"><Plus size={14} /> Add Expense</button>
                <span className="font-lora font-semibold" style={{ fontSize: '18px', color: 'var(--brand-gold)' }}>{formatCurrency(runningTotal)}</span>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={handleConfirm} className="btn-gold" disabled={runningTotal <= 0}>Confirm</button>
            </div>
          </>
        )}

        {activeTab === 'weekly' && <ReportView expenses={weeklyExpenses} title="Weekly Expenses" />}
        {activeTab === 'monthly' && <ReportView expenses={monthlyExpenses} title="Monthly Expenses" />}
        {activeTab === 'alltime' && <ReportView expenses={state.expenses} title="All Time Expenses" />}
      </div>
    </AppLayout>
  );
}

function ReportView({ expenses, title }: { expenses: any[]; title: string }) {
  const total = expenses.reduce((s, e) => s + e.rows.reduce((rs: number, r: any) => rs + r.price, 0), 0);
  return (
    <div className="card-white">
      <div className="px-6 py-4" style={{ borderBottom: '2px solid var(--border-section)' }}>
        <h3 className="font-lora font-semibold" style={{ fontSize: '18px', color: 'var(--dark-heading)' }}>{title}</h3>
      </div>
      {expenses.map(expense => {
        const expTotal = expense.rows.reduce((s: number, r: any) => s + r.price, 0);
        return (
          <div key={expense.id} className="px-6 py-3 soleria-table-row">
            <div className="flex items-center justify-between mb-2">
              <span className="font-inter font-medium" style={{ fontSize: '13px', color: 'var(--secondary-text)' }}>
                {new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {expense.time}
              </span>
              <span className="font-lora font-semibold" style={{ fontSize: '14px', color: 'var(--brand-gold)' }}>{formatCurrency(expTotal)}</span>
            </div>
            {expense.rows.map((row: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between py-1" style={{ borderTop: idx > 0 ? '1px solid var(--border-table)' : 'none' }}>
                <span className="font-inter" style={{ fontSize: '13px', color: 'var(--primary-text)' }}>{row.desc}</span>
                <span className="font-inter" style={{ fontSize: '13px', color: 'var(--primary-text)' }}>{formatCurrency(row.price)}</span>
              </div>
            ))}
          </div>
        );
      })}
      {expenses.length === 0 && (
        <div className="px-6 py-8 text-center font-inter" style={{ color: 'var(--muted-text)' }}>No expenses found.</div>
      )}
      <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: '2px solid var(--border-section)' }}>
        <span className="font-inter font-semibold" style={{ fontSize: '13px', color: 'var(--dark-heading)' }}>Total Expenses</span>
        <span className="font-lora font-semibold" style={{ fontSize: '26px', color: 'var(--brand-gold)' }}>{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
