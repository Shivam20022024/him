import React, { useState } from 'react';
import { UploadCloud, FileText, Loader2, Briefcase, UserPlus } from 'lucide-react';
import { Job } from '../types';

interface ResumeUploadProps {
  onUpload: (files: File[], jobDescription: string, jobDescriptionFile?: File | null, skipAi?: boolean) => Promise<void>;
  onManualAdd?: (candidate: { name: string; email: string; phone: string; skills: string[]; role?: string }) => Promise<void>;
  isUploading: boolean;
  initialJob?: Job | null;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onUpload, onManualAdd, isUploading, initialJob }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'manual'>('upload');
  const [jobDescription, setJobDescription] = useState(initialJob?.description || '');
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [skipAi, setSkipAi] = useState(false);

  // Manual entry state
  const [manualName, setManualName] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualSkills, setManualSkills] = useState('');

  React.useEffect(() => {
    if (initialJob) {
      setJobDescription(initialJob.description);
    }
  }, [initialJob]);

  const handleJdFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setJdFile(event.target.files[0]);
      setJobDescription('');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
    }
  };

  const handleSubmitUpload = async () => {
    if (files.length === 0) return;
    if (!jobDescription.trim() && !jdFile && !skipAi) return;

    await onUpload(files, jobDescription, jdFile, skipAi);
    setFiles([]);
  };

  const handleSubmitManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName || !manualEmail || !onManualAdd) return;

    await onManualAdd({
      name: manualName,
      email: manualEmail,
      phone: manualPhone,
      skills: manualSkills.split(',').map(s => s.trim()).filter(Boolean),
      role: initialJob?.title
    });

    setManualName('');
    setManualEmail('');
    setManualPhone('');
    setManualSkills('');
  };

  return (
    <div className="rounded-[16px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
      {initialJob && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-blue-50 p-4 border border-blue-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-blue-900">Hiring for: <span className="text-blue-700">{initialJob.title}</span></h3>
            {initialJob.skills?.length > 0 && (
              <p className="mt-1 text-xs text-blue-600 flex gap-1">
                {initialJob.skills.join(', ')}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="mb-6 flex space-x-1 rounded-xl bg-slate-200/60 p-1">
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
            activeTab === 'upload'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
          }`}
        >
          <UploadCloud className="h-4 w-4" />
          Upload Resumes
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('manual')}
          className={`flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
            activeTab === 'manual'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
          }`}
        >
          <UserPlus className="h-4 w-4" />
          Manual Entry
        </button>
      </div>

      {activeTab === 'upload' ? (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">1. Job Description File (Optional)</label>
                <div className="relative rounded-2xl border-2 border-dashed border-slate-300 bg-white px-4 py-4 text-center transition hover:border-blue-300 hover:bg-slate-50">
                  <input
                    type="file"
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    onChange={handleJdFileChange}
                    accept=".pdf,.docx,.txt"
                  />
                  <div className="mx-auto inline-flex rounded-xl bg-slate-100 p-2 text-slate-500 shadow-sm">
                    {jdFile ? <FileText className="h-5 w-5" /> : <UploadCloud className="h-5 w-5" />}
                  </div>
                  <h4 className="mt-2 text-sm font-semibold text-slate-950">
                    {jdFile ? jdFile.name : 'Upload JD document'}
                  </h4>
                </div>
              </div>
              <div className="flex items-center justify-center py-2">
                <span className="text-xs font-semibold uppercase text-slate-400">OR PASTE TEXT</span>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Job Description Text</label>
                <textarea
                  value={jobDescription}
                  onChange={(event) => {
                    setJobDescription(event.target.value);
                    setJdFile(null);
                  }}
                  className="h-28 w-full resize-none rounded-2xl border-2 border-slate-300 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-100 focus:bg-white [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                  placeholder="Paste the role summary and required skills here..."
                />
              </div>
            </div>

            <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <label className="mb-2 block text-sm font-medium text-slate-700">2. Candidate Resumes</label>
              <div className="relative flex h-[calc(100%-28px)] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white px-4 py-6 text-center transition hover:border-blue-300 hover:bg-slate-50">
                <input
                  type="file"
                  multiple
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.txt"
                />
                <div className="mb-3 inline-flex rounded-xl bg-slate-100 p-3 text-slate-500 shadow-sm">
                  {files.length > 0 ? <FileText className="h-8 w-8" /> : <UploadCloud className="h-8 w-8" />}
                </div>
                <h4 className="text-base font-semibold text-slate-950">
                  {files.length > 0 
                    ? files.length === 1 
                      ? files[0].name 
                      : `${files.length} files selected` 
                    : 'Drag & drop resumes here'}
                </h4>
                <p className="mt-1 text-sm text-slate-500">Supports PDF, DOCX, TXT</p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl bg-blue-50/50 p-3 border border-blue-100">
            <div>
              <label htmlFor="skipAi" className="text-sm font-medium text-slate-800">
                Fast Upload (Skip AI Scoring)
              </label>
              <p className="text-xs text-slate-500 mt-0.5">
                Bypass AI analysis. The resume will be uploaded and scored 100 instantly.
              </p>
            </div>
            <div className="flex h-5 items-center">
              <input
                id="skipAi"
                type="checkbox"
                checked={skipAi}
                onChange={(e) => setSkipAi(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
              />
            </div>
          </div>

          <button
            onClick={handleSubmitUpload}
            disabled={files.length === 0 || (!jobDescription.trim() && !jdFile && !skipAi) || isUploading}
            className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-semibold transition-all ${
              files.length === 0 || (!jobDescription.trim() && !jdFile && !skipAi) || isUploading
                ? 'cursor-not-allowed bg-slate-200 text-slate-500'
                : 'bg-blue-600 text-white shadow-[0_18px_40px_rgba(37,99,235,0.18)] hover:bg-blue-700'
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Analyzing Resumes...
              </>
            ) : (
              skipAi ? 'Fast Upload to Pipeline' : 'Analyze & Add to Pipeline'
            )}
          </button>
        </>
      ) : (
        <form onSubmit={handleSubmitManual} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={manualName}
                onChange={e => setManualName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email <span className="text-red-500">*</span></label>
              <input
                type="email"
                required
                value={manualEmail}
                onChange={e => setManualEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="john@example.com"
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Phone</label>
              <input
                type="text"
                value={manualPhone}
                onChange={e => setManualPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="+1 234 567 8900"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Skills <span className="text-slate-400 font-normal text-xs">(comma-separated)</span></label>
              <input
                type="text"
                value={manualSkills}
                onChange={e => setManualSkills(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="React, Node.js, Python"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={!manualName || !manualEmail || isUploading}
            className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-semibold transition-all ${
              !manualName || !manualEmail || isUploading
                ? 'cursor-not-allowed bg-slate-200 text-slate-500'
                : 'bg-blue-600 text-white shadow-[0_18px_40px_rgba(37,99,235,0.18)] hover:bg-blue-700'
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Adding Candidate...
              </>
            ) : (
              'Add Candidate to Pipeline'
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default ResumeUpload;
