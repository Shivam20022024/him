import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2, Plus, Building, User, Mail, Lock, X } from 'lucide-react';

export const Companies: React.FC = () => {
  const { token, setContextOrganization } = useAuth();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [companyName, setCompanyName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

  const fetchCompanies = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/superadmin/companies`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCompanies(response.data);
    } catch (error) {
      console.error('Failed to fetch companies', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [token]);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError('');
    try {
      await axios.post(`${API_URL}/api/superadmin/companies`, {
        company_name: companyName,
        admin_name: adminName,
        admin_email: adminEmail,
        admin_password: adminPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Reset form & close modal
      setCompanyName('');
      setAdminName('');
      setAdminEmail('');
      setAdminPassword('');
      setShowModal(false);
      
      // Refresh list
      fetchCompanies();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create company');
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Companies</h1>
          <p className="text-slate-500 mt-2">Manage all tenants on the TalklyAI platform.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Company
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">COMPANY</th>
                <th className="px-6 py-4">STATUS</th>
                <th className="px-6 py-4">USERS</th>
                <th className="px-6 py-4">CALLS</th>
                <th className="px-6 py-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {companies.map((company) => (
                <tr key={company.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 text-[15px]">{company.name}</span>
                      <span className="text-slate-400 text-[11px] mt-0.5 tracking-wide">{company.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider ${company.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {company.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{company.stats.users}</td>
                  <td className="px-6 py-4 text-slate-600">{company.stats.candidates}</td>
                  <td className="px-6 py-4 text-right">
                     <div className="flex items-center justify-end gap-4">
                       <button 
                         onClick={() => {
                           setContextOrganization(company.id);
                           navigate('/dashboard');
                         }}
                         className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                       >
                         View As
                       </button>
                       <button 
                         className="text-sm font-semibold text-slate-600 hover:text-slate-900"
                       >
                         {company.status === 'active' ? 'Suspend' : 'Activate'}
                       </button>
                     </div>
                  </td>
                </tr>
              ))}
              {companies.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No companies found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Create New Company</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleCreateCompany} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="pl-9 w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      placeholder="Acme Corp"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Admin Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      className="pl-9 w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Admin Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="pl-9 w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      placeholder="john@acme.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Initial Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="pl-9 w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      placeholder="SecurePass123"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center"
                  >
                    {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Company & Admin'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Companies;
