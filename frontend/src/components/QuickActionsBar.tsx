import React from 'react';
import { Eye, Mail, PhoneCall, PlusCircle, RefreshCw, UsersRound } from 'lucide-react';

interface QuickActionsBarProps {
  onAddCandidate: () => void;
  onStartOutreach: () => void;
  onStartOutreachAll: () => void;
  onSendEmails?: () => void;
  onViewResults?: () => void;
  onDownloadCandidates?: () => void;
  onDownloadCalls?: () => void;
}

const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
  onAddCandidate,
  onStartOutreach,
  onStartOutreachAll,
  onSendEmails,
  onViewResults,
  onDownloadCandidates,
  onDownloadCalls,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-500">
            Quick Actions
          </p>
          <h2 className="mt-2 text-lg font-semibold text-slate-950">
            Move faster across your hiring funnel.
          </h2>
        </div>

        <div className="flex flex-wrap justify-start gap-3">
          <button
            type="button"
            onClick={onAddCandidate}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 active:scale-95"
          >
            <PlusCircle className="h-4 w-4" />
            Add Candidate
          </button>

          <button
            type="button"
            onClick={onStartOutreach}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-95"
            title="Call only candidates with AI score >= 70"
          >
            <PhoneCall className="h-4 w-4" />
            Call Shortlisted
          </button>

          <button
            type="button"
            onClick={onStartOutreachAll}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-95"
            title="Call all candidates in the pipeline"
          >
            <UsersRound className="h-4 w-4" />
            Call All
          </button>

          <button
            type="button"
            onClick={onViewResults}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-95"
          >
            <Eye className="h-4 w-4" />
            View Results
          </button>
          
          <button
            type="button"
            onClick={onSendEmails}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-95"
          >
            <Mail className="h-4 w-4" />
            Send Emails
          </button>
          
          {onDownloadCandidates && (
            <button
              type="button"
              onClick={onDownloadCandidates}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-95"
            >
              Download Candidates
            </button>
          )}

          {onDownloadCalls && (
            <button
              type="button"
              onClick={onDownloadCalls}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-95"
            >
              Download Calls
            </button>
          )}

        </div>
      </div>
    </div>
  );
};

export default QuickActionsBar;
