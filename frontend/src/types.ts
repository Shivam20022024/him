// ===============================
// Sentiment Enum (UI Convenience)
// ===============================
export enum CallSentiment {
  POSITIVE = "Positive",
  NEUTRAL = "Neutral",
  NEGATIVE = "Negative",
}

// ===============================
// Data Shape Returned by Backend
// (For GET /calls and GET /calls/{id})
// ===============================
export interface CallFromAPI {
  call_id: string;
  customer_id?: string;
  duration_seconds?: number;
  duration?: string;
  sentiment?: string;
  sentiment_confidence?: number;
  sentiment_reason?: string;
  emotion?: string;
  summary?: string;
  transcript?: string;
  raw_transcript?: string;
  refined_transcript?: string;
  transcript_provider?: string;
  transcript_refined?: boolean;
  transcript_refiner?: string;
  analysis_provider?: string;
  response_text?: string;
  response_audio_path?: string;
  response_audio_url?: string;
  response_audio_error?: string;
  tags?: string[];
  analysis?: any;  
  created_at?: string;
  excel_path?: string;
  transcript_path?: string;
  analysis_raw?: string;
}

// ===============================
// Data Returned by POST /process-audio
// (AI Processing Pipeline Output)
// ===============================
export interface APIAnalysisResponse {
  call_id: string;
  customer_id?: string;

  transcript: string;
  raw_transcript?: string;
  refined_transcript?: string;
  transcript_provider?: string;
  transcript_refined?: boolean;
  transcript_refiner?: string;
  summary: string;
  sentiment: string;
  sentiment_confidence?: number;
  sentiment_reason?: string;
  emotion: string;

  intents: string[];
  analysis_provider?: string;
  response_text?: string;
  response_audio_path?: string;
  response_audio_url?: string;
  response_audio_error?: string;

  analysis: {
    call_summary?: string;
    customer_intent?: string;
    key_points?: string[];
    intent_detection?: string[];
    sentiment_emotion?: {
      sentiment: string;
      emotion: string;
    };
    action_items?: string[];
    root_cause?: any;
    [k: string]: any;
  };

  qa?: {
    score: number;
    checks: {
      rule: string;
      passed: boolean;
      note?: string;
    }[];
  };

  analysis_raw?: string;

  // Optional backend fields
  excel_path?: string;
  transcript_path?: string;
  created_at?: string;
}


  export interface CallInteraction {
  id: string;
  customerId?: string;
  customerName?: string;
  agentName: string;
  date: string;
  duration: string;
  durationSeconds?: number;
  sentiment: string;
  sentimentConfidence?: number;
  tags: string[];
  summary: string;
  transcript: string;
  rawTranscript?: string;
  refinedTranscript?: string;
  transcriptProvider?: string;
  transcriptRefined?: boolean;
  transcriptRefiner?: string;
  emotion?: string;
  sentimentReason?: string;
  analysisProvider?: string;
  responseText?: string;
  responseAudioPath?: string;
  responseAudioUrl?: string;
  responseAudioError?: string;
  analysis?: any;
  converted?: boolean;
}

// ===============================
// Analytics View Type
// ===============================
export interface AnalyticsData {
  totalCalls: number;
  connectionRate: number;
  avgDuration: string;
  conversionRate: number;
  volumeData: { name: string; calls: number }[];
}

export interface Candidate {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  skills: string[];
  missing_skills?: string[];
  resume_score: number;
  status: string;
  shortlisted: boolean;
  email_sent: boolean;
  interest?: string;

  
  // New AI Interaction Fields
  role?: string;
  call_status?: string; // Completed, No Response, Busy, Failed
  call_duration?: string;
  call_start_time?: string;
  call_end_time?: string;
  transcript?: string;
  candidate_responded: boolean;
  interest_status?: string; // Interested, Not Interested, Follow-up Needed
  interview_status?: string;
  interview_scheduled: boolean;
  interview_time?: string;
  ai_summary?: string;
  recruiter_verdict?: string;
  conversation_summary?: string;
  last_interaction?: string;
  screening_skills?: string;
  screening_score?: number;

  // New Real Call Pipeline Fields
  communication_score?: number;
  technical_score?: number;
  confidence_score?: number;
  final_recommendation?: string;
  recording_url?: string;
  interview_date?: string;

  transcription?: string;
  job_description?: string;
  interview_evaluation?: {
    skill_match_score?: number;
    communication_quality_score?: number;
    sentiment?: string;
    emotion?: string;
    summary?: string;
    pros?: string[];
    cons?: string[];
  };
  interview_transcript?: any[];
  created_at?: string;
}



export interface ResumeAnalysisResponse {
  candidate_id: string;
  name: string;
  email?: string;
  phone?: string;
  score: number;
  skills: string[];
  status: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  skills: string[];
  experience?: string;
  location?: string;
  jobType?: string;
  createdAt: string;
}

// ===============================
// View Routing
// ===============================
export type ViewState = "HOME" | "HIRING" | "JOBS";
