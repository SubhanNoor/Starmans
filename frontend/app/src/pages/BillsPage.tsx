import { useState } from 'react';
import { useApp, formatCurrency } from '@/context/AppContext';
import AppLayout from '@/components/AppLayout';
import { Plus } from 'lucide-react';

type TabType = 'add' | 'all';

export default function BillsPage() {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('add');
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [entries, setEntries] = useState([{ name: '', amount: 0 }]);
  const [successMsg, setSuccessMsg] = useState('');
  const [filterMonthYear, setFilterMonthYear] = useState('');

  const filteredBills = filterMonthYear
    ? state.bills.filter(bill => bill.date.slice(0, 7) === filterMonthYear)
    : state.bills;

  const groupedBills = filteredBills.reduce((groups, bill) => {
    if (!groups[bill.month]) groups[bill.month] = [];
    groups[bill.month].push(bill);
    return groups;
  }, {} as Record<string, typeof state.bills>);

  function addEntry() {
    setEntries([...entries, { name: '', amount: 0 }]);
  }

  function updateEntry(idx: number, updates: Partial<{ name: string; amount: number }>) {
    setEntries(entries.map((e, i) => i === idx ? { ...e, ...updates } : e));
  }

  function removeEntry(idx: number) {
    setEntries(entries.filter((_, i) => i !== idx));
  }

  function handleConfirm() {
    const validEntries = entries.filter(e => e.name.trim() && e.amount > 0);
    if (validEntries.length === 0) return;

    const date = new Date(billDate);
    const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const bill = {
      id: 'b' + Date.now(),
      date: billDate,
      month: monthName,
      entries: validEntries.map(e => ({ name: e.name, amount: e.amount }))
    };

    dispatch({ type: 'ADD_BILL', bill });
    setEntries([{ name: '', amount: 0 }]);
    setSuccessMsg('Bills recorded successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  }

  const runningTotal = entries.reduce((s, e) => s + (e.amount || 0), 0);

  return (
    <AppLayout pageTitle="Bills">
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div className="tab-pill-container mb-6">
          <button onClick={() => setActiveTab('add')} className={activeTab === 'add' ? 'tab-pill-active' : 'tab-pill-inactive'}>Add Bills</button>
          <button onClick={() => setActiveTab('all')} className={activeTab === 'all' ? 'tab-pill-active' : 'tab-pill-inactive'}>All Bills</button>
        </div>

        {activeTab === 'add' && (
          <>
            {successMsg && <div className="banner-success rounded-lg px-4 py-3 text-sm mb-4">{successMsg}</div>}

            <div className="flex items-center gap-3 mb-4">
              <label className="font-inter font-semibold" style={{ fontSize: '12px', color: 'var(--dark-heading)' }}>Bill Date</label>
              <input type="date" value={billDate} onChange={e => setBillDate(e.target.value)} className="soleria-input" style={{ width: 160, fontSize: '13px' }} />
            </div>

            <div className="card-white">
              <div className="grid gap-3 px-5 py-3 soleria-table-header" style={{ gridTemplateColumns: '1fr 140px 36px', background: 'var(--app-bg)' }}>
                <span>Description</span>
                <span className="text-left">Amount</span>
                <span />
              </div>

              {entries.map((entry, idx) => (
                <div key={idx} className="grid gap-3 px-5 py-2.5 items-center soleria-table-row" style={{ gridTemplateColumns: '1fr 140px 36px' }}>
                  <input type="text" value={entry.name} onChange={e => updateEntry(idx, { name: e.target.value })} placeholder="e.g. Electricity" className="soleria-input" style={{ fontSize: '13px' }} />
                  <input type="number" min={0} value={entry.amount || ''} onChange={e => updateEntry(idx, { amount: parseInt(e.target.value) || 0 })} className="soleria-input text-right" style={{ fontSize: '13px' }} />
                  {entries.length > 1 && (
                    <button onClick={() => removeEntry(idx)} className="flex items-center justify-center text-sm" style={{ color: 'var(--error)' }}>&times;</button>
                  )}
                </div>
              ))}

              <div className="px-5 py-3 flex items-center justify-between">
                <button onClick={addEntry} className="btn-dashed flex items-center gap-1 text-xs">
                  <Plus size={14} /> Add Row
                </button>
                <span className="font-lora font-semibold" style={{ fontSize: '16px', color: 'var(--brand-gold)' }}>
                  {formatCurrency(runningTotal)}
                </span>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button onClick={handleConfirm} className="btn-gold" disabled={runningTotal <= 0}>Confirm Bills</button>
            </div>
          </>
        )}

        {activeTab === 'all' && (
          <div className="space-y-6">
            <div className="flex items-center justify-end gap-3 mb-4" data-no-print>
              <label className="font-inter font-semibold" style={{ fontSize: '12px', color: 'var(--dark-heading)' }}>
                Month / Year
              </label>
              <input
                type="month"
                value={filterMonthYear}
                onChange={e => setFilterMonthYear(e.target.value)}
                className="soleria-input"
                style={{ width: 180, fontSize: '13px' }}
              />
              <button
                onClick={() => setFilterMonthYear('')}
                className="btn-outline text-xs"
                disabled={!filterMonthYear}
              >
                Show All
              </button>
            </div>

            {Object.entries(groupedBills).sort((a, b) => b[0].localeCompare(a[0])).map(([month, bills]) => {
              const monthTotal = bills.reduce((s, b) => s + b.entries.reduce((es, e) => es + e.amount, 0), 0);
              return (
                <div key={month} className="card-white">
                  <div className="flex items-center justify-between px-6 py-3" style={{ borderBottom: '2px solid var(--border-section)' }}>
                    <h4 className="font-lora font-semibold" style={{ fontSize: '16px', color: 'var(--dark-heading)' }}>{month}</h4>
                    <span className="font-lora font-semibold" style={{ fontSize: '14px', color: 'var(--brand-gold)' }}>{formatCurrency(monthTotal)}</span>
                  </div>
                  {bills.flatMap(b => b.entries).map((entry, idx) => (
                    <div key={idx} className="grid items-center px-6 py-2.5 soleria-table-row" style={{ gridTemplateColumns: '1fr 140px' }}>
                      <span className="font-inter" style={{ fontSize: '14px', color: 'var(--primary-text)' }}>{entry.name}</span>
                      <span className="font-inter font-medium text-right whitespace-nowrap" style={{ fontSize: '14px', color: 'var(--primary-text)' }}>{formatCurrency(entry.amount)}</span>
                    </div>
                  ))}
                </div>
              );
            })}
            {Object.keys(groupedBills).length === 0 && (
              <div className="text-center py-12 font-inter" style={{ color: 'var(--muted-text)' }}>No bills recorded yet.</div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
