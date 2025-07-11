"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../page.module.css';
import ClientSessions from '../../src/components/ClientSessions';
import ClientBooking from '../../src/components/ClientBooking';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const navItems = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'profile', label: 'Profile' },
  { key: 'programs', label: 'Programs' },
  { key: 'progress', label: 'Progress' },
  { key: 'scheduling', label: 'Scheduling' },
  { key: 'booking', label: 'Book Session' },
  // { key: 'resources', label: 'Resources' }, // Hidden for now
];

export default function ClientPortal() {
  const [active, setActive] = useState('dashboard');
  const [authChecked, setAuthChecked] = useState(false);
  const [clientData, setClientData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [profileForm, setProfileForm] = useState({ email: '', phone: '', notes: '' });
  const [preferencesForm, setPreferencesForm] = useState({
    preferredTimes: { morning: true, afternoon: false, evening: false },
    sessionTypes: { inPerson: true, virtual: false },
    notifications: { email: true, sms: false }
  });
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('client-portal-token') : null;
    if (!token) {
      router.replace('/client/login');
    } else {
      setAuthChecked(true);
    }
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('client-portal-token') : null;
      if (!token) return;
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE}/api/client/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          throw new Error('Failed to fetch client data');
        }
        const data = await res.json();
        setClientData(data);
        
        // Initialize profile form with current data
        setProfileForm({
          email: data.profile.email || '',
          phone: data.profile.phone || '',
          notes: data.profile.notes || ''
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    if (authChecked) fetchData();
  }, [authChecked]);

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleProfileUpdate = async () => {
    const token = localStorage.getItem('client-portal-token');
    if (!token) return;
    
    try {
      const res = await fetch(`${API_BASE}/api/client/profile`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(profileForm)
      });
      
      if (!res.ok) {
        throw new Error('Failed to update profile');
      }
      
      const data = await res.json();
      setClientData((prev: any) => ({
        ...prev,
        profile: { ...prev.profile, ...data.client }
      }));
      setShowProfileModal(false);
      showMessage('Profile updated successfully!');
    } catch (err) {
      showMessage(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  const handlePreferencesUpdate = async () => {
    const token = localStorage.getItem('client-portal-token');
    if (!token) return;
    
    try {
      const res = await fetch(`${API_BASE}/api/client/preferences`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(preferencesForm)
      });
      
      if (!res.ok) {
        throw new Error('Failed to update preferences');
      }
      
      setShowPreferencesModal(false);
      showMessage('Preferences updated successfully!');
    } catch (err) {
      showMessage(err instanceof Error ? err.message : 'Failed to update preferences');
    }
  };

  if (!authChecked) {
    return null;
  }

  return (
    <div className={styles.onboardingContainer}>
      <div className={styles.onboardingContent} style={{ maxWidth: 1000 }}>
        <div className={styles.onboardingHeader}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1>Client Portal</h1>
              <p>Welcome! Access your training, progress, and more.</p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('client-portal-token');
                localStorage.removeItem('client-portal-user');
                router.push('/client/login');
              }}
              style={{
                padding: '10px 20px',
                borderRadius: 12,
                border: '1px solid #dc2626',
                background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
                color: '#dc2626',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '0.95rem',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(220, 38, 38, 0.1)',
                letterSpacing: '-0.025em'
              }}
            >
              Logout
            </button>
          </div>
        </div>
        <nav style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => setActive(item.key)}
              style={{
                padding: '12px 24px',
                borderRadius: 12,
                border: '1px solid rgba(148, 163, 184, 0.1)',
                background: active === item.key ? 'white' : 'white',
                color: active === item.key ? '#1e293b' : '#64748b',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                fontSize: '0.95rem',
                letterSpacing: '-0.025em',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {active === item.key && (
                <div style={{ 
                  position: 'absolute', 
                  top: '0', 
                  left: '0', 
                  right: '0', 
                  height: '3px', 
                  background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)'
                }}></div>
              )}
              {item.label}
            </button>
          ))}
        </nav>
        <div style={{ minHeight: 400 }}>
          {loading && <p>Loading your data...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {active === 'dashboard' && clientData && (
            <section>
              {/* Welcome Header */}
              <div style={{ 
                background: 'white', 
                padding: '40px', 
                borderRadius: '20px', 
                marginBottom: '32px',
                color: '#1e293b',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid rgba(148, 163, 184, 0.1)'
              }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <h2 style={{ margin: '0 0 12px 0', fontSize: '2.25rem', fontWeight: '600', letterSpacing: '-0.025em' }}>
                    Welcome back, {clientData.profile.firstName}! ✨
                  </h2>
                  <p style={{ margin: '0', color: '#64748b', fontSize: '1.125rem', fontWeight: '500' }}>
                    Ready to elevate your fitness journey today?
                  </p>
                </div>
                <div style={{ 
                  position: 'absolute', 
                  top: '0', 
                  left: '0', 
                  right: '0', 
                  height: '3px', 
                  background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)'
                }}></div>
              </div>

              {/* Quick Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', 
                  padding: '28px', 
                  borderRadius: '16px', 
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                  textAlign: 'center',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    position: 'absolute', 
                    top: '0', 
                    left: '0', 
                    right: '0', 
                    height: '3px', 
                    background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)'
                  }}></div>
                  <div style={{ 
                    fontSize: '2.5rem', 
                    marginBottom: '12px',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>📊</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: '600', color: '#1e293b', marginBottom: '6px', letterSpacing: '-0.025em' }}>
                    {clientData.progress.length}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '500' }}>Progress Entries</div>
                </div>

                <div style={{ 
                  background: 'linear-gradient(135deg, #fef7ff 0%, #f3e8ff 100%)', 
                  padding: '28px', 
                  borderRadius: '16px', 
                  border: '1px solid rgba(168, 85, 247, 0.1)',
                  textAlign: 'center',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    position: 'absolute', 
                    top: '0', 
                    left: '0', 
                    right: '0', 
                    height: '3px', 
                    background: 'linear-gradient(90deg, #a855f7, #ec4899)'
                  }}></div>
                  <div style={{ 
                    fontSize: '2.5rem', 
                    marginBottom: '12px',
                    background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>💪</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: '600', color: '#1e293b', marginBottom: '6px', letterSpacing: '-0.025em' }}>
                    {clientData.programs.length}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '500' }}>Active Programs</div>
                </div>

                <div style={{ 
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', 
                  padding: '28px', 
                  borderRadius: '16px', 
                  border: '1px solid rgba(34, 197, 94, 0.1)',
                  textAlign: 'center',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    position: 'absolute', 
                    top: '0', 
                    left: '0', 
                    right: '0', 
                    height: '3px', 
                    background: 'linear-gradient(90deg, #22c55e, #16a34a)'
                  }}></div>
                  <div style={{ 
                    fontSize: '2.5rem', 
                    marginBottom: '12px',
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>🎯</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: '600', color: '#1e293b', marginBottom: '6px', letterSpacing: '-0.025em' }}>
                    {clientData.progress.length > 0 ? clientData.progress[clientData.progress.length - 1]?.weight || 'N/A' : 'N/A'}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '500' }}>Current Weight (kg)</div>
                </div>

                <div style={{ 
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', 
                  padding: '28px', 
                  borderRadius: '16px', 
                  border: '1px solid rgba(245, 158, 11, 0.1)',
                  textAlign: 'center',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    position: 'absolute', 
                    top: '0', 
                    left: '0', 
                    right: '0', 
                    height: '3px', 
                    background: 'linear-gradient(90deg, #f59e0b, #d97706)'
                  }}></div>
                  <div style={{ 
                    fontSize: '2.5rem', 
                    marginBottom: '12px',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>📈</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: '600', color: '#1e293b', marginBottom: '6px', letterSpacing: '-0.025em' }}>
                    {clientData.progress.length > 0 ? clientData.progress[clientData.progress.length - 1]?.bodyFat || 'N/A' : 'N/A'}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '500' }}>Body Fat %</div>
                </div>
              </div>

              {/* Programs Section */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ 
                  fontSize: '1.75rem', 
                  fontWeight: '500', 
                  marginBottom: '24px', 
                  color: '#1e293b',
                  letterSpacing: '-0.025em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{
                    background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontSize: '1.5rem'
                  }}>🏋️‍♀️</span>
                  Your Training Programs
                </h3>
                
                {clientData.programs.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '60px 20px',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    borderRadius: '20px',
                    border: '1px solid rgba(148, 163, 184, 0.1)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}>
                    <div style={{ 
                      fontSize: '4rem', 
                      marginBottom: '20px',
                      background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>📋</div>
                    <p style={{ color: '#64748b', margin: '0 0 12px 0', fontSize: '1.25rem', fontWeight: '600' }}>No programs assigned yet</p>
                    <p style={{ color: '#94a3b8', margin: '0', fontSize: '1rem' }}>Your trainer will assign programs to help you reach your goals</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {clientData.programs.slice(0, 2).map((program: any) => (
                      <div key={program.id} style={{
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                        borderRadius: '16px',
                        padding: '24px',
                        border: '1px solid rgba(148, 163, 184, 0.1)',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          position: 'absolute', 
                          top: '0', 
                          left: '0', 
                          right: '0', 
                          height: '3px', 
                          background: program.status === 'ACTIVE' 
                            ? 'linear-gradient(90deg, #22c55e, #16a34a)' 
                            : 'linear-gradient(90deg, #f59e0b, #d97706)'
                        }}></div>
                        <div>
                          <h4 style={{ 
                            margin: '0 0 8px 0', 
                            color: '#1e293b', 
                            fontSize: '1.25rem',
                            fontWeight: '500',
                            letterSpacing: '-0.025em'
                          }}>{program.programName}</h4>
                          <p style={{ 
                            margin: '0', 
                            color: '#64748b', 
                            fontSize: '0.95rem',
                            fontWeight: '500'
                          }}>
                            Phase: <span style={{ fontWeight: '600', color: '#475569' }}>{program.optPhase}</span> • Status: <span style={{ 
                              color: program.status === 'ACTIVE' ? '#059669' : '#dc2626',
                                                          fontWeight: '500',
                            padding: '2px 8px',
                              borderRadius: '12px',
                              background: program.status === 'ACTIVE' 
                                ? 'rgba(34, 197, 94, 0.1)' 
                                : 'rgba(220, 38, 38, 0.1)'
                            }}>{program.status}</span>
                          </p>
                        </div>
                        <button style={{
                          padding: '10px 20px',
                          borderRadius: '12px',
                          border: '1px solid #22c55e',
                          background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                          color: 'white',
                          cursor: 'pointer',
                                                      fontSize: '0.9rem',
                            fontWeight: '500',
                          boxShadow: '0 2px 4px rgba(34, 197, 94, 0.2)',
                          transition: 'all 0.2s ease'
                        }}>
                          Continue
                        </button>
                      </div>
                    ))}
                    {clientData.programs.length > 2 && (
                      <div style={{ 
                        textAlign: 'center', 
                        padding: '16px', 
                        color: '#64748b', 
                        fontSize: '0.95rem',
                        fontWeight: '500',
                        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                        borderRadius: '12px',
                        border: '1px solid rgba(148, 163, 184, 0.1)'
                      }}>
                        +{clientData.programs.length - 2} more programs
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Recent Progress */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ 
                  fontSize: '1.75rem', 
                  fontWeight: '500', 
                  marginBottom: '24px', 
                  color: '#1e293b',
                  letterSpacing: '-0.025em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontSize: '1.5rem'
                  }}>📊</span>
                  Recent Progress
                </h3>
                
                {clientData.progress.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '60px 20px',
                    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                    borderRadius: '20px',
                    border: '1px solid rgba(34, 197, 94, 0.1)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}>
                    <div style={{ 
                      fontSize: '4rem', 
                      marginBottom: '20px',
                      background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>📈</div>
                    <p style={{ color: '#64748b', margin: '0 0 12px 0', fontSize: '1.25rem', fontWeight: '600' }}>No progress entries yet</p>
                    <p style={{ color: '#94a3b8', margin: '0', fontSize: '1rem' }}>Start tracking your progress to see your journey</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {clientData.progress.slice(-3).reverse().map((entry: any, index: number) => (
                      <div key={entry.id} style={{
                        background: index === 0 
                          ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' 
                          : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                        borderRadius: '16px',
                        padding: '24px',
                        border: index === 0 
                          ? '1px solid rgba(34, 197, 94, 0.2)' 
                          : '1px solid rgba(148, 163, 184, 0.1)',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          position: 'absolute', 
                          top: '0', 
                          left: '0', 
                          right: '0', 
                          height: '3px', 
                          background: index === 0 
                            ? 'linear-gradient(90deg, #22c55e, #16a34a)' 
                            : 'linear-gradient(90deg, #3b82f6, #8b5cf6)'
                        }}></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <h4 style={{ 
                            margin: '0', 
                            color: '#1e293b', 
                            fontSize: '1.125rem',
                            fontWeight: '500',
                            letterSpacing: '-0.025em'
                          }}>
                            {new Date(entry.date).toLocaleDateString()}
                          </h4>
                          <span style={{ 
                            fontSize: '0.875rem', 
                            color: '#64748b',
                            background: 'rgba(148, 163, 184, 0.1)',
                            padding: '6px 12px',
                            borderRadius: '12px',
                            fontWeight: '500'
                          }}>
                            {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' })}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '32px', marginBottom: '12px' }}>
                          <div>
                            <span style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: '500' }}>Weight: </span>
                            <span style={{ fontWeight: '500', color: '#1e293b', fontSize: '1.05rem' }}>
                              {entry.weight || 'N/A'} kg
                            </span>
                          </div>
                          <div>
                            <span style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: '500' }}>Body Fat: </span>
                            <span style={{ fontWeight: '500', color: '#1e293b', fontSize: '1.05rem' }}>
                              {entry.bodyFat || 'N/A'}%
                            </span>
                          </div>
                        </div>
                        
                        {entry.notes && (
                          <div style={{ 
                            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', 
                            padding: '12px 16px', 
                            borderRadius: '12px',
                            border: '1px solid rgba(59, 130, 246, 0.2)'
                          }}>
                            <p style={{ margin: '0', fontSize: '0.95rem', color: '#1e40af', fontWeight: '500' }}>{entry.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}
          {active === 'profile' && clientData && (
            <section>
              <h2>My Profile</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                  <h3 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>Personal Information</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.9rem', color: '#6b7280', marginBottom: '4px' }}>Full Name</label>
                      <p style={{ margin: '0', fontWeight: '600', color: '#1f2937' }}>
                        {clientData.profile.firstName} {clientData.profile.lastName}
                      </p>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.9rem', color: '#6b7280', marginBottom: '4px' }}>Email</label>
                      <p style={{ margin: '0', color: '#1f2937' }}>{clientData.profile.email}</p>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.9rem', color: '#6b7280', marginBottom: '4px' }}>Client Code</label>
                      <p style={{ margin: '0', color: '#1f2937' }}>{clientData.profile.codeName}</p>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.9rem', color: '#6b7280', marginBottom: '4px' }}>Status</label>
                      <span style={{ 
                        padding: '4px 12px', 
                        borderRadius: '20px', 
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        background: clientData.profile.status === 'active' ? '#dcfce7' : '#fee2e2',
                        color: clientData.profile.status === 'active' ? '#166534' : '#dc2626'
                      }}>
                        {clientData.profile.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                  <h3 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>Account Actions</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button 
                      onClick={() => setShowProfileModal(true)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #3b82f6',
                        background: 'white',
                        color: '#3b82f6',
                        cursor: 'pointer',
                        fontWeight: '500',
                        textAlign: 'left'
                      }}
                    >
                      📧 Update Profile
                    </button>
                    <button 
                      onClick={() => showMessage('Password change functionality coming soon!')}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #10b981',
                        background: 'white',
                        color: '#10b981',
                        cursor: 'pointer',
                        fontWeight: '500',
                        textAlign: 'left'
                      }}
                    >
                      🔒 Change Password
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '24px', background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <h3 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>Recent Activity</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                    <span style={{ color: '#1f2937' }}>Last login</span>
                    <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Today</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                    <span style={{ color: '#1f2937' }}>Progress entries</span>
                    <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>{clientData.progress.length} total</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                    <span style={{ color: '#1f2937' }}>Active programs</span>
                    <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>{clientData.programs.filter((p: any) => p.status === 'ACTIVE').length}</span>
                  </div>
                </div>
              </div>
            </section>
          )}
          {active === 'programs' && (
            <section>
              <h2>Training Programs</h2>
              {clientData?.programs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <p>No training programs assigned yet.</p>
                  <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Your trainer will assign programs to help you reach your goals.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {clientData?.programs.map((program: any) => (
                    <div key={program.id} style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '24px',
                      background: 'white',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div>
                          <h3 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>{program.programName}</h3>
                          <p style={{ margin: '0', color: '#6b7280', fontSize: '0.9rem' }}>
                            Phase: {program.optPhase} • Status: <span style={{ 
                              color: program.status === 'ACTIVE' ? '#059669' : '#dc2626',
                              fontWeight: '600'
                            }}>{program.status}</span>
                          </p>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '0.9rem', color: '#6b7280' }}>
                          {program.startDate && (
                            <div>Start: {new Date(program.startDate).toLocaleDateString()}</div>
                          )}
                          {program.endDate && (
                            <div>End: {new Date(program.endDate).toLocaleDateString()}</div>
                          )}
                        </div>
                      </div>
                      
                      {program.goals && (
                        <div style={{ marginBottom: '16px' }}>
                          <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#374151' }}>Goals</h4>
                          <p style={{ margin: '0', color: '#4b5563', fontSize: '0.9rem' }}>{program.goals}</p>
                        </div>
                      )}
                      
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button style={{
                          padding: '8px 16px',
                          borderRadius: '6px',
                          border: '1px solid #3b82f6',
                          background: 'white',
                          color: '#3b82f6',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: '500'
                        }}>
                          View Details
                        </button>
                        <button style={{
                          padding: '8px 16px',
                          borderRadius: '6px',
                          border: '1px solid #10b981',
                          background: 'white',
                          color: '#10b981',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: '500'
                        }}>
                          Start Workout
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
          {active === 'progress' && (
            <section>
              <h2>Progress Tracking</h2>
              <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
                <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                  <h3 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>Quick Stats</h3>
                  {clientData?.progress.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6b7280' }}>Current Weight:</span>
                        <span style={{ fontWeight: '600', color: '#1f2937' }}>
                          {clientData.progress[clientData.progress.length - 1]?.weight || 'N/A'} kg
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6b7280' }}>Body Fat %:</span>
                        <span style={{ fontWeight: '600', color: '#1f2937' }}>
                          {clientData.progress[clientData.progress.length - 1]?.bodyFat || 'N/A'}%
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6b7280' }}>Total Entries:</span>
                        <span style={{ fontWeight: '600', color: '#1f2937' }}>
                          {clientData.progress.length}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p style={{ color: '#6b7280', margin: '0' }}>No progress data yet.</p>
                  )}
                </div>
                
                <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                  <h3 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>Add Progress</h3>
                  <button style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #10b981',
                    background: 'white',
                    color: '#10b981',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}>
                    + Log New Entry
                  </button>
                </div>
              </div>

              <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <h3 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>Progress History</h3>
                {clientData?.progress.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <p style={{ color: '#6b7280', margin: '0 0 8px 0' }}>No progress entries yet.</p>
                    <p style={{ color: '#9ca3af', fontSize: '0.9rem', margin: '0' }}>Start tracking your progress to see your journey.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {clientData.progress.slice().reverse().map((entry: any) => (
                      <div key={entry.id} style={{
                        border: '1px solid #f3f4f6',
                        borderRadius: '8px',
                        padding: '16px',
                        background: '#fafafa'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <h4 style={{ margin: '0', color: '#1f2937', fontSize: '1rem' }}>
                            {new Date(entry.date).toLocaleDateString()}
                          </h4>
                          <span style={{ 
                            fontSize: '0.8rem', 
                            color: '#6b7280',
                            background: '#f3f4f6',
                            padding: '4px 8px',
                            borderRadius: '4px'
                          }}>
                            {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' })}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '24px', marginBottom: '8px' }}>
                          <div>
                            <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Weight: </span>
                            <span style={{ fontWeight: '600', color: '#1f2937' }}>
                              {entry.weight || 'N/A'} kg
                            </span>
                          </div>
                          <div>
                            <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Body Fat: </span>
                            <span style={{ fontWeight: '600', color: '#1f2937' }}>
                              {entry.bodyFat || 'N/A'}%
                            </span>
                          </div>
                        </div>
                        
                        {entry.notes && (
                          <div style={{ 
                            background: '#f0f9ff', 
                            padding: '8px 12px', 
                            borderRadius: '6px',
                            borderLeft: '3px solid #3b82f6'
                          }}>
                            <p style={{ margin: '0', fontSize: '0.9rem', color: '#1e40af' }}>{entry.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}
          {active === 'scheduling' && (
            <section>
              <ClientSessions />
            </section>
          )}
          {active === 'booking' && (
            <section>
              <ClientBooking />
            </section>
          )}
          {active === 'resources' && (
            <section>
              <h2>Training Resources</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                  <h3 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>📚 Educational Materials</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                      <div>
                        <div style={{ fontWeight: '600', color: '#1e40af' }}>Exercise Form Guide</div>
                        <div style={{ fontSize: '0.9rem', color: '#0369a1' }}>PDF • 2.3 MB</div>
                      </div>
                      <button style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #1e40af',
                        background: 'white',
                        color: '#1e40af',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: '500'
                      }}>
                        Download
                      </button>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                      <div>
                        <div style={{ fontWeight: '600', color: '#1e40af' }}>Nutrition Basics</div>
                        <div style={{ fontSize: '0.9rem', color: '#0369a1' }}>PDF • 1.8 MB</div>
                      </div>
                      <button style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #1e40af',
                        background: 'white',
                        color: '#1e40af',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: '500'
                      }}>
                        Download
                      </button>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                      <div>
                        <div style={{ fontWeight: '600', color: '#1e40af' }}>Recovery Techniques</div>
                        <div style={{ fontSize: '0.9rem', color: '#0369a1' }}>Video • 15 min</div>
                      </div>
                      <button style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #1e40af',
                        background: 'white',
                        color: '#1e40af',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: '500'
                      }}>
                        Watch
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                  <h3 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>🍎 Nutrition Plans</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                      <div>
                        <div style={{ fontWeight: '600', color: '#166534' }}>Weekly Meal Plan</div>
                        <div style={{ fontSize: '0.9rem', color: '#15803d' }}>Updated 2 days ago</div>
                      </div>
                      <button style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #166534',
                        background: 'white',
                        color: '#166534',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: '500'
                      }}>
                        View
                      </button>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                      <div>
                        <div style={{ fontWeight: '600', color: '#166534' }}>Supplement Guide</div>
                        <div style={{ fontSize: '0.9rem', color: '#15803d' }}>Personalized recommendations</div>
                      </div>
                      <button style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #166534',
                        background: 'white',
                        color: '#166534',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: '500'
                      }}>
                        View
                      </button>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                      <div>
                        <div style={{ fontWeight: '600', color: '#166534' }}>Recipe Collection</div>
                        <div style={{ fontSize: '0.9rem', color: '#15803d' }}>15 healthy recipes</div>
                      </div>
                      <button style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #166534',
                        background: 'white',
                        color: '#166534',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: '500'
                      }}>
                        Browse
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <h3 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>🎯 Workout Videos</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                  <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ height: '120px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: '#6b7280', fontSize: '2rem' }}>▶️</span>
                    </div>
                    <div style={{ padding: '16px' }}>
                      <h4 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>Squat Form Tutorial</h4>
                      <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#6b7280' }}>Learn proper squat technique with detailed form cues.</p>
                      <button style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: '1px solid #3b82f6',
                        background: 'white',
                        color: '#3b82f6',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}>
                        Watch Video
                      </button>
                    </div>
                  </div>
                  
                  <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ height: '120px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: '#6b7280', fontSize: '2rem' }}>▶️</span>
                    </div>
                    <div style={{ padding: '16px' }}>
                      <h4 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>Deadlift Mastery</h4>
                      <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#6b7280' }}>Master the deadlift with step-by-step instructions.</p>
                      <button style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: '1px solid #3b82f6',
                        background: 'white',
                        color: '#3b82f6',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}>
                        Watch Video
                      </button>
                    </div>
                  </div>
                  
                  <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ height: '120px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: '#6b7280', fontSize: '2rem' }}>▶️</span>
                    </div>
                    <div style={{ padding: '16px' }}>
                      <h4 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>Core Strengthening</h4>
                      <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#6b7280' }}>Essential core exercises for stability and strength.</p>
                      <button style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: '1px solid #3b82f6',
                        background: 'white',
                        color: '#3b82f6',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}>
                        Watch Video
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Profile Update Modal */}
      {showProfileModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '32px',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ margin: '0 0 24px 0', color: '#1f2937' }}>Update Profile</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: '#6b7280', marginBottom: '4px' }}>Email</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: '#6b7280', marginBottom: '4px' }}>Phone</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: '#6b7280', marginBottom: '4px' }}>Notes</label>
                <textarea
                  value={profileForm.notes}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, notes: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    minHeight: '100px',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={handleProfileUpdate}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#3b82f6',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Save Changes
              </button>
              <button
                onClick={() => setShowProfileModal(false)}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  background: 'white',
                  color: '#6b7280',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Update Modal */}
      {showPreferencesModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '32px',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ margin: '0 0 24px 0', color: '#1f2937' }}>Update Session Preferences</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h4 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '1rem' }}>Preferred Times</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { key: 'morning', label: 'Morning (6AM-12PM)' },
                    { key: 'afternoon', label: 'Afternoon (12PM-6PM)' },
                    { key: 'evening', label: 'Evening (6PM-10PM)' }
                  ].map(time => (
                    <label key={time.key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={preferencesForm.preferredTimes[time.key as keyof typeof preferencesForm.preferredTimes]}
                        onChange={(e) => setPreferencesForm(prev => ({
                          ...prev,
                          preferredTimes: {
                            ...prev.preferredTimes,
                            [time.key]: e.target.checked
                          }
                        }))}
                      />
                      <span style={{ color: '#1f2937' }}>{time.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '1rem' }}>Session Types</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { key: 'inPerson', label: 'In-Person' },
                    { key: 'virtual', label: 'Virtual' }
                  ].map(type => (
                    <label key={type.key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={preferencesForm.sessionTypes[type.key as keyof typeof preferencesForm.sessionTypes]}
                        onChange={(e) => setPreferencesForm(prev => ({
                          ...prev,
                          sessionTypes: {
                            ...prev.sessionTypes,
                            [type.key]: e.target.checked
                          }
                        }))}
                      />
                      <span style={{ color: '#1f2937' }}>{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '1rem' }}>Notifications</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { key: 'email', label: 'Email Notifications' },
                    { key: 'sms', label: 'SMS Notifications' }
                  ].map(notification => (
                    <label key={notification.key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={preferencesForm.notifications[notification.key as keyof typeof preferencesForm.notifications]}
                        onChange={(e) => setPreferencesForm(prev => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            [notification.key]: e.target.checked
                          }
                        }))}
                      />
                      <span style={{ color: '#1f2937' }}>{notification.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={handlePreferencesUpdate}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#3b82f6',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Save Preferences
              </button>
              <button
                onClick={() => setShowPreferencesModal(false)}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  background: 'white',
                  color: '#6b7280',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Message */}
      {message && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '12px 24px',
          borderRadius: '8px',
          background: message.includes('success') ? '#dcfce7' : '#fee2e2',
          color: message.includes('success') ? '#166534' : '#dc2626',
          border: `1px solid ${message.includes('success') ? '#bbf7d0' : '#fecaca'}`,
          zIndex: 1001,
          fontWeight: '500'
        }}>
          {message}
        </div>
      )}
    </div>
  );
} 