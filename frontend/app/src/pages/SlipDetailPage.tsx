import { useApp, formatCurrency } from '@/context/AppContext';
import AppLayout from '@/components/AppLayout';
import { Printer, ArrowLeft, Pencil, Trash2 } from 'lucide-react';

export default function SlipDetailPage() {
  const { state, dispatch } = useApp();

  const client = state.clients.find(item => item.id === state.selectedClientId);
  const slip = client?.slips.find(item => item.id === state.selectedSlipId);

  function navigate(page: string) {
    dispatch({ type: 'NAVIGATE', page });
  }

  function handlePrint() {
    window.print();
  }

  if (!slip || !client) return null;

  return (
    <AppLayout
      pageTitle={`Invoice ${slip.no}`}
      headerAction={
        <div className="flex items-center gap-2">
          <button onClick={handlePrint} className="btn-gold flex items-center gap-2">
            <Printer size={16} />
            Print
          </button>
        </div>
      }
    >
      <div style={{ maxWidth: 500, margin: '0 auto' }}>
        {/* Action bar */}
        <div className="flex items-center gap-2 mb-4" data-no-print>
          <button onClick={() => navigate('client-detail')} className="btn-outline flex items-center gap-1 text-xs">
            <ArrowLeft size={14} /> Back
          </button>
          <button className="btn-outline flex items-center gap-1 text-xs">
            <Pencil size={14} /> Edit
          </button>
          <button className="btn-danger flex items-center gap-1 text-xs">
            <Trash2 size={14} /> Delete
          </button>
        </div>

        {/* Invoice Card */}
        <div className="card-white" style={{ padding: 40 }}>
          {/* Header */}
          <div className="flex justify-between items-start" style={{ borderBottom: '2px solid var(--border-section)', paddingBottom: 16 }}>
            <div>
              <h2 className="font-lora font-semibold" style={{ fontSize: '24px', color: 'var(--dark-heading)' }}>
                STARMANS
              </h2>
              <p
                className="font-inter uppercase tracking-wider mt-0.5"
                style={{ fontSize: '11px', color: 'var(--brand-gold)', letterSpacing: '1.5px' }}
              >
                Sole House
              </p>
              <p className="font-inter mt-2" style={{ fontSize: '12px', color: 'var(--secondary-text)', lineHeight: 1.6 }}>
                Main Bazaar, Sialkot Road<br />
                Gujranwala, Pakistan
              </p>
            </div>
            <div className="text-right">
              <div className="font-inter" style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>
                <span className="font-semibold" style={{ color: 'var(--dark-heading)' }}>Slip No:</span> {slip.no}
              </div>
              <div className="font-inter mt-1" style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>
                <span className="font-semibold" style={{ color: 'var(--dark-heading)' }}>Date:</span> {new Date(`${slip.date}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              <div className="font-inter mt-1" style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>
                <span className="font-semibold" style={{ color: 'var(--dark-heading)' }}>Time:</span> {slip.time}
              </div>
            </div>
          </div>

          {/* Billed To */}
          <div className="mt-6">
            <span
              className="font-inter uppercase tracking-wider"
              style={{ fontSize: '11px', color: 'var(--secondary-text)', letterSpacing: '0.6px' }}
            >
              Billed To
            </span>
            <p className="font-inter font-semibold mt-1" style={{ fontSize: '15px', color: 'var(--dark-heading)' }}>
              {client.name}
            </p>
            <p className="font-inter" style={{ fontSize: '13px', color: 'var(--secondary-text)' }}>
              {client.phone}
            </p>
          </div>

          {/* Items Table */}
          <div className="mt-6">
            <div
              className="grid gap-4 py-3 soleria-table-header"
              style={{ gridTemplateColumns: '1fr 60px 100px 110px', borderBottom: '1px solid var(--border-table)' }}
            >
              <span>Article</span>
              <span className="text-center">Qty</span>
              <span className="text-right">Unit Price</span>
              <span className="text-right">Amount</span>
            </div>

            {slip.items.map((item, idx) => (
              <div key={idx}>
                <div
                  className="grid gap-4 py-3 items-start"
                  style={{ gridTemplateColumns: '1fr 60px 100px 110px' }}
                >
                  <div>
                    <span className="font-inter font-medium" style={{ fontSize: '14px', color: 'var(--primary-text)' }}>
                      {item.name}
                    </span>
                    {(item.size || item.color) && (
                      <p className="font-inter" style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>
                        {item.size} {item.color && `/ ${item.color}`}
                      </p>
                    )}
                    {item.desc && (
                      <p className="font-inter italic" style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>
                        {item.desc}
                      </p>
                    )}
                  </div>
                  <span className="text-center font-inter" style={{ fontSize: '14px', color: 'var(--primary-text)' }}>
                    {item.qty}
                  </span>
                  <span className="text-right font-inter" style={{ fontSize: '14px', color: 'var(--primary-text)' }}>
                    {formatCurrency(item.price)}
                  </span>
                  <span className="text-right font-inter font-medium" style={{ fontSize: '14px', color: 'var(--primary-text)' }}>
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>
                {(item.discountType && (item.discountAmount > 0 || item.discountPct > 0)) && (
                  <div className="flex justify-end pb-2">
                    <span style={{ fontSize: '12px', color: 'var(--error)' }}>
                      Discount ({item.discountType === '%'
                        ? `${item.discountPct}%`
                        : `${formatCurrency(item.discountAmount)} / ${item.subtotal > 0 ? ((item.discountAmount / item.subtotal) * 100).toFixed(1).replace(/\.0$/, '') : '0'}%`})
                      : -{formatCurrency(item.subtotal - item.amount)}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Grand Total */}
          <div className="mt-6 pt-4 text-right" style={{ borderTop: '2px solid var(--border-section)' }}>
            <span
              className="font-inter uppercase tracking-wider"
              style={{ fontSize: '11px', color: 'var(--secondary-text)', letterSpacing: '0.6px' }}
            >
              Grand Total
            </span>
            <p className="font-lora font-semibold" style={{ fontSize: '30px', color: 'var(--brand-gold)' }}>
              {formatCurrency(slip.total)}
            </p>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 text-center" style={{ borderTop: '1px dashed var(--border-color)' }}>
            <p className="font-inter" style={{ fontSize: '12px', color: 'var(--muted-text)' }}>
              Thank you for your business
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
