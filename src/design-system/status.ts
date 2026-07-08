export const statusToneClasses = {
  pending: 'bg-status-pending-bg text-status-pending-text ring-status-pending-ring',
  confirmed:
    'bg-status-confirmed-bg text-status-confirmed-text ring-status-confirmed-ring',
  preparing:
    'bg-status-preparing-bg text-status-preparing-text ring-status-preparing-ring',
  ready: 'bg-status-ready-bg text-status-ready-text ring-status-ready-ring',
  outForDelivery:
    'bg-status-delivery-bg text-status-delivery-text ring-status-delivery-ring',
  completed:
    'bg-status-completed-bg text-status-completed-text ring-status-completed-ring',
  cancelled:
    'bg-status-cancelled-bg text-status-cancelled-text ring-status-cancelled-ring',
  paid: 'bg-status-paid-bg text-status-paid-text ring-status-paid-ring',
  partiallyPaid: 'bg-status-partial-bg text-status-partial-text ring-status-partial-ring',
  unpaid: 'bg-status-unpaid-bg text-status-unpaid-text ring-status-unpaid-ring',
} as const;

export const feedbackToneClasses = {
  success: 'bg-success-bg text-success-text ring-success-ring border-success-ring',
  warning: 'bg-warning-bg text-warning-text ring-warning-ring border-warning-ring',
  danger: 'bg-danger-bg text-danger-text ring-danger-ring border-danger-ring',
  error: 'bg-danger-bg text-danger-text ring-danger-ring border-danger-ring',
  info: 'bg-info-bg text-info-text ring-info-ring border-info-ring',
  neutral: 'bg-surface text-muted ring-border border-border',
} as const;
