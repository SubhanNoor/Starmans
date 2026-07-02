import { useState, useMemo } from 'react';
import { useApp, formatCurrency, isDateInCurrentWeek, isDateInMonth, getWeekRange } from '@/context/AppContext';
import AppLayout from '@/components/AppLayout';
import { Search } from 'lucide-react';

type TabType = 'new' | 'weekly' | 'monthly';
type PaymentMethod = 'Cash' | 'Bank Transfer' | 'Cheque' | 'Online';

export default function PaymentPage() {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('new');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('Cash');
  const [amount, setAmount] = useState('');
  const [chequeDate, setChequeDate] = useState('');
  const [desc, setDesc] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchText, setSearchText] = useState('');
  const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0, 7));

  const matchedClient = useMemo(() => {
    if (!clientName.trim()) return null;
    return state.clients.find(c => c.name.toLowerCase() === clientName.toLowerCase());
  }, [clientName, state.clients]);

  const phoneMatch = matchedClient && matchedClient.phone === clientPhone;
  const isVerified = matchedClient && phoneMatch;

  const canConfirm = isVerified && parseInt(amount) > 0;

  function handleConfirm() {
    if (!canConfirm || !matchedClient) return;

    const now = new Date();
    const payment = {
      id: 'pay' + Date.now(),
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      clientId: matchedClient.id,
      clientName: matchedClient.name,
      clientPhone: matchedClient.phone,
      method,
      amount: parseInt(amount),
      desc,
      collectionDate: method === 'Cheque' ? now.toISOString().split('T')[0] : undefined,
      chequeDate: method === 'Cheque' && chequeDate ? chequeDate : undefined,
    };

    dispatch({ type: 'ADD_PAYMENT', payment });
    setClientName('');
    setClientPhone('');
    setAmount('');
    setChequeDate('');
    setDesc('');
    setMethod('Cash');
    setSuccessMsg('Payment recorded successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  }

  const weeklyPayments = state.payments.filter(p => isDateInCurrentWeek(p.date));
  const monthlyPayments = state.payments.filter(p => {
    const [year, month] = monthFilter.split('-').map(Number);
    return isDateInMonth(p.date, month - 1, year);
  });

  const filteredWeekly = weeklyPayments.filter(p =>
    p.clientName.toLowerCase().includes(searchText.toLowerCase()) ||
    p.clientPhone.includes(searchText) ||
    p.method.toLowerCase().includes(searchText.toLowerCase())
  );
  const filteredMonthly = monthlyPayments.filter(p =>
    p.clientName.toLowerCase().includes(searchText.toLowerCase()) ||
    p.clientPhone.includes(searchText) ||
    p.method.toLowerCase().includes(searchText.toLowerCase())
  );

  const weeklyTotal = filteredWeekly.reduce((s, p) => s + p.amount, 0);
  const monthlyTotal = filteredMonthly.reduce((s, p) => s + p.amount, 0);

  return (
    <AppLayout pageTitle="Payment">
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div className="tab-pill-container mb-6">
          <button onClick={() => setActiveTab('new')} className={activeTab === 'new' ? 'tab-pill-active' : 'tab-pill-inactive'}>New Payment</button>
          <button onClick={() => setActiveTab('weekly')} className={activeTab === 'weekly' ? 'tab-pill-active' : 'tab-pill-inactive'}>Weekly</button>
          <button onClick={() => setActiveTab('monthly')} className={activeTab === 'monthly' ? 'tab-pill-active' : 'tab-pill-inactive'}>Monthly</button>
        </div>

        {activeTab === 'new' && (
          <>
            {successMsg && <div className="banner-success rounded-lg px-4 py-3 text-sm mb-4">{successMsg}</div>}

            <div className="card-white p-6">
              {/* Row 1: Client name + phone */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block font-inter font-semibold mb-1" style={{ fontSize: '12px', color: 'var(--dark-heading)' }}>Client Name</label>
                  <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Enter client name" className="soleria-input" />
                  {clientName && !matchedClient && (
                    <p className="mt-1 font-inter" style={{ fontSize: '11px', color: 'var(--error)' }}>No client found</p>
                  )}
                  {matchedClient && (
                    <p className="mt-1 font-inter" style={{ fontSize: '11px', color: 'var(--success)' }}>Client found</p>
                  )}
                </div>
                <div>
                  <label className="block font-inter font-semibold mb-1" style={{ fontSize: '12px', color: 'var(--dark-heading)' }}>Phone Number</label>
                  <input type="text" value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="Enter phone" className="soleria-input" />
                  {clientPhone && matchedClient && (
                    <p className="mt-1 font-inter" style={{ fontSize: '11px', color: phoneMatch ? 'var(--success)' : 'var(--error)' }}>
                      {phoneMatch ? 'Phone matched' : 'Phone does not match'}
                    </p>
                  )}
                </div>
              </div>

              {/* Verified card */}
              {isVerified && matchedClient && (
                <div className="banner-verified rounded-lg p-4 mb-4 flex items-center gap-3">
                  <div className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: 40, height: 40, background: 'var(--brand-navy)' }}>
                    <span className="font-inter font-semibold text-sm" style={{ color: 'var(--brand-gold)' }}>
                      {matchedClient.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <p className="font-inter font-semibold" style={{ fontSize: '14px', color: 'var(--dark-heading)' }}>{matchedClient.name}</p>
                    <p className="font-inter" style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>{matchedClient.phone} &middot; {matchedClient.slips.length} slips</p>
                  </div>
                </div>
              )}

              {/* Row 3: Method + Amount */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block font-inter font-semibold mb-1" style={{ fontSize: '12px', color: 'var(--dark-heading)' }}>Payment Method</label>
                  <select value={method} onChange={e => setMethod(e.target.value as PaymentMethod)} className="soleria-input cursor-pointer">
                    <option>Cash</option>
                    <option>Bank Transfer</option>
                    <option>Cheque</option>
                    <option>Online</option>
                  </select>
                </div>
                <div>
                  <label className="block font-inter font-semibold mb-1" style={{ fontSize: '12px', color: 'var(--dark-heading)' }}>Amount Paid</label>
                  <input type="number" min={0} value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className="soleria-input" />
                </div>
              </div>

              {/* Cheque panel */}
              {method === 'Cheque' && (
                <div className="rounded-lg p-4 mb-4" style={{ background: '#FDFBF7', border: '1px solid #E3D9C6' }}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-inter font-semibold mb-1" style={{ fontSize: '12px', color: 'var(--dark-heading)' }}>Collection Date</label>
                      <input type="text" value={new Date().toLocaleDateString('en-US')} readOnly className="soleria-input" style={{ background: 'var(--alt-surface)' }} />
                      <p className="mt-1 font-inter" style={{ fontSize: '10px', color: 'var(--secondary-text)' }}>Auto-set to today</p>
                    </div>
                    <div>
                      <label className="block font-inter font-semibold mb-1" style={{ fontSize: '12px', color: 'var(--dark-heading)' }}>Cheque Date</label>
                      <input type="date" value={chequeDate} onChange={e => setChequeDate(e.target.value)} className="soleria-input" />
                      <p className="mt-1 font-inter" style={{ fontSize: '10px', color: 'var(--secondary-text)' }}>Date printed on the cheque</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="mb-4">
                <label className="block font-inter font-semibold mb-1" style={{ fontSize: '12px', color: 'var(--dark-heading)' }}>Description (optional)</label>
                <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="e.g. Partial payment for slip SL-1040" className="soleria-input" />
              </div>

              {/* Confirm */}
              <div className="flex items-center justify-between">
                <span className="font-lora font-semibold" style={{ fontSize: '20px', color: 'var(--brand-gold)' }}>
                  {formatCurrency(parseInt(amount) || 0)}
                </span>
                <button onClick={handleConfirm} className="btn-gold" disabled={!canConfirm}>Confirm Payment</button>
              </div>
            </div>

            {/* Recorded payments list */}
            {state.payments.length > 0 && (
              <div className="card-white mt-6">
                <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--border-table)' }}>
                  <h4 className="font-lora font-semibold" style={{ fontSize: '16px', color: 'var(--dark-heading)' }}>Recorded Payments</h4>
                </div>
                <div className="grid gap-4 px-5 py-2.5 soleria-table-header" style={{ gridTemplateColumns: '1fr 160px 130px 110px 120px', background: 'var(--app-bg)' }}>
                  <span>Client</span>
                  <span>Phone</span>
                  <span>Date</span>
                  <span>Method</span>
                  <span className="text-right">Amount</span>
                </div>
                {state.payments.slice().reverse().map(p => (
                  <div key={p.id} className="grid gap-4 px-5 py-2.5 soleria-table-row items-center" style={{ gridTemplateColumns: '1fr 160px 130px 110px 120px' }}>
                    <span className="font-inter font-medium" style={{ fontSize: '13px', color: 'var(--primary-text)' }}>{p.clientName}</span>
                    <span className="font-inter" style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>{p.clientPhone}</span>
                    <span className="font-inter" style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>{new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <span className="tag-pill text-center" style={{ fontSize: '11px' }}>{p.method}</span>
                    <span className="text-right font-lora font-semibold" style={{ fontSize: '14px', color: 'var(--brand-gold)' }}>{formatCurrency(p.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'weekly' && (
          <PaymentListView payments={filteredWeekly} total={weeklyTotal} title={`Week of ${getWeekRange()}`} searchText={searchText} setSearchText={setSearchText} />
        )}

        {activeTab === 'monthly' && (
          <>
            <div className="mb-4 flex items-center gap-3">
              <input type="month" value={monthFilter} onChange={e => setMonthFilter(e.target.value)} className="soleria-input" style={{ width: 180, fontSize: '13px' }} />
            </div>
            <PaymentListView payments={filteredMonthly} total={monthlyTotal} title={`${new Date(monthFilter + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`} searchText={searchText} setSearchText={setSearchText} showCount />
          </>
        )}
      </div>
    </AppLayout>
  );
}

function PaymentListView({ payments, total, title, searchText, setSearchText, showCount }: {
  payments: any[]; total: number; title: string; searchText: string; setSearchText: (s: string) => void; showCount?: boolean;
}) {
  return (
    <>
      <div className="mb-4" style={{ maxWidth: 280 }}>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--secondary-text)' }} />
          <input type="text" value={searchText} onChange={e => setSearchText(e.target.value)} placeholder="Search..." className="soleria-input pl-9" style={{ fontSize: '13px' }} />
        </div>
      </div>
      <div className="card-white">
        <div className="px-6 py-3" style={{ borderBottom: '1px solid var(--border-table)' }}>
          <h4 className="font-lora font-semibold" style={{ fontSize: '16px', color: 'var(--dark-heading)' }}>{title}</h4>
        </div>
        <div className="grid gap-4 px-6 py-2.5 soleria-table-header" style={{ gridTemplateColumns: '1fr 160px 130px 110px 120px', background: 'var(--app-bg)' }}>
          <span>Client</span>
          <span>Phone</span>
          <span>Date</span>
          <span>Method</span>
          <span className="text-right">Amount</span>
        </div>
        {payments.map(p => (
          <div key={p.id} className="grid gap-4 px-6 py-2.5 soleria-table-row items-center" style={{ gridTemplateColumns: '1fr 160px 130px 110px 120px' }}>
            <span className="font-inter font-medium" style={{ fontSize: '13px', color: 'var(--primary-text)' }}>{p.clientName}</span>
            <span className="font-inter" style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>{p.clientPhone}</span>
            <span className="font-inter" style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>{new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            <span className="tag-pill text-center" style={{ fontSize: '11px' }}>{p.method}</span>
            <span className="text-right font-lora font-semibold" style={{ fontSize: '14px', color: 'var(--brand-gold)' }}>{formatCurrency(p.amount)}</span>
          </div>
        ))}
        {payments.length === 0 && (
          <div className="px-6 py-8 text-center font-inter" style={{ color: 'var(--muted-text)' }}>No payments found.</div>
        )}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: '2px solid var(--border-section)' }}>
          <span className="font-inter" style={{ fontSize: '13px', color: 'var(--secondary-text)' }}>
            {showCount ? `${payments.length} payments` : 'Total Collected'}
          </span>
          <span className="font-lora font-semibold" style={{ fontSize: '26px', color: 'var(--brand-gold)' }}>{formatCurrency(total)}</span>
        </div>
      </div>
    </>
  );
}
