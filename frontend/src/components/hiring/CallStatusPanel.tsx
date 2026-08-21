import React from 'react';
import { Loader2, PhoneCall, PhoneForwarded, CheckCheck } from 'lucide-react';

interface CallStatusPanelProps {
  isCalling: boolean;
  queuedCount: number;
  responseCount: number;
  summary: string;
}

const CallStatusPanel: React.FC<CallStatusPanelProps> = ({
  isCalling,
  queuedCount,
  responseCount,
  summary,
}) => {
  const items = [
    {
      label: 'Calling',
      value: isCalling ? 'Calling...' : `${queuedCount} queued`,
      icon: isCalling ? <Loader2 className="h-4 w-4 animate-spin" /> : <PhoneCall className="h-4 w-4" />,
    },
    {
      label: 'Progress',
      value: queuedCount > 0 ? 'Outreach started' : 'Waiting to start',
      icon: <PhoneForwarded className="h-4 w-4" />,
    },
    {
      label: 'Responses',
      value: responseCount > 0 ? 'Response received' : 'Pending',
      icon: <CheckCheck className="h-4 w-4" />,
    },
  ];

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-950">Call Status</h3>
          <p className="mt-1 text-sm text-slate-600">{summary}</p>
        </div>
        <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
          Live Overview
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <span className="text-slate-500">{item.icon}</span>
              {item.label}
            </div>
            <div className="mt-3 text-base font-bold text-slate-950">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CallStatusPanel;
