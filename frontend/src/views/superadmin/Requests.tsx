import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, CheckCircle, XCircle, Mail, Building, Briefcase, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:8001';

interface AccessRequest {
  _id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

const Requests = () => {
  const { token } = useAuth();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/superadmin/requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(res.data);
    } catch (err) {
      console.error('Failed to fetch requests', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!window.confirm('Are you sure you want to approve this request? This will create a new company and admin account.')) return;
    
    setProcessingId(id);
    try {
      await axios.post(`${API_BASE}/api/superadmin/requests/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchRequests(); // Refresh list
    } catch (err) {
      console.error('Failed to approve request', err);
      alert('Failed to approve request.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!window.confirm('Are you sure you want to reject this request?')) return;
    
    setProcessingId(id);
    try {
      await axios.post(`${API_BASE}/api/superadmin/requests/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchRequests(); // Refresh list
    } catch (err) {
      console.error('Failed to reject request', err);
      alert('Failed to reject request.');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Access Requests</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">Review and manage waitlist requests.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50/50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4 font-bold">User</th>
                <th className="px-6 py-4 font-bold">Company / Role</th>
                <th className="px-6 py-4 font-bold">Requested At</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 font-medium">
                    No access requests found.
                  </td>
                </tr>
              ) : (
                requests.map(req => (
                  <tr key={req._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{req.name}</div>
                      <div className="text-slate-500 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" /> {req.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" /> {req.company}
                      </div>
                      <div className="text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {req.role}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(req.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                        req.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                        req.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                        'bg-red-50 text-red-600 border border-red-200'
                      }`}>
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {req.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(req._id)}
                            disabled={processingId === req._id}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                          >
                            {processingId === req._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(req._id)}
                            disabled={processingId === req._id}
                            className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            {processingId === req._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Requests;
