import React from 'react';
import { Calendar } from 'lucide-react';

interface DashboardHeaderProps {
  selectedDate?: string;
  onDateChange?: (date: string) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ selectedDate, onDateChange }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-5 py-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-500">
            Overview
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">
            Hiring Dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            A concise view of candidate flow, progress, and next steps.
          </p>
        </div>
        {onDateChange && (
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
            <Calendar className="h-4 w-4 text-slate-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="bg-transparent text-sm font-medium text-slate-700 outline-none focus:ring-0 border-none p-0 cursor-pointer"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;
