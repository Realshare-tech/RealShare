'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { MapPin, Image as ImageIcon, Search, RefreshCw, AlertTriangle } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import Image from 'next/image';

interface LoginLog {
  id: string;
  user_id: string;
  role: string;
  ip_address: string | null;
  latitude: number | null;
  longitude: number | null;
  photo_url: string | null;
  created_at: string;
  profile?: {
    full_name: string;
    email: string;
    phone_number: string;
    avatar_url: string;
  };
}

export default function LoginLogsPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const token = await user?.getIdToken();
      if (!token) throw new Error('No auth token');

      const res = await fetch('/api/superadmin/login-logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to fetch logs');
      setLogs(data.logs || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user || profile?.role !== 'superadmin') {
        router.push('/');
      } else {
        fetchLogs();
      }
    }
  }, [user, profile, authLoading, router]);

  if (authLoading || (loading && logs.length === 0)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <RefreshCw className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  const filteredLogs = logs.filter(l => 
    l.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.profile?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout title="Security Login Logs">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Security Login Logs</h1>
          <p className="text-slate-500">Track employee and admin authentication events.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <button 
            onClick={fetchLogs}
            className="p-2 border rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh logs"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-3">
          <AlertTriangle size={20} />
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">IP Address</th>
                <th className="p-4">Location</th>
                <th className="p-4 text-center">Security Photo</th>
              </tr>
            </thead>
            <tbody className="divide-y text-slate-700">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                        {log.profile?.avatar_url ? (
                          <img src={log.profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-slate-400 font-semibold text-lg">
                            {log.profile?.full_name?.charAt(0) || '?'}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{log.profile?.full_name || 'Unknown'}</div>
                        <div className="text-xs text-slate-500">{log.profile?.email || log.profile?.phone_number}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex px-2 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 uppercase tracking-wider">
                      {log.role}
                    </span>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <div>{new Date(log.created_at).toLocaleDateString()}</div>
                    <div className="text-xs text-slate-500">{new Date(log.created_at).toLocaleTimeString()}</div>
                  </td>
                  <td className="p-4 font-mono text-xs">
                    {log.ip_address || 'Unknown'}
                  </td>
                  <td className="p-4">
                    {log.latitude && log.longitude ? (
                      <a 
                        href={`https://maps.google.com/?q=${log.latitude},${log.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <MapPin size={16} /> View Map
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">Not Provided</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {log.photo_url ? (
                      <a 
                        href={log.photo_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center justify-center h-10 w-10 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-600 transition-colors border shadow-sm group relative"
                      >
                        <ImageIcon size={18} className="text-slate-500 group-hover:text-blue-600" />
                      </a>
                    ) : (
                      <span className="text-slate-400 italic text-xs">No Photo</span>
                    )}
                  </td>
                </tr>
              ))}
              
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No login logs found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </AdminLayout>
  );
}
