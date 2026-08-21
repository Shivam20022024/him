import React from 'react';
import { Candidate } from '../types';

interface CandidateTableProps {
  candidates: Candidate[];
}

const statusBadge = (status: string) => {
  const normalized = status === 'shortlisted' ? 'shortlisted' : 'rejected';
  return normalized === 'shortlisted'
    ? 'bg-blue-50 text-blue-700 border border-blue-200'
    : 'bg-slate-100 text-slate-600 border border-slate-200';
};

const interestBadge = (interest?: string) => {
  switch ((interest || 'pending').toLowerCase()) {
    case 'interested':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case 'not_interested':
      return 'bg-rose-50 text-rose-700 border border-rose-200';
    default:
      return 'bg-amber-50 text-amber-700 border border-amber-200';
  }
};

const interestLabel = (interest?: string) => {
  switch ((interest || 'pending').toLowerCase()) {
    case 'interested':
      return 'Interested';
    case 'not_interested':
      return 'Not Interested';
    default:
      return 'Pending';
  }
};

const CandidateTable: React.FC<CandidateTableProps> = ({ candidates }) => {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Name</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Resume Score</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Status</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Interest</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {candidates.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center">
                  <div className="mx-auto max-w-sm">
                    <h4 className="text-base font-semibold text-slate-900">No candidates uploaded yet</h4>
                    <p className="mt-2 text-sm text-slate-500">Upload resumes to populate the candidate pipeline and begin shortlisting.</p>
                  </div>
                </td>
              </tr>
            ) : (
              candidates.map((candidate) => {
                const status = candidate.resume_score >= 70 ? 'shortlisted' : 'rejected';
                return (
                  <tr key={candidate.id} className="hover:bg-slate-50/80">
                    <td className="px-6 py-5">
                      <div>
                        <div className="font-semibold text-slate-950">{candidate.name}</div>
                        <div className="mt-1 text-sm text-slate-500">{candidate.email || '-'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-semibold text-slate-900">{Math.round(candidate.resume_score)}%</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${statusBadge(status)}`}>
                        {status === 'shortlisted' ? 'Shortlisted' : 'Rejected'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${interestBadge(candidate.interest)}`}>
                        {interestLabel(candidate.interest)}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CandidateTable;
