import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';
import { DecisionStatus } from '../../types';

interface BadgeProps {
  status: DecisionStatus | string;
  className?: string;
  showIcon?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '', showIcon = true }) => {
  let bg = 'bg-slate-100 text-slate-700 border-slate-200';
  let icon = <HelpCircle className="w-3.5 h-3.5" />;
  let label = status.replace('_', ' ');

  switch (status) {
    case 'POSITIVE_SIGNAL':
    case 'VERIFIED':
    case 'COMPLETED':
      bg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      icon = <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />;
      label = status === 'POSITIVE_SIGNAL' ? 'Observed Positive' : (status === 'VERIFIED' ? 'Verified' : 'Completed');
      break;

    case 'NEGATIVE_SIGNAL':
    case 'REJECTED':
    case 'CRITICAL':
      bg = 'bg-red-50 text-red-800 border-red-200';
      icon = <XCircle className="w-3.5 h-3.5 text-red-600" />;
      label = status === 'NEGATIVE_SIGNAL' ? 'Observed Negative' : (status === 'REJECTED' ? 'Rejected' : 'Critical');
      break;

    case 'NEEDS_VERIFICATION':
    case 'HIGH':
    case 'WARNING':
      bg = 'bg-amber-50 text-amber-800 border-amber-200';
      icon = <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />;
      label = status === 'NEEDS_VERIFICATION' ? 'Needs Verification' : status;
      break;

    case 'INCONCLUSIVE':
    case 'MEDIUM':
    case 'PENDING':
      bg = 'bg-sky-50 text-sky-800 border-sky-200';
      icon = <HelpCircle className="w-3.5 h-3.5 text-sky-600" />;
      label = status === 'INCONCLUSIVE' ? 'Inconclusive' : status;
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${bg} ${className}`}>
      {showIcon && icon}
      <span className="capitalize">{label}</span>
    </span>
  );
};
