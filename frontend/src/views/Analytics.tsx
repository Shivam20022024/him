import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell
} from 'recharts';
import { hiringApi } from '../services/hiringApi';
import { Users, FileSearch, PhoneCall, Heart, Clock, Calendar, CheckCircle, Briefcase, Download, Filter, TrendingUp, TrendingDown, MoreHorizontal, ChevronRight, AlertCircle, PhoneMissed, Mic } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const Analytics: React.FC = () => {
  const [dateRange, setDateRange] = useState('this_month');
  const [selectedRole, setSelectedRole] = useState('all');
  
  // Dashboard Metrics
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [funnelData, setFunnelData] = useState<any>(null);
  
  // Trend Chart Controls
  const [trendMetric, setTrendMetric] = useState('candidates');
  const [trendPeriod, setTrendPeriod] = useState('daily');
  const [trendData, setTrendData] = useState<any[]>([]);
  
  // Role Chart Controls
  const [roleChartMetric, setRoleChartMetric] = useState('candidates');
  const [rolesData, setRolesData] = useState<any[]>([]);
  
  // Report Table Controls
  const [reportPeriod, setReportPeriod] = useState('daily');
  const [reportData, setReportData] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);

  // Available roles for filter dropdown
  const rolesList = useMemo(() => {
    return rolesData.filter(r => r.job_id).map(r => ({ id: r.job_id, title: r.role }));
  }, [rolesData]);

  useEffect(() => {
    fetchDashboardAndRoles();
  }, [dateRange, selectedRole]);

  useEffect(() => {
    fetchTrendData();
  }, [trendMetric, trendPeriod, dateRange, selectedRole]);

  useEffect(() => {
    fetchReportData();
  }, [reportPeriod, dateRange, selectedRole]);

  const fetchDashboardAndRoles = async () => {
    setLoading(true);
    try {
      const jobId = selectedRole === 'all' ? undefined : selectedRole;
      const [dash, funnel, roles] = await Promise.all([
        hiringApi.getDashboardMetrics(dateRange, jobId),
        hiringApi.getFunnelMetrics(dateRange, jobId),
        hiringApi.getRoleMetrics(dateRange)
      ]);
      setDashboardData(dash);
      setFunnelData(funnel);
      setRolesData(roles);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendData = async () => {
    try {
      const jobId = selectedRole === 'all' ? undefined : selectedRole;
      const data = await hiringApi.getTrendData(trendMetric, trendPeriod, dateRange, jobId);
      setTrendData(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchReportData = async () => {
    try {
      const jobId = selectedRole === 'all' ? undefined : selectedRole;
      const data = await hiringApi.getReportData(reportPeriod, dateRange, jobId);
      setReportData(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleExport = async () => {
    try {
      await hiringApi.exportAnalytics(reportPeriod, 'csv', dateRange);
    } catch (e) {
      console.error("Failed to export analytics", e);
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
          <p className="text-sm font-medium text-slate-500">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  const { current = {}, previous = {}, trends = {} } = dashboardData || {};

  const StatCard = ({ title, value, trend, icon: Icon }: any) => {
    const isPositive = trend >= 0;
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</p>
            <h3 className="mt-2 text-3xl font-black text-slate-900">{value || 0}</h3>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1.5">
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-xs font-bold ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
              {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
          <span className="text-xs font-medium text-slate-400">vs previous period</span>
        </div>
      </div>
    );
  };

  const FunnelStage = ({ label, count, total, nextCount }: any) => {
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    const conversion = count > 0 && nextCount !== undefined ? Math.round((nextCount / count) * 100) : null;
    return (
      <div className="flex flex-1 flex-col items-center relative group">
        <div className="mb-3 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-black text-slate-900">{count || 0}</p>
        </div>
        <div className="w-full px-2">
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
            <div 
              className="h-full rounded-full bg-blue-500 transition-all duration-1000" 
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
        {conversion !== null && (
          <div className="absolute -right-4 top-1/2 -mt-2 hidden z-10 lg:block">
            <div className="flex flex-col items-center">
              <span className="bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                {conversion}%
              </span>
              <ChevronRight className="h-4 w-4 text-slate-300 mt-1" />
            </div>
          </div>
        )}
      </div>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      let displayLabel = label;
      try {
        if (displayLabel.includes('-')) {
           displayLabel = format(parseISO(label), 'd MMM yyyy');
        }
      } catch (e) {}

      return (
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
          <p className="mb-2 text-xs font-bold text-slate-500">{displayLabel}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-slate-700 capitalize">{entry.name}</span>
              <span className="text-sm font-black text-slate-900">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const unassignedRole = rolesData.find(r => r.job_id === null || r.role === 'Unassigned Candidates');
  const validRolesData = rolesData.filter(r => r.job_id !== null && r.role !== 'Unassigned Candidates');

  const formatChartDate = (tickItem: string) => {
    try {
      if (trendPeriod === 'daily' && tickItem.includes('-')) {
        return format(parseISO(tickItem), 'd MMM');
      }
      if (trendPeriod === 'monthly' && tickItem.includes('-')) {
        const parts = tickItem.split('-');
        if(parts.length >= 2) {
          const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
          return format(d, 'MMM yyyy');
        }
      }
    } catch(e) {}
    return tickItem;
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px] space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Hiring Analytics</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">Track recruitment performance, candidate activity, and hiring outcomes.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm font-bold text-slate-700 shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 cursor-pointer"
            >
              <option value="all">All Roles</option>
              {rolesList.map(role => (
                <option key={role.id} value={role.id}>{role.title}</option>
              ))}
            </select>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm font-bold text-slate-700 shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 cursor-pointer"
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
            <button 
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-slate-800 hover:shadow-md"
            >
              <Download className="h-4 w-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        {dashboardData && dashboardData.current && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard title="Total Candidates" value={current.total_candidates} trend={trends.total_candidates} icon={Users} />
            <StatCard title="Screened" value={current.screened} trend={trends.screened} icon={FileSearch} />
            <StatCard title="Interested" value={current.interested} trend={trends.interested} icon={Heart} />
            <StatCard title="Callbacks" value={current.callback_required} trend={trends.callback_required} icon={PhoneCall} />
            <StatCard title="Interviews" value={current.interviews} trend={trends.interviews} icon={Calendar} />
            <StatCard title="Hired" value={current.hired} trend={trends.hired} icon={CheckCircle} />
          </div>
        )}

        {/* Hiring Funnel */}
        {funnelData && (
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:p-8">
            <div className="mb-8">
              <h3 className="text-lg font-black text-slate-900">Hiring Funnel</h3>
              <p className="text-sm font-medium text-slate-500">Candidate progression through the recruitment process.</p>
            </div>
            
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-0">
              <FunnelStage label="Candidates" count={funnelData.candidates} total={funnelData.candidates} nextCount={funnelData.screened} />
              <FunnelStage label="Screened" count={funnelData.screened} total={funnelData.candidates} nextCount={funnelData.interested} />
              <FunnelStage label="Interested" count={funnelData.interested} total={funnelData.candidates} nextCount={funnelData.interview} />
              <FunnelStage label="Interview" count={funnelData.interview} total={funnelData.candidates} nextCount={funnelData.selected} />
              <FunnelStage label="Selected" count={funnelData.selected} total={funnelData.candidates} nextCount={funnelData.hired} />
              <FunnelStage label="Hired" count={funnelData.hired} total={funnelData.candidates} />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* Activity Trend */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-8">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <h3 className="text-lg font-black text-slate-900">Hiring Activity</h3>
                <p className="mt-1 text-sm font-medium text-slate-500">Candidate activity over the selected period.</p>
              </div>
              <div className="flex flex-col gap-2 sm:items-end">
                <div className="flex overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-1">
                  {['candidates', 'screened', 'calls', 'interested', 'interviews', 'hired'].map(metric => (
                    <button
                      key={metric}
                      onClick={() => setTrendMetric(metric)}
                      className={`rounded-md px-3 py-1.5 text-xs font-bold capitalize transition-all ${
                        trendMetric === metric 
                          ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50' 
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      {metric}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Period:</span>
                  <select 
                    value={trendPeriod}
                    onChange={(e) => setTrendPeriod(e.target.value)}
                    className="cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white py-1 pl-3 pr-8 text-xs font-bold text-slate-700 outline-none hover:bg-slate-50"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="h-[320px] w-full">
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} 
                      dy={10}
                      tickFormatter={formatChartDate}
                      minTickGap={30}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} />
                    <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      name={trendMetric}
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorCount)" 
                      activeDot={{ r: 6, strokeWidth: 0, fill: '#2563eb' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
                  <p className="text-sm font-medium text-slate-500">No activity data for this period.</p>
                </div>
              )}
            </div>
          </div>

          {/* Role Performance */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-4">
            <div className="mb-6">
              <h3 className="text-lg font-black text-slate-900">Role Performance</h3>
              <p className="mt-1 text-sm font-medium text-slate-500">Compare recruitment outcomes.</p>
            </div>
            
            <div className="mb-6">
              <select 
                value={roleChartMetric}
                onChange={(e) => setRoleChartMetric(e.target.value)}
                className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-4 pr-10 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="candidates">Candidates</option>
                <option value="screened">Screened</option>
                <option value="interested">Interested</option>
                <option value="interviews">Interviews</option>
                <option value="hired">Hired</option>
              </select>
            </div>

            <div className="h-[260px] w-full">
              {validRolesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={validRolesData} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 600}} />
                    <YAxis dataKey="role" type="category" axisLine={false} tickLine={false} tick={false} />
                    <RechartsTooltip 
                      cursor={{fill: '#f8fafc'}}
                      content={({ active, payload }: any) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
                              <p className="mb-1 text-xs font-bold text-slate-500">{payload[0].payload.role}</p>
                              <p className="text-sm font-black text-blue-600">
                                {payload[0].value} <span className="font-medium text-slate-600 capitalize">{roleChartMetric}</span>
                              </p>
                            </div>
                          )
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey={roleChartMetric} fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
                  <p className="text-sm font-medium text-slate-500">No role data available.</p>
                </div>
              )}
            </div>
            
            {/* Custom Y-Axis Labels overlay for better truncation handling */}
            <div className="mt-4 space-y-3 max-h-[100px] overflow-y-auto pr-2">
               {validRolesData.map((role, idx) => (
                 <div key={idx} className="flex items-center justify-between text-xs">
                   <div className="flex items-center gap-2 truncate">
                     <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                     <span className="font-bold text-slate-700 truncate" title={role.role}>{role.role}</span>
                   </div>
                   <span className="font-black text-slate-900 ml-2">{role[roleChartMetric]}</span>
                 </div>
               ))}
            </div>

            {unassignedRole && unassignedRole.candidates > 0 && (
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div>
                  <p className="text-xs font-bold text-amber-800">{unassignedRole.candidates} candidates are unassigned.</p>
                  <p className="mt-1 text-[11px] font-medium text-amber-700/80">These candidates are not associated with any active job role.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Role-Wise Analytics Table */}
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-5">
            <h3 className="text-lg font-black text-slate-900">Role-Wise Analytics</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Role</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-right">Candidates</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-right">Screened</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-right">Interested</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-right">Interviews</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-right">Hired</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-right">Conversion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {validRolesData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center">
                        <Briefcase className="h-8 w-8 text-slate-300 mb-3" />
                        <p className="font-bold text-slate-900">No active roles found</p>
                        <p className="text-sm mt-1">Publish a job to see role-wise analytics.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  validRolesData.map((role) => {
                    const conversion = role.candidates > 0 ? ((role.hired / role.candidates) * 100).toFixed(1) : "0.0";
                    return (
                      <tr key={role.job_id} className="group transition-colors hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                              <Briefcase className="h-4 w-4" />
                            </div>
                            <span className="font-bold text-slate-900">{role.role}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-black text-slate-900">{role.candidates}</td>
                        <td className="px-6 py-4 text-right font-semibold text-slate-600">{role.screened}</td>
                        <td className="px-6 py-4 text-right font-bold text-emerald-600">{role.interested}</td>
                        <td className="px-6 py-4 text-right font-semibold text-slate-600">{role.interviews}</td>
                        <td className="px-6 py-4 text-right font-black text-slate-900">{role.hired}</td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
                            {conversion}%
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Time-Based Reporting */}
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <h3 className="text-lg font-black text-slate-900">Hiring Reporting</h3>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              {['daily', 'weekly', 'monthly'].map(period => (
                <button
                  key={period}
                  onClick={() => setReportPeriod(period)}
                  className={`px-4 py-1.5 text-xs font-bold capitalize rounded-md transition-all ${
                    reportPeriod === period ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Period</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-right">Candidates</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-right">Screened</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-right">Calls</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-right">Interested</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-right">Interviews</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-right">Hired</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500 font-medium">No reporting data for this timeframe.</td>
                  </tr>
                ) : (
                  reportData.map((row, idx) => (
                    <tr key={idx} className="transition-colors hover:bg-slate-50">
                      <td className="px-6 py-4 font-bold text-slate-900">{formatChartDate(row.date)}</td>
                      <td className="px-6 py-4 text-right font-black text-slate-900">{row.candidates}</td>
                      <td className="px-6 py-4 text-right font-medium text-slate-600">{row.screened}</td>
                      <td className="px-6 py-4 text-right font-medium text-slate-600">{row.calls}</td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-600">{row.interested}</td>
                      <td className="px-6 py-4 text-right font-medium text-slate-600">{row.interviews}</td>
                      <td className="px-6 py-4 text-right font-black text-slate-900">{row.hired}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Callback Analytics */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-black text-slate-900">AI Call Analytics</h3>
            <p className="mt-1 text-sm font-medium text-slate-500">Performance of the automated voice screening agent.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                <Mic className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Calls Completed</p>
                <p className="text-2xl font-black text-slate-900">{current.calls_completed || 0}</p>
              </div>
            </div>
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                <PhoneMissed className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Callback Required</p>
                <p className="text-2xl font-black text-slate-900">{current.callback_required || 0}</p>
              </div>
            </div>
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Heart className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Interested Yield</p>
                <p className="text-2xl font-black text-slate-900">
                  {current.calls_completed > 0 ? Math.round((current.interested / current.calls_completed) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
