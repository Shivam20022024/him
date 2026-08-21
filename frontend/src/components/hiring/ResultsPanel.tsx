import React from 'react';
import { CheckCircle2, Mail, Phone } from 'lucide-react';
import { Candidate } from '../../types';

interface ResultsPanelProps {
  candidates: Candidate[];
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ candidates }) => {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-950">Final Results</h3>
          <p className="mt-1 text-sm text-slate-600">Interested candidates ready for the next stage of the hiring process.</p>
        </div>
        <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
          {candidates.length} selected
        </div>
      </div>

      {candidates.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
          <div className="mx-auto inline-flex rounded-2xl bg-white p-3 text-slate-400 shadow-sm">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h4 className="mt-4 text-base font-semibold text-slate-900">No interested candidates yet</h4>
          <p className="mt-2 text-sm text-slate-500">Start calling shortlisted candidates to populate the final results section.</p>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {candidates.map((candidate) => (
            <div key={candidate.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-lg font-semibold text-slate-950">{candidate.name}</h4>
                  <p className="mt-1 text-sm text-slate-500">Resume score {Math.round(candidate.resume_score)}%</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                  Interested
                </span>
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span>{candidate.email || 'Email not available'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span>{candidate.phone || 'Phone not available'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResultsPanel;
