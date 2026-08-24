import axios from 'axios';
import { Candidate, ResumeAnalysisResponse, Job } from '../types';

type CandidateFilter = 'all' | 'shortlisted' | 'interested';
type DataSource = 'api' | 'demo';

interface CandidateResponse {
  candidates: Candidate[];
  source: DataSource;
}

interface CallingResponse {
  source: DataSource;
  calledIds: string[];
}

interface SendShortlistedEmailsResponse {
  success: boolean;
  message: string;
  sent?: number;
  skipped?: number;
  failed?: number;
  errors?: string[];
}

const HIRE_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:8001';

const hiringClient = axios.create({
  baseURL: HIRE_BASE,
  timeout: 60000,
});

hiringClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  const orgId = localStorage.getItem('activeOrganizationId');
  if (orgId) {
    config.headers['x-view-as-org'] = orgId;
  }
  
  return config;
});

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeResumeResponse = (result: any): Candidate => {
  // Handle both 'score' (from API response) and 'resume_score' (from DB/list response)
  const rawScore = result.resume_score !== undefined ? result.resume_score : result.score;
  const score = typeof rawScore === 'string' ? parseFloat(rawScore) : Number(rawScore || 0);
  
  return {
    id: result.candidate_id || result.id || Math.random().toString(36).substr(2, 9),
    name: result.name || 'Unknown Candidate',
    email: result.email || '',
    phone: result.phone || '',
    skills: result.skills || [],
    missing_skills: result.missing_skills || [],
    resume_score: isNaN(score) ? 0 : score,
    status: result.status || (score >= 70 ? 'shortlisted' : 'rejected'),
    shortlisted: !!result.shortlisted,
    interest: result.interest || 'pending',
    created_at: result.created_at,

    
    // New fields
    role: result.role,
    call_status: result.call_status,
    call_duration: result.call_duration,
    call_start_time: result.call_start_time,
    call_end_time: result.call_end_time,
    transcript: result.transcript,
    candidate_responded: !!result.candidate_responded,
    interest_status: result.interest_status,
    interview_status: result.interview_status,
    interview_scheduled: !!result.interview_scheduled,
    interview_time: result.interview_time,
    ai_summary: result.ai_summary,
    recruiter_verdict: result.recruiter_verdict,
    conversation_summary: result.conversation_summary,
    last_interaction: result.last_interaction || result.created_at || result.screening_completed_at,
    email_sent: !!result.email_sent,
    screening_score: result.screening_score,
    screening_skills: result.screening_skills,
  };


};



const extractApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string' && detail.trim()) {
      return detail;
    }
    if (typeof error.message === 'string' && error.message.trim()) {
      return error.message;
    }
  }
  return 'Resume upload failed.';
};

export const hiringApi = {
  async createJob(jobData: { title: string; description: string; skills: string[]; experience?: string; location?: string; jobType?: string }): Promise<Job> {
    const { data } = await hiringClient.post<Job>('/job', jobData);
    return data;
  },

  async getJobs(): Promise<Job[]> {
    const { data } = await hiringClient.get<Job[]>('/jobs');
    return data;
  },

  async getJobById(jobId: string): Promise<Job> {
    const { data } = await hiringClient.get<Job>(`/job/${jobId}`);
    return data;
  },

  async getCandidates(filter: CandidateFilter, date?: string, jobId?: string): Promise<CandidateResponse> {
    try {
      let endpoint = '/candidates';
      if (filter === 'interested') {
        endpoint = '/final';
      } else if (filter === 'shortlisted') {
        endpoint = '/shortlisted';
      }
      
      const queryParams = new URLSearchParams();
      if (date) queryParams.append('date', date);
      if (jobId) queryParams.append('job_id', jobId);
      
      const queryString = queryParams.toString();
      if (queryString) {
        endpoint += `?${queryString}`;
      }

      const { data } = await hiringClient.get<any[]>(endpoint);
      return { 
        candidates: data.map(normalizeResumeResponse), 
        source: 'api' 
      };
    } catch (error) {
      return { candidates: [], source: 'api' };
    }
  },

  async deleteCandidate(candidateId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const { data } = await hiringClient.delete(`/candidates/${candidateId}`);
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: extractApiErrorMessage(error) };
    }
  },

  async uploadResume(file: File, jobDescription: string, jobDescriptionFile?: File | null, skipAi: boolean = false, jobId?: string): Promise<{ candidate: Candidate; source: DataSource }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('job_description', jobDescription);
      if (jobDescriptionFile) {
        formData.append('jd_file', jobDescriptionFile);
      }
      formData.append('skip_ai', skipAi.toString());
      if (jobId) {
        formData.append('job_id', jobId);
      }

      const { data } = await hiringClient.post<ResumeAnalysisResponse>('/upload-resume', formData);
      return { candidate: normalizeResumeResponse(data), source: 'api' };
    } catch (error) {
      throw new Error(extractApiErrorMessage(error));
    }
  },

  async addManualCandidate(candidateData: { name: string; email: string; phone: string; skills: string[]; role?: string; job_id?: string }): Promise<{ candidate: Candidate; source: DataSource }> {
    try {
      const { data } = await hiringClient.post<ResumeAnalysisResponse>('/add-manual', candidateData);
      return { candidate: normalizeResumeResponse(data), source: 'api' };
    } catch (error) {
      throw new Error(extractApiErrorMessage(error));
    }
  },

  async startCalling(candidateIds: string[]): Promise<CallingResponse> {
    try {
      await hiringClient.post('/bolna/call-shortlisted');
      return { source: 'api', calledIds: candidateIds };
    } catch (error) {
      console.error('Bulk Bolna calling failed:', error);
      return { source: 'demo', calledIds: candidateIds };
    }
  },

  async callCandidate(candidateId: string): Promise<{ success: boolean; message?: string }> {
    try {
      await hiringClient.post(`/bolna/call-candidate/${candidateId}`);
      return { success: true };
    } catch (error) {
      console.error('Individual Bolna call failed:', error);
      return { success: false, message: extractApiErrorMessage(error) };
    }
  },

  async syncCall(candidateId: string): Promise<{ success: boolean }> {
    try {
      await hiringClient.get(`/bolna/sync-call/${candidateId}`);
      return { success: true };
    } catch (error) {
      console.error('Call sync failed:', error);
      return { success: false };
    }
  },


  async sendShortlistedEmails(): Promise<SendShortlistedEmailsResponse> {
    try {
      const { data } = await hiringClient.post('/email/send-shortlisted');
      return {
        success: true,
        message: data.message || 'Emails processed successfully.',
        sent: data.sent,
        skipped: data.skipped,
        failed: data.failed,
        errors: data.errors,
      };
    } catch (error) {
      return {
        success: false,
        message: extractApiErrorMessage(error),
      };
    }
  },

  async resetSession(): Promise<{ success: boolean }> {
    try {
      await hiringClient.post(`/reset-session`);
      return { success: true };
    } catch (error) {
      console.error('Session reset failed:', error);
      return { success: false };
    }
  },

  async downloadExcel(type: 'candidates' | 'calls', date?: string, jobId?: string): Promise<void> {
    try {
      const queryParams = new URLSearchParams();
      if (date) queryParams.append('date', date);
      if (jobId) queryParams.append('job_id', jobId);
      
      const queryString = queryParams.toString();
      const url = queryString ? `/export/${type}?${queryString}` : `/export/${type}`;
      const response = await hiringClient.get(url, {
        responseType: 'blob'
      });
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `candidates_export_${new Date().getTime()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download excel:', error);
      throw error;
    }
  },

  async getDashboardMetrics(dateRange: string = 'all', jobId?: string) {
    try {
      const query = new URLSearchParams({ date_range: dateRange });
      if (jobId) query.append('job_id', jobId);
      const { data } = await hiringClient.get(`/analytics/dashboard?${query}`);
      return data;
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  async getRoleMetrics(dateRange: string = 'all') {
    try {
      const { data } = await hiringClient.get(`/analytics/roles?date_range=${dateRange}`);
      return data;
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  async getTrendData(metric: string, dateRange: string = 'all', jobId?: string) {
    try {
      const query = new URLSearchParams({ metric, date_range: dateRange });
      if (jobId) query.append('job_id', jobId);
      const { data } = await hiringClient.get(`/analytics/trend?${query}`);
      return data;
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  async exportAnalytics(type: string, format: string, dateRange: string = 'all') {
    try {
      const query = new URLSearchParams({ report_type: type, format, date_range: dateRange });
      const response = await hiringClient.get(`/analytics/export?${query}`, {
        responseType: 'blob'
      });
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `hireonomous_report_${type}.${format === 'excel' ? 'xlsx' : 'csv'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  // Simulation Endpoints
  async nextQuestion(candidateId: string, history: any[], jd?: string, customPrompt?: string, introGreeting?: string) {
    const { data } = await hiringClient.post('/simulation/next-question', {
      candidate_id: candidateId,
      history,
      jd,
      custom_prompt: customPrompt,
      intro_greeting: introGreeting
    });
    return data; // { text, audio_url }
  },

  async evaluateSimulation(candidateId: string, history: any[], jd?: string, customPrompt?: string, introGreeting?: string) {
    const { data } = await hiringClient.post('/simulation/evaluate', {
      candidate_id: candidateId,
      history,
      jd,
      custom_prompt: customPrompt,
      intro_greeting: introGreeting
    });
    return data; // { skill_match_score, communication_quality_score, summary, pros, cons }
  }
};
