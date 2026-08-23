import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, MessageSquare, Loader2, X, Trophy, CheckCircle, AlertCircle } from 'lucide-react';
import { Candidate } from '../../types';
import { hiringApi } from '../../services/hiringApi';

interface InterviewModalProps {
  candidate: Candidate;
  onClose: () => void;
  onComplete?: () => void;
  onStatusChange?: (status: string, interest?: string) => void;
  mode?: 'interview' | 'result';
}

interface Message {
  role: 'ai' | 'user';
  text: string;
}

interface NextQuestionResponse {
  text: string;
  audio_url: string;
  done?: boolean;
}

const InterviewModal: React.FC<InterviewModalProps> = ({ candidate, onClose, onComplete, onStatusChange, mode = 'interview' }) => {
  const [step, setStep] = useState<'setup' | 'calling' | 'live' | 'ending' | 'summary'>(
    mode === 'result' ? 'summary' : 'setup'
  );
  const [history, setHistory] = useState<Message[]>([]);
  const [isAIPushing, setIsAIPushing] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [evaluation, setEvaluation] = useState<any>(
    mode === 'result' ? {
      skill_match_score: candidate.screening_score !== undefined ? candidate.screening_score : candidate.resume_score,
      communication_quality_score: candidate.communication_score ? (candidate.communication_score <= 10 ? candidate.communication_score * 10 : candidate.communication_score) : (candidate.interview_evaluation?.communication_quality_score || null),
      technical_score: candidate.technical_score,
      confidence_score: candidate.confidence_score,
      recommendation: candidate.final_recommendation,
      duration: candidate.call_duration,
      summary: candidate.recruiter_verdict || candidate.ai_summary || candidate.conversation_summary
    } : null
  );
  const [error, setError] = useState<string | null>(null);

  // Initialize history from candidate transcript if in result mode
  useEffect(() => {
    if (mode === 'result' && candidate.transcript) {
      // If we have a plain string transcript, split it into lines
      const lines = candidate.transcript.split('\n').filter(l => l.trim());
      const newHistory: Message[] = lines.map((line, i) => {
        const isAI = line.toLowerCase().startsWith('ai:') || line.toLowerCase().startsWith('recruiter:');
        return {
          role: isAI ? 'ai' : 'user',
          text: line.replace(/^(ai:|recruiter:|candidate:|user:)\s*/i, '')
        };
      });
      setHistory(newHistory);
    } else if (mode === 'result' && candidate.interview_transcript) {
       setHistory(candidate.interview_transcript as any);
    }
  }, [mode, candidate.transcript, candidate.interview_transcript]);

  // Lock body scroll when modal is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);
  const [customPrompt, setCustomPrompt] = useState(
    `You are an AI voice recruiter conducting a phone screening interview for Novlantis.

## ROLE
- You are a friendly, professional AI recruiter.
- You are speaking to a candidate over a phone call.
- Keep responses short, natural, and human-like.

## GOAL
- Conduct a quick 2–3 minute screening.
- Collect key candidate details.
- Decide if the candidate is suitable.

## CONVERSATION FLOW

STEP 1: Greeting & Availability
Say:
"Hi, this is an AI recruiter calling from Novlantis regarding your job application. Is now a good time for a quick 2–3 minute screening call?"

- If NO -> Ask for a better time and end call.
- If YES -> Continue.

STEP 2: Introduction
Say:
"Great, thank you! I'll ask you a few quick questions to understand your profile better."

STEP 3: Interest Check
Ask:
"Are you currently interested in exploring this opportunity?"

- If NO -> Politely end:
"Got it, thanks for letting me know. Have a great day."
- If YES -> Continue.

STEP 4: Experience
Ask:
"Could you briefly tell me about your relevant experience?"

Follow-up:
"That sounds good. Can you tell me what kind of projects or technologies you've worked with?"

STEP 5: Availability
Ask:
"How soon would you be available to join if selected?"

STEP 6: Salary
Ask:
"Could you share your current and expected salary?"

STEP 7: Decision

If candidate seems suitable:
Say:
"Great, thanks for sharing. Based on your responses, you seem like a good fit. I'll pass your profile to the hiring team, and they will reach out to you for next steps."

If not suitable:
Say:
"Thanks for your time. At the moment, we won't be moving forward, but we'll keep your profile for future opportunities."

STEP 8: Closing
Say:
"It was nice speaking with you. Have a great day!"

## STYLE & BEHAVIOR RULES

- Always sound conversational, not robotic.
- Use filler phrases naturally:
  - "Got it"
  - "Thanks for sharing"
  - "That sounds good"
- Ask ONLY one question at a time.
- Wait for user response before continuing.
- Keep responses under 2 sentences.
- Handle interruptions gracefully.
- If input is unclear, ask politely:
  "Sorry, could you repeat that?"

## IMPORTANT RULES

- Do NOT say you are an AI unless asked.
- Do NOT speak long paragraphs.
- Do NOT skip steps.
- Do NOT ask multiple questions at once.
- Always acknowledge user responses.

## EDGE CASE HANDLING

- If user is silent -> "Are you still there?"
- If user asks unrelated questions -> briefly answer and return to flow.
- If call drops -> restart from last question.`
  );
  const [introGreeting, setIntroGreeting] = useState(
    'Hi, this is an AI recruiter calling from Novlantis regarding your job application. Is now a good time for a quick 2-3 minute screening call?'
  );

  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, transcript]);

  // Handle STT initialization
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      setError("Speech recognition not supported in this browser.");
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          const final = event.results[i][0].transcript;
          handleUserResponse(final);
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setTranscript(interim);
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error("Speech Recognition Error", event.error);
    };

    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  // Simulator sequence
  useEffect(() => {
    if (step === 'calling') {
      const timer = setTimeout(() => setStep('live'), 3000);
      return () => clearTimeout(timer);
    }
    if (step === 'live' && history.length === 0) {
      startInterview();
    }
  }, [step]);

  const startInterview = async () => {
    setIsAIPushing(true);
    try {
      const data: NextQuestionResponse = await hiringApi.nextQuestion(candidate.id, [], undefined, customPrompt, introGreeting);
      playAIQuestion(data.text, data.audio_url, data.done);
    } catch (err) {
      setError("Failed to start session.");
      setIsAIPushing(false);
    }
  };

  const playAIQuestion = (
    text: string,
    audioUrl: string,
    done = false,
    baseHistory?: Message[]
  ) => {
    const sourceHistory = baseHistory ?? history;
    const updatedHistory = [...sourceHistory, { role: 'ai' as const, text }];
    setHistory(updatedHistory);
    setIsAIPushing(true);

    if (audioRef.current) {
      audioRef.current.src = `http://localhost:8001${audioUrl}`;
      audioRef.current.play();
      audioRef.current.onended = () => {
        setIsAIPushing(false);
        if (done) {
          setTimeout(() => endInterview(updatedHistory), 150);
          return;
        }
        if (isMicOn) recognitionRef.current?.start();
      };
    } else {
      setTimeout(() => {
        setIsAIPushing(false);
        if (done) {
          endInterview(updatedHistory);
        }
      }, 2000);
    }
  };

  const handleUserResponse = async (text: string) => {
    recognitionRef.current?.stop();
    setTranscript('');
    const newHistory: Message[] = [...history, { role: 'user', text }];
    setHistory(newHistory);
    
    setIsAIPushing(true);
    try {
      const data: NextQuestionResponse = await hiringApi.nextQuestion(candidate.id, newHistory, undefined, customPrompt, introGreeting);
      playAIQuestion(data.text, data.audio_url, data.done, newHistory);
    } catch (err) {
      setError("Failed to get next question.");
      setIsAIPushing(false);
    }
  };

  const endInterview = async (finalHistory: Message[]) => {
    setStep('ending');
    try {
      const results = await hiringApi.evaluateSimulation(candidate.id, finalHistory, undefined, customPrompt, introGreeting);
      setEvaluation(results);
      onStatusChange?.('interviewed', 'interviewed');
      setStep('summary');
      if (onComplete) onComplete();
    } catch (err) {
      setError("Evaluation failed.");
      setStep('summary');
    }
  };

  const toggleMic = () => {
    if (isMicOn) {
      recognitionRef.current?.stop();
    } else {
      if (!isAIPushing) recognitionRef.current?.start();
    }
    setIsMicOn(!isMicOn);
  };

  const handleStartCalling = () => {
    onStatusChange?.('calling', 'pending');
    setStep('calling');
  };

  if (step === 'setup') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
        <div className="w-full max-w-xl bg-white rounded-[32px] overflow-hidden shadow-2xl">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
               <h2 className="text-2xl font-bold text-slate-900">Prepare Interview</h2>
               <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                  <X className="h-6 w-6" />
               </button>
            </div>
            
            <div className="space-y-4">
               <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-4 items-start">
                  <MessageSquare className="h-5 w-5 text-blue-600 mt-1 shrink-0" />
                  <div>
                     <p className="text-sm font-semibold text-blue-900">Custom Recruiter Session</p>
                     <p className="text-xs text-blue-700 mt-1">Refine the interview style and introduction script for Novlantis.</p>
                  </div>
               </div>

               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-widest">Initial Greeting (Script)</label>
                  <textarea 
                    value={introGreeting}
                    onChange={(e) => setIntroGreeting(e.target.value)}
                    placeholder="E.g. Hello, this is Novlantis..."
                    className="w-full h-24 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 transition-all resize-none"
                  />
               </div>

               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-widest">Recruiter Instruction (Style)</label>
                  <textarea 
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="E.g. Focus on their Python skills and ask 2 behavioral questions."
                    className="w-full h-24 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 transition-all resize-none"
                  />
               </div>

               <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleStartCalling}
                    className="w-full bg-blue-600 text-white rounded-2xl py-4 font-bold hover:bg-blue-700 transition shadow-lg flex items-center justify-center gap-2"
                  >
                     <Phone className="h-5 w-5" />
                     Start Browser Simulation
                  </button>
                  
                  <button 
                    onClick={async () => {
                       try {
                          const success = await hiringApi.callCandidate(candidate.id);
                          if (!success.success) {
                            throw new Error('Bolna call failed');
                          }
                          onStatusChange?.('calling', 'pending');
                          onClose();
                       } catch (err) {
                          alert("Make sure your BOLNA_API_KEY is set in the .env file.");
                       }
                    }}
                    className="w-full border-2 border-slate-200 text-slate-700 rounded-2xl py-4 font-bold hover:bg-slate-50 transition flex items-center justify-center gap-2"
                  >
                     <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                     Start Real Phone Call (Bolna)
                  </button>

                  <p className="text-center text-[10px] text-slate-400 font-medium max-w-[80%] mx-auto">
                    Simulation is free. Real calls use Bolna credits. Ensure candidate phone number is valid.
                  </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'calling') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-8 text-white">
          <div className="relative">
            <div className="h-32 w-32 rounded-full bg-blue-600/20 animate-ping absolute inset-0" />
            <div className="h-32 w-32 rounded-full bg-blue-600 flex items-center justify-center relative shadow-2xl">
              <Phone className="h-12 w-12 animate-pulse" />
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-3xl font-bold">{candidate.name}</h2>
            <p className="text-slate-400 mt-2 text-lg">Calling...</p>
          </div>
          <button onClick={onClose} className="rounded-full bg-red-500 p-6 hover:bg-red-600 transition-colors shadow-lg">
            <PhoneOff className="h-8 w-8" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 lg:p-8">
      <audio ref={audioRef} className="hidden" />
      <div className="grid h-full max-h-[900px] w-full max-w-6xl overflow-hidden rounded-[32px] bg-white shadow-2xl lg:grid-cols-[1fr_400px]">
        {/* Main Call View */}
        <div className="flex flex-col border-r border-slate-100 bg-slate-50 min-h-0 overflow-hidden">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-semibold tracking-wider text-slate-500 uppercase">
                {mode === 'result' ? 'AI Screening Result' : 'Live Interview Simulation'}
              </span>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors hover:bg-slate-100 p-2 rounded-full">
               <X className="h-6 w-6" />
            </button>
          </div>

          <div className={`flex flex-1 flex-col p-8 overflow-y-auto min-h-0 ${step === 'summary' ? '' : 'justify-center items-center'}`}>
             {step === 'ending' ? (
                <div className="text-center mx-auto">
                   <Loader2 className="h-16 w-16 text-blue-600 animate-spin mx-auto" />
                   <h3 className="mt-6 text-2xl font-bold text-slate-900">Processing Interview...</h3>
                   <p className="text-slate-500 mt-2">AI is evaluating your responses.</p>
                </div>
             ) : step === 'summary' ? (
                <div className="max-w-xl w-full mx-auto">
                   <div className="text-center mb-8">
                      <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
                         <CheckCircle className="h-10 w-10" />
                      </div>
                      <h3 className="text-3xl font-bold text-slate-900">
                        {mode === 'result' ? 'AI Screening Outcome' : 'Interview Complete'}
                      </h3>
                      <p className="text-slate-500 mt-2">
                        {mode === 'result' ? `Analyzed on ${candidate.last_interaction ? new Date(candidate.last_interaction).toLocaleDateString() : 'Recent'}` : 'Insights successfully generated'}
                      </p>
                   </div>
                   
                   {evaluation && (
                      <div className="space-y-6">

                         {mode === 'result' && (
                            <div className="grid grid-cols-1 gap-4">
                               <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Interest</p>
                                  <p className="text-sm font-bold text-slate-900 mt-1">{candidate.interest_status || candidate.interest || 'Confirmed'}</p>
                                </div>
                            </div>
                         )}

                         <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <h4 className="font-bold text-slate-900 mb-2">Recruiter Summary</h4>
                            <p className="text-slate-600 leading-relaxed text-sm">{evaluation.summary}</p>
                         </div>
                         
                         <button onClick={onClose} className="w-full bg-slate-900 text-white rounded-2xl py-4 font-bold hover:bg-slate-800 transition shadow-lg">
                            Close & Return to Dashboard
                         </button>
                      </div>
                   )}
                </div>
             ) : (
                <div className="flex flex-col items-center gap-12 w-full max-w-lg mx-auto">
                   <div className="relative">
                      <div className={`h-48 w-48 rounded-full border-4 border-blue-100 flex items-center justify-center bg-white shadow-xl transition-all duration-700 ${isAIPushing ? 'scale-110 shadow-blue-200' : 'scale-100'}`}>
                         <div className="h-40 w-40 rounded-full bg-slate-900 flex items-center justify-center text-white overflow-hidden relative">
                             {isAIPushing ? (
                                <div className="flex gap-1 items-end h-8">
                                   {[1,2,3,4,5].map(i => (
                                      <div key={i} className="w-1.5 bg-blue-400 rounded-full animate-bounce" style={{ height: `${Math.random()*100+20}%`, animationDelay: `${i*0.1}s` }} />
                                   ))}
                                </div>
                             ) : (
                                <Phone className="h-10 w-10 text-slate-400" />
                             )}
                         </div>
                      </div>
                      {isAIPushing && (
                         <span className="absolute -top-4 -right-4 bg-blue-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-lg border-2 border-white">AI Speaking</span>
                      )}
                   </div>

                   <div className="text-center">
                      <h2 className="text-3xl font-bold text-slate-900">{candidate.name}</h2>
                      <p className="text-slate-400 mt-2 uppercase tracking-widest font-bold text-xs">{isAIPushing ? 'Listening to AI...' : 'Waiting for your response'}</p>
                   </div>

                   {transcript && (
                      <div className="w-full bg-blue-50 border border-blue-100 rounded-2xl p-4 text-blue-800 text-center italic shadow-sm">
                         "{transcript}"
                      </div>
                   )}
                </div>
             )}
          </div>

          {/* Controls */}
          {step === 'live' && (
             <div className="flex items-center justify-center gap-6 p-10">
                <button 
                  onClick={toggleMic}
                  className={`flex h-16 w-16 items-center justify-center rounded-full transition-all shadow-xl ${isMicOn ? 'bg-white text-slate-600 hover:bg-slate-50' : 'bg-red-500 text-white'}`}
                >
                   {isMicOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
                </button>
                <button 
                  onClick={() => endInterview(history)}
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-red-600 text-white shadow-2xl hover:bg-red-700 transition-all hover:scale-105 active:scale-95"
                >
                   <PhoneOff className="h-8 w-8" />
                </button>
             </div>
          )}
        </div>

        {/* Info & Transcript Panel */}
        <div className="flex flex-col bg-white overflow-hidden">
           <div className="p-6 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                 <MessageSquare className="h-4 w-4 text-blue-600" />
                 Live Transcript
              </h4>
           </div>
           <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
              {history.map((msg, i) => (
                 <div key={i} className={`flex flex-col ${msg.role === 'ai' ? 'items-start' : 'items-end'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${msg.role === 'ai' ? 'bg-white text-slate-800 border border-slate-100' : 'bg-blue-600 text-white'}`}>
                       {msg.text}
                    </div>
                    <span className="text-[10px] mt-1 uppercase font-bold text-slate-400 mx-2">{msg.role === 'ai' ? 'AI Recruiter' : 'You'}</span>
                 </div>
              ))}
              {isAIPushing && (
                 <div className="flex items-center gap-2 text-slate-400 text-xs italic ml-2">
                   <Loader2 className="h-3 w-3 animate-spin" />
                   AI is typing...
                 </div>
              )}
              <div ref={transcriptEndRef} />
           </div>
           <div className="p-6 bg-white border-t border-slate-100 h-32 flex items-center justify-center">
              <div className="text-center">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                 <p className="text-xs font-semibold text-slate-900">{isAIPushing ? 'AI Interviewer speaking' : isMicOn ? 'Listening for your voice...' : 'Microphone muted'}</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewModal;
