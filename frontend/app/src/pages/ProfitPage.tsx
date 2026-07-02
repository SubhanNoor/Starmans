import { useState, useMemo } from 'react';
import { useApp, formatCurrency, isDateInMonth, getMonthName } from '@/context/AppContext';
import AppLayout from '@/components/AppLayout';
import { Printer } from 'lucide-react';

type TabType = 'monthly' | 'annual' | 'analytics';

const EXPENSE_COLORS = {
  operating: '#B08D57',
  bills: '#4A7FC1',
  chemical: '#3F7D58'
};

export default function ProfitPage() {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [analyticsMonth, setAnalyticsMonth] = useState(new Date().getMonth());
  const [analyticsYear, setAnalyticsYear] = useState(new Date().getFullYear());

  const currentMonth = new Date().getMonth();

  // Calculate profit data
  const grossSales = useMemo(() => {
    return state.clients.flatMap(c => c.slips)
      .filter(s => isDateInMonth(s.date, selectedMonth, selectedYear))
      .reduce((sum, s) => sum + s.total, 0);
  }, [state, selectedMonth, selectedYear]);

  const operatingExpenses = useMemo(() => {
    return state.expenses
      .filter(e => isDateInMonth(e.date, selectedMonth, selectedYear))
      .reduce((sum, e) => sum + e.rows.reduce((rs, r) => rs + r.price, 0), 0);
  }, [state, selectedMonth, selectedYear]);

  const utilityBills = useMemo(() => {
    return state.bills
      .filter(b => isDateInMonth(b.date, selectedMonth, selectedYear))
      .reduce((sum, b) => sum + b.entries.reduce((es, e) => es + e.amount, 0), 0);
  }, [state, selectedMonth, selectedYear]);

  const chemicalCosts = useMemo(() => {
    return state.chemPurchases
      .filter(c => isDateInMonth(c.date, selectedMonth, selectedYear))
      .reduce((sum, c) => sum + c.cost, 0);
  }, [state, selectedMonth, selectedYear]);

  const totalExpenses = operatingExpenses + utilityBills + chemicalCosts;
  const netProfit = grossSales - totalExpenses;

  // Annual data
  const annualData = useMemo(() => {
    const months = [];
    for (let m = 0; m <= currentMonth; m++) {
      const sales = state.clients.flatMap(c => c.slips)
        .filter(s => isDateInMonth(s.date, m, selectedYear))
        .reduce((sum, s) => sum + s.total, 0);
      const opExp = state.expenses
        .filter(e => isDateInMonth(e.date, m, selectedYear))
        .reduce((sum, e) => sum + e.rows.reduce((rs, r) => rs + r.price, 0), 0);
      const utilBills = state.bills
        .filter(b => isDateInMonth(b.date, m, selectedYear))
        .reduce((sum, b) => sum + b.entries.reduce((es, e) => es + e.amount, 0), 0);
      const chemCost = state.chemPurchases
        .filter(c => isDateInMonth(c.date, m, selectedYear))
        .reduce((sum, c) => sum + c.cost, 0);
      const totalExp = opExp + utilBills + chemCost;
      months.push({ month: m, sales, expenses: totalExp, net: sales - totalExp });
    }
    return months;
  }, [state, selectedYear, currentMonth]);

  const yearTotalSales = annualData.reduce((s, m) => s + m.sales, 0);
  const yearTotalExpenses = annualData.reduce((s, m) => s + m.expenses, 0);
  const yearNetProfit = yearTotalSales - yearTotalExpenses;

  // Analytics data
  const analyticsMonthly = useMemo(() => {
    const opExp = state.expenses.filter(e => isDateInMonth(e.date, analyticsMonth, analyticsYear))
      .reduce((s, e) => s + e.rows.reduce((rs, r) => rs + r.price, 0), 0);
    const utilBills = state.bills.filter(b => isDateInMonth(b.date, analyticsMonth, analyticsYear))
      .reduce((s, b) => s + b.entries.reduce((es, e) => es + e.amount, 0), 0);
    const chemCost = state.chemPurchases.filter(c => isDateInMonth(c.date, analyticsMonth, analyticsYear))
      .reduce((s, c) => s + c.cost, 0);
    return { operating: opExp, bills: utilBills, chemical: chemCost };
  }, [state, analyticsMonth, analyticsYear]);

  const analyticsAnnual = useMemo(() => {
    const opExp = state.expenses.filter(e => new Date(e.date).getFullYear() === analyticsYear)
      .reduce((s, e) => s + e.rows.reduce((rs, r) => rs + r.price, 0), 0);
    const utilBills = state.bills.filter(b => new Date(b.date).getFullYear() === analyticsYear)
      .reduce((s, b) => s + b.entries.reduce((es, e) => es + e.amount, 0), 0);
    const chemCost = state.chemPurchases.filter(c => new Date(c.date).getFullYear() === analyticsYear)
      .reduce((s, c) => s + c.cost, 0);
    return { operating: opExp, bills: utilBills, chemical: chemCost };
  }, [state, analyticsYear]);

  function renderPieSVG(data: { operating: number; bills: number; chemical: number }, size: number = 200) {
    const total = data.operating + data.bills + data.chemical;
    if (total === 0) return <div className="text-center py-8 font-inter" style={{ color: 'var(--muted-text)' }}>No data</div>;

    const radius = size / 2 - 10;
    const cx = size / 2;
    const cy = size / 2;

    const slices = [
      { value: data.operating, color: EXPENSE_COLORS.operating, label: 'Operating' },
      { value: data.bills, color: EXPENSE_COLORS.bills, label: 'Bills' },
      { value: data.chemical, color: EXPENSE_COLORS.chemical, label: 'Chemical' },
    ];

    let currentAngle = -Math.PI / 2;
    const paths = slices.map((slice, i) => {
      const angle = (slice.value / total) * Math.PI * 2;
      const x1 = cx + radius * Math.cos(currentAngle);
      const y1 = cy + radius * Math.sin(currentAngle);
      const x2 = cx + radius * Math.cos(currentAngle + angle);
      const y2 = cy + radius * Math.sin(currentAngle + angle);
      const largeArc = angle > Math.PI ? 1 : 0;
      const d = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      currentAngle += angle;
      return <path key={i} d={d} fill={slice.color} stroke="white" strokeWidth={2} />;
    });

    return (
      <div className="flex flex-col items-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>{paths}</svg>
        <div className="flex flex-wrap gap-3 mt-3 justify-center">
          {slices.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="rounded-full" style={{ width: 10, height: 10, background: s.color }} />
              <span className="font-inter" style={{ fontSize: '11px', color: 'var(--secondary-text)' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <AppLayout
      pageTitle="Profit"
      headerAction={
        activeTab !== 'analytics' ? (
          <button onClick={() => window.print()} className="btn-navy flex items-center gap-2">
            <Printer size={16} />
            Print Report
          </button>
        ) : undefined
      }
    >
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div className="tab-pill-container mb-6">
          <button onClick={() => setActiveTab('monthly')} className={activeTab === 'monthly' ? 'tab-pill-active' : 'tab-pill-inactive'}>Monthly</button>
          <button onClick={() => setActiveTab('annual')} className={activeTab === 'annual' ? 'tab-pill-active' : 'tab-pill-inactive'}>Annual</button>
          <button onClick={() => setActiveTab('analytics')} className={activeTab === 'analytics' ? 'tab-pill-active' : 'tab-pill-inactive'}>Analytics</button>
        </div>

        {activeTab === 'monthly' && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setSelectedMonth(m => Math.max(0, m - 1))} className="btn-outline text-xs px-2 py-1">&larr;</button>
              <span className="font-lora font-semibold" style={{ fontSize: '16px', color: 'var(--dark-heading)' }}>
                {getMonthName(selectedMonth)} {selectedYear}
              </span>
              <button onClick={() => setSelectedMonth(m => Math.min(11, m + 1))} className="btn-outline text-xs px-2 py-1">&rarr;</button>
            </div>

            <div className="card-white p-6 space-y-4">
              <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--border-table)' }}>
                <span className="font-inter" style={{ fontSize: '14px', color: 'var(--primary-text)' }}>Gross Sales</span>
                <span className="font-lora font-semibold" style={{ fontSize: '18px', color: 'var(--dark-heading)' }}>{formatCurrency(grossSales)}</span>
              </div>
              <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--border-table)' }}>
                <span className="font-inter" style={{ fontSize: '14px', color: 'var(--secondary-text)' }}>Operating Expenses</span>
                <span className="font-inter" style={{ fontSize: '14px', color: 'var(--error)' }}>-{formatCurrency(operatingExpenses)}</span>
              </div>
              <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--border-table)' }}>
                <span className="font-inter" style={{ fontSize: '14px', color: 'var(--secondary-text)' }}>Utility Bills</span>
                <span className="font-inter" style={{ fontSize: '14px', color: 'var(--error)' }}>-{formatCurrency(utilityBills)}</span>
              </div>
              <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--border-table)' }}>
                <span className="font-inter" style={{ fontSize: '14px', color: 'var(--secondary-text)' }}>Chemical Costs</span>
                <span className="font-inter" style={{ fontSize: '14px', color: 'var(--error)' }}>-{formatCurrency(chemicalCosts)}</span>
              </div>
              <div className="flex justify-between items-center py-3" style={{ borderTop: '2px solid var(--border-section)' }}>
                <span className="font-inter font-semibold" style={{ fontSize: '14px', color: 'var(--dark-heading)' }}>Total Expenses</span>
                <span className="font-lora font-semibold" style={{ fontSize: '18px', color: 'var(--error)' }}>{formatCurrency(totalExpenses)}</span>
              </div>
              <div className="flex justify-between items-center py-3" style={{ borderTop: '2px solid var(--border-section)' }}>
                <span className="font-inter font-semibold" style={{ fontSize: '16px', color: 'var(--dark-heading)' }}>Net Profit</span>
                <span className="font-lora font-semibold" style={{ fontSize: '32px', color: netProfit >= 0 ? 'var(--success)' : 'var(--error)' }}>
                  {formatCurrency(netProfit)}
                </span>
              </div>
            </div>
          </>
        )}

        {activeTab === 'annual' && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <input type="number" value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))} className="soleria-input" style={{ width: 100, fontSize: '14px' }} />
            </div>

            <div className="card-white">
              <div className="grid gap-4 px-6 py-3 soleria-table-header" style={{ gridTemplateColumns: '130px 1fr 1fr 1fr', background: 'var(--app-bg)' }}>
                <span>Month</span>
                <span className="text-right">Gross Sales</span>
                <span className="text-right">Expenses</span>
                <span className="text-right">Net Profit</span>
              </div>
              {annualData.map(d => (
                <div key={d.month} className="grid gap-4 px-6 py-3 soleria-table-row items-center" style={{ gridTemplateColumns: '130px 1fr 1fr 1fr' }}>
                  <span className="font-inter font-medium" style={{ fontSize: '14px', color: 'var(--primary-text)' }}>{getMonthName(d.month)}</span>
                  <span className="text-right font-inter" style={{ fontSize: '13px', color: 'var(--primary-text)' }}>{formatCurrency(d.sales)}</span>
                  <span className="text-right font-inter" style={{ fontSize: '13px', color: 'var(--error)' }}>{formatCurrency(d.expenses)}</span>
                  <span className="text-right font-lora font-semibold" style={{ fontSize: '14px', color: d.net >= 0 ? 'var(--success)' : 'var(--error)' }}>{formatCurrency(d.net)}</span>
                </div>
              ))}
              <div className="grid gap-4 px-6 py-4 items-center" style={{ gridTemplateColumns: '130px 1fr 1fr 1fr', borderTop: '2px solid var(--border-section)' }}>
                <span className="font-inter font-semibold" style={{ fontSize: '14px', color: 'var(--dark-heading)' }}>Year Total</span>
                <span className="text-right font-lora font-semibold" style={{ fontSize: '14px', color: 'var(--brand-gold)' }}>{formatCurrency(yearTotalSales)}</span>
                <span className="text-right font-lora font-semibold" style={{ fontSize: '14px', color: 'var(--error)' }}>{formatCurrency(yearTotalExpenses)}</span>
                <span className="text-right font-lora font-semibold" style={{ fontSize: '16px', color: yearNetProfit >= 0 ? 'var(--success)' : 'var(--error)' }}>{formatCurrency(yearNetProfit)}</span>
              </div>
            </div>
          </>
        )}

        {activeTab === 'analytics' && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <select value={analyticsYear} onChange={e => setAnalyticsYear(parseInt(e.target.value))} className="soleria-input" style={{ width: 100, fontSize: '13px' }}>
                {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <select value={analyticsMonth} onChange={e => setAnalyticsMonth(parseInt(e.target.value))} className="soleria-input" style={{ width: 140, fontSize: '13px' }}>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i}>{getMonthName(i)}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="card-white p-6">
                <h4 className="font-lora font-semibold text-center mb-4" style={{ fontSize: '16px', color: 'var(--dark-heading)' }}>
                  Monthly Breakdown — {getMonthName(analyticsMonth)} {analyticsYear}
                </h4>
                {renderPieSVG(analyticsMonthly)}
                <div className="text-center mt-4">
                  <span className="font-inter" style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>Net Profit/Loss</span>
                  <p className="font-lora font-semibold" style={{ fontSize: '20px', color: (Object.values(analyticsMonthly).reduce((s: number, v: number) => s + v, 0)) >= 0 ? 'var(--success)' : 'var(--error)' }}>
                    {formatCurrency(state.clients.flatMap(c => c.slips).filter(s => isDateInMonth(s.date, analyticsMonth, analyticsYear)).reduce((s, sl) => s + sl.total, 0) - Object.values(analyticsMonthly).reduce((s: number, v: number) => s + v, 0))}
                  </p>
                </div>
              </div>
              <div className="card-white p-6">
                <h4 className="font-lora font-semibold text-center mb-4" style={{ fontSize: '16px', color: 'var(--dark-heading)' }}>
                  Annual Breakdown — {analyticsYear}
                </h4>
                {renderPieSVG(analyticsAnnual)}
                <div className="text-center mt-4">
                  <span className="font-inter" style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>Net Profit/Loss</span>
                  <p className="font-lora font-semibold" style={{ fontSize: '20px', color: 'var(--success)' }}>
                    {formatCurrency(state.clients.flatMap(c => c.slips).filter(s => new Date(s.date).getFullYear() === analyticsYear).reduce((s, sl) => s + sl.total, 0) - Object.values(analyticsAnnual).reduce((s: number, v: number) => s + v, 0))}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
