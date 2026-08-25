import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BriefcaseBusiness, Heart, PhoneCall, Users, Calendar, Star } from 'lucide-react';
import ResumeUpload from '../components/ResumeUpload';
import DashboardHeader from '../components/DashboardHeader';
import QuickActionsBar from '../components/QuickActionsBar';
import EnhancedStatsCards from '../components/EnhancedStatsCards';
import PipelineTable from '../components/PipelineTable';
import NotificationBanner from '../components/hiring/NotificationBanner';
import { Candidate, Job, GroupedCandidate } from '../types';

import { hiringApi } from '../services/hiringApi';
import InterviewModal from '../components/hiring/InterviewModal';
import CandidateWorkspace from '../components/CandidateWorkspace';
import AiRecruiterConfig from '../components/AiRecruiterConfig';
import { Bot } from 'lucide-react';


// Demo candidates removed per requirement

import { useNavigate, useLocation } from 'react-router-dom';

type Notification = {
  tone: 'success' | 'info' | 'warning';
  message: string;
} | null;

const Hiring: React.FC = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isUploadedExpanded, setIsUploadedExpanded] = useState(true);
  const [calling, setCalling] = useState(false);
  const [notification, setNotification] = useState<Notification>(null);
  const [activities, setActivities] = useState<any[]>([]);

  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [selectedForInterview, setSelectedForInterview] = useState<Candidate | null>(null);
  const [viewingResult, setViewingResult] = useState<GroupedCandidate | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [activeTab, setActiveTab] = useState<'pipeline' | 'ai_recruiter'>('pipeline');
  const pipelineRef = useRef<HTMLDivElement | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const activeJobId = new URLSearchParams(location.search).get('jobId') || undefined;

  const loadCandidates = async (silent = false, dateToLoad?: string) => {
    if (!silent) setLoading(true);
    try {
      const response = await hiringApi.getCandidates('all', dateToLoad || selectedDate, activeJobId);
      // Only show candidates in the pipeline if they are from the live API
      if (response.source === 'api') {
        setCandidates(response.candidates);
      } else {
        setCandidates([]);
      }
      setNotification(null);

    } catch {
      if (!silent) {
        setNotification({
          tone: 'warning',
          message: 'Unable to load candidate data. Please refresh.',
        });
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setCandidates([]);
      setActivities([]);
      setSelectedForInterview(null);

      const urlParams = new URLSearchParams(window.location.search);
      const jobId = urlParams.get('jobId');

      if (jobId) {
        try {
          const jobData = await hiringApi.getJobById(jobId);
          setCurrentJob(jobData);
          setShowAddCandidate(true);
        } catch (e) {
          console.error("Failed to fetch job", e);
          setShowAddCandidate(true);
        }
      } else {
        // No job selected, show the generic add candidate panel
        setShowAddCandidate(true);
      }

      loadCandidates(false, selectedDate);
    };

    fetchInitialData();
  }, [selectedDate, location.search]);

  // Real-time polling for status updates
  useEffect(() => {
    const activeCallCandidates = candidates.filter(c => c.status === 'ai_call_pending' || c.status === 'calling');
    const hasActiveCalls = activeCallCandidates.length > 0;
    
    if (hasActiveCalls || candidates.length > 0) {
      const interval = setInterval(async () => {
        // Proactively sync active calls from Bolna API if they are still pending
        if (hasActiveCalls) {
          try {
            await Promise.all(activeCallCandidates.map(c => hiringApi.syncCall(c.id)));
          } catch (e) {
            console.error("Sync failed", e);
          }
        }
        loadCandidates(true); // Silent refresh to avoid blinking
      }, 5000); // Poll every 5 seconds for live updates
      return () => clearInterval(interval);
    }
  }, [candidates.length, candidates.some(c => c.status === 'ai_call_pending' || c.status === 'calling')]);

  // GROUPING LOGIC
  const groupedCandidates = useMemo<GroupedCandidate[]>(() => {
    const groups = new Map<string, GroupedCandidate>();
    
    candidates.forEach(c => {
      // Use email, then phone, then name as fallback for grouping
      const key = (c.email || c.phone || c.name).toLowerCase().trim();
      
      if (!groups.has(key)) {
        groups.set(key, {
          id: key,
          name: c.name,
          email: c.email,
          phone: c.phone,
          // Extract experience from first application, ideally they match
          totalExperience: c.total_experience || c.experience_years || '', 
          applications: []
        });
      }
      
      const group = groups.get(key)!;
      group.applications.push(c);
      
      // Update general info if missing
      if (!group.email && c.email) group.email = c.email;
      if (!group.phone && c.phone) group.phone = c.phone;
    });
    
    return Array.from(groups.values());
  }, [candidates]);

  const shortlistedCandidates = useMemo(
    () => candidates.filter((candidate) => candidate.resume_score >= 70 || candidate.screening_score >= 70),
    [candidates]
  );

  const callbackRequiredCandidates = useMemo(() => candidates.filter((c) => (c.status || '').toLowerCase() === 'callback_required'), [candidates]);
  
  const pendingCandidates = useMemo(() => candidates.filter(
    (c) => {
      const s = (c.status || '').toLowerCase();
      return !s || s === 'pending' || s === 'uploaded' || s === 'new';
    }
  ), [candidates]);
  
  const aiQualifiedCandidates = useMemo(() => candidates.filter(
    (c) => {
      const s = (c.status || '').toLowerCase();
      const i = (c.interest || '').toLowerCase();
      return s === 'interested' || i === 'interested' || s === 'interview_scheduled' || i === 'interview_scheduled' || s === 'interview' || s === 'selected' || s === 'hired';
    }
  ), [candidates]);
  
  const interviewingCandidates = useMemo(() => candidates.filter(
    (c) => {
      const s = (c.status || '').toLowerCase();
      return s === 'interview_scheduled' || s === 'interview';
    }
  ), [candidates]);

  const handleUploadResume = async (
    files: File[],
    jobDescription: string,
    jobDescriptionFile?: File | null,
    skipAi?: boolean
  ): Promise<boolean> => {
    setUploading(true);
    try {
      const results = await Promise.allSettled(
        files.map(async (file) => {
          const response = await hiringApi.uploadResume(file, jobDescription, jobDescriptionFile, skipAi, activeJobId);
          setCandidates((current) => [response.candidate, ...current]);

          setActivities((current) =>
            [
              {
                id: Date.now().toString(),
                candidateName: response.candidate.name,
                type: 'resume_uploaded',
                message: skipAi ? 'Fast Uploaded Resume' : 'Resume Uploaded',
                timestamp: new Date().toISOString(),
              },
              ...current,
            ].slice(0, 15)
          );
          return response;
        })
      );

      const successful = results.filter((r) => r.status === 'fulfilled').length;
      const failedMessages = results
        .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
        .map((r) => (r.reason instanceof Error ? r.reason.message : 'Resume upload failed.'));

      if (successful > 0) {
        setNotification({
          tone: failedMessages.length > 0 ? 'warning' : 'success',
          message:
            failedMessages.length > 0
              ? `Processed ${successful} ${successful === 1 ? 'candidate' : 'candidates'}, but ${failedMessages.length} failed. ${failedMessages[0]}`
              : `Successfully processed ${successful} ${successful === 1 ? 'candidate' : 'candidates'} and added to the pipeline.`,
        });
        return true;
      } else {
        setNotification({
          tone: 'warning',
          message: failedMessages[0] || 'Resume upload could not be completed. Please try again.',
        });
        return false;
      }
    } finally {
      setUploading(false);
    }
  };

  const handleAddCandidate = async (
    files: File[],
    jobDescription: string,
    jobDescriptionFile?: File | null,
    skipAi?: boolean
  ) => {
    const success = await handleUploadResume(files, jobDescription, jobDescriptionFile, skipAi);
    if (success) {
      setShowAddCandidate(false);
    }
  };

  const handleManualAdd = async (candidateData: { name: string; email: string; phone: string; skills: string[]; role?: string }) => {
    setUploading(true);
    try {
      const response = await hiringApi.addManualCandidate({ ...candidateData, job_id: activeJobId });
      setCandidates((current) => [response.candidate, ...current]);
      
      setActivities((current) =>
        [
          {
            id: Date.now().toString(),
            candidateName: response.candidate.name,
            type: 'resume_uploaded',
            message: 'Manually Added',
            timestamp: new Date().toISOString(),
          },
          ...current,
        ].slice(0, 15)
      );

      setNotification({
        tone: 'success',
        message: `Successfully added ${response.candidate.name} to the pipeline.`,
      });
      setShowAddCandidate(false);
    } catch (error: any) {
      setNotification({
        tone: 'warning',
        message: error.message || 'Failed to add manual candidate.',
      });
    } finally {
      setUploading(false);
    }
  };

  const executeCalling = async (candidatesToCall: Candidate[], isAll: boolean) => {
    const validCandidates = candidatesToCall.filter(c => {
      const s = c.status?.toLowerCase() || '';
      const blocklist = ['calling', 'ai_call_pending', 'completed', 'interested', 'not_interested', 'interview', 'interview_scheduled', 'selected', 'hired'];
      return !blocklist.includes(s) && c.interest !== 'interested' && c.interest !== 'not_interested';
    });

    if (!validCandidates.length) {
      setNotification({
        tone: 'warning',
        message: `No candidates available in your pipeline for outreach.`,
      });
      return;
    }

    setCalling(true);
    setNotification({
      tone: 'info',
      message: `Initiating AI outreach for ${candidatesToCall.length} candidates in your pipeline...`,
    });

    try {
      // If we are calling all candidates, we trigger individual calls for those not already called
      // If it's just shortlisted, we can use the bulk API or individual as fallback
      let calledIds: string[] = [];
      
      if (isAll) {
        const results = await Promise.allSettled(
          validCandidates.map(c => hiringApi.callCandidate(c.id))
        );
        calledIds = validCandidates.filter((_, i) => results[i].status === 'fulfilled').map(c => c.id);
      } else {
        const response = await hiringApi.startCalling(validCandidates.map(c => c.id));
        calledIds = response.calledIds;
      }

      // Create live activity entries for outreach calls
      const newActivities: any[] = validCandidates.map((candidate) => ({
        id: `${Date.now()}-${candidate.id}`,
        candidateName: candidate.name,
        type: 'call',
        message: 'Calling candidate...',
        timestamp: new Date().toISOString(),
      }));
      setActivities((current) => [...newActivities, ...current].slice(0, 15));

      setCandidates((current) =>
        current.map((candidate) => {
          if (!calledIds.includes(candidate.id)) {
            return candidate;
          }
          return {
            ...candidate,
            status: 'calling',
            interest: candidate.interest || 'pending',
          };
        })
      );

      setNotification({
        tone: 'success',
        message: 'Outreach campaign successfully launched.',
      });
    } catch {
      setNotification({
        tone: 'warning',
        message: 'Outreach could not be started. Please check your API configuration.',
      });
    } finally {
      setCalling(false);
    }
  };

  const handleStartCalling = async () => {
    await executeCalling(shortlistedCandidates, false);
  };

  const handleStartCallingAll = async () => {
    await executeCalling(candidates, true);
  };



  const updateCandidateStatus = (candidateId: string, status: string, interest?: string) => {
    setCandidates((current) =>
      current.map((candidate) =>
        candidate.id === candidateId
          ? {
            ...candidate,
            status,
            ...(interest ? { interest } : {}),
          }
          : candidate
      )
    );
  };


  const handleCallCandidate = async (candidate: Candidate) => {
    // Prevent double clicking if already calling
    if (candidate.status === 'calling') return;

    // Optimistically set to calling
    setCandidates((current) =>
      current.map((item) =>
        item.id === candidate.id ? { ...item, status: 'calling' } : item
      )
    );

    try {
      setNotification({
        tone: 'info',
        message: `Initiating AI Agent call for ${candidate.name}...`,
      });

      const result = await hiringApi.callCandidate(candidate.id);

      if (!result.success) {
        throw new Error(result.message || 'Call failed');
      }

      setNotification({
        tone: 'success',
        message: `AI Agent call successfully triggered for ${candidate.name}.`,
      });

      setCandidates((current) =>
        current.map((item) =>
          item.id === candidate.id ? { ...item, interest: 'pending', status: 'calling' } : item
        )
      );
    } catch (err: any) {
      // Revert status on failure
      setCandidates((current) =>
        current.map((item) =>
          item.id === candidate.id ? { ...item, status: candidate.status } : item
        )
      );
      setNotification({
        tone: 'warning',
        message: err.message || `Failed to initiate AI call for ${candidate.name}. Please check your Bolna configuration.`,
      });
    }
  };

  const handleDeleteCandidate = async (candidate: Candidate) => {
    if (!window.confirm(`Are you sure you want to remove ${candidate.name} from the pipeline?`)) {
      return;
    }

    try {
      const result = await hiringApi.deleteCandidate(candidate.id);
      if (result.success) {
        setCandidates((current) => current.filter((c) => c.id !== candidate.id));
        setNotification({
          tone: 'success',
          message: `${candidate.name} removed successfully.`,
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      setNotification({
        tone: 'warning',
        message: error.message || 'Failed to remove candidate.',
      });
    }
  };

  const handleInterviewCandidate = (candidate: Candidate) => {
    console.log("DEBUG: Setting selectedForInterview to:", candidate.name);
    setSelectedForInterview(candidate);
  };


  const handleSendEmails = async () => {
    setNotification({
      tone: 'info',
      message: 'Sending emails to shortlisted candidates...',
    });

    const result = await hiringApi.sendShortlistedEmails();

    if (result.success) {
      // Create live activity entries for email outreach
      const newActivities: ActivityItem[] = aiQualifiedCandidates.map((candidate) => ({
        id: `${Date.now()}-${candidate.id}-mail`,
        candidateName: candidate.name,
        type: 'mail_sent',
        message: `Mail sent to ${candidate.email}`,
        timestamp: new Date().toISOString(),
      }));
      setActivities((current) => [...newActivities, ...current].slice(0, 15));

      setNotification({
        tone: result.failed && result.failed > 0 ? 'warning' : 'success',
        message:
          result.failed && result.failed > 0
            ? `${result.message} First error: ${result.errors?.[0] || 'Unknown error.'}`
            : result.message,
      });
      return;
    }

    setNotification({
      tone: 'warning',
      message: result.message,
    });
  };

  const scrollToResults = () => {
    resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#eef4fb_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        {notification && <NotificationBanner tone={notification.tone} message={notification.message} />}

        <DashboardHeader 
          selectedDate={selectedDate} 
          onDateChange={setSelectedDate} 
          currentJob={currentJob}
          onDeleteJob={currentJob ? async () => {
            if (!window.confirm(`Delete "${currentJob.title}"? This cannot be undone.`)) return;
            try {
              const result = await hiringApi.deleteJob(currentJob.id);
              if (result.success) {
                setNotification({ tone: 'success', message: 'Job deleted successfully.' });
                navigate('/jobs');
              } else {
                setNotification({ tone: 'warning', message: result.message || 'Failed to delete job.' });
              }
            } catch (e: any) {
              setNotification({ tone: 'warning', message: e.message || 'Failed to delete job.' });
            }
          } : undefined}
        />

        {currentJob && (
          <div className="flex gap-4 border-b border-slate-200 mb-6 pb-2">
            <button 
              onClick={() => setActiveTab('pipeline')}
              className={`font-semibold text-sm pb-2 border-b-2 transition ${activeTab === 'pipeline' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              Hiring Pipeline
            </button>
            <button 
              onClick={() => setActiveTab('ai_recruiter')}
              className={`font-semibold text-sm pb-2 border-b-2 transition flex items-center gap-2 ${activeTab === 'ai_recruiter' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              <Bot className="h-4 w-4" /> AI Recruiter
            </button>
          </div>
        )}

        {activeTab === 'ai_recruiter' && currentJob ? (
          <AiRecruiterConfig job={currentJob} />
        ) : (
          <>
            <EnhancedStatsCards
              stats={[
                {
                  title: 'Total Candidates',
                  value: groupedCandidates.length,
                  icon: <Users className="h-5 w-5" />,
                  subtitle: 'Unique people in pipeline',
                  trend: groupedCandidates.length > 0 ? 'up' : 'neutral',
                  trendValue: 'New',
                },
                {
                  title: 'Total Applications',
                  value: candidates.length,
                  icon: <BriefcaseBusiness className="h-5 w-5" />,
                  subtitle: 'Total database rows',
                  trend: candidates.length > 0 ? 'up' : 'neutral',
                },
                {
                  title: 'Shortlisted',
                  value: shortlistedCandidates.length,
                  icon: <Star className="h-5 w-5" />,
                  subtitle: 'Strong matches (≥70%)',
                  trend: shortlistedCandidates.length > 0 ? 'up' : 'neutral',
                },
                {
                  title: 'Interested',
                  value: aiQualifiedCandidates.length,
                  icon: <Heart className="h-5 w-5" />,
                  subtitle: 'Successfully screened by AI',
                  trend: aiQualifiedCandidates.length > 0 ? 'up' : 'neutral',
                },
                {
                  title: 'Pending Outreach',
                  value: pendingCandidates.length,
                  icon: <PhoneCall className="h-5 w-5" />,
                  subtitle: 'Awaiting AI screening call',
                  trend: 'neutral',
                },
              ]}
            />

            <QuickActionsBar
              onAddCandidate={() => setShowAddCandidate((current) => !current)}
              onStartOutreach={handleStartCalling}
              onStartOutreachAll={handleStartCallingAll}
              onSendEmails={handleSendEmails}
              onViewResults={scrollToResults}
              onDownloadCandidates={() => hiringApi.downloadExcel('candidates', selectedDate, activeJobId)}
              onDownloadCalls={() => hiringApi.downloadExcel('calls', selectedDate, activeJobId)}
              isGlobal={!activeJobId}
            />

            {showAddCandidate && (
              <div className="w-full">
                <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Add Profiles</h3>
                      <p className="mt-1 text-sm font-medium text-slate-600">
                        Upload a resume and generate a shortlist-ready profile from your hiring brief.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddCandidate(false)}
                      className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                    >
                      Close
                    </button>
                  </div>
                  <ResumeUpload
                    onUpload={handleAddCandidate}
                    onManualAdd={handleManualAdd}
                    isUploading={uploading}
                    initialJob={currentJob}
                  />
                </div>
              </div>
            )}

            <div className="grid items-start gap-6 min-w-0">
              <div ref={pipelineRef} className="min-w-0">
                <div className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-sm min-w-0">
                  <div className="mb-4">
                  <div 
                    className="mb-4 flex items-center justify-between cursor-pointer select-none"
                    onClick={() => setIsUploadedExpanded(!isUploadedExpanded)}
                  >
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 border border-slate-100 mb-2">
                        <Users className="h-3 w-3" />
                        Real-time Pipeline
                      </div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">Uploaded Candidates</h2>
                      <p className="mt-1 text-sm font-medium text-slate-600">
                        Manage resumes you've uploaded and track their screening progress.
                      </p>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
                      {isUploadedExpanded ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                      )}
                    </div>
                  </div>

                  {isUploadedExpanded && (
                    <div className="mt-4">
                      {loading ? (
                        <PipelineTable
                          groupedCandidates={[]}
                          isLoading={true}
                        />
                      ) : candidates.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center shadow-sm">
                          <div className="mx-auto inline-flex rounded-full bg-white p-4 text-slate-300 shadow-sm">
                            <Users className="h-8 w-8" />
                          </div>
                          <h3 className="mt-4 text-lg font-bold text-slate-900">No candidates uploaded yet</h3>
                          <p className="mt-2 text-sm text-slate-500 max-w-xs">
                            Upload candidate resumes to begin AI screening and outreach.
                          </p>
                          <button
                            onClick={() => setShowAddCandidate(true)}
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98]"
                          >
                            Upload Candidates
                          </button>
                        </div>
                      ) : (
                        <PipelineTable
                          groupedCandidates={groupedCandidates}
                          onCallCandidate={handleCallCandidate}
                          onDeleteCandidate={handleDeleteCandidate}
                          onViewCandidate={setViewingResult}
                          isLoading={false}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          </>
        )}




        {selectedForInterview && (
          <InterviewModal
            candidate={selectedForInterview}
            onStatusChange={(status, interest) => {
              if (!selectedForInterview) return;
              updateCandidateStatus(selectedForInterview.id, status, interest);
            }}
            onClose={() => {
              setSelectedForInterview(null);
              loadCandidates();
            }}
            onComplete={() => {
              setNotification({
                tone: 'success',
                message: `Interview for ${selectedForInterview.name} completed successfully!`
              });
            }}
          />
        )}

        {viewingResult && (
          <CandidateWorkspace
            candidateGroup={viewingResult}
            onClose={() => setViewingResult(null)}
            onStatusChange={(candidateId, status, interest) => {
              updateCandidateStatus(candidateId, status, interest);
              loadCandidates(true); // refresh silently
            }}
            onCallCandidate={(c) => {
              handleCallCandidate(c);
            }}
          />
        )}

      </div>
    </div>
  );
};

export default Hiring;
