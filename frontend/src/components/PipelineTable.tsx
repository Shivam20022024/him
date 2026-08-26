import React, { useState, useMemo } from 'react';
import { Search, PhoneCall, Trash2, Clock, CheckCircle2, ChevronDown, ChevronRight, FileText, Briefcase } from 'lucide-react';
import { Candidate, GroupedCandidate } from '../types';
import { useNavigate } from 'react-router-dom';

interface PipelineTableProps {
  groupedCandidates: GroupedCandidate[];
  onCallCandidate?: (candidate: Candidate) => void;
  onDeleteCandidate?: (candidate: Candidate) => void;
  onDeleteSelected?: (candidates: Candidate[]) => void;
  onViewCandidate?: (group: GroupedCandidate) => void;
  isLoading?: boolean;
}

const PipelineTable: React.FC<PipelineTableProps> = ({
  groupedCandidates,
  onCallCandidate,
  onDeleteCandidate,
  onDeleteSelected,
  onViewCandidate,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(new Set());

  const toggleRow = (id: string, e: React.MouseEvent) => {
    // Prevent toggling when clicking buttons inside the row
    if ((e.target as HTMLElement).closest('button')) return;
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  const filteredCandidates = useMemo(() => {
    return groupedCandidates.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone?.includes(searchQuery)
    );
  }, [groupedCandidates, searchQuery]);

  const toggleSelectAll = () => {
    if (selectedGroupIds.size === filteredCandidates.length && filteredCandidates.length > 0) {
      setSelectedGroupIds(new Set());
    } else {
      setSelectedGroupIds(new Set(filteredCandidates.map(g => g.id)));
    }
  };

  const toggleSelectGroup = (groupId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const next = new Set(selectedGroupIds);
    if (next.has(groupId)) {
      next.delete(groupId);
    } else {
      next.add(groupId);
    }
    setSelectedGroupIds(next);
  };
  
  const handleDeleteSelected = () => {
    if (!onDeleteSelected) return;
    const candidatesToDelete: Candidate[] = [];
    filteredCandidates.forEach(g => {
      if (selectedGroupIds.has(g.id)) {
        candidatesToDelete.push(...g.applications);
      }
    });
    onDeleteSelected(candidatesToDelete);
    setSelectedGroupIds(new Set());
  };

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
      
    if (normalizedStatus === 'not_interested' || normalizedInterest === 'not_interested' || normalizedStatus === 'rejected')
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">
          <div className="h-1.5 w-1.5 rounded-full bg-red-600" />
          {normalizedStatus === 'rejected' ? 'Rejected' : 'Not Interested'}
        </span>
      );
      
    if (normalizedStatus === 'not_assessed' || (!normalizedStatus && !normalizedInterest))
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          Not Assessed
        </span>
      );

    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800 capitalize">
        <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
        {normalizedStatus.replace('_', ' ') || 'New'}
      </span>
    );
  };

  const getAiScore = (candidate: Candidate) => {
    if (candidate.status === 'not_assessed' || (!candidate.resume_score && !candidate.screening_score)) {
      return <span className="text-slate-400 text-xs font-semibold">—</span>;
    }
    const score = candidate.screening_score || candidate.resume_score || 0;
    const color = score >= 80 ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 
                 score >= 60 ? 'text-amber-600 bg-amber-50 border-amber-200' : 
                 'text-red-600 bg-red-50 border-red-200';
    return (
      <span className={`inline-flex items-center justify-center h-7 px-2 rounded font-black text-sm border ${color}`}>
        {score}%
      </span>
    );
  };

  return (
    <div className="flex flex-col">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2">
        <div className="flex items-center gap-4 w-full sm:w-auto flex-wrap">
          <div className="relative w-full sm:w-80 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search candidates by name, email..."
              className="w-full rounded-xl border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {selectedGroupIds.size > 0 && onDeleteSelected && (
            <button
              onClick={handleDeleteSelected}
              className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 border border-red-100 hover:bg-red-100 hover:text-red-700 transition-colors shrink-0 shadow-sm"
            >
              <Trash2 size={16} /> Delete Selected ({selectedGroupIds.size})
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto min-w-0 rounded-[20px] border border-slate-200 bg-white">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="w-12 px-4 py-4 text-center">
                <input 
                  type="checkbox" 
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  checked={filteredCandidates.length > 0 && selectedGroupIds.size === filteredCandidates.length}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="w-8 px-2 py-4"></th>
              <th className="px-6 py-4 font-bold">Candidate</th>
              <th className="px-6 py-4 font-bold">Applications</th>
              <th className="px-6 py-4 font-bold">Match Score</th>
              <th className="px-6 py-4 font-bold">Latest Status</th>
              <th className="px-6 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-medium">
                  <div className="flex justify-center items-center gap-3">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
                    Loading candidates...
                  </div>
                </td>
              </tr>
            ) : filteredCandidates.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-medium">
                  No candidates found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredCandidates.map((group) => {
                const isExpanded = expandedRowId === group.id;
                const latestApp = group.applications[0]; // Assuming sorted by latest

                return (
                  <React.Fragment key={group.id}>
                    <tr 
                      className={`group transition-colors hover:bg-slate-50 cursor-pointer ${isExpanded ? 'bg-slate-50/50' : ''}`}
                      onClick={(e) => toggleRow(group.id, e)}
                    >
                      <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          checked={selectedGroupIds.has(group.id)}
                          onChange={(e) => toggleSelectGroup(group.id, e)}
                        />
                      </td>
                      <td className="px-2 py-4 text-slate-400">
                        {group.applications.length > 1 ? (
                          isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />
                        ) : null}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 font-bold shadow-inner">
                            {group.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{group.name}</div>
                            <div className="text-xs text-slate-500">{group.email || group.phone || 'No contact info'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {group.applications.length === 1 ? (
                          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 text-xs font-semibold text-slate-700">
                            <Briefcase size={12} className="text-slate-500" />
                            {latestApp.role || 'General'}
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-blue-50 text-xs font-semibold text-blue-700 border border-blue-100">
                            {group.applications.length} Applications
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {getAiScore(latestApp)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(latestApp.status, latestApp.interest)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <button
                             onClick={() => onViewCandidate?.(group)}
                             className="rounded-lg px-3 py-1.5 text-xs font-bold text-white bg-slate-900 transition hover:bg-slate-800"
                           >
                             View Profile
                           </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* EXPANDED APPLICATIONS */}
                    {isExpanded && group.applications.length > 1 && (
                      <tr>
                        <td colSpan={7} className="p-0 border-b border-slate-200 bg-slate-50/50">
                          <div className="px-14 py-4">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Applications</h4>
                            <div className="space-y-2">
                              {group.applications.map((app, idx) => (
                                <div key={app.id || idx} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                  <div className="flex items-center gap-4">
                                    <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                      <Briefcase size={14} />
                                    </div>
                                    <div>
                                      <div className="font-bold text-slate-900 text-sm">{app.role || 'General Application'}</div>
                                      <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
                                        <Clock size={10} /> Applied: {new Date(app.created_at || Date.now()).toLocaleDateString()}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-6">
                                    <div className="flex flex-col items-end">
                                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">AI Match</span>
                                      {getAiScore(app)}
                                    </div>
                                    <div className="flex flex-col items-end">
                                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Status</span>
                                      {getStatusBadge(app.status, app.interest)}
                                    </div>
                                    <button
                                      onClick={() => onViewCandidate?.({ ...group, applications: [app] })}
                                      className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 border border-slate-200 shadow-sm bg-white"
                                      title="View Application"
                                    >
                                      <ChevronRight size={16} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PipelineTable;
