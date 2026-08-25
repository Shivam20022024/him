import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Loader2, User, Building, Briefcase, Mail, CheckCircle } from 'lucide-react';

const API_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:8001';

const RequestAccess = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    role: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post(`${API_BASE}/api/auth/request-access`, formData);
      setSuccess(true);
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Failed to submit request. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#eef3f8_100%)] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/70 backdrop-blur-xl border border-white rounded-3xl shadow-2xl p-10 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-2">Request Received!</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Thank you for your interest in Hireonomous. Our team will review your request and get back to you shortly.
          </p>
          <Link
            to="/login"
            className="w-full flex justify-center py-3 px-4 border border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-200"
          >
            Return to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#eef3f8_100%)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/70 backdrop-blur-xl border border-white rounded-3xl shadow-2xl p-8">
        <div className="mb-8">
          <Link to="/login" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to login
          </Link>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Request Access</h2>
          <p className="text-slate-500 font-medium">Join the waitlist to supercharge your hiring pipeline with AI.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold mb-6 flex items-start gap-3 border border-red-100 shadow-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-bold text-slate-700 mb-1.5">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="appearance-none block w-full pl-11 pr-3 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium transition-all"
                placeholder="Jane Doe"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-1.5">Work Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none block w-full pl-11 pr-3 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium transition-all"
                placeholder="jane@company.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="company" className="block text-sm font-bold text-slate-700 mb-1.5">Company Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Building className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="company"
                name="company"
                type="text"
                required
                value={formData.company}
                onChange={handleChange}
                className="appearance-none block w-full pl-11 pr-3 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium transition-all"
                placeholder="Acme Corp"
              />
            </div>
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-bold text-slate-700 mb-1.5">Your Role</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Briefcase className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="role"
                name="role"
                type="text"
                required
                value={formData.role}
                onChange={handleChange}
                className="appearance-none block w-full pl-11 pr-3 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium transition-all"
                placeholder="Head of Talent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] text-sm font-black text-white bg-blue-600 hover:bg-blue-700 hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-6"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Request Access'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequestAccess;
