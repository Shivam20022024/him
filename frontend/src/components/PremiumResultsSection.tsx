import React from 'react';
import { 
  CheckCircle2, 
  Calendar, 
  User, 
  Clock, 
  Mail, 
  MessageSquare, 
  Heart,
  BrainCircuit,
  BarChart3,
  Phone,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ChevronRight
} from 'lucide-react';
import { Candidate } from '../types';
import { useState } from 'react';
import CandidateWorkspace from './CandidateWorkspace';

interface PremiumResultsSectionProps {
  candidates: Candidate[];
  isLoading?: boolean;
  onViewResult?: (candidate: Candidate) => void;
  onCallCandidate?: (candidate: Candidate) => void;
  onStatusChange?: (candidateId: string, status: string, interest?: string) => void;
}

const PremiumResultsSection: React.FC<PremiumResultsSectionProps> = ({
  candidates,
  isLoading = false,
  onViewResult,
  onCallCandidate,
  onStatusChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 rounded-3xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  const renderCandidateCard = (c: Candidate, index: number) => {
    const displayScore = c.screening_score !== undefined ? c.screening_score : c.resume_score;

    return (
      <div 
        key={c.id || index} 
        onClick={() => setActiveCandidate(c)}
        className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:shadow-lg cursor-pointer hover:border-blue-200 flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="flex items-center gap-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-xl font-black text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
            {c.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight">{c.name}</h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{c.role || "Candidate"}</p>
          </div>
        </div>

        <div className="flex items-center gap-8 md:gap-12">
          <div className="flex items-center gap-3">
             <div className="hidden md:block">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">Status</span>
                <span className="text-sm font-bold text-slate-700 capitalize">{c.status || 'Uploaded'}</span>
             </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="text-right">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">AI Match</span>
                <span className={`text-xl font-black ${displayScore >= 70 ? 'text-emerald-600' : 'text-blue-600'}`}>
                  {Math.round(displayScore)}%
                </span>
             </div>
             <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <ChevronRight size={16} />
             </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div 
        className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 border border-slate-200">
            <BarChart3 size={12} />
            AI Pipeline Results
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Interested Candidates</h2>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </div>
          <p className="text-slate-500 font-medium">Reviewing high-confidence matches identified by AI screening.</p>
        </div>
      </div>

      {isExpanded && (
        <div className="grid gap-3">
          {candidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-6 text-slate-300">
                <BrainCircuit size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No results yet</h3>
              <p className="text-slate-500 max-w-md mx-auto">
                Once candidates are screened and confirm interest, they will appear here with detailed AI insights.
              </p>
            </div>
          ) : (
            candidates.map((candidate, idx) => renderCandidateCard(candidate, idx))
          )}
        </div>
      )}

      {activeCandidate && (
        <CandidateWorkspace
          candidate={activeCandidate}
          onClose={() => setActiveCandidate(null)}
          onStatusChange={(status, interest) => {
            if (onStatusChange) {
              onStatusChange(activeCandidate.id, status, interest);
              setActiveCandidate(null);
            }
          }}
          onCallCandidate={(c) => {
            if (onCallCandidate) {
              onCallCandidate(c);
              setActiveCandidate(null);
            }
          }}
        />
      )}
    </div>
  );
};

export default PremiumResultsSection;

