import { useState } from 'react';
import { useApp, formatCurrency } from '@/context/AppContext';
import AppLayout from '@/components/AppLayout';

type TabType = 'manage' | 'purchases' | 'usage';

export default function ChemicalPage() {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('manage');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [purchaseQty, setPurchaseQty] = useState('');
  const [purchaseCost, setPurchaseCost] = useState('');
  const [usageEntries, setUsageEntries] = useState([{ date: new Date().toISOString().split('T')[0], qty: '' }]);
  const [successMsg, setSuccessMsg] = useState('');
  const [filterText, setFilterText] = useState('');

  const totalPurchased = state.chemPurchases.reduce((s, p) => s + p.qty, 0);
  const totalUsed = state.chemUsage.reduce((s, u) => s + u.qty, 0);
  const remaining = totalPurchased - totalUsed;

  function handleAddPurchase() {
    if (!purchaseQty || !purchaseCost) return;
    dispatch({ type: 'ADD_CHEM_PURCHASE', purchase: { id: 'cp' + Date.now(), date: purchaseDate, qty: parseFloat(purchaseQty), cost: parseInt(purchaseCost) } });
    setPurchaseQty('');
    setPurchaseCost('');
    setSuccessMsg('Purchase logged successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  }

  function handleAddUsage() {
    const valid = usageEntries.filter(e => e.qty && parseFloat(e.qty) > 0);
    if (valid.length === 0) return;
    valid.forEach(e => {
      dispatch({ type: 'ADD_CHEM_USAGE', usage: { id: 'cu' + Date.now(), date: e.date, qty: parseFloat(e.qty) } });
    });
    setUsageEntries([{ date: new Date().toISOString().split('T')[0], qty: '' }]);
    setSuccessMsg('Usage logged successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  }

  function addUsageRow() {
    setUsageEntries([...usageEntries, { date: new Date().toISOString().split('T')[0], qty: '' }]);
  }

  const groupedPurchases = state.chemPurchases.reduce((g, p) => {
    const month = new Date(p.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!g[month]) g[month] = [];
    g[month].push(p);
    return g;
  }, {} as Record<string, typeof state.chemPurchases>);

  const groupedUsage = state.chemUsage.reduce((g, u) => {
    const month = new Date(u.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!g[month]) g[month] = [];
    g[month].push(u);
    return g;
  }, {} as Record<string, typeof state.chemUsage>);

  const filteredPurchases = Object.entries(groupedPurchases).filter(([month]) =>
    month.toLowerCase().includes(filterText.toLowerCase())
  );
  const filteredUsage = Object.entries(groupedUsage).filter(([month]) =>
    month.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <AppLayout pageTitle="Chemical">
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div className="tab-pill-container mb-6">
          <button onClick={() => setActiveTab('manage')} className={activeTab === 'manage' ? 'tab-pill-active' : 'tab-pill-inactive'}>Manage</button>
          <button onClick={() => setActiveTab('purchases')} className={activeTab === 'purchases' ? 'tab-pill-active' : 'tab-pill-inactive'}>Purchase History</button>
          <button onClick={() => setActiveTab('usage')} className={activeTab === 'usage' ? 'tab-pill-active' : 'tab-pill-inactive'}>Usage Log</button>
        </div>

        {activeTab === 'manage' && (
          <>
            {successMsg && <div className="banner-success rounded-lg px-4 py-3 text-sm mb-4">{successMsg}</div>}

            {/* Add Purchase */}
            <div className="card-white p-5 mb-5">
              <h4 className="font-lora font-semibold mb-3" style={{ fontSize: '16px', color: 'var(--dark-heading)' }}>Add Purchase</h4>
              <div className="grid items-end gap-4" style={{ gridTemplateColumns: 'minmax(160px, 1.4fr) minmax(90px, 0.8fr) minmax(90px, 0.8fr) auto' }}>
                <div style={{ minWidth: 0 }}>
                  <label className="block font-inter font-semibold mb-1" style={{ fontSize: '12px', color: 'var(--dark-heading)' }}>Purchase Date</label>
                  <input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} className="soleria-input" style={{ width: '100%' }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <label className="block font-inter font-semibold mb-1" style={{ fontSize: '12px', color: 'var(--dark-heading)' }}>Quantity (kg)</label>
                  <input type="number" value={purchaseQty} onChange={e => setPurchaseQty(e.target.value)} placeholder="0" className="soleria-input" style={{ width: '100%' }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <label className="block font-inter font-semibold mb-1" style={{ fontSize: '12px', color: 'var(--dark-heading)' }}>Cost (Rs)</label>
                  <input type="number" value={purchaseCost} onChange={e => setPurchaseCost(e.target.value)} placeholder="0" className="soleria-input" style={{ width: '100%' }} />
                </div>
                <button
                  onClick={handleAddPurchase}
                  disabled={!purchaseDate || !purchaseQty || !purchaseCost}
                  className="btn-gold"
                  style={{ height: 42, whiteSpace: 'nowrap' }}
                >
                  Add Purchase
                </button>
              </div>
            </div>

            {/* Log Daily Usage */}
            <div className="card-white mb-5">
              <div className="px-5 pt-5 pb-3">
                <h4 className="font-lora font-semibold" style={{ fontSize: '16px', color: 'var(--dark-heading)' }}>Log Daily Usage</h4>
              </div>
              <div className="grid gap-4 px-5 py-2 soleria-table-header" style={{ gridTemplateColumns: '1fr 1fr', background: 'var(--app-bg)' }}>
                <span>Date</span>
                <span>Quantity Used (kg)</span>
              </div>
              <div className="px-5 py-3 flex flex-col gap-3">
                {usageEntries.map((entry, idx) => (
                  <div key={idx} className="grid grid-cols-2 gap-3">
                    <input type="date" value={entry.date} onChange={e => {
                      const newEntries = [...usageEntries];
                      newEntries[idx].date = e.target.value;
                      setUsageEntries(newEntries);
                    }} className="soleria-input" />
                    <input type="number" value={entry.qty} onChange={e => {
                      const newEntries = [...usageEntries];
                      newEntries[idx].qty = e.target.value;
                      setUsageEntries(newEntries);
                    }} placeholder="0" className="soleria-input" />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between px-5 pb-5">
                <button onClick={addUsageRow} className="btn-dashed text-xs py-1.5 px-3">+ Add Row</button>
                <button
                  onClick={handleAddUsage}
                  disabled={!usageEntries.some(e => e.date && e.qty && parseFloat(e.qty) > 0)}
                  className="btn-gold"
                >
                  Confirm Usage
                </button>
              </div>
            </div>

            {/* Summary row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="card-white p-4 text-center">
                <p className="font-inter uppercase tracking-wider mb-1" style={{ fontSize: '10px', color: 'var(--secondary-text)', letterSpacing: '0.6px' }}>Total Purchased</p>
                <p className="font-lora font-semibold" style={{ fontSize: '28px', color: 'var(--dark-heading)' }}>{totalPurchased} <span style={{ fontSize: '16px' }}>kg</span></p>
              </div>
              <div className="card-white p-4 text-center">
                <p className="font-inter uppercase tracking-wider mb-1" style={{ fontSize: '10px', color: 'var(--secondary-text)', letterSpacing: '0.6px' }}>Total Used</p>
                <p className="font-lora font-semibold" style={{ fontSize: '28px', color: 'var(--dark-heading)' }}>{totalUsed} <span style={{ fontSize: '16px' }}>kg</span></p>
              </div>
              <div className="p-4 text-center rounded-lg" style={{ background: 'var(--dark-heading)' }}>
                <p className="font-inter uppercase tracking-wider mb-1" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.6px' }}>Remaining</p>
                <p className="font-lora font-semibold" style={{ fontSize: '28px', color: 'var(--brand-gold)' }}>{remaining} <span style={{ fontSize: '16px' }}>kg</span></p>
              </div>
            </div>
          </>
        )}

        {activeTab === 'purchases' && (
          <HistoryView groupedData={filteredPurchases} type="purchase" filterText={filterText} setFilterText={setFilterText} />
        )}

        {activeTab === 'usage' && (
          <HistoryView groupedData={filteredUsage} type="usage" filterText={filterText} setFilterText={setFilterText} />
        )}
      </div>
    </AppLayout>
  );
}

function HistoryView({ groupedData, type, filterText, setFilterText }: {
  groupedData: [string, any[]][];
  type: 'purchase' | 'usage';
  filterText: string;
  setFilterText: (s: string) => void;
}) {
  return (
    <>
      <div className="mb-4" style={{ maxWidth: 380 }}>
        <input
          type="text"
          value={filterText}
          onChange={e => setFilterText(e.target.value)}
          placeholder="Filter by month or date (e.g. 2026-06)."
          className="soleria-input"
          style={{ fontSize: '13px', width: '100%' }}
        />
      </div>
      <div className="space-y-4">
        {groupedData.map(([month, items]) => {
          const total = items.reduce((s: number, it: any) => s + it.qty, 0);
          return (
            <div key={month} className="card-white">
              <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3" style={{ borderBottom: '1px solid var(--border-table)' }}>
                <span className="font-lora font-semibold" style={{ fontSize: '15px', color: 'var(--dark-heading)' }}>{month}</span>
                <span className="font-lora font-semibold" style={{ fontSize: '14px', color: 'var(--brand-gold)' }}>{total} kg{type === 'usage' ? ' used' : ''}</span>
              </div>
              <div className="grid gap-4 px-5 py-2 soleria-table-header" style={{ gridTemplateColumns: type === 'purchase' ? '1fr 110px 120px' : '1fr 150px', background: 'var(--app-bg)' }}>
                <span>Date</span>
                <span className="text-right">{type === 'purchase' ? 'Quantity (kg)' : 'Quantity Used (kg)'}</span>
                {type === 'purchase' && <span className="text-right">Cost</span>}
              </div>
              {items.map((it: any) => (
                <div key={it.id} className="grid gap-4 px-5 py-4 soleria-table-row items-center" style={{ gridTemplateColumns: type === 'purchase' ? '1fr 110px 120px' : '1fr 150px' }}>
                  <span className="font-inter" style={{ fontSize: '13px', color: 'var(--primary-text)' }}>{new Date(it.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span className="text-right font-inter font-medium" style={{ fontSize: '13px', color: 'var(--primary-text)' }}>{it.qty} kg</span>
                  {type === 'purchase' && <span className="text-right font-inter" style={{ fontSize: '13px', color: 'var(--brand-gold)' }}>{formatCurrency(it.cost)}</span>}
                </div>
              ))}
            </div>
          );
        })}
        {groupedData.length === 0 && (
          <div className="text-center py-12 font-inter" style={{ color: 'var(--muted-text)' }}>No records found.</div>
        )}
      </div>
    </>
  );
}
