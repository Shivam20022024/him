import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, Loader2, PlayCircle, StopCircle, RefreshCw } from 'lucide-react';
import { hiringApi } from '../../services/hiringApi';

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

interface AiRecruiterSimulatorProps {
  jobId: string;
}

const AiRecruiterSimulator: React.FC<AiRecruiterSimulatorProps> = ({ jobId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const startSimulation = async () => {
    setIsOpen(true);
    setMessages([]);
    setLoading(true);
    try {
      const response = await hiringApi.simulateAiRecruiter(jobId, []);
      setMessages([{ role: 'assistant', content: response.response }]);
    } catch (e) {
      setMessages([{ role: 'assistant', content: 'Simulation failed to start. Check API connection.' }]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    const newMessages = [...messages, { role: 'user' as const, content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    
    try {
      const response = await hiringApi.simulateAiRecruiter(jobId, newMessages);
      setMessages([...newMessages, { role: 'assistant', content: response.response }]);
    } catch (e) {
      setMessages([...newMessages, { role: 'assistant', content: 'Error: Could not reach simulator engine.' }]);
    } finally {
      setLoading(false);
    }
  };

  const quickScenarios = [
    { label: 'Interested', text: 'Yes, I am interested in this role.' },
    { label: 'Busy', text: "I'm actually quite busy right now. Can we talk later?" },
    { label: 'Callback', text: 'Call me tomorrow at 6 PM.' },
    { label: 'Not Interested', text: "I'm not interested in looking for a job." },
    { label: 'Doesn\'t Understand', text: 'Pain.' }
  ];

  if (!isOpen) {
    return (
      <button 
        onClick={startSimulation}
        className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 transition-all"
      >
        <PlayCircle className="h-5 w-5" /> Test AI Recruiter
      </button>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-[500px] overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 px-4 py-3 flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-400" />
          <span className="font-bold text-sm">Conversation Simulator</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={startSimulation} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 transition" title="Restart">
            <RefreshCw className="h-4 w-4" />
          </button>
          <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 transition" title="Stop">
            <StopCircle className="h-4 w-4 text-red-400" />
          </button>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-slate-900 text-white'}`}>
              {m.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            <div className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-sm ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-sm shadow-sm' 
                : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center flex-shrink-0">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-400 rounded-tl-sm text-sm italic">
              Typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Scenarios */}
      <div className="px-4 py-2 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
        {quickScenarios.map((s, idx) => (
          <button 
            key={idx}
            onClick={() => sendMessage(s.text)}
            disabled={loading}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition disabled:opacity-50"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-slate-200">
        <form 
          onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
          className="flex gap-2"
        >
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
            placeholder="Type a response..." 
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || loading}
            className="h-10 w-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center transition disabled:opacity-50 disabled:hover:bg-blue-600 shadow-sm"
          >
            <Send className="h-4 w-4 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiRecruiterSimulator;
