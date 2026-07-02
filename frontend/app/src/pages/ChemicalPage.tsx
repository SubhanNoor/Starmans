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

            {/* Summary row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="card-white p-4 text-center">
                <p className="font-inter uppercase tracking-wider mb-1" style={{ fontSize: '10px', color: 'var(--secondary-text)', letterSpacing: '0.6px' }}>Total Purchased</p>
                <p className="font-lora font-semibold" style={{ fontSize: '22px', color: 'var(--dark-heading)' }}>{totalPurchased} <span style={{ fontSize: '14px' }}>kg</span></p>
              </div>
              <div className="card-white p-4 text-center">
                <p className="font-inter uppercase tracking-wider mb-1" style={{ fontSize: '10px', color: 'var(--secondary-text)', letterSpacing: '0.6px' }}>Total Used</p>
                <p className="font-lora font-semibold" style={{ fontSize: '22px', color: 'var(--error)' }}>{totalUsed} <span style={{ fontSize: '14px' }}>kg</span></p>
              </div>
              <div className="card-white p-4 text-center">
                <p className="font-inter uppercase tracking-wider mb-1" style={{ fontSize: '10px', color: 'var(--secondary-text)', letterSpacing: '0.6px' }}>Remaining</p>
                <p className="font-lora font-semibold" style={{ fontSize: '22px', color: remaining < 0 ? 'var(--error)' : 'var(--success)' }}>{remaining} <span style={{ fontSize: '14px' }}>kg</span></p>
              </div>
            </div>

            {/* Two forms */}
            <div className="grid grid-cols-2 gap-4">
              {/* Purchase form */}
              <div className="card-white p-5">
                <h4 className="font-lora font-semibold mb-3" style={{ fontSize: '16px', color: 'var(--dark-heading)' }}>Log Purchase</h4>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="block font-inter font-semibold mb-1" style={{ fontSize: '12px', color: 'var(--dark-heading)' }}>Date</label>
                    <input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} className="soleria-input" />
                  </div>
                  <div>
                    <label className="block font-inter font-semibold mb-1" style={{ fontSize: '12px', color: 'var(--dark-heading)' }}>Quantity (kg)</label>
                    <input type="number" value={purchaseQty} onChange={e => setPurchaseQty(e.target.value)} placeholder="e.g. 50" className="soleria-input" />
                  </div>
                  <div>
                    <label className="block font-inter font-semibold mb-1" style={{ fontSize: '12px', color: 'var(--dark-heading)' }}>Cost</label>
                    <input type="number" value={purchaseCost} onChange={e => setPurchaseCost(e.target.value)} placeholder="e.g. 45000" className="soleria-input" />
                  </div>
                  <button onClick={handleAddPurchase} className="btn-gold mt-1">Add Purchase</button>
                </div>
              </div>

              {/* Usage form */}
              <div className="card-white p-5">
                <h4 className="font-lora font-semibold mb-3" style={{ fontSize: '16px', color: 'var(--dark-heading)' }}>Log Daily Usage</h4>
                <div className="flex flex-col gap-3">
                  {usageEntries.map((entry, idx) => (
                    <div key={idx} className="grid grid-cols-2 gap-2">
                      <input type="date" value={entry.date} onChange={e => {
                        const newEntries = [...usageEntries];
                        newEntries[idx].date = e.target.value;
                        setUsageEntries(newEntries);
                      }} className="soleria-input" />
                      <input type="number" value={entry.qty} onChange={e => {
                        const newEntries = [...usageEntries];
                        newEntries[idx].qty = e.target.value;
                        setUsageEntries(newEntries);
                      }} placeholder="Qty (kg)" className="soleria-input" />
                    </div>
                  ))}
                  <button onClick={addUsageRow} className="btn-dashed text-xs py-1.5">+ Add Row</button>
                  <button onClick={handleAddUsage} className="btn-gold">Confirm Usage</button>
                </div>
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
      <div className="mb-4" style={{ maxWidth: 280 }}>
        <input
          type="text"
          value={filterText}
          onChange={e => setFilterText(e.target.value)}
          placeholder="Filter by month..."
          className="soleria-input"
          style={{ fontSize: '13px' }}
        />
      </div>
      <div className="space-y-4">
        {groupedData.map(([month, items]) => {
          const total = items.reduce((s: number, it: any) => s + it.qty, 0);
          return (
            <div key={month} className="card-white">
              <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid var(--border-table)' }}>
                <span className="font-lora font-semibold" style={{ fontSize: '15px', color: 'var(--dark-heading)' }}>{month}</span>
                <span className="font-lora font-semibold" style={{ fontSize: '14px', color: 'var(--brand-gold)' }}>{total} kg</span>
              </div>
              <div className="grid gap-4 px-5 py-2 soleria-table-header" style={{ gridTemplateColumns: type === 'purchase' ? '1fr 80px 100px' : '1fr 80px', background: 'var(--app-bg)' }}>
                <span>Date</span>
                <span className="text-right">Qty (kg)</span>
                {type === 'purchase' && <span className="text-right">Cost</span>}
              </div>
              {items.map((it: any) => (
                <div key={it.id} className="grid gap-4 px-5 py-2 soleria-table-row items-center" style={{ gridTemplateColumns: type === 'purchase' ? '1fr 80px 100px' : '1fr 80px' }}>
                  <span className="font-inter" style={{ fontSize: '13px', color: 'var(--primary-text)' }}>{new Date(it.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  <span className="text-right font-inter font-medium" style={{ fontSize: '13px', color: 'var(--primary-text)' }}>{it.qty}</span>
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
