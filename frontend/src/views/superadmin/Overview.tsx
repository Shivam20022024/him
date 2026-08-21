import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Building2, CheckCircle2, Users, PhoneCall, Loader2 } from 'lucide-react';

const Overview: React.FC = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/superadmin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token, API_URL]);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Platform Overview</h1>
        <p className="text-slate-500 mt-2">Monitor the overall health and usage of TalklyAI across all tenants.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <span className="text-slate-500 font-medium text-sm">Total Companies</span>
            <Building2 className="text-slate-400 w-5 h-5" />
          </div>
          <span className="text-3xl font-bold text-slate-900">{stats?.total_companies || 0}</span>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <span className="text-slate-500 font-medium text-sm">Active Companies</span>
            <CheckCircle2 className="text-green-500 w-5 h-5" />
          </div>
          <span className="text-3xl font-bold text-slate-900">{stats?.active_companies || 0}</span>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <span className="text-slate-500 font-medium text-sm">Total Users</span>
            <Users className="text-slate-400 w-5 h-5" />
          </div>
          <span className="text-3xl font-bold text-slate-900">{stats?.total_users || 0}</span>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <span className="text-slate-500 font-medium text-sm">Total Calls</span>
            <PhoneCall className="text-blue-500 w-5 h-5" />
          </div>
          <span className="text-3xl font-bold text-slate-900">{stats?.total_calls || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default Overview;
