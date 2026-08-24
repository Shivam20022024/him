import React, { useState, useEffect, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { hiringApi } from '../services/hiringApi';
import { format, parseISO } from 'date-fns';

const Analytics: React.FC = () => {
  const [dateRange, setDateRange] = useState('this_month');
  const [selectedRole, setSelectedRole] = useState('all');
  
  // Dashboard Metrics
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [funnelData, setFunnelData] = useState<any>(null);
  
  // Trend Chart Controls
  const [trendMetric, setTrendMetric] = useState('candidates');
  const [trendData, setTrendData] = useState<any[]>([]);
  
  // Role Data
  const [rolesData, setRolesData] = useState<any[]>([]);
  
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
  }, [trendMetric, dateRange, selectedRole]);

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
      const data = await hiringApi.getTrendData(trendMetric, 'daily', dateRange, jobId);
      setTrendData(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleExport = async () => {
    try {
      await hiringApi.exportAnalytics('daily', 'csv', dateRange);
    } catch (e) {
      console.error("Failed to export analytics", e);
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-surface-container-high border-t-primary"></div>
          <p className="text-sm font-medium text-text-muted font-body-md">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  const { current = {}, trends = {} } = dashboardData || {};

  const StatCard = ({ title, value, trend, icon, isHired, isCallback }: any) => {
    const isPositive = trend >= 0;
    
    if (isHired) {
      return (
        <div className="bg-secondary-container p-sm rounded-xl shadow-sm flex flex-col gap-xs">
          <span className="font-label-compact text-on-secondary-container">{title}</span>
          <span className="font-headline-lg text-on-secondary-container">{value || 0}</span>
          <span className="font-label-small text-on-secondary-container/70">{trend !== undefined ? `${Math.abs(trend)}%` : ''}</span>
        </div>
      );
    }

    if (isCallback) {
      return (
        <div className="bg-surface-white p-sm rounded-xl shadow-sm flex flex-col gap-xs">
          <span className="font-label-compact text-tertiary">{title}</span>
          <span className="font-headline-lg text-tertiary">{value || 0}</span>
          <span className="font-label-small text-tertiary-fixed-dim">{trend !== undefined ? `${Math.abs(trend)}%` : ''}</span>
        </div>
      );
    }

    return (
      <div className="bg-surface-white p-sm rounded-xl shadow-sm flex flex-col gap-xs relative overflow-hidden">
        <span className="font-label-compact text-text-muted">{title}</span>
        <span className="font-headline-lg text-on-surface">{value || 0}</span>
        
        {trend !== undefined ? (
          <div className={`flex items-center gap-xs ${isPositive ? 'text-secondary' : 'text-error'}`}>
            <span className="material-symbols-outlined text-[14px]">
              {isPositive ? 'trending_up' : 'trending_down'}
            </span>
            <span className="font-label-small">{Math.abs(trend)}%</span>
          </div>
        ) : (
          <span className="font-label-small text-text-muted">N/A</span>
        )}
        
        {icon && (
          <div className="absolute right-0 bottom-0 opacity-5 w-16 h-16 translate-x-4 translate-y-4">
            <span className="material-symbols-outlined text-[64px] text-primary">{icon}</span>
          </div>
        )}
      </div>
    );
  };

  const formatChartDate = (tickItem: string) => {
    try {
      if (tickItem.includes('-')) {
        return format(parseISO(tickItem), 'd MMM');
      }
    } catch(e) {}
    return tickItem;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-on-surface text-surface-white px-sm py-xs rounded text-label-small shadow-md whitespace-nowrap flex flex-col items-center relative">
          <span className="font-bold">{payload[0].value} {trendMetric}</span>
          <span className="text-text-muted text-[10px]">{formatChartDate(label)}</span>
          <div className="w-2 h-2 bg-on-surface absolute -bottom-1 rotate-45"></div>
        </div>
      );
    }
    return null;
  };

  const metricsTabs = ['candidates', 'screened', 'calls', 'interested', 'interviews', 'hired'];

  return (
    <div className="min-h-screen bg-background">
      {/* Header handled by App layout, but we match inner spacing */}
      <div className="flex flex-col w-full pb-safe gap-md px-md max-w-container-max mx-auto">
        
        <div className="flex flex-col gap-xs pt-sm">
          <h2 className="font-headline-md text-on-surface">Hiring Analytics</h2>
          <p className="font-body-md text-text-muted">Track recruitment performance and activity.</p>
        </div>

        <div className="flex flex-wrap gap-sm py-sm">
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="appearance-none flex items-center gap-xs px-sm py-xs bg-surface-white rounded-lg shadow-sm whitespace-nowrap text-on-surface font-body-md pr-8 cursor-pointer outline-none border border-border-light/50 focus:border-primary"
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
            <span className="material-symbols-outlined text-[16px] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">arrow_drop_down</span>
          </div>

          <div className="relative">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="appearance-none flex items-center gap-xs px-sm py-xs bg-surface-white rounded-lg shadow-sm whitespace-nowrap text-on-surface font-body-md pr-8 cursor-pointer outline-none border border-border-light/50 focus:border-primary"
            >
              <option value="all">All Roles</option>
              {rolesList.map(role => (
                <option key={role.id} value={role.id}>{role.title}</option>
              ))}
            </select>
            <span className="material-symbols-outlined text-[16px] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">arrow_drop_down</span>
          </div>

          <button 
            onClick={handleExport}
            className="flex items-center gap-xs px-sm py-xs bg-surface-white rounded-lg shadow-sm whitespace-nowrap text-primary font-body-md md:ml-auto hover:bg-surface-container transition-colors border border-border-light/50"
          >
            <span className="material-symbols-outlined text-[16px]">download</span> Export
          </button>
        </div>

        {dashboardData && dashboardData.current && (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-sm">
            <StatCard title="Total Candidates" value={current.total_candidates} trend={trends.total_candidates} icon="groups" />
            <StatCard title="Screened" value={current.screened} trend={trends.screened} />
            <StatCard title="Interested" value={current.interested} trend={trends.interested} />
            <StatCard title="Callback Required" value={current.callback_required} trend={trends.callback_required} isCallback={true} />
            <StatCard title="Interviews" value={current.interviews} trend={trends.interviews} />
            <StatCard title="Hired" value={current.hired} trend={trends.hired} isHired={true} />
          </div>
        )}

        {funnelData && (
          <div className="bg-surface-white rounded-xl shadow-sm p-md flex flex-col gap-md border border-border-light/50">
            <h3 className="font-headline-sm text-on-surface">Hiring Funnel</h3>
            <div className="flex overflow-x-auto no-scrollbar pb-sm gap-md">
              
              <div className="flex flex-col items-center min-w-[60px] gap-xs relative">
                <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">person_add</span>
                </div>
                <span className="font-label-small text-text-muted text-center">Candidates</span>
                <span className="font-body-md font-semibold text-on-surface">{funnelData.candidates}</span>
              </div>
              
              <div className="flex flex-col items-center justify-center text-border-light"><span className="material-symbols-outlined">chevron_right</span></div>
              
              <div className="flex flex-col items-center min-w-[60px] gap-xs relative">
                <div className="w-10 h-10 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">fact_check</span>
                </div>
                <span className="font-label-small text-text-muted text-center">Screened</span>
                <span className="font-body-md font-semibold text-on-surface">{funnelData.screened}</span>
              </div>
              
              <div className="flex flex-col items-center justify-center text-border-light"><span className="material-symbols-outlined">chevron_right</span></div>
              
              <div className="flex flex-col items-center min-w-[60px] gap-xs relative">
                <div className="w-10 h-10 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">thumb_up</span>
                </div>
                <span className="font-label-small text-text-muted text-center">Interested</span>
                <span className="font-body-md font-semibold text-on-surface">{funnelData.interested}</span>
              </div>
              
              <div className="flex flex-col items-center justify-center text-border-light"><span className="material-symbols-outlined">chevron_right</span></div>
              
              <div className="flex flex-col items-center min-w-[60px] gap-xs relative">
                <div className="w-10 h-10 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">forum</span>
                </div>
                <span className="font-label-small text-text-muted text-center">Interview</span>
                <span className="font-body-md font-semibold text-on-surface">{funnelData.interview}</span>
              </div>

              <div className="flex flex-col items-center justify-center text-border-light"><span className="material-symbols-outlined">chevron_right</span></div>
              
              <div className="flex flex-col items-center min-w-[60px] gap-xs relative">
                <div className="w-10 h-10 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
                </div>
                <span className="font-label-small text-text-muted text-center">Selected</span>
                <span className="font-body-md font-semibold text-on-surface">{funnelData.selected}</span>
              </div>
              
              <div className="flex flex-col items-center justify-center text-border-light"><span className="material-symbols-outlined">chevron_right</span></div>
              
              <div className="flex flex-col items-center min-w-[60px] gap-xs relative">
                <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">celebration</span>
                </div>
                <span className="font-label-small text-text-muted text-center">Hired</span>
                <span className="font-body-md font-semibold text-on-surface">{funnelData.hired}</span>
              </div>
              
            </div>
          </div>
        )}

        <div className="bg-surface-white rounded-xl shadow-sm p-md flex flex-col gap-md border border-border-light/50">
          <div className="flex justify-between items-center">
            <h3 className="font-headline-sm text-on-surface">Hiring Activity</h3>
          </div>
          
          <div className="flex gap-xs overflow-x-auto no-scrollbar pb-xs">
            {metricsTabs.map(metric => (
              <button 
                key={metric}
                onClick={() => setTrendMetric(metric)}
                className={`px-sm py-xs rounded-full font-label-small whitespace-nowrap capitalize transition-colors ${
                  trendMetric === metric 
                    ? 'bg-primary-container text-on-primary-container'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {metric}
              </button>
            ))}
          </div>
          
          <div className="h-64 w-full relative mt-sm">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#0052cc" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#0052cc" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DFE1E6" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#6B778C', fontSize: 10, fontFamily: 'Inter'}} 
                    dy={10}
                    tickFormatter={formatChartDate}
                    minTickGap={30}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B778C', fontSize: 10, fontFamily: 'Inter'}} />
                  <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: '#DFE1E6', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#0052cc" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#areaGradient)" 
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#003d9b' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-text-muted font-body-md">
                No activity data available.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
