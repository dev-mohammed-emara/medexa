export const statusConfig: Record<string, { bg: string, border: string, text: string, iconColor: string, dotColor: string }> = {
  'pending': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', iconColor: 'text-amber-700', dotColor: 'bg-amber-400' },
  'completed': { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', iconColor: 'text-emerald-700', dotColor: 'bg-emerald-400' },
  'canceled': { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', iconColor: 'text-rose-700', dotColor: 'bg-rose-400' }
};
