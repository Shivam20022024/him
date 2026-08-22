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
  ShieldCheck
} from 'lucide-react';
import { Candidate } from '../types';

interface PremiumResultsSectionProps {
  candidates: Candidate[];
  isLoading?: boolean;
  onViewResult?: (candidate: Candidate) => void;
}

const PremiumResultsSection: React.FC<PremiumResultsSectionProps> = ({
  candidates,
  isLoading = false,
  onViewResult,
}) => {
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
    const screeningSkillsArray = c.screening_skills ? c.screening_skills.split(',').map(s => s.trim()) : [];

    return (
      <div key={c.id || index} className="group relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-8 transition-all hover:shadow-2xl hover:shadow-slate-200/50">
        <div className="flex flex-col xl:flex-row gap-12">
          {/* Left Section: Profile Card */}
          <div className="xl:w-1/3 space-y-6">
            <div className="flex items-center gap-5">
              <div className="h-20 w-20 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm transition-transform group-hover:scale-105">
                <User size={40} />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{c.name}</h3>
                <p className="text-sm font-bold text-blue-600 uppercase tracking-wider">{c.role || "Candidate"}</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-slate-600">
                <div className="p-1.5 rounded-lg bg-slate-50 text-slate-400">
                  <Mail size={14} />
                </div>
                <span className="text-sm font-medium">{c.email || "Email not provided"}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <div className="p-1.5 rounded-lg bg-slate-50 text-slate-400">
                  <Phone size={14} />
                </div>
                <span className="text-sm font-medium">{c.phone || "Phone not provided"}</span>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] rotate-12">
                <ShieldCheck size={80} />
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                  {c.screening_score !== undefined ? "AI Screening Score" : "Resume Match Score"}
                </span>
                <span className="text-xl font-black text-blue-600">{Math.round(displayScore)}%</span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(37,99,235,0.4)] ${c.screening_score !== undefined ? 'bg-emerald-500 shadow-emerald-500/40' : 'bg-blue-600'}`} 
                  style={{ width: `${displayScore}%` }} 
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <Clock size={12} />
              Last Interaction: {c.last_interaction ? new Date(c.last_interaction).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "Recently Screened"}
            </div>
            
            {onViewResult && (c.call_status === 'completed' || c.status === 'completed') && (
              <button 
                onClick={() => onViewResult(c)}
                className="w-full mt-4 flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-sm font-bold text-white transition-all hover:bg-slate-800 hover:shadow-lg active:scale-[0.98]"
              >
                <MessageSquare size={18} />
                View Full Result
              </button>
            )}
          </div>

          {/* Center Section: Status & Engagement */}
          <div className="xl:w-1/4 space-y-6 xl:border-l xl:border-slate-100 xl:pl-10">
            <div className="flex items-center gap-2 mb-2">
              <BrainCircuit size={18} className="text-slate-400" />
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status & Engagement</h4>
            </div>
            <ul className="space-y-4">
              {[
                { label: "Email Sent", active: c.email_sent || c.shortlisted, icon: <Mail size={16} /> },
                { label: "AI Call Completed", active: c.call_status === 'completed' || c.status === 'completed', icon: <Phone size={16} /> },
                { label: "Candidate Responded", active: c.candidate_responded, icon: <MessageSquare size={16} /> },
                { label: "Interest Confirmed", active: c.interest_status === 'interested' || c.interest === 'interested', icon: <Heart size={16} /> },
              ].map((step, i) => (
                <li key={i} className={`flex items-center justify-between ${step.active ? 'text-slate-900' : 'text-slate-300'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${step.active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-300'}`}>
                      {step.icon}
                    </div>
                    <span className="text-sm font-bold tracking-tight">{step.label}</span>
                  </div>
                  {step.active ? <CheckCircle2 size={18} className="text-emerald-500" /> : <div className="h-4 w-4 rounded-full border-2 border-slate-100" />}
                </li>
              ))}

            </ul>


          </div>

          {/* Right Section: Skills Intelligence */}
          <div className="xl:flex-1 space-y-8 xl:border-l xl:border-slate-100 xl:pl-10">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Verified Skills</span>
                <div className="flex flex-wrap gap-2">
                  {screeningSkillsArray.length > 0 ? (
                    screeningSkillsArray.map((s: string) => (
                      <span key={s} className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-100 shadow-sm">
                        {s}
                      </span>
                    ))
                  ) : (c.skills || []).length > 0 ? (
                    c.skills.map((s: string) => (
                      <span key={s} className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-[11px] font-bold border border-slate-200 shadow-sm">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic font-medium">None identified</span>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Missing Skills</span>
                <div className="flex flex-wrap gap-2">
                  {(c.missing_skills || []).length > 0 ? (
                    c.missing_skills.map((s: string) => (
                      <span key={s} className="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 text-[11px] font-bold border border-red-100 shadow-sm">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic font-medium">None identified</span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">AI Decision Summary</span>
               <div className="p-6 rounded-3xl bg-blue-50/30 border border-blue-100/50">
                  <p className="text-sm font-medium text-slate-700 leading-relaxed italic">
                    "{c.recruiter_verdict || c.ai_summary || "Professional recruiter verdict pending AI call completion..."}"
                  </p>
               </div>
            </div>


            <div className="space-y-4">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Candidate Conversation Summary</span>
               <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                  <p className="text-sm font-medium text-slate-600 leading-relaxed">
                    {c.conversation_summary || "Insights will appear here after the AI screening call is completed and analyzed."}
                  </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 border border-slate-200">
            <BarChart3 size={12} />
            AI Pipeline Results
          </div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Interested Candidates</h2>
          <p className="text-slate-500 font-medium">Reviewing high-confidence matches identified by AI screening.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {candidates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-slate-200 rounded-[32px] bg-slate-50/50">
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
    </div>
  );
};

export default PremiumResultsSection;

