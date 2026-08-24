import React, { useState } from 'react';
import { 
  X, Mail, Phone, MapPin, Briefcase, Calendar, CheckCircle2, 
  MessageSquare, FileText, ChevronRight, Clock, ShieldAlert,
  BrainCircuit, Download, Play, Trophy, Activity, Check
} from 'lucide-react';
import { Candidate } from '../types';

interface CandidateWorkspaceProps {
  candidate: Candidate;
  onClose: () => void;
  onStatusChange?: (status: string, interest?: string) => void;
  onCallCandidate?: (candidate: Candidate) => void;
}

const PipelineStage: React.FC<{ label: string; active: boolean; completed: boolean; isLast?: boolean }> = ({ label, active, completed, isLast }) => (
  <div className="flex items-center flex-1">
    <div className={`flex flex-col items-center gap-1.5 flex-1 relative z-10`}>
      <div className={`h-6 w-6 rounded-full flex items-center justify-center border-2 text-[10px] font-bold transition-colors
        ${active ? 'border-blue-600 bg-blue-600 text-white shadow-[0_0_0_4px_rgba(37,99,235,0.1)]' : 
          completed ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-200 bg-white text-slate-300'}`}
      >
        {completed && !active ? <Check size={12} strokeWidth={3} /> : <div className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-white' : 'bg-transparent'}`} />}
      </div>
      <span className={`text-[10px] font-black uppercase tracking-wider text-center
        ${active ? 'text-blue-700' : completed ? 'text-emerald-700' : 'text-slate-400'}`}>
        {label}
      </span>
    </div>
    {!isLast && (
      <div className={`h-[2px] w-full -ml-[50%] flex-1 relative top-[-10px] z-0
        ${completed ? 'bg-emerald-500' : 'bg-slate-100'}`} 
      />
    )}
  </div>
);

const CandidateWorkspace: React.FC<CandidateWorkspaceProps> = ({ candidate, onClose, onStatusChange, onCallCandidate }) => {
  const [showTranscript, setShowTranscript] = useState(false);

  const displayScore = candidate.screening_score !== undefined ? candidate.screening_score : candidate.resume_score;
  const isGoodMatch = displayScore >= 70;
  
  const statusLower = (candidate.status || '').toLowerCase();
  
  const pipeline = [
    { id: 'uploaded', label: 'Applied' },
    { id: 'completed', label: 'AI Screening' },
    { id: 'interested', label: 'Interested' },
    { id: 'interview', label: 'Interview' },
    { id: 'selected', label: 'Selected' },
    { id: 'hired', label: 'Hired' }
  ];

  const currentStageIndex = pipeline.findIndex(p => p.id === statusLower) >= 0 
    ? pipeline.findIndex(p => p.id === statusLower) 
    : candidate.call_status === 'completed' ? 1 : 0;

  const verifiedSkills = candidate.screening_skills ? candidate.screening_skills.split(',').map(s => s.trim()) : (candidate.skills || []);
  const skillGaps = candidate.missing_skills || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 lg:p-6 backdrop-blur-sm">
      <div className="flex h-full w-full max-w-[1400px] flex-col overflow-hidden rounded-2xl bg-[#f8fafc] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Navbar */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
              <X size={20} />
            </button>
            <span className="text-sm font-semibold text-slate-500">Candidate Workspace</span>
            <ChevronRight size={14} className="text-slate-300" />
            <span className="text-sm font-bold text-slate-900">{candidate.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onStatusChange?.('interview_scheduled')}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            >
              Move Stage
            </button>
            <button 
              onClick={() => onCallCandidate?.(candidate)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20"
            >
              Call Candidate
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Left: Main Candidate Workspace (75%) */}
          <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
            
            {/* Header Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-blue-50 text-2xl font-black text-blue-600">
                    {candidate.name.charAt(0)}
                  </div>
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">{candidate.name}</h1>
                    <p className="text-sm font-bold text-slate-600 mb-2 uppercase tracking-wide">{candidate.role || 'Unassigned Role'}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
                      {candidate.experience_years && (
                        <span className="flex items-center gap-1"><Briefcase size={12} /> {candidate.experience_years} years</span>
                      )}
                      {candidate.location && (
                        <span className="flex items-center gap-1"><MapPin size={12} /> {candidate.location}</span>
                      )}
                      <span className="flex items-center gap-1"><Clock size={12} /> Applied: {new Date(candidate.created_at || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">AI Match Score</span>
                  <div className="flex items-end gap-2">
                    <span className={`text-4xl font-black leading-none ${isGoodMatch ? 'text-emerald-600' : 'text-blue-600'}`}>
                      {Math.round(displayScore)}%
                    </span>
                  </div>
                  <span className={`text-xs font-bold mt-1 ${isGoodMatch ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {isGoodMatch ? 'Strong Match' : 'Average Match'}
                  </span>
                </div>
              </div>

              {/* Action Bar */}
              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
                <button 
                  onClick={() => onStatusChange?.('interview')}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 transition-colors"
                >
                  Move to Interview
                </button>
                <button 
                  onClick={() => onStatusChange?.('interview_scheduled')}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Schedule Interview
                </button>
                <button 
                  onClick={() => onStatusChange?.('rejected')}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 hover:border-red-100 transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>

            {/* Pipeline Visualizer */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center w-full justify-between pr-4">
                {pipeline.map((stage, idx) => (
                  <PipelineStage 
                    key={stage.id} 
                    label={stage.label} 
                    active={currentStageIndex === idx} 
                    completed={currentStageIndex > idx}
                    isLast={idx === pipeline.length - 1}
                  />
                ))}
              </div>
            </div>

            {/* Callback Warning */}
            {statusLower === 'callback_required' && (
              <div className="rounded-xl border border-orange-200 bg-orange-50 p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                    <Phone size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-orange-900">Callback Required</h3>
                    <p className="mt-1 text-sm text-orange-800 font-medium">Candidate requested a callback or was unavailable during the initial outreach.</p>
                    <div className="mt-4 flex gap-3">
                      <button 
                        onClick={() => onCallCandidate?.(candidate)}
                        className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-700 transition-colors"
                      >
                        Call Now
                      </button>
                      <button 
                        onClick={() => onStatusChange?.('pending')}
                        className="rounded-lg border border-orange-200 bg-white px-4 py-2 text-sm font-bold text-orange-700 hover:bg-orange-100 transition-colors"
                      >
                        Mark Handled
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Candidate Overview Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Email</span>
                <span className="text-sm font-semibold text-slate-900 break-all">{candidate.email || 'N/A'}</span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Phone</span>
                <span className="text-sm font-semibold text-slate-900">{candidate.phone || 'N/A'}</span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Status</span>
                <span className="text-sm font-bold text-slate-900 capitalize px-2 py-0.5 rounded bg-slate-100 inline-block mt-0.5">{candidate.status || 'Uploaded'}</span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Resume</span>
                <button className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-0.5">
                  <FileText size={14} /> View File
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AI Screening Insights */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
                <div className="border-b border-slate-100 bg-slate-50 px-6 py-4 flex items-center gap-2">
                  <BrainCircuit size={16} className="text-blue-600" />
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">AI Screening Insights</h2>
                </div>
                <div className="p-6 flex-1">
                  <div className="mb-6 grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Overall Match</span>
                      <span className="text-xl font-black text-slate-900">{Math.round(displayScore)}%</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Comm. Skills</span>
                      <span className="text-xl font-black text-slate-900">{candidate.communication_score ? Math.round(candidate.communication_score) + '/10' : '-'}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Tech. Score</span>
                      <span className="text-xl font-black text-slate-900">{candidate.technical_score ? Math.round(candidate.technical_score) + '/10' : '-'}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Recruiter Verdict</span>
                      <p className="text-sm font-medium text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                        "{candidate.recruiter_verdict || candidate.ai_summary || candidate.reason || 'Pending AI screening call.'}"
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills Analysis */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
                <div className="border-b border-slate-100 bg-slate-50 px-6 py-4 flex items-center gap-2">
                  <Trophy size={16} className="text-emerald-600" />
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Skills Analysis</h2>
                </div>
                <div className="p-6 flex-1 space-y-6">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Verified Skills</span>
                    <div className="flex flex-wrap gap-2">
                      {verifiedSkills.length > 0 ? verifiedSkills.map(s => (
                        <span key={s} className="px-2.5 py-1 rounded border border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-sm">
                          {s}
                        </span>
                      )) : <span className="text-xs text-slate-500 italic">No verified skills</span>}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Potential Skill Gaps</span>
                    <div className="flex flex-wrap gap-2">
                      {skillGaps.length > 0 ? skillGaps.map(s => (
                        <span key={s} className="px-2.5 py-1 rounded border border-orange-100 bg-orange-50 text-xs font-bold text-orange-800 shadow-sm">
                          {s}
                        </span>
                      )) : <span className="text-xs text-slate-500 italic">No major gaps identified</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Screening Call */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-slate-600" />
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">AI Screening Call</h2>
                </div>
                {candidate.call_status === 'completed' && (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Completed</span>
                )}
              </div>
              <div className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Conversation Transcript</span>
                  <p className="text-sm font-medium text-slate-600">
                    {candidate.call_status === 'completed' ? 'Call transcript and conversation summary are available.' : 'No call data available yet.'}
                  </p>
                </div>
                {candidate.call_status === 'completed' && (
                  <button 
                    onClick={() => setShowTranscript(true)}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    View Transcript
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* Right: Sticky Sidebar (25%) */}
          <div className="w-[320px] lg:w-[380px] shrink-0 border-l border-slate-200 bg-slate-50 overflow-y-auto hidden md:block">
            <div className="p-6 space-y-8">
              
              {/* Quick Actions */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Quick Actions</h3>
                <div className="grid grid-cols-1 gap-2">
                  <button onClick={() => onStatusChange?.('interview_scheduled')} className="w-full text-left rounded-lg bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200 shadow-sm flex items-center gap-2">
                    <Calendar size={16} className="text-blue-600" /> Schedule Interview
                  </button>
                  <button onClick={() => onCallCandidate?.(candidate)} className="w-full text-left rounded-lg bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200 shadow-sm flex items-center gap-2">
                    <Phone size={16} className="text-blue-600" /> AI Screen Candidate
                  </button>
                </div>
              </div>

              {/* Job Details */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Target Role</h3>
                <div className="rounded-lg bg-white p-4 border border-slate-200 shadow-sm">
                  <p className="text-sm font-bold text-slate-900 mb-1">{candidate.role || 'General Position'}</p>
                  <p className="text-xs font-medium text-slate-500 line-clamp-3">
                    {candidate.job_description || 'No specific job description provided for this evaluation.'}
                  </p>
                </div>
              </div>

              {/* Documents */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Documents</h3>
                <div className="rounded-lg bg-white p-3 border border-slate-200 shadow-sm flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                      <FileText size={16} />
                    </div>
                    <div className="max-w-[150px]">
                      <p className="text-xs font-bold text-slate-900 truncate">{candidate.name.replace(/\s/g, '_')}_Resume.pdf</p>
                      <p className="text-[10px] font-medium text-slate-500">PDF Document</p>
                    </div>
                  </div>
                  <Download size={16} className="text-slate-400" />
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Activity Timeline</h3>
                <div className="relative pl-3 space-y-4 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
                  {candidate.last_interaction && (
                    <div className="relative pl-6">
                      <div className="absolute left-[-5px] top-1 h-3 w-3 rounded-full border-2 border-white bg-blue-500 shadow-sm" />
                      <p className="text-xs font-bold text-slate-900">Latest Update</p>
                      <p className="text-[10px] font-medium text-slate-500 mt-0.5">{new Date(candidate.last_interaction).toLocaleString()}</p>
                    </div>
                  )}
                  <div className="relative pl-6">
                    <div className="absolute left-[-5px] top-1 h-3 w-3 rounded-full border-2 border-white bg-slate-300 shadow-sm" />
                    <p className="text-xs font-bold text-slate-900">Application Received</p>
                    <p className="text-[10px] font-medium text-slate-500 mt-0.5">{new Date(candidate.created_at || Date.now()).toLocaleString()}</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Transcript Modal */}
      {showTranscript && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><MessageSquare size={18} /> AI Screening Transcript</h3>
              <button onClick={() => setShowTranscript(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
              {candidate.transcript ? candidate.transcript.split('\n').filter(l => l.trim()).map((line, i) => {
                const isAI = line.toLowerCase().startsWith('ai:') || line.toLowerCase().startsWith('recruiter:');
                const text = line.replace(/^(ai:|recruiter:|candidate:|user:)\s*/i, '');
                return (
                  <div key={i} className={`flex flex-col ${isAI ? 'items-start' : 'items-end'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${isAI ? 'bg-white text-slate-800 border border-slate-100' : 'bg-blue-600 text-white'}`}>
                      {text}
                    </div>
                    <span className="text-[10px] mt-1 uppercase font-bold text-slate-400 mx-2">{isAI ? 'AI Recruiter' : candidate.name}</span>
                  </div>
                );
              }) : (
                <div className="text-center py-12 text-sm font-medium text-slate-500">Transcript not available.</div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CandidateWorkspace;
