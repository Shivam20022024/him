import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { hiringApi } from '../services/hiringApi';
import { Users, FileSearch, PhoneCall, Heart, Clock, Calendar, CheckCircle, Briefcase, Download, Filter } from 'lucide-react';

const Analytics: React.FC = () => {
  const [dateRange, setDateRange] = useState('all');
  const [trendMetric, setTrendMetric] = useState('candidates');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [rolesData, setRolesData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, trendMetric]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [dash, roles, trend] = await Promise.all([
        hiringApi.getDashboardMetrics(dateRange),
        hiringApi.getRoleMetrics(dateRange),
        hiringApi.getTrendData(trendMetric, dateRange)
      ]);
      setDashboardData(dash);
      setRolesData(roles);
      setTrendData(trend);
    } catch (e) {
      console.error("Failed to load analytics", e);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: 'daily' | 'weekly' | 'monthly' | 'roles', format: 'csv' | 'excel') => {
    try {
      await hiringApi.exportAnalytics(type, format, dateRange);
    } catch (e) {
      console.error("Failed to export analytics", e);
    }
  };

  if (loading && !dashboardData) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: number, icon: any, color: string }) => (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{title}</p>
        <p className={`text-3xl font-black ${color}`}>{value || 0}</p>
      </div>
      <div className={`p-3 rounded-xl bg-slate-50 text-slate-400`}>
        <Icon className="h-6 w-6" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#eef4fb_100%)] px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* Header & Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hiring Analytics</h1>
            <p className="text-sm text-slate-500">Track and optimize your recruitment pipeline across all roles.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl pl-4 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="this_week">This Week</option>
                <option value="last_7_days">Last 7 Days</option>
                <option value="this_month">This Month</option>
                <option value="last_month">Last Month</option>
                <option value="this_quarter">This Quarter</option>
                <option value="this_year">This Year</option>
                <option value="all">All Time</option>
              </select>
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
            
            <div className="dropdown relative group">
              <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:bg-slate-800 transition">
                <Download className="h-4 w-4" /> Export Reports
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 shadow-xl rounded-xl py-2 hidden group-hover:block z-10">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Download CSV</div>
                <button onClick={() => handleExport('daily', 'csv')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Daily Report</button>
                <button onClick={() => handleExport('roles', 'csv')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Role-Wise Report</button>
                <div className="border-t border-slate-100 my-1"></div>
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Download Excel</div>
                <button onClick={() => handleExport('monthly', 'excel')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Monthly Report</button>
                <button onClick={() => handleExport('roles', 'excel')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Role-Wise Report</button>
              </div>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        {dashboardData && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard title="Total Candidates" value={dashboardData.total_candidates} icon={Users} color="text-slate-900" />
            <StatCard title="Screened via AI" value={dashboardData.screened} icon={FileSearch} color="text-blue-600" />
            <StatCard title="Interested" value={dashboardData.interested} icon={Heart} color="text-emerald-600" />
            <StatCard title="Calls Completed" value={dashboardData.calls_completed} icon={PhoneCall} color="text-slate-700" />
            <StatCard title="Callback Required" value={dashboardData.callback_required} icon={Clock} color="text-amber-500" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Trend Chart */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900">Activity Trend</h3>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                {['candidates', 'screened', 'interested'].map(metric => (
                  <button
                    key={metric}
                    onClick={() => setTrendMetric(metric)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-colors ${trendMetric === metric ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {metric}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <RechartsTooltip 
                    contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    cursor={{stroke: '#e2e8f0', strokeWidth: 2}}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    name="Count"
                    stroke="#2563eb" 
                    strokeWidth={3}
                    dot={{fill: '#2563eb', strokeWidth: 2, r: 4}}
                    activeDot={{r: 6}}
                    animationDuration={1000}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Role Pipeline Chart */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900">Pipeline by Role</h3>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rolesData} layout="vertical" margin={{ top: 0, right: 0, left: 60, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis dataKey="role" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 12, fontWeight: 500}} />
                  <RechartsTooltip 
                    contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    cursor={{fill: '#f8fafc'}}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="candidates" name="Total Candidates" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={16} />
                  <Bar dataKey="interested" name="Interested" fill="#10b981" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Role-Wise Analytics Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">Role-Wise Analytics</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Role</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Candidates</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Screened</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Calls</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Interested</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Callbacks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rolesData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No data available for the selected period.</td>
                  </tr>
                ) : (
                  rolesData.map((role) => (
                    <tr key={role.job_id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{role.role}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{role.candidates}</td>
                      <td className="px-6 py-4 text-slate-600">{role.screened}</td>
                      <td className="px-6 py-4 text-slate-600">{role.calls_completed}</td>
                      <td className="px-6 py-4 text-emerald-600 font-medium">{role.interested}</td>
                      <td className="px-6 py-4 text-amber-500">{role.callbacks}</td>
                    </tr>
                  ))
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
