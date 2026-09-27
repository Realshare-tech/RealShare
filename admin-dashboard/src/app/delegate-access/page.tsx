'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/layout/AdminLayout';

interface DelegateSession {
  id: string;
  requester_id: string;
  requester_role: string;
  requester_name: string;
  target_user_id: string;
  target_user_role: string;
  target_user_name: string;
  access_code: string;
  status: string;
  reason: string | null;
  code_expires_at: string;
  activated_at: string | null;
  ended_at: string | null;
  ip_address: string | null;
  created_at: string;
  requester?: { full_name: string; email: string; phone_number: string; avatar_url: string };
  target_user?: { full_name: string; email: string; phone_number: string; avatar_url: string };
  logs: DelegateLog[];
}

interface DelegateLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: string | null;
  created_at: string;
}

interface TargetProfile {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  role: string;
  avatar_url: string;
  kyc_status: string;
  about_me: string | null;
  full_address: string | null;
  company_name: string | null;
  office_address: string | null;
  website: string | null;
  rera_number: string | null;
  posted_properties: any[];
  investments: any[];
  subscriptions: any[];
}

export default function DelegateAccessPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const router = useRouter();

  // Code entry
  const [accessCode, setAccessCode] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  // Active session
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [targetProfile, setTargetProfile] = useState<TargetProfile | null>(null);

  // Session history
  const [sessions, setSessions] = useState<DelegateSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  // Tab
  const [tab, setTab] = useState<'access' | 'history'>('access');

  const fetchSessions = useCallback(async () => {
    try {
      setSessionsLoading(true);
      const token = await user?.getIdToken();
      const res = await fetch('/api/delegate-access/sessions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setSessions(data.sessions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSessionsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && user && userProfile) {
      if (!['admin', 'superadmin', 'employee'].includes(userProfile.role)) {
        router.push('/');
      } else {
        fetchSessions();
      }
    }
  }, [authLoading, user, userProfile, router, fetchSessions]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim() || accessCode.length !== 6) {
      setVerifyError('Please enter the 6-digit code shared by the user');
      return;
    }
    setVerifyLoading(true);
    setVerifyError('');
    try {
      const token = await user?.getIdToken();
      const res = await fetch('/api/delegate-access/verify', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_code: accessCode.toUpperCase() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setActiveSession(data.session.id);
      setTargetProfile(data.profile);
      setAccessCode('');
      fetchSessions();
    } catch (err: any) {
      setVerifyError(err.message);
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!activeSession) return;
    try {
      const token = await user?.getIdToken();
      await fetch('/api/delegate-access/end', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: activeSession })
      });
      setActiveSession(null);
      setTargetProfile(null);
      fetchSessions();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string }> = {
      pending: { bg: '#FEF3C7', text: '#92400E' },
      active: { bg: '#D1FAE5', text: '#065F46' },
      completed: { bg: '#E0E7FF', text: '#3730A3' },
      expired: { bg: '#FEE2E2', text: '#991B1B' },
    };
    const s = map[status] || { bg: '#F1F5F9', text: '#475569' };
    return (
      <span style={{ background: s.bg, color: s.text, padding: '2px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {status}
      </span>
    );
  };

  if (authLoading) {
    return <AdminLayout title="Delegate Access"><div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><span style={{ fontSize: '16px', color: '#94A3B8' }}>Loading...</span></div></AdminLayout>;
  }

  // ─── ACTIVE SESSION VIEW ───
  if (activeSession && targetProfile) {
    return (
      <AdminLayout title="Delegate Access — Active Session">
        <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)', color: '#FFF', borderRadius: '12px', padding: '20px 24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '13px', opacity: 0.8, marginBottom: '4px' }}>🔴 DELEGATE ACCESS ACTIVE</div>
              <div style={{ fontSize: '18px', fontWeight: 700 }}>Operating as: {targetProfile.full_name}</div>
              <div style={{ fontSize: '13px', opacity: 0.8 }}>{targetProfile.role.toUpperCase()} • {targetProfile.email || targetProfile.phone_number}</div>
            </div>
            <button
              onClick={handleEndSession}
              style={{ background: '#FFF', color: '#DC2626', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
            >
              End Session
            </button>
          </div>

          <div style={{ background: '#FFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1E293B', marginBottom: '16px' }}>Profile Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <InfoItem label="Full Name" value={targetProfile.full_name} />
              <InfoItem label="Email" value={targetProfile.email || '—'} />
              <InfoItem label="Phone" value={targetProfile.phone_number || '—'} />
              <InfoItem label="Role" value={targetProfile.role} />
              <InfoItem label="KYC Status" value={targetProfile.kyc_status} />
              <InfoItem label="Address" value={targetProfile.full_address || '—'} />
              {targetProfile.company_name && <InfoItem label="Company" value={targetProfile.company_name} />}
              {targetProfile.website && <InfoItem label="Website" value={targetProfile.website} />}
              {targetProfile.rera_number && <InfoItem label="RERA Number" value={targetProfile.rera_number} />}
            </div>
          </div>

          {targetProfile.posted_properties?.length > 0 && (
            <div style={{ background: '#FFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1E293B', marginBottom: '16px' }}>Properties ({targetProfile.posted_properties.length})</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left', color: '#64748B' }}>Name</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', color: '#64748B' }}>Type</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', color: '#64748B' }}>Status</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', color: '#64748B' }}>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {targetProfile.posted_properties.map((p: any) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 500 }}>{p.name}</td>
                        <td style={{ padding: '8px 12px' }}>{p.property_type}</td>
                        <td style={{ padding: '8px 12px' }}>{getStatusBadge(p.approval_status || p.status)}</td>
                        <td style={{ padding: '8px 12px', color: '#64748B' }}>{new Date(p.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {targetProfile.investments?.length > 0 && (
            <div style={{ background: '#FFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1E293B', marginBottom: '16px' }}>Investments ({targetProfile.investments.length})</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left', color: '#64748B' }}>Property</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', color: '#64748B' }}>Fractions</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', color: '#64748B' }}>Amount</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', color: '#64748B' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {targetProfile.investments.map((inv: any) => (
                      <tr key={inv.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 500 }}>{inv.property_id}</td>
                        <td style={{ padding: '8px 12px' }}>{inv.fractions}</td>
                        <td style={{ padding: '8px 12px' }}>₹{Number(inv.amount || 0).toLocaleString('en-IN')}</td>
                        <td style={{ padding: '8px 12px' }}>{getStatusBadge(inv.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {targetProfile.subscriptions?.length > 0 && (
            <div style={{ background: '#FFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1E293B', marginBottom: '16px' }}>Subscription</h3>
              {targetProfile.subscriptions.map((sub: any) => (
                <div key={sub.id} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <InfoItem label="Plan" value={sub.plan?.tier || '—'} />
                  <InfoItem label="Status" value={sub.status} />
                  <InfoItem label="Expires" value={new Date(sub.expires_at).toLocaleDateString()} />
                </div>
              ))}
            </div>
          )}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Delegate Access">
      <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1E293B' }}>Delegate Access</h1>
          <p style={{ color: '#64748B', fontSize: '14px' }}>Enter the 6-digit code shared by the user to access their profile. All actions are logged.</p>
        </div>

        <div style={{ display: 'flex', gap: '4px', background: '#F1F5F9', borderRadius: '8px', padding: '4px', marginBottom: '24px', maxWidth: '320px' }}>
          <button onClick={() => setTab('access')} style={{ flex: 1, padding: '8px 16px', borderRadius: '6px', border: 'none', background: tab === 'access' ? '#FFF' : 'transparent', color: tab === 'access' ? '#1E293B' : '#64748B', fontWeight: 600, fontSize: '14px', cursor: 'pointer', boxShadow: tab === 'access' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>
            Enter Code
          </button>
          <button onClick={() => { setTab('history'); fetchSessions(); }} style={{ flex: 1, padding: '8px 16px', borderRadius: '6px', border: 'none', background: tab === 'history' ? '#FFF' : 'transparent', color: tab === 'history' ? '#1E293B' : '#64748B', fontWeight: 600, fontSize: '14px', cursor: 'pointer', boxShadow: tab === 'history' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>
            Session History
          </button>
        </div>

        {tab === 'access' && (
          <div style={{ background: '#FFF', borderRadius: '12px', border: '2px solid #3B82F6', padding: '32px', maxWidth: '420px' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>🔑</div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1E293B', margin: '0 0 8px 0' }}>Enter User&apos;s Access Code</h3>
              <p style={{ color: '#64748B', fontSize: '13px', margin: 0 }}>
                Ask the user to tap &quot;Grant Delegate Access&quot; in their Profile and share the 6-digit code with you.
              </p>
            </div>
            <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
              <input
                type="text"
                value={accessCode}
                onChange={e => setAccessCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
                placeholder="ENTER CODE"
                maxLength={6}
                style={{ width: '220px', padding: '14px', borderRadius: '8px', border: '2px solid #CBD5E1', fontSize: '24px', textAlign: 'center', fontWeight: 700, letterSpacing: '6px', fontFamily: 'monospace', outline: 'none' }}
              />
              {verifyError && <div style={{ background: '#FEF2F2', color: '#DC2626', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', width: '100%', textAlign: 'center' }}>{verifyError}</div>}
              <button
                type="submit"
                disabled={verifyLoading || accessCode.length !== 6}
                style={{ background: '#2563EB', color: '#FFF', border: 'none', borderRadius: '8px', padding: '12px 32px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', opacity: (verifyLoading || accessCode.length !== 6) ? 0.5 : 1, width: '100%' }}
              >
                {verifyLoading ? 'Verifying...' : 'Verify & Start Session'}
              </button>
            </form>
          </div>
        )}

        {tab === 'history' && (
          <div style={{ background: '#FFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            {sessionsLoading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>Loading sessions...</div>
            ) : sessions.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>No delegate access sessions found.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '10px 14px', textAlign: 'left', color: '#64748B', fontWeight: 600 }}>Requester</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', color: '#64748B', fontWeight: 600 }}>Target User</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', color: '#64748B', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', color: '#64748B', fontWeight: 600 }}>Date</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', color: '#64748B', fontWeight: 600 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map(s => (
                    <React.Fragment key={s.id}>
                      <tr style={{ borderBottom: '1px solid #F1F5F9', cursor: 'pointer' }} onClick={() => setExpandedSession(expandedSession === s.id ? null : s.id)}>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ fontWeight: 600 }}>{s.requester?.full_name || s.requester_name || '—'}</div>
                          <div style={{ fontSize: '11px', color: '#94A3B8' }}>{s.requester_role !== 'pending' ? s.requester_role : 'Not yet claimed'}</div>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ fontWeight: 600 }}>{s.target_user?.full_name || s.target_user_name}</div>
                          <div style={{ fontSize: '11px', color: '#94A3B8' }}>{s.target_user_role} • {s.target_user?.email || s.target_user?.phone_number}</div>
                        </td>
                        <td style={{ padding: '10px 14px' }}>{getStatusBadge(s.status)}</td>
                        <td style={{ padding: '10px 14px', whiteSpace: 'nowrap', color: '#64748B' }}>
                          {new Date(s.created_at).toLocaleDateString()}<br />
                          <span style={{ fontSize: '11px' }}>{new Date(s.created_at).toLocaleTimeString()}</span>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ fontSize: '12px', color: '#3B82F6', cursor: 'pointer' }}>
                            {expandedSession === s.id ? '▲ Hide Logs' : `▼ ${s.logs.length} Actions`}
                          </span>
                        </td>
                      </tr>
                      {expandedSession === s.id && (
                        <tr>
                          <td colSpan={5} style={{ padding: '0 14px 14px', background: '#F8FAFC' }}>
                            <div style={{ padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFF' }}>
                              <div style={{ display: 'flex', gap: '24px', marginBottom: '12px', flexWrap: 'wrap', fontSize: '12px', color: '#64748B' }}>
                                <span>🕐 Started: {s.activated_at ? new Date(s.activated_at).toLocaleString() : '—'}</span>
                                <span>🏁 Ended: {s.ended_at ? new Date(s.ended_at).toLocaleString() : '—'}</span>
                                <span>🌐 IP: {s.ip_address || '—'}</span>
                              </div>
                              {s.logs.length === 0 ? (
                                <p style={{ color: '#94A3B8', fontSize: '13px', textAlign: 'center', padding: '16px' }}>No actions were performed during this session.</p>
                              ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                                  <thead>
                                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                                      <th style={{ padding: '6px 10px', textAlign: 'left', color: '#94A3B8' }}>Time</th>
                                      <th style={{ padding: '6px 10px', textAlign: 'left', color: '#94A3B8' }}>Action</th>
                                      <th style={{ padding: '6px 10px', textAlign: 'left', color: '#94A3B8' }}>Entity</th>
                                      <th style={{ padding: '6px 10px', textAlign: 'left', color: '#94A3B8' }}>Details</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {s.logs.map(log => (
                                      <tr key={log.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                        <td style={{ padding: '6px 10px', color: '#64748B', whiteSpace: 'nowrap' }}>{new Date(log.created_at).toLocaleTimeString()}</td>
                                        <td style={{ padding: '6px 10px', fontWeight: 600 }}>{log.action}</td>
                                        <td style={{ padding: '6px 10px' }}>{log.entity_type}{log.entity_id ? ` (${log.entity_id.slice(0, 8)}...)` : ''}</td>
                                        <td style={{ padding: '6px 10px', color: '#64748B' }}>{log.details || '—'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600, marginBottom: '2px' }}>{label}</div>
      <div style={{ fontSize: '14px', color: '#1E293B', fontWeight: 500 }}>{value}</div>
    </div>
  );
}
