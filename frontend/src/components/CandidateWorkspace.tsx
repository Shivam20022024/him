import React, { useState, useEffect } from 'react';
import { 
  X, Mail, Phone, Briefcase, Calendar, CheckCircle2, 
  MessageSquare, ChevronRight, Clock, ShieldAlert,
  BrainCircuit, Download, Play, Check, ChevronLeft, AlertTriangle
} from 'lucide-react';
import { Candidate, GroupedCandidate } from '../types';

interface CandidateWorkspaceProps {
  candidateGroup: GroupedCandidate;
  onClose: () => void;
  onStatusChange?: (candidateId: string, status: string, interest?: string) => void;
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

const CandidateWorkspace: React.FC<CandidateWorkspaceProps> = ({ candidateGroup, onClose, onStatusChange, onCallCandidate }) => {
  // If there's only 1 app or we passed a specific app via URL (simulated), auto-select it.
  const queryParams = new URLSearchParams(window.location.search);
  const appIdParam = queryParams.get('appId');
  
  const defaultApp = appIdParam 
    ? candidateGroup.applications.find(a => a.id === appIdParam) 
    : candidateGroup.applications.length === 1 ? candidateGroup.applications[0] : null;

  const [activeApp, setActiveApp] = useState<Candidate | null>(defaultApp || null);
  const [showTranscript, setShowTranscript] = useState(false);

  const handleAppSelect = (app: Candidate) => {
    setActiveApp(app);
    setShowTranscript(false);
  };

  const getStatusBadge = (status?: string, interest?: string) => {
    const normalizedStatus = (status || '').toLowerCase();
    const normalizedInterest = (interest || '').toLowerCase();

    if (normalizedStatus === 'calling' || normalizedStatus === 'ai_call_pending') return 'bg-blue-100 text-blue-800';
    if (normalizedStatus === 'callback_required') return 'bg-amber-100 text-amber-800';
    if (normalizedStatus === 'interested' || normalizedInterest === 'interested') return 'bg-emerald-100 text-emerald-800';
    if (normalizedStatus === 'interview' || normalizedStatus === 'interview_scheduled') return 'bg-purple-100 text-purple-800';
    if (normalizedStatus === 'selected') return 'bg-indigo-100 text-indigo-800';
    if (normalizedStatus === 'hired') return 'bg-teal-100 text-teal-800';
    if (normalizedStatus === 'not_interested' || normalizedInterest === 'not_interested' || normalizedStatus === 'rejected') return 'bg-red-100 text-red-800';
    if (normalizedStatus === 'not_assessed' || (!normalizedStatus && !normalizedInterest)) return 'bg-slate-100 text-slate-600';
    return 'bg-slate-100 text-slate-800';
  };

  const getStatusText = (status?: string, interest?: string) => {
    const normalizedStatus = (status || '').toLowerCase();
    const normalizedInterest = (interest || '').toLowerCase();
    if (normalizedStatus === 'calling' || normalizedStatus === 'ai_call_pending') return 'Calling';
    if (normalizedStatus === 'callback_required') return 'Callback Required';
    if (normalizedStatus === 'interested' || normalizedInterest === 'interested') return 'Interested';
    if (normalizedStatus === 'interview' || normalizedStatus === 'interview_scheduled') return 'Interview';
    if (normalizedStatus === 'not_assessed' || (!normalizedStatus && !normalizedInterest)) return 'Not Assessed';
    if (normalizedStatus === 'not_interested' || normalizedInterest === 'not_interested') return 'Not Interested';
    return normalizedStatus.replace('_', ' ') || 'New';
  };

  const getAiScore = (candidate: Candidate) => {
    if (candidate.status === 'not_assessed' || (!candidate.resume_score && !candidate.screening_score)) {
      return '—';
    }
    return `${candidate.screening_score || candidate.resume_score || 0}%`;
  };

  const pipeline = [
    { id: 'uploaded', label: 'Applied' },
    { id: 'completed', label: 'Screening' },
    { id: 'interested', label: 'Interested' },
    { id: 'interview', label: 'Interview' },
    { id: 'selected', label: 'Selected' },
    { id: 'hired', label: 'Hired' }
  ];

  const getStageIndex = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'hired') return 5;
    if (s === 'selected') return 4;
    if (s === 'interview' || s === 'interview_scheduled') return 3;
    if (s === 'interested') return 2;
    if (s === 'completed' || s === 'calling' || s === 'ai_call_pending' || s === 'callback_required') return 1;
    return 0;
  };

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
            <span className="text-sm font-bold text-slate-900">{candidateGroup.name}</span>
            {activeApp && (
              <>
                <ChevronRight size={14} className="text-slate-300" />
                <span className="text-sm font-bold text-slate-900">{activeApp.role || 'Application'}</span>
              </>
            )}
          </div>
          {activeApp && (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => onCallCandidate?.(activeApp)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
              >
                Call Candidate
              </button>
              <button 
                onClick={() => onStatusChange?.(activeApp.id, 'interview_scheduled')}
                className="rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm"
              >
                Schedule Interview
              </button>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          
          <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
            
            {/* Candidate Header Profile */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 text-2xl font-black text-blue-700 shadow-inner">
                    {candidateGroup.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">{candidateGroup.name}</h2>
                    <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-600">
                      <span className="flex items-center gap-1.5"><Mail size={14} className="text-slate-400" /> {candidateGroup.email || 'Not Available'}</span>
                      <span className="flex items-center gap-1.5"><Phone size={14} className="text-slate-400" /> {candidateGroup.phone || 'Not Available'}</span>
                      <span className="flex items-center gap-1.5"><Briefcase size={14} className="text-slate-400" /> Experience: {candidateGroup.totalExperience || 'Not Available'}</span>
                    </div>
                  </div>
                </div>
                
                {/* Data Quality Indicator */}
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Data Completeness</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: candidateGroup.email && candidateGroup.phone ? '100%' : '60%' }}></div>
                    </div>
                    <span className="text-xs font-bold text-slate-700">{candidateGroup.email && candidateGroup.phone ? '100%' : '60%'}</span>
                  </div>
                  {(!candidateGroup.email || !candidateGroup.phone) && (
                    <span className="text-[10px] text-slate-400 mt-1">Missing contact info</span>
                  )}
                </div>
              </div>
            </div>

            {/* Applications or Application Detail */}
            {!activeApp ? (
              // List Applications
              <div>
                <h3 className="text-lg font-black text-slate-900 mb-4 tracking-tight">Applications ({candidateGroup.applications.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {candidateGroup.applications.map(app => (
                    <div 
                      key={app.id} 
                      onClick={() => handleAppSelect(app)}
                      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm cursor-pointer hover:border-blue-300 hover:shadow-md transition group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition">{app.role || 'General Application'}</h4>
                          <span className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-1">
                            <Clock size={12} /> Applied {new Date(app.created_at || Date.now()).toLocaleDateString()}
                          </span>
                        </div>
                        <div className={`px-2.5 py-1 rounded-md text-xs font-bold capitalize ${getStatusBadge(app.status, app.interest)}`}>
                          {getStatusText(app.status, app.interest)}
                        </div>
                      </div>
                      <div className="flex items-center gap-6 pt-4 border-t border-slate-100">
                        <div>
                          <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">AI Match</span>
                          <span className="font-black text-slate-900">{getAiScore(app)}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Screening</span>
                          <span className="font-bold text-slate-700">{app.call_status === 'completed' ? 'Completed' : 'Pending'}</span>
                        </div>
                        <div className="ml-auto text-blue-600 bg-blue-50 h-8 w-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                          <ChevronRight size={16} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Application Detail View
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                
                {/* Back button if multiple apps */}
                {candidateGroup.applications.length > 1 && (
                  <button onClick={() => setActiveApp(null)} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition">
                    <ChevronLeft size={16} /> Back to Applications
                  </button>
                )}

                {/* Pipeline Tracker */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    {pipeline.map((stage, idx) => (
                      <PipelineStage 
                        key={stage.id} 
                        label={stage.label} 
                        active={getStageIndex(activeApp.status || '') === idx}
                        completed={getStageIndex(activeApp.status || '') > idx}
                        isLast={idx === pipeline.length - 1}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column: Summary & Transcripts */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* Callback Required Banner */}
                    {(activeApp.status === 'callback_required' || activeApp.interest === 'callback_required') && (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
                        <div className="flex justify-between items-start">
                          <div className="flex gap-3">
                            <div className="h-10 w-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 shrink-0">
                              <Phone size={20} />
                            </div>
                            <div>
                              <h4 className="font-black text-amber-900">Callback Required</h4>
                              <p className="text-sm font-medium text-amber-700 mt-1">Candidate requested a callback. Check call notes for details.</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => onStatusChange?.(activeApp.id, 'interview')} className="px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-sm font-bold text-amber-700 hover:bg-amber-100 transition shadow-sm">Mark Completed</button>
                            <button onClick={() => onCallCandidate?.(activeApp)} className="px-3 py-1.5 bg-amber-600 rounded-lg text-sm font-bold text-white hover:bg-amber-700 transition shadow-sm">Call Now</button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* AI Screening Summary */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                          <BrainCircuit size={20} className="text-blue-600" />
                          AI Screening Result
                        </h3>
                        <div className="px-3 py-1 bg-blue-50 text-blue-700 font-bold text-sm rounded-lg border border-blue-100">
                          Match: {getAiScore(activeApp)}
                        </div>
                      </div>

                      {activeApp.status === 'not_assessed' || (!activeApp.screening_score && !activeApp.resume_score) ? (
                        <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                          <BrainCircuit size={32} className="text-slate-300 mx-auto mb-3" />
                          <h4 className="font-bold text-slate-700">Not Assessed</h4>
                          <p className="text-sm text-slate-500 font-medium mt-1">Start screening to generate AI insights.</p>
                          <button onClick={() => onCallCandidate?.(activeApp)} className="mt-4 px-4 py-2 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 shadow-sm transition">Start Screening</button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Total Experience</span>
                            <span className="font-bold text-slate-900">{activeApp.total_experience || activeApp.experience_years || 'Not Available'}</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Interest</span>
                            <span className="font-bold text-slate-900">{activeApp.screening_interest || activeApp.interest || 'Not Available'}</span>
                          </div>
                          
                          {activeApp.missing_skills && activeApp.missing_skills.length > 0 && (
                             <div className="col-span-full p-3 bg-red-50 rounded-lg border border-red-100 mt-2 flex gap-3 items-start">
                               <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                               <div>
                                 <span className="text-[10px] font-bold uppercase tracking-widest text-red-500 block mb-1">Potential Concern</span>
                                 <span className="text-sm font-semibold text-red-900">Candidate is missing required skills: {activeApp.missing_skills.join(', ')}</span>
                               </div>
                             </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Transcript Viewer */}
                    {activeApp.call_status === 'completed' && (
                      <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col h-[500px]">
                        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
                          <h3 className="font-black text-slate-900 flex items-center gap-2">
                            <MessageSquare size={18} className="text-slate-500" /> Conversation Transcript
                          </h3>
                          <div className="flex gap-2">
                            {activeApp.recording_url && (
                               <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition shadow-sm">
                                 <Play size={14} /> Play Recording
                               </button>
                            )}
                            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition shadow-sm">
                              <Download size={14} /> Download
                            </button>
                          </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
                          {activeApp.transcript ? (
                            activeApp.transcript.split('\n').map((line, idx) => {
                              if (!line.trim()) return null;
                              const isAI = line.toLowerCase().startsWith('ai') || line.toLowerCase().startsWith('agent');
                              const text = line.replace(/^(AI|Agent|Candidate|User):\s*/i, '');
                              return (
                                <div key={idx} className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
                                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${isAI ? 'bg-slate-100 text-slate-800 rounded-tl-sm' : 'bg-blue-600 text-white rounded-tr-sm shadow-sm'}`}>
                                    <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isAI ? 'text-slate-500' : 'text-blue-200'}`}>
                                      {isAI ? 'AI Recruiter' : 'Candidate'}
                                    </div>
                                    <p className="text-sm font-medium leading-relaxed">{text}</p>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="h-full flex items-center justify-center text-slate-400 font-medium text-sm">
                              No transcript available for this call.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Timeline & Meta */}
                  <div className="space-y-6">
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                      <h3 className="font-black text-slate-900 mb-6">Application Timeline</h3>
                      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                        
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-white bg-blue-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2"></div>
                          <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-slate-50 p-3 rounded-lg border border-slate-100 shadow-sm">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-slate-900 text-sm">Application Created</span>
                            </div>
                            <span className="text-xs font-semibold text-slate-500">{new Date(activeApp.created_at || Date.now()).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {activeApp.call_status === 'completed' && (
                          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-white bg-blue-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2"></div>
                            <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-slate-50 p-3 rounded-lg border border-slate-100 shadow-sm">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-slate-900 text-sm">AI Screening Completed</span>
                              </div>
                              <span className="text-xs font-semibold text-slate-500">{activeApp.call_duration || 'Duration unavailable'}</span>
                            </div>
                          </div>
                        )}

                        {activeApp.interest && activeApp.interest !== 'pending' && (
                          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-white bg-blue-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2"></div>
                            <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-slate-50 p-3 rounded-lg border border-slate-100 shadow-sm">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-slate-900 text-sm capitalize">{activeApp.interest}</span>
                              </div>
                              <span className="text-xs font-semibold text-slate-500">Interest Confirmed</span>
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateWorkspace;
