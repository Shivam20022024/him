import React, { useState, useMemo } from 'react';
import { PhoneCall, Search, Trash2 } from 'lucide-react';
import { Candidate } from '../types';

interface PipelineTableProps {
  candidates: Candidate[];
  onCallCandidate?: (candidate: Candidate) => void;
  onDeleteCandidate?: (candidate: Candidate) => void;
  isLoading?: boolean;
}

const PipelineTable: React.FC<PipelineTableProps> = ({
  candidates,
  onCallCandidate,
  onDeleteCandidate,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'date'>('score');

  const filteredAndSorted = useMemo(() => {
    let filtered = candidates.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.sort((a, b) => {
      if (sortBy === 'score') {
        const scoreA = a.screening_score !== undefined ? a.screening_score : a.resume_score;
        const scoreB = b.screening_score !== undefined ? b.screening_score : b.resume_score;
        return scoreB - scoreA;
      }
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'date') {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      }
      return 0;
    });

    return filtered;
  }, [candidates, searchQuery, sortBy]);

  const getStatusBadge = (status?: string, interest?: string) => {
    const normalizedStatus = (status || '').toLowerCase();
    const normalizedInterest = (interest || '').toLowerCase();

    if (normalizedStatus === 'calling' || normalizedStatus === 'ai_call_pending')
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
          Calling
        </span>
      );
      
    if (normalizedStatus === 'callback_required')
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
          <div className="h-1.5 w-1.5 rounded-full bg-amber-600" />
          Callback Required
        </span>
      );

    if (normalizedStatus === 'interested' || normalizedInterest === 'interested')
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
          Interested
        </span>
      );
      
    if (normalizedStatus === 'interview' || normalizedStatus === 'interview_scheduled')
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-800">
          <div className="h-1.5 w-1.5 rounded-full bg-purple-600" />
          Interview
        </span>
      );
      
    if (normalizedStatus === 'selected')
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-800">
          <div className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
          Selected
        </span>
      );
      
    if (normalizedStatus === 'hired')
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-800">
          <div className="h-1.5 w-1.5 rounded-full bg-teal-600" />
          Hired
        </span>
      );

    if (normalizedStatus === 'not_interested' || normalizedInterest === 'not_interested')
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">
          <div className="h-1.5 w-1.5 rounded-full bg-red-600" />
          Not interested
        </span>
      );

    if (normalizedStatus === 'completed')
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          Call Completed
        </span>
      );

    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">
        <div className="h-1.5 w-1.5 rounded-full bg-slate-600" />
        New
      </span>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-blue-600 bg-blue-50';
    return 'text-slate-600 bg-slate-50';
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-12 rounded-lg bg-slate-100 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Search and Sort Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-400/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'score' | 'name' | 'date')}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 cursor-pointer"
          >
            <option value="score">Sort by Score</option>
            <option value="name">Sort by Name</option>
            <option value="date">Sort by Date</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {filteredAndSorted.length === 0 ? (
        <div className="rounded-[24px] border border-slate-100 bg-white px-6 py-8 text-center shadow-sm">
          <div className="mx-auto mb-4 inline-flex rounded-full bg-slate-50 p-3 text-slate-400">
            <Search className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-slate-600">No candidates found</p>
          <p className="mt-1 text-xs text-slate-500">
            Try adjusting your search criteria
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Score
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredAndSorted.map((candidate) => {
                  const s = (candidate.status || '').toLowerCase();
                  const blocklist = ['calling', 'ai_call_pending', 'completed', 'interested', 'not_interested', 'interview', 'interview_scheduled', 'selected', 'hired'];
                  const disabled = blocklist.includes(s) || candidate.interest === 'interested' || candidate.interest === 'not_interested';


                  return (
                    <tr
                      key={candidate.id}
                      className="transition-colors duration-200 hover:bg-slate-50 cursor-pointer"
                    >
                      <td className="px-6 py-5">
                        <div className="font-semibold text-slate-900">
                          {candidate.name}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm text-slate-600">
                          {candidate.email || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold ${
                            (candidate.screening_score ?? candidate.resume_score) != null 
                              ? getScoreColor(candidate.screening_score ?? candidate.resume_score ?? 0)
                              : 'text-slate-500 bg-slate-50'
                          }`}
                          title={candidate.screening_score !== undefined ? "Post-Call AI Score" : "Initial Resume Score"}
                        >
                          {(candidate.screening_score ?? candidate.resume_score) != null
                            ? `${candidate.screening_score ?? candidate.resume_score}%`
                            : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {getStatusBadge(candidate.status, candidate.interest)}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onCallCandidate?.(candidate)}
                            disabled={disabled}
                            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition duration-200 ${
                              disabled
                                ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            <PhoneCall className="h-3.5 w-3.5" />
                            Call
                          </button>
                          
                          {onDeleteCandidate && (
                            <button
                              onClick={() => onDeleteCandidate(candidate)}
                              className="inline-flex items-center justify-center rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                              title="Remove Candidate"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 text-xs text-slate-600">
        <span>
          Showing <span className="font-semibold text-slate-900">{filteredAndSorted.length}</span> of{' '}
          <span className="font-semibold text-slate-900">{candidates.length}</span> candidates
        </span>
      </div>
    </div>
  );
};

export default PipelineTable;
