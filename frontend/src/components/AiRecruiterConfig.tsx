import React, { useEffect, useState } from 'react';
import { Bot, Settings2, PlayCircle, Loader2, Save, Trash2, Plus, GripVertical, CheckCircle, AlertCircle, Copy } from 'lucide-react';
import AiRecruiterSimulator from './hiring/AiRecruiterSimulator';
import { hiringApi, JobAIConfig, ScreeningQuestion } from '../services/hiringApi';
import { Job } from '../types';

interface AiRecruiterConfigProps {
  job: Job;
}

const AiRecruiterConfig: React.FC<AiRecruiterConfigProps> = ({ job }) => {
  const [config, setConfig] = useState<JobAIConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [previewPrompt, setPreviewPrompt] = useState<string | null>(null);
  const [previewTab, setPreviewTab] = useState<'context'|'questions'|'rules'|'final'>('final');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    loadConfig();
  }, [job.id]);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const data = await hiringApi.getAiConfig(job.id);
      setConfig(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const validateConfig = () => {
    if (!config) return false;
    const errors: string[] = [];
    if (!job.title) errors.push('Job title is missing');
    if (!job.description) errors.push('Job description is missing');
    if (config.screening_questions.length === 0) errors.push('No screening questions added');
    
    // Check for duplicates
    const questions = config.screening_questions.map(q => q.question.toLowerCase().trim());
    const uniqueQuestions = new Set(questions);
    if (uniqueQuestions.size < questions.length) {
      errors.push('Duplicate screening questions detected');
    }
    
    // Check for empty
    if (questions.some(q => q === '')) {
      errors.push('One or more screening questions are empty');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSave = async (activate = false) => {
    if (!config) return;
    
    if (activate && !validateConfig()) {
      return;
    }
    
    const newStatus = activate ? 'Active' : config.status;
    
    try {
      const updated = await hiringApi.updateAiConfig(job.id, { ...config, status: newStatus });
      setConfig(updated);
      alert('Configuration saved successfully');
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Failed to save configuration');
    }
  };

  const handleGenerateQuestions = async () => {
    setGenerating(true);
    try {
      const { questions } = await hiringApi.generateAiQuestions(job.id);
      setConfig(prev => prev ? { ...prev, screening_questions: questions } : null);
    } catch (e) {
      alert('Failed to generate questions');
    } finally {
      setGenerating(false);
    }
  };

  const handlePreview = async () => {
    try {
      const { prompt } = await hiringApi.previewAiPrompt(job.id);
      setPreviewPrompt(prompt);
    } catch (e) {
      alert('Failed to generate preview');
    }
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    if (!config) return;
    const newQs = [...config.screening_questions];
    newQs[index] = { ...newQs[index], [field]: value };
    setConfig({ ...config, screening_questions: newQs });
  };

  const removeQuestion = (index: number) => {
    if (!config) return;
    const newQs = config.screening_questions.filter((_, i) => i !== index);
    setConfig({ ...config, screening_questions: newQs });
  };

  const addQuestion = () => {
    if (!config) return;
    const newQs = [...config.screening_questions, { id: Math.random().toString(), question: '', category: 'General', required: true, order: config.screening_questions.length + 1 }];
    setConfig({ ...config, screening_questions: newQs });
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin h-8 w-8 mx-auto text-blue-600" /></div>;
  if (!config) return <div className="p-8 text-center">Failed to load configuration</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Bot className="h-7 w-7 text-blue-600" /> AI Recruiter Configuration
          </h2>
          <p className="text-slate-500 mt-1">Customize the screening agent for {job.title}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handlePreview} className="px-4 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-xl font-medium text-sm flex items-center gap-2 transition">
            <PlayCircle className="h-4 w-4" /> Preview Prompt
          </button>
          <button onClick={() => handleSave(false)} className="px-4 py-2 border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl font-medium text-sm flex items-center gap-2 transition">
            <Save className="h-4 w-4" /> Save Draft
          </button>
          <button onClick={() => handleSave(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm flex items-center gap-2 transition shadow-sm">
            <CheckCircle className="h-4 w-4" /> Activate
          </button>
        </div>
      </div>

      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex gap-3 text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>
            <h4 className="font-bold text-sm mb-1">AI Recruiter setup incomplete</h4>
            <ul className="list-disc list-inside text-sm opacity-90">
              {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-slate-400" /> Settings
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Language</label>
                <select value={config.language} onChange={e => setConfig({...config, language: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Tone</label>
                <select value={config.tone} onChange={e => setConfig({...config, tone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="Professional & Conversational">Professional & Conversational</option>
                  <option value="Professional">Professional</option>
                  <option value="Friendly">Friendly</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Voice</label>
                <select value={config.voice} onChange={e => setConfig({...config, voice: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="Configured Voice">Default Voice</option>
                  <option value="Female 1">Female 1</option>
                  <option value="Male 1">Male 1</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Status</label>
                <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${config.status === 'Active' ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                  {config.status}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <AiRecruiterSimulator jobId={job.id} />
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-[24px] p-6 text-sm">
            <h4 className="font-bold text-slate-800 mb-2">Job Context</h4>
            <div className="space-y-2 text-slate-600">
              <p><span className="font-semibold text-slate-700">Title:</span> {job.title}</p>
              <p><span className="font-semibold text-slate-700">Exp:</span> {job.experience || 'Not specified'}</p>
              <p><span className="font-semibold text-slate-700">Skills:</span> {job.skills.join(', ')}</p>
            </div>
          </div>
        </div>

        <div className="col-span-2">
          <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm min-h-[500px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 text-lg">Screening Questions</h3>
              <button onClick={handleGenerateQuestions} disabled={generating} className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-sm font-semibold transition flex items-center gap-2">
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
                Generate AI Questions
              </button>
            </div>

            <div className="space-y-3">
              {config.screening_questions.map((q, idx) => (
                <div key={idx} className="flex gap-3 items-start p-3 bg-slate-50 border border-slate-100 rounded-xl group">
                  <GripVertical className="h-5 w-5 text-slate-300 mt-2 cursor-grab" />
                  <div className="flex-1 space-y-2">
                    <input 
                      type="text" 
                      value={q.question}
                      onChange={e => updateQuestion(idx, 'question', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                      placeholder="Enter screening question..."
                    />
                    <div className="flex gap-4">
                      <select value={q.category} onChange={e => updateQuestion(idx, 'category', e.target.value)} className="bg-transparent text-xs font-semibold text-slate-500 focus:outline-none">
                        <option value="General">General</option>
                        <option value="Experience">Experience</option>
                        <option value="Technical">Technical</option>
                        <option value="Logistics">Logistics</option>
                      </select>
                      <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                        <input type="checkbox" checked={q.required} onChange={e => updateQuestion(idx, 'required', e.target.checked)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                        Required
                      </label>
                    </div>
                  </div>
                  <button onClick={() => removeQuestion(idx)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition p-2">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <button onClick={addQuestion} className="mt-4 w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 font-medium text-sm hover:bg-slate-50 hover:border-slate-300 transition flex items-center justify-center gap-2">
              <Plus className="h-4 w-4" /> Add Question
            </button>
          </div>
        </div>
      </div>

      {previewPrompt && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-600" /> Prompt Preview (v{config.prompt_template_version || '1.0'})
              </h3>
              <div className="flex items-center gap-3">
                <button onClick={() => navigator.clipboard.writeText(previewPrompt)} className="text-slate-600 hover:text-slate-800 font-medium text-sm px-3 py-1.5 bg-white border border-slate-200 rounded-lg flex items-center gap-2">
                  <Copy className="h-4 w-4" /> Copy Prompt
                </button>
                <button onClick={() => setPreviewPrompt(null)} className="text-slate-400 hover:text-slate-600 font-medium text-sm px-3 py-1.5 bg-white border border-slate-200 rounded-lg">Close</button>
              </div>
            </div>
            
            <div className="flex border-b border-slate-200 bg-white px-6 pt-2">
              {[
                { id: 'final', label: 'Final Prompt' },
                { id: 'context', label: 'Job Context' },
                { id: 'questions', label: 'Questions' },
                { id: 'rules', label: 'Rules' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setPreviewTab(tab.id as any)}
                  className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition ${previewTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
              {previewTab === 'final' && (
                <pre className="whitespace-pre-wrap text-sm text-white bg-slate-900 p-6 rounded-2xl font-mono leading-relaxed">
                  {previewPrompt}
                </pre>
              )}
              {previewTab === 'context' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200">
                  <h4 className="font-bold text-lg mb-4">Job Context Injected</h4>
                  <ul className="space-y-3 text-sm text-slate-600">
                    <li><strong className="text-slate-800">Job Title:</strong> {job.title}</li>
                    <li><strong className="text-slate-800">Company:</strong> Hireonomous</li>
                    <li><strong className="text-slate-800">Description:</strong> {job.description}</li>
                    <li><strong className="text-slate-800">Skills:</strong> {job.skills.join(', ')}</li>
                  </ul>
                </div>
              )}
              {previewTab === 'questions' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
                  {config.screening_questions.map((q, i) => (
                    <div key={i} className="flex gap-3 text-sm">
                      <span className="font-bold text-slate-400">{i + 1}.</span>
                      <p className="text-slate-700 font-medium">{q.question}</p>
                    </div>
                  ))}
                </div>
              )}
              {previewTab === 'rules' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200">
                  <p className="text-sm text-slate-600">Rules are globally applied to all AI Recruiter calls to ensure professional and compliant interactions. See Final Prompt for full rule text.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiRecruiterConfig;
