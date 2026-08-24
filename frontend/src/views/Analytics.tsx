import React, { useState, useEffect, useMemo } from 'react';
import { hiringApi } from '../services/hiringApi';
import { Candidate } from '../types';
import CandidateTable from '../components/CandidateTable';

const Analytics: React.FC = () => {
  const [dateRange, setDateRange] = useState('today');
  const [selectedRole, setSelectedRole] = useState('all');

  // Dashboard Metrics
  const [dashboardData, setDashboardData] = useState<any>(null);

  // Role Data
  const [rolesData, setRolesData] = useState<any[]>([]);

  // Candidates matching the current filters
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);

  const [loading, setLoading] = useState(true);

  // Available roles for filter dropdown
  const rolesList = useMemo(() => {
    return rolesData.filter(r => r.job_id).map(r => ({ id: r.job_id, title: r.role }));
  }, [rolesData]);

  useEffect(() => {
    fetchDashboardAndRoles();
  }, [dateRange, selectedRole]);

  useEffect(() => {
    fetchFilteredCandidates();
  }, [dateRange, selectedRole]);

  const fetchDashboardAndRoles = async () => {
    setLoading(true);
    try {
      const jobId = selectedRole === 'all' ? undefined : selectedRole;
      const [dash, roles] = await Promise.all([
        hiringApi.getDashboardMetrics(dateRange, jobId),
        hiringApi.getRoleMetrics(dateRange)
      ]);
      setDashboardData(dash);
      setRolesData(roles);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredCandidates = async () => {
    setCandidatesLoading(true);
    try {
      const jobId = selectedRole === 'all' ? undefined : selectedRole;
      const data = await hiringApi.getAnalyticsCandidates(dateRange, jobId);
      setFilteredCandidates(data);
    } catch (e) {
      console.error(e);
    } finally {
      setCandidatesLoading(false);
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

  const StatCard = ({ title, value, trend, icon, isCallback }: any) => {
    const isPositive = trend >= 0;

    if (isCallback) {
      return (
        <div className="bg-surface-white p-sm rounded-xl shadow-sm flex flex-col gap-xs">
          <span className="text-sm font-bold uppercase tracking-wider text-tertiary">{title}</span>
          <span className="font-headline-lg text-tertiary">{value || 0}</span>
          <span className="font-label-small text-tertiary-fixed-dim">{trend !== undefined ? `${Math.abs(trend)}%` : ''}</span>
        </div>
      );
    }

    return (
      <div className="bg-surface-white p-sm rounded-xl shadow-sm flex flex-col gap-xs relative overflow-hidden">
        <span className="text-sm font-bold uppercase tracking-wider text-slate-700">{title}</span>
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
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header handled by App layout, but we match inner spacing */}
      <div className="flex flex-col w-full pb-safe gap-md px-md max-w-container-max mx-auto">
        
        <div className="flex flex-col gap-xs pt-sm">
          <h2 className="font-headline-md font-bold text-on-surface">Hiring Analytics</h2>
          <p className="font-body-md font-bold text-text-muted">Track recruitment performance and activity.</p>
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-sm">
            <StatCard title="Total Candidates" value={current.total_candidates} trend={trends.total_candidates} icon="groups" />
            <StatCard title="Screened" value={current.screened} trend={trends.screened} />
            <StatCard title="Interested" value={current.interested} trend={trends.interested} />
            <StatCard title="Callback Required" value={current.callback_required} trend={trends.callback_required} isCallback={true} />
          </div>
        )}

        <div className="flex flex-col gap-sm pt-sm">
          <div className="flex items-center gap-3">
            <h3 className="font-headline-sm text-on-surface">Candidates</h3>
            <div className="flex h-6 min-w-[24px] items-center justify-center rounded-lg bg-surface-white border border-border-light/50 px-1.5">
              <span className="text-xs font-bold text-primary">{filteredCandidates.length}</span>
            </div>
          </div>

          {candidatesLoading ? (
            <div className="flex justify-center py-10">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-surface-container-high border-t-primary"></div>
            </div>
          ) : (
            <CandidateTable candidates={filteredCandidates} />
          )}
        </div>

      </div>
    </div>
  );
};

export default Analytics;
