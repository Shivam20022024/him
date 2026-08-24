import React from 'react';
import { Calendar } from 'lucide-react';

import { Job } from '../types';

interface DashboardHeaderProps {
  selectedDate?: string;
  onDateChange?: (date: string) => void;
  currentJob?: Job | null;
  onDeleteJob?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ selectedDate, onDateChange, currentJob, onDeleteJob }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-5 py-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-500">
          Overview • {currentJob ? 'Job Hiring Dashboard' : 'Global Dashboard'}
        </p>
        <div className="flex items-center gap-4 mt-2">
          <h1 className="text-2xl font-semibold text-slate-950">
            {currentJob ? currentJob.title : 'All Candidates (Global)'}
          </h1>
          {currentJob && onDeleteJob && (
            <button 
              onClick={onDeleteJob}
              className="px-3 py-1 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
            >
              Delete Job
            </button>
          )}
        </div>
        <p className="max-w-2xl text-sm text-slate-500 mt-1">
          {currentJob ? `Reviewing pipeline and flow for ${currentJob.title}.` : 'A centralized view of candidate flow across all jobs.'}
        </p>
      </div>
      {onDateChange && (
        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 shrink-0">
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
  );
};

export default DashboardHeader;
