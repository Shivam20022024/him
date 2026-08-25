import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, Cell 
} from 'recharts';
import { 
  Users, BrainCircuit, PhoneCall, Heart, Calendar, Briefcase, Download, Clock, Star, Phone, CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react';
import { hiringApi } from '../services/hiringApi';
import { Job, Candidate } from '../types';
import { format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];
const MATCH_COLORS = { high: '#10b981', medium: '#f59e0b', low: '#ef4444' };

const Analytics: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [dateRange, setDateRange] = useState('this_month');
  const [selectedJob, setSelectedJob] = useState('all');
  
  // Data State
  const [jobs, setJobs] = useState<Job[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [funnel, setFunnel] = useState<any>(null);
  const [rolesData, setRolesData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [reportData, setReportData] = useState<any[]>([]);
  const [callbacks, setCallbacks] = useState<Candidate[]>([]);
  const [aiScreening, setAiScreening] = useState<any>(null);
  
  // Chart Tabs
  const [activeTrendTab, setActiveTrendTab] = useState<'candidates' | 'screened' | 'calls' | 'interviews' | 'hired'>('candidates');

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [dateRange, selectedJob]);

  const fetchJobs = async () => {
    try {
      const data = await hiringApi.getJobs();
      setJobs(data);
    } catch (e) {
      console.error("Failed to load jobs", e);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const jobId = selectedJob === 'all' ? undefined : selectedJob;
      const [dash, funl, rls, trnd, rpt, cbs, ai] = await Promise.all([
        hiringApi.getDashboardMetrics(dateRange, jobId),
        hiringApi.getFunnelMetrics(dateRange, jobId),
        hiringApi.getRoleMetrics(dateRange),
        hiringApi.getTrendData(activeTrendTab, dateRange === 'this_month' || dateRange === 'last_month' ? 'daily' : 'weekly', dateRange, jobId),
        hiringApi.getReportData('daily', dateRange, jobId),
        hiringApi.getCallbackAnalytics(jobId),
        hiringApi.getAiScreeningAnalytics(dateRange, jobId)
      ]);
      
      setDashboard(dash);
      setFunnel(funl);
      setRolesData(rls);
      setTrendData(trnd);
      setReportData(rpt);
      setCallbacks(cbs);
      setAiScreening(ai);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch trend when tab changes
  useEffect(() => {
    const fetchTrend = async () => {
      const jobId = selectedJob === 'all' ? undefined : selectedJob;
      const trnd = await hiringApi.getTrendData(activeTrendTab, dateRange === 'this_month' || dateRange === 'last_month' ? 'daily' : 'weekly', dateRange, jobId);
      setTrendData(trnd);
    };
    fetchTrend();
  }, [activeTrendTab]);

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      await hiringApi.exportAnalytics('daily', format, dateRange);
    } catch (e) {
      console.error("Failed to export analytics", e);
    }
  };

  const { current = {}, trends = {} } = dashboard || {};

  // --- Components --- //

  const KPICard = ({ title, value, trend, icon: Icon, valueColor = "text-slate-900" }: any) => {
    const isPositive = trend > 0;
    const isNeutral = trend === 0;
    return (
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</span>
          <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
            <Icon size={18} />
          </div>
        </div>
        <div>
          <h4 className={`text-3xl font-black ${valueColor} leading-none mb-2`}>{value || 0}</h4>
          {trend !== undefined && (
            <div className={`text-xs font-semibold flex items-center gap-1 ${isPositive ? 'text-emerald-600' : isNeutral ? 'text-slate-400' : 'text-red-500'}`}>
              {isPositive ? '↑' : isNeutral ? '−' : '↓'} {Math.abs(trend)}% vs previous
            </div>
          )}
        </div>
      </div>
    );
  };

  const ProgressBar = ({ label, percentage, colorClass }: { label: string, percentage: number, colorClass: string }) => (
    <div className="mb-4">
      <div className="flex justify-between text-sm font-semibold mb-1">
        <span className="text-slate-700">{label}</span>
        <span className="text-slate-900">{percentage}%</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2.5">
        <div className={`h-2.5 rounded-full ${colorClass}`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );

  const calculateRate = (part: number, whole: number) => {
    if (!whole || whole === 0) return 0;
    return Math.round((part / whole) * 100);
  };

  if (loading && !dashboard) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <p className="text-sm font-medium">Loading Enterprise Analytics...</p>
        </div>
      </div>
    );
  }

  // Derived Rates
  const screeningRate = calculateRate(current.screened, current.total_candidates);
  const interestRate = calculateRate(current.interested, current.calls_completed);
  const interviewRate = calculateRate(current.interviews, current.interested);
  const hiringRate = calculateRate(current.hired, current.total_candidates);

  return (
    <div className="min-h-screen bg-[#f8fbff] p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Hiring Analytics</h1>
            <p className="text-slate-500 font-medium mt-1">Track recruitment performance, conversion, and hiring outcomes across roles.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleExport('csv')} className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 transition shadow-sm">
              <Download size={16} /> Export CSV
            </button>
            <button onClick={() => handleExport('excel')} className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-[0_4px_14px_0_rgba(37,99,235,0.39)]">
              <Download size={16} /> Export Excel
            </button>
          </div>
        </div>

        {/* --- FILTER BAR --- */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Date Range</label>
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 font-semibold appearance-none"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="this_week">This Week</option>
              <option value="last_7_days">Last 7 Days</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="this_quarter">This Quarter</option>
              <option value="this_year">This Year</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Job Role</label>
            <select 
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 font-semibold appearance-none"
            >
              <option value="all">All Jobs</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>{job.title}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5 flex-1 min-w-[150px] opacity-50 pointer-events-none">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Location</label>
            <select className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl block w-full p-2.5 font-semibold">
              <option>All Locations</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchAllData} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition">
              Apply Filters
            </button>
            <button onClick={() => { setDateRange('this_month'); setSelectedJob('all'); }} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition">
              Reset
            </button>
          </div>
        </div>

        {/* --- KPI CARDS --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard title="Total Candidates" value={current.total_candidates} trend={trends.total_candidates} icon={Users} />
          <KPICard title="AI Screened" value={current.screened} trend={trends.screened} icon={BrainCircuit} />
          <KPICard title="Calls Completed" value={current.calls_completed} trend={trends.calls_completed} icon={Phone} />
          <KPICard title="Interested" value={current.interested} trend={trends.interested} icon={Heart} valueColor="text-blue-600" />
          <KPICard title="Interviews" value={current.interviews} trend={trends.interviews} icon={Calendar} />
          <KPICard title="Selected" value={current.selected} trend={trends.selected} icon={CheckCircle2} />
          <KPICard title="Hired" value={current.hired} trend={trends.hired} icon={Star} valueColor="text-emerald-600" />
          <KPICard title="Callbacks Needed" value={current.callback_required} trend={trends.callback_required} icon={AlertCircle} valueColor="text-orange-500" />
        </div>

        {/* --- FUNNEL --- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
          <h3 className="text-lg font-black text-slate-900 tracking-tight mb-6">Hiring Funnel</h3>
          <div className="flex items-center min-w-[800px] justify-between px-4 pb-4">
            {[
              { label: 'Candidates Applied', value: funnel?.candidates || 0, color: 'bg-blue-50 text-blue-600 border-blue-200' },
              { label: 'AI Screened', value: funnel?.screened || 0, color: 'bg-blue-100 text-blue-700 border-blue-300', rate: `${calculateRate(funnel?.screened, funnel?.candidates)}% screened` },
              { label: 'Calls', value: current.calls_completed || 0, color: 'bg-blue-200 text-blue-800 border-blue-400', rate: `${calculateRate(current.calls_completed, funnel?.screened)}% reached` },
              { label: 'Interested', value: funnel?.interested || 0, color: 'bg-indigo-100 text-indigo-700 border-indigo-300', rate: `${calculateRate(funnel?.interested, current.calls_completed)}% interested` },
              { label: 'Interviews', value: funnel?.interview || 0, color: 'bg-indigo-200 text-indigo-800 border-indigo-400', rate: `${calculateRate(funnel?.interview, funnel?.interested)}% interviewed` },
              { label: 'Selected', value: funnel?.selected || 0, color: 'bg-emerald-50 text-emerald-700 border-emerald-200', rate: `${calculateRate(funnel?.selected, funnel?.interview)}% selected` },
              { label: 'Hired', value: funnel?.hired || 0, color: 'bg-emerald-100 text-emerald-800 border-emerald-300', rate: `${calculateRate(funnel?.hired, funnel?.candidates)}% hired (overall)` }
            ].map((stage, idx, arr) => (
              <React.Fragment key={stage.label}>
                <div className="flex flex-col items-center relative z-10 w-24">
                  <div className={`h-16 w-16 rounded-2xl flex items-center justify-center text-xl font-black border-2 ${stage.color} mb-3 shadow-sm`}>
                    {stage.value}
                  </div>
                  <span className="text-xs font-bold text-slate-600 text-center uppercase tracking-wide leading-tight">{stage.label}</span>
                </div>
                {idx < arr.length - 1 && (
                  <div className="flex-1 flex flex-col items-center justify-center -mx-4 z-0">
                    <div className="h-0.5 w-full bg-slate-200 relative top-2"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4 bg-white px-2 relative">{arr[idx+1].rate}</span>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* --- TREND & ROLE PERF --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
            <div className="flex flex-col items-start gap-4 mb-6">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Recruitment Activity</h3>
              <div className="flex flex-wrap bg-slate-100 p-1 rounded-lg w-full sm:w-auto">
                {['candidates', 'screened', 'calls', 'interviews', 'hired'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTrendTab(tab as any)}
                    className={`px-3 py-1 text-xs font-bold capitalize rounded-md transition ${activeTrendTab === tab ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-64 w-full">
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                    <RechartsTooltip 
                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'}}
                      labelStyle={{fontWeight: 'bold', color: '#0f172a', marginBottom: '4px'}}
                    />
                    <Area type="monotone" dataKey="count" name={activeTrendTab} stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium border border-dashed border-slate-200 rounded-xl">No trend data available</div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
            <h3 className="text-lg font-black text-slate-900 tracking-tight mb-6">Performance by Role</h3>
            <div className="h-64 w-full overflow-y-auto">
               {rolesData.length > 0 ? (
                 <div className="space-y-4 pr-2">
                   {rolesData.map(role => (
                     <div key={role.job_id} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                       <div className="flex justify-between items-center mb-2">
                         <span className="font-bold text-slate-900">{role.role}</span>
                         <span className="text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">{role.candidates} candidates</span>
                       </div>
                       <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-600 mt-3">
                         <div className="flex items-center gap-1"><BrainCircuit size={12} className="text-blue-500"/> {role.screened} Screened</div>
                         <div className="flex items-center gap-1"><Heart size={12} className="text-pink-500"/> {role.interested} Interested</div>
                         <div className="flex items-center gap-1"><Calendar size={12} className="text-indigo-500"/> {role.interviews} Interviews</div>
                         <div className="flex items-center gap-1"><Star size={12} className="text-emerald-500"/> {role.hired} Hired</div>
                       </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium border border-dashed border-slate-200 rounded-xl">No roles data available</div>
               )}
            </div>
          </div>
        </div>

        {/* --- CONVERSION & AI --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-black text-slate-900 tracking-tight mb-6">Conversion Rates</h3>
            <ProgressBar label="Screening Rate" percentage={screeningRate} colorClass="bg-blue-500" />
            <ProgressBar label="Interest Rate" percentage={interestRate} colorClass="bg-indigo-500" />
            <ProgressBar label="Interview Rate" percentage={interviewRate} colorClass="bg-purple-500" />
            <ProgressBar label="Selection Rate" percentage={calculateRate(current.selected, current.interviews)} colorClass="bg-emerald-400" />
            <ProgressBar label="Hiring Rate" percentage={hiringRate} colorClass="bg-emerald-600" />
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-black text-slate-900 tracking-tight mb-6">AI Screening Performance</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                <BrainCircuit className="h-7 w-7 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Average Match</p>
                <h4 className="text-2xl font-black text-slate-900">{aiScreening?.avg_score || 0}%</h4>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg">
                <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div> High Match (80-100)
                </span>
                <span className="font-black text-slate-900">{aiScreening?.high_match || 0}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg">
                <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div> Medium Match (60-79)
                </span>
                <span className="font-black text-slate-900">{aiScreening?.medium_match || 0}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg">
                <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div> Low Match (&lt;60)
                </span>
                <span className="font-black text-slate-900">{aiScreening?.low_match || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-black text-slate-900 tracking-tight mb-6">Callback Analytics</h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-1">Total Requests</span>
                <span className="text-xl font-black text-slate-900">{current.callback_required || 0}</span>
              </div>
              <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
                <span className="text-[10px] font-bold uppercase tracking-widest text-orange-600 block mb-1">Upcoming</span>
                <span className="text-xl font-black text-orange-700">{callbacks.length}</span>
              </div>
            </div>

            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Pending Callbacks</h4>
            {callbacks.length > 0 ? (
              <div className="space-y-2 h-32 overflow-y-auto">
                {callbacks.map(c => (
                  <div key={c.id} className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-slate-50 transition cursor-pointer" onClick={() => navigate(`/hiring?jobId=${c.job_id}`)}>
                    <div className="font-bold text-slate-900 truncate mr-2">{c.name}</div>
                    <div className="text-xs font-semibold text-slate-500 whitespace-nowrap bg-white border border-slate-200 px-2 rounded">{c.role}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-400 font-medium py-4 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">No pending callbacks</div>
            )}
          </div>
        </div>

        {/* --- TABLES --- */}
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
            <h3 className="text-lg font-black text-slate-900 tracking-tight mb-6">Role-Wise Detail</h3>
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="pb-3 pr-4">Role</th>
                  <th className="pb-3 px-4">Candidates</th>
                  <th className="pb-3 px-4">Screened</th>
                  <th className="pb-3 px-4">Calls</th>
                  <th className="pb-3 px-4">Interested</th>
                  <th className="pb-3 px-4">Callbacks</th>
                  <th className="pb-3 px-4">Interviews</th>
                  <th className="pb-3 px-4">Selected</th>
                  <th className="pb-3 px-4">Hired</th>
                  <th className="pb-3 pl-4 text-right">Conversion</th>
                </tr>
              </thead>
              <tbody className="text-sm font-semibold text-slate-700">
                {rolesData.length > 0 ? rolesData.map((role, idx) => (
                  <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition cursor-pointer" onClick={() => setSelectedJob(role.job_id)}>
                    <td className="py-4 pr-4 font-black text-slate-900 text-blue-600 hover:underline">{role.role}</td>
                    <td className="py-4 px-4">{role.candidates}</td>
                    <td className="py-4 px-4">{role.screened}</td>
                    <td className="py-4 px-4">{role.calls_completed}</td>
                    <td className="py-4 px-4 text-blue-600">{role.interested}</td>
                    <td className="py-4 px-4 text-orange-500">{role.callbacks}</td>
                    <td className="py-4 px-4">{role.interviews}</td>
                    <td className="py-4 px-4">{role.selected}</td>
                    <td className="py-4 px-4 text-emerald-600">{role.hired}</td>
                    <td className="py-4 pl-4 text-right">{calculateRate(role.hired, role.candidates)}%</td>
                  </tr>
                )) : (
                  <tr><td colSpan={10} className="py-8 text-center text-slate-400">No role data available</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
            <h3 className="text-lg font-black text-slate-900 tracking-tight mb-6">Daily Recruitment Activity</h3>
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 px-4">Candidates</th>
                  <th className="pb-3 px-4">Screened</th>
                  <th className="pb-3 px-4">Calls</th>
                  <th className="pb-3 px-4">Interested</th>
                  <th className="pb-3 px-4">Callbacks</th>
                  <th className="pb-3 px-4">Interviews</th>
                  <th className="pb-3 pl-4">Hired</th>
                </tr>
              </thead>
              <tbody className="text-sm font-semibold text-slate-700">
                {reportData.length > 0 ? reportData.map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                    <td className="py-3 pr-4 font-bold">{row.date}</td>
                    <td className="py-3 px-4">{row.candidates}</td>
                    <td className="py-3 px-4">{row.screened}</td>
                    <td className="py-3 px-4">{row.calls}</td>
                    <td className="py-3 px-4 text-blue-600">{row.interested}</td>
                    <td className="py-3 px-4 text-orange-500">{row.callbacks}</td>
                    <td className="py-3 px-4">{row.interviews}</td>
                    <td className="py-3 pl-4 text-emerald-600">{row.hired}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={8} className="py-8 text-center text-slate-400">No activity data available for this period</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>



      </div>
    </div>
  );
};

export default Analytics;
