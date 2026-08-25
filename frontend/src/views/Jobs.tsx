import React, { useEffect, useState } from 'react';
import { Briefcase, Plus, CalendarDays, ChevronRight, Loader2, MapPin, Clock, UserRound, Trash2, Search, Edit2, BriefcaseBusiness, FileText } from 'lucide-react';
import { Job } from '../types';
import { hiringApi } from '../services/hiringApi';
import { useNavigate } from 'react-router-dom';

interface JobsProps {
  onNavigate?: (view: "HIRING") => void; // Kept for backwards compatibility if needed
}

const Jobs: React.FC<JobsProps> = ({ onNavigate }) => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [newJob, setNewJob] = useState({ 
    title: '', 
    description: '', 
    skills: '',
    experience: '0-2 years',
    location: '',
    jobType: 'Full-time'
  });
  const [creating, setCreating] = useState(false);
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await hiringApi.getJobs();
      
      // Deduplicate jobs by title (keep the most recent one)
      const uniqueJobs = Array.from(
        data.reduce((map, job) => {
          if (!map.has(job.title)) {
            map.set(job.title, job);
          }
          return map;
        }, new Map<string, Job>()).values()
      );
      
      setJobs(uniqueJobs);
    } catch (error) {
      console.error("Failed to load jobs", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartHiring = (jobId: string) => {
    // Navigate to the hiring page with the jobId in the query string
    navigate(`/hiring?jobId=${jobId}`);
  };

  const handleDeleteJob = async (job: Job, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${job.title}"? This cannot be undone.`)) {
      return;
    }

    setDeletingJobId(job.id);
    try {
      const result = await hiringApi.deleteJob(job.id);
      if (result.success) {
        setJobs(prev => prev.filter(j => j.id !== job.id));
      } else {
        alert(result.message || 'Failed to delete job.');
      }
    } catch (error) {
      console.error('Failed to delete job', error);
      alert('Failed to delete job.');
    } finally {
      setDeletingJobId(null);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.title || !newJob.description) return;

    setCreating(true);
    try {
      const skillsArray = newJob.skills.split(',').map(s => s.trim()).filter(Boolean);
      
      if (editingJobId) {
        await hiringApi.updateJob(editingJobId, {
          title: newJob.title,
          description: newJob.description,
          skills: skillsArray,
          experience: newJob.experience,
          location: newJob.location,
          jobType: newJob.jobType
        });
        
        setShowAddForm(false);
        setEditingJobId(null);
        setNewJob({ title: '', description: '', skills: '', experience: '0-2 years', location: '', jobType: 'Full-time' });
        loadJobs();
      } else {
        const createdJob = await hiringApi.createJob({
          title: newJob.title,
          description: newJob.description,
          skills: skillsArray,
          experience: newJob.experience,
          location: newJob.location,
          jobType: newJob.jobType
        });
        
        handleStartHiring(createdJob.id);
      }
    } catch (error) {
      console.error("Failed to save job", error);
    } finally {
      setCreating(false);
    }
  };

  const handleEditJobClick = (job: Job, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingJobId(job.id);
    setNewJob({
      title: job.title || '',
      description: job.description || '',
      skills: job.skills ? job.skills.join(', ') : '',
      experience: job.experience || '0-2 years',
      location: job.location || '',
      jobType: job.jobType || 'Full-time'
    });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#eef4fb_100%)] px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
                <label className="relative block mb-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <input
            type="text"
            placeholder="Search jobs by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-14 w-full rounded-2xl border border-[#e2e8f0] bg-white pl-12 pr-5 text-sm shadow-[0_2px_4px_rgba(25,54,93,0.04)] outline-none placeholder:text-slate-500 focus:border-[#003d9b] focus:ring-4 focus:ring-[#003d9b]/10 transition-all"
          />
        </label>
        
        <div className="mt-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-[30px] font-bold tracking-[-0.045em] text-slate-900">Jobs Board</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Create a job and let AI find your next great hire.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                const nextState = !showAddForm;
                setShowAddForm(nextState);
                if (!nextState) {
                  setEditingJobId(null);
                  setNewJob({ title: '', description: '', skills: '', experience: '0-2 years', location: '', jobType: 'Full-time' });
                }
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md active:scale-95 whitespace-nowrap"
            >
              <Plus className="h-5 w-5" />
              {showAddForm ? 'Cancel' : 'Create New Job'}
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm animate-in fade-in slide-in-from-top-4 duration-200">
            <h2 className="text-base font-semibold text-slate-900 mb-3">{editingJobId ? 'Edit Job Details' : 'Job Details'}</h2>
            <form onSubmit={handleCreateJob} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Job Title <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={newJob.title}
                    onChange={e => setNewJob({ ...newJob, title: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                    placeholder="e.g. Senior Frontend Engineer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Skills <span className="text-slate-400 normal-case tracking-normal font-normal">(comma-separated)</span></label>
                  <input
                    type="text"
                    value={newJob.skills}
                    onChange={e => setNewJob({ ...newJob, skills: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                    placeholder="React, TypeScript, Node.js"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Experience</label>
                  <select
                    value={newJob.experience}
                    onChange={e => setNewJob({ ...newJob, experience: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                  >
                    <option>0-2 years</option>
                    <option>2-5 years</option>
                    <option>5-8 years</option>
                    <option>8+ years</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Job Type</label>
                  <select
                    value={newJob.jobType}
                    onChange={e => setNewJob({ ...newJob, jobType: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                  >
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Intern</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Location <span className="text-slate-400 normal-case tracking-normal font-normal">(Optional)</span></label>
                  <input
                    type="text"
                    value={newJob.location}
                    onChange={e => setNewJob({ ...newJob, location: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                    placeholder="e.g. Remote, San Francisco"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Job Description <span className="text-red-500">*</span></label>
                <textarea
                  required
                  value={newJob.description}
                  onChange={e => setNewJob({ ...newJob, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 h-24 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors resize-none"
                  placeholder="Describe the role and responsibilities..."
                />
              </div>
              
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Briefcase className="h-4 w-4" />}
                  {editingJobId ? 'Update Job' : 'Create & Start Hiring'}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#e2e8f0] bg-white py-16 text-center">
              <FileText className="mx-auto text-slate-400" size={28} />
              <p className="mt-3 text-sm font-semibold text-slate-900">No jobs found</p>
              <p className="mt-1 text-xs text-slate-500">Create a new job to start hiring.</p>
            </div>
        ) : (
          <>
            {jobs.length > 0 && !loading && (
                <div className="mt-9 flex items-center gap-2">
                  <h2 className="text-lg font-semibold tracking-[-0.02em] text-slate-900">Open positions</h2>
                  <span className="rounded-md border border-[#003d9b]/20 bg-[#003d9b]/10 px-2 py-0.5 text-[11px] font-bold text-[#003d9b]">
                    {jobs.length}
                  </span>
                </div>
              )}

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {jobs.filter(j => j.title.toLowerCase().includes(searchQuery.toLowerCase())).map(job => (
              <div 
                key={job.id} 
                className="job-card group cursor-pointer"
                  onClick={() => handleStartHiring(job.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-slate-900 group-hover:text-[#003d9b] transition-colors">
                      {job.title}
                    </h2>
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleEditJobClick(job, e)}
                        title="Edit job"
                        className="icon-button"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteJob(job, e)}
                        disabled={deletingJobId === job.id}
                        title="Delete job"
                        className="icon-button"
                      >
                        {deletingJobId === job.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 size={15} />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] font-medium text-slate-500">
                    {job.location && (
                      <span className="inline-flex items-center gap-1">
                        <span className="pin-dot text-slate-400" />
                        {job.location}
                      </span>
                    )}
                    {job.jobType && (
                      <span className="inline-flex items-center gap-1">
                        <BriefcaseBusiness size={13} />
                        {job.jobType}
                      </span>
                    )}
                    {job.experience && (
                      <span className="inline-flex items-center gap-1">
                        <UserRound size={13} />
                        {job.experience}
                      </span>
                    )}
                  </div>

                  <p className="mt-5 min-h-5 text-sm text-slate-500 line-clamp-3">
                    {job.description}
                  </p>
                  
                  {job.skills && job.skills.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {job.skills.slice(0, 3).map(skill => (
                        <span key={skill} className="inline-flex max-w-full rounded-md border border-[#003d9b]/20 bg-[#003d9b]/10 px-2.5 py-1 text-[11px] font-semibold text-[#003d9b]">
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 3 && (
                        <span className="inline-flex max-w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                          +{job.skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-5 pt-4 border-t border-[#e2e8f0] flex items-center justify-between">
                    <span className="flex items-center text-[11px] text-slate-500 gap-1.5">
                      <CalendarDays size={14} />
                      {new Date(job.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartHiring(job.id);
                      }}
                      className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-[11px] font-semibold border border-[#003d9b]/25 bg-[#003d9b]/5 text-[#003d9b] hover:bg-[#003d9b]/10 transition-all"
                    >
                      Start hiring <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
            ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Jobs;
