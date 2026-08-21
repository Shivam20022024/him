
// src/services/api.ts
// Centralized API wrapper for your FastAPI backend

import { APIAnalysisResponse, CallFromAPI } from "../types";

/**
 * Backend URL (Vite environment variable recommended)
 * Add this to `.env.local`:
 * VITE_API_URL=http://localhost:8000
 */
const BASE = (import.meta as any).env.VITE_API_URL || "http://localhost:8000";
const HIRE_BASE = "http://localhost:8001"; // Our new pipeline port

/**
 * Helper: Parse JSON or throw a readable error
 */
async function handleJSON(res: Response) {
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // ---------------- Existing methods ----------------

  /**
   * GET all calls
   */
  getAllCalls: async (
    limit = 200,
    skip = 0
  ): Promise<CallFromAPI[]> => {
    const res = await fetch(`${BASE}/calls?limit=${limit}&skip=${skip}`);
    return handleJSON(res);
  },

  /**
   * GET single call by ID
   */
  getCallById: async (callId: string): Promise<CallFromAPI> => {
    const res = await fetch(`${BASE}/calls/${encodeURIComponent(callId)}`);
    return handleJSON(res);
  },

  /**
   * Upload audio → triggers AI processing
   */
  uploadAudio: async (file: File): Promise<APIAnalysisResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${BASE}/process-audio`, {
      method: "POST",
      body: formData,
    });

    return handleJSON(res);
  },

  /**
   * Optional backend ping
   */
  ping: async () => {
    const res = await fetch(`${BASE}/test-mongo`);
    return handleJSON(res);
  },

  // ---------------- ✅ EXCEL DOWNLOADS ----------------

  /**
   * Download overall calls Excel
   */
  downloadOverallExcel: () => {
    window.open(`${BASE}/download/overall`, "_blank");
  },

  /**
   * Download weekly calls Excel
   */
  downloadWeeklyCallsExcel: () => {
    window.open(`${BASE}/download/weekly-calls`, "_blank");
  },

  /**
   * Download weekly sales Excel
   */
  downloadWeeklySalesExcel: () => {
    window.open(`${BASE}/download/weekly-sales`, "_blank");
  },
  /**
   * Upload resume + JD → triggers AI parsing & scoring
   */
  uploadResume: async (file: File, jobDescription: string): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("job_description", jobDescription);

    const res = await fetch(`${HIRE_BASE}/upload-resume`, {
      method: "POST",
      body: formData,
    });
    return handleJSON(res);
  },

  /**
   * GET shortlisted candidates (score >= 70)
   */
  getShortlistedCandidates: async (): Promise<any[]> => {
    const res = await fetch(`${HIRE_BASE}/shortlisted`);
    return handleJSON(res);
  },

  /**
   * GET final candidates (interest == 'interested')
   */
  getFinalCandidates: async (): Promise<any[]> => {
    const res = await fetch(`${HIRE_BASE}/final`);
    return handleJSON(res);
  },

  /**
   * Trigger shortlist follow-up call
   */
  triggerCall: async (candidateId: string): Promise<{ status: string; message: string }> => {
    const res = await fetch(`${HIRE_BASE}/bolna/call-candidate/${encodeURIComponent(candidateId)}`, {
      method: "POST",
    });
    return handleJSON(res);
  },

  /**
   * Trigger calls for all shortlisted candidates with phone numbers
   */
  triggerShortlistedCalls: async (): Promise<{
    count: number;
    results: Array<{
      name: string;
      phone?: string;
      status: string;
      call_sid?: string;
      error?: string;
    }>;
  }> => {
    const res = await fetch(`${HIRE_BASE}/bolna/call-shortlisted`, {
      method: "POST",
    });
    return handleJSON(res);
  },

  /**
   * Process voice response for a candidate
   */
  processVoiceResponse: async (candidateId: string, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${HIRE_BASE}/process-response?candidate_id=${candidateId}`, {
      method: "POST",
      body: formData,
    });
    return handleJSON(res);
  },
};
