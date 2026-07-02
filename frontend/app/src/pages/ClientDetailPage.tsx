import { useApp, formatCurrency, getPairsSold } from '@/context/AppContext';
import AppLayout from '@/components/AppLayout';
import { ArrowLeft, Printer, Pencil, Trash2 } from 'lucide-react';

export default function ClientDetailPage() {
  const { state, dispatch } = useApp();
  const client = state.clients.find(item => item.id === state.selectedClientId);

  const filteredSlips = client?.slips || [];

  function navigate(page: string) {
    dispatch({ type: 'NAVIGATE', page });
  }

  function openSlip(slipId: string) {
    dispatch({ type: 'SELECT_SLIP', slipId });
    navigate('slip-detail');
  }

  function handleDeleteSlip(slipId: string) {
    if (!client) return;
    if (window.confirm('Delete this slip? Stock will be restored.')) {
      dispatch({ type: 'DELETE_SLIP', clientId: client.id, slipId });
    }
  }

  if (!client) return null;

  return (
    <AppLayout
      pageTitle={client.name}
      headerAction={
        <button onClick={() => navigate('slips')} className="btn-outline flex items-center gap-2">
          <ArrowLeft size={16} />
          All Clients
        </button>
      }
    >
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        {/* Client info */}
        <div className="mb-6">
          <h2 className="font-lora font-semibold" style={{ fontSize: '26px', color: 'var(--dark-heading)' }}>
            {client.name}
          </h2>
          <p className="font-inter mt-1" style={{ fontSize: '14px', color: 'var(--secondary-text)' }}>
            {client.phone} &middot; {client.slips.length} slips
          </p>
        </div>

        {/* Slip list */}
        <div className="card-white">
          {filteredSlips.map(slip => (
            <div
              key={slip.id}
              className="flex items-center justify-between px-6 py-4 soleria-table-row"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-inter font-semibold" style={{ fontSize: '14.5px', color: 'var(--dark-heading)' }}>
                    {slip.no}
                  </span>
                  <span className="font-inter" style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>
                    {new Date(slip.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <div className="mt-1 font-inter" style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>
                  {slip.items.length} item{slip.items.length !== 1 ? 's' : ''} &middot; {getPairsSold(slip)} pairs
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-lora font-semibold" style={{ fontSize: '16px', color: 'var(--brand-gold)' }}>
                  {formatCurrency(slip.total)}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openSlip(slip.id)}
                    className="p-1.5 rounded-md transition-colors hover:bg-gray-100"
                    style={{ color: 'var(--secondary-text)' }}
                    title="Open"
                  >
                    <Printer size={14} />
                  </button>
                  <button
                    className="p-1.5 rounded-md transition-colors hover:bg-gray-100"
                    style={{ color: 'var(--secondary-text)' }}
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteSlip(slip.id)}
                    className="p-1.5 rounded-md transition-colors hover:bg-red-50"
                    style={{ color: 'var(--error)' }}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredSlips.length === 0 && (
            <div className="px-6 py-8 text-center font-inter" style={{ color: 'var(--muted-text)' }}>
              No slips found.
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
