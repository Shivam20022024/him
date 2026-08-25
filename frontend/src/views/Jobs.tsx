import React, { useEffect, useState } from 'react';
import { Briefcase, Plus, Calendar, ChevronRight, Loader2, MapPin, Clock, Award, Trash2, Search, Edit2 } from 'lucide-react';
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
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Jobs Board</h1>
            <p className="mt-1 text-base font-semibold text-slate-800">
              Start by creating a job to automatically find the best candidates using AI.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search jobs by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
            <button
              onClick={() => {
                const nextState = !showAddForm;
                setShowAddForm(nextState);
                if (!nextState) {
                  setEditingJobId(null);
                  setNewJob({ title: '', description: '', skills: '', experience: '0-2 years', location: '', jobType: 'Full-time' });
                }
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md active:scale-95 whitespace-nowrap"
            >
              {showAddForm ? 'Cancel' : <><Plus className="h-4 w-4" /> Create New Job</>}
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
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400">
              <Briefcase className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-slate-900">No jobs posted yet</h3>
            <p className="mt-1 text-sm text-slate-500">Create a job posting to start your hiring workflow.</p>
          </div>
        ) : (
          <>
            {jobs.length > 0 && !loading && (
              <div className="flex items-center gap-3 pt-2">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Open Positions</h2>
                <div className="flex h-6 min-w-[24px] items-center justify-center rounded-lg bg-white border border-slate-200 px-1.5 shadow-sm">
                  <span className="text-xs font-bold text-blue-600">{jobs.length}</span>
                </div>
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {jobs.filter(j => j.title.toLowerCase().includes(searchQuery.toLowerCase())).map(job => (
              <div 
                key={job.id} 
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-blue-300 hover:shadow-md cursor-pointer"
                onClick={() => handleStartHiring(job.id)}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-bold text-slate-900 leading-tight group-hover:text-blue-700 transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleEditJobClick(job, e)}
                        title="Edit job"
                        className="rounded-lg p-1.5 text-slate-400 transition-all hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteJob(job, e)}
                        disabled={deletingJobId === job.id}
                        title="Delete job"
                        className="rounded-lg p-1.5 text-slate-400 transition-all hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      >
                        {deletingJobId === job.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-medium text-slate-500">
                    {job.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {job.location}
                      </span>
                    )}
                    {job.jobType && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {job.jobType}
                      </span>
                    )}
                    {job.experience && (
                      <span className="flex items-center gap-1">
                        <Award className="h-3.5 w-3.5" />
                        {job.experience}
                      </span>
                    )}
                  </div>

                  <p className="mt-4 text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>
                  
                  {job.skills && job.skills.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {job.skills.slice(0, 3).map(skill => (
                        <span key={skill} className="inline-flex items-center rounded-lg bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-100/50">
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 3 && (
                        <span className="inline-flex items-center rounded-lg bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-500 border border-slate-100">
                          +{job.skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="flex items-center text-[11px] font-medium text-slate-400">
                    <Calendar className="mr-1 h-3 w-3" />
                    {new Date(job.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartHiring(job.id);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-blue-600 border border-slate-200 transition-all group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600"
                  >
                    Start Hiring <ChevronRight className="h-3.5 w-3.5" />
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
