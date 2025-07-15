import React, { useEffect, useState } from 'react';
import Calendar from './Calendar';
import SessionTemplates from './SessionTemplates';
import RecurringSessions from './RecurringSessions';
import AvailabilityManager from './AvailabilityManager';
import CalendarExport from './CalendarExport';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Session {
  id: string;
  clientId: string;
  startTime: string;
  endTime?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'MISSED';
  type: 'IN_PERSON' | 'VIRTUAL';
  location?: string;
  notes?: string;
  client?: {
    firstName: string;
    lastName: string;
    codeName: string;
  };
}

export default function TrainerSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [form, setForm] = useState({
    clientId: '',
    startTime: '',
    endTime: '',
    type: 'IN_PERSON',
    location: '',
    notes: ''
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [editModal, setEditModal] = useState<{ open: boolean; session: Session | null }>({ open: false, session: null });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [view, setView] = useState<'calendar' | 'table' | 'templates' | 'recurring' | 'availability' | 'export'>('calendar');
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [sessionDetailModal, setSessionDetailModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return '#1d4ed8';
      case 'COMPLETED': return '#047857';
      case 'CANCELLED': return '#dc2626';
      case 'MISSED': return '#d97706';
      default: return '#374151';
    }
  };

  const fetchSessions = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('trainer-tracker-token');
      const res = await fetch(`${API_BASE}/api/sessions?role=trainer`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch sessions');
      const data = await res.json();
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    // Fetch clients for dropdown
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem('trainer-tracker-token');
        const res = await fetch(`${API_BASE}/api/clients`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch clients');
        const data = await res.json();
        setClients(data);
      } catch {}
    };
    if (showModal) fetchClients();
  }, [showModal]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    if (!form.clientId || !form.startTime) {
      setFormError('Client and start time are required.');
      return;
    }
    try {
      const token = localStorage.getItem('trainer-tracker-token');
      const res = await fetch(`${API_BASE}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          startTime: new Date(form.startTime).toISOString(),
          endTime: form.endTime ? new Date(form.endTime).toISOString() : undefined
        })
      });
      
      if (res.status === 409) {
        const errorData = await res.json();
        setFormError(`Session conflicts with existing appointments. Please choose a different time.`);
        return;
      }
      
      if (!res.ok) throw new Error('Failed to create session');
      setFormSuccess('Session created!');
      setShowModal(false);
      setForm({ clientId: '', startTime: '', endTime: '', type: 'IN_PERSON', location: '', notes: '' });
      fetchSessions();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create session');
    }
  };

  const handleEdit = (session: Session) => {
    setEditModal({ open: true, session });
    setActionError('');
    setActionSuccess('');
    // Close the session detail modal when opening edit modal
    setSessionDetailModal(false);
    setSelectedSession(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');
    if (!editModal.session?.clientId || !editModal.session?.startTime) {
      setActionError('Client and start time are required.');
      return;
    }
    try {
      const token = localStorage.getItem('trainer-tracker-token');
      const res = await fetch(`${API_BASE}/api/sessions?id=${editModal.session.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...editModal.session,
          startTime: new Date(editModal.session.startTime).toISOString(),
          endTime: editModal.session.endTime ? new Date(editModal.session.endTime).toISOString() : undefined
        })
      });
      if (!res.ok) throw new Error('Failed to update session');
      setActionSuccess('Session updated!');
      setEditModal({ open: false, session: null });
      // Close the session detail modal after successful edit
      setSessionDetailModal(false);
      setSelectedSession(null);
      fetchSessions();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update session');
    }
  };

  const handleDelete = async (id: string) => {
    setActionError('');
    setActionSuccess('');
    if (!window.confirm('Are you sure you want to delete this session?')) return;
    try {
      const token = localStorage.getItem('trainer-tracker-token');
      const res = await fetch(`${API_BASE}/api/sessions?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete session');
      setActionSuccess('Session deleted!');
      // Close the session detail modal after successful delete
      setSessionDetailModal(false);
      setSelectedSession(null);
      fetchSessions();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete session');
    }
  };

  const handleSessionClick = (session: Session) => {
    setSelectedSession(session);
    setSessionDetailModal(true);
  };

  const handleDateClick = (date: Date) => {
    // Pre-fill the form with the selected date
    setForm(prev => ({
      ...prev,
      startTime: date.toISOString().slice(0, 16)
    }));
    setShowModal(true);
  };

  const handleSessionMove = async (sessionId: string, newDate: Date) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    try {
      const token = localStorage.getItem('trainer-tracker-token');
      const newStartTime = new Date(newDate);
      newStartTime.setHours(new Date(session.startTime).getHours());
      newStartTime.setMinutes(new Date(session.startTime).getMinutes());

      const res = await fetch(`${API_BASE}/api/sessions?id=${sessionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          startTime: newStartTime.toISOString()
        })
      });
      
      if (!res.ok) throw new Error('Failed to move session');
      fetchSessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move session');
    }
  };

  const renderSessionDetailModal = () => (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{ 
        background: 'white', 
        padding: 32, 
        borderRadius: 12, 
        minWidth: 400, 
        maxWidth: 500,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#1f2937', fontSize: '1.5rem', fontWeight: '600' }}>Session Details</h3>
        {selectedSession && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ marginBottom: 16, padding: '12px', background: '#f9fafb', borderRadius: '6px' }}>
              <strong style={{ color: '#374151', display: 'block', marginBottom: '4px' }}>Client:</strong>
              <span style={{ color: '#1f2937', fontWeight: '500' }}>
                {selectedSession.client?.firstName} {selectedSession.client?.lastName} ({selectedSession.client?.codeName})
              </span>
            </div>
            <div style={{ marginBottom: 16, padding: '12px', background: '#f9fafb', borderRadius: '6px' }}>
              <strong style={{ color: '#374151', display: 'block', marginBottom: '4px' }}>Date/Time:</strong>
              <span style={{ color: '#1f2937', fontWeight: '500' }}>
                {new Date(selectedSession.startTime).toLocaleString()}
              </span>
            </div>
            {selectedSession.endTime && (
              <div style={{ marginBottom: 16, padding: '12px', background: '#f9fafb', borderRadius: '6px' }}>
                <strong style={{ color: '#374151', display: 'block', marginBottom: '4px' }}>End Time:</strong>
                <span style={{ color: '#1f2937', fontWeight: '500' }}>
                  {new Date(selectedSession.endTime).toLocaleString()}
                </span>
              </div>
            )}
            <div style={{ marginBottom: 16, padding: '12px', background: '#f9fafb', borderRadius: '6px' }}>
              <strong style={{ color: '#374151', display: 'block', marginBottom: '4px' }}>Status:</strong>
                             <span style={{ 
                 fontWeight: '500',
                 padding: '4px 8px',
                 borderRadius: '4px',
                 background: getSessionStatusColor(selectedSession.status),
                 color: 'white',
                 fontSize: '0.875rem'
               }}>
                {selectedSession.status}
              </span>
            </div>
            <div style={{ marginBottom: 16, padding: '12px', background: '#f9fafb', borderRadius: '6px' }}>
              <strong style={{ color: '#374151', display: 'block', marginBottom: '4px' }}>Type:</strong>
              <span style={{ color: '#1f2937', fontWeight: '500' }}>
                {selectedSession.type}
              </span>
            </div>
            {selectedSession.location && (
              <div style={{ marginBottom: 16, padding: '12px', background: '#f9fafb', borderRadius: '6px' }}>
                <strong style={{ color: '#374151', display: 'block', marginBottom: '4px' }}>Location:</strong>
                <span style={{ color: '#1f2937', fontWeight: '500' }}>
                  {selectedSession.location}
                </span>
              </div>
            )}
            {selectedSession.notes && (
              <div style={{ marginBottom: 16, padding: '12px', background: '#f9fafb', borderRadius: '6px' }}>
                <strong style={{ color: '#374151', display: 'block', marginBottom: '4px' }}>Notes:</strong>
                <span style={{ color: '#1f2937', fontWeight: '500' }}>
                  {selectedSession.notes}
                </span>
              </div>
            )}
          </div>
        )}
        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            onClick={() => selectedSession && handleEdit(selectedSession)}
            style={{ 
              background: '#1d4ed8', 
              color: 'white', 
              padding: '10px 20px', 
              border: 'none', 
              borderRadius: 6, 
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#1e40af'}
            onMouseOut={(e) => e.currentTarget.style.background = '#1d4ed8'}
          >
            Edit Session
          </button>
          <button 
            onClick={() => selectedSession && handleDelete(selectedSession.id)}
            style={{ 
              background: '#dc2626', 
              color: 'white', 
              padding: '10px 20px', 
              border: 'none', 
              borderRadius: 6, 
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#b91c1c'}
            onMouseOut={(e) => e.currentTarget.style.background = '#dc2626'}
          >
            Delete Session
          </button>
          <button 
            onClick={() => setSessionDetailModal(false)}
            style={{ 
              background: '#6b7280', 
              color: 'white', 
              padding: '10px 20px', 
              border: 'none', 
              borderRadius: 6,
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#4b5563'}
            onMouseOut={(e) => e.currentTarget.style.background = '#6b7280'}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ 
          color: '#1f2937', 
          fontSize: '1.875rem', 
          fontWeight: '700', 
          margin: '0',
          textShadow: '0 1px 2px rgba(0,0,0,0.1)'
        }}>Scheduled Sessions</h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            onClick={() => setView('calendar')}
            style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              background: view === 'calendar' ? '#1d4ed8' : 'white',
              color: view === 'calendar' ? 'white' : '#1f2937',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              boxShadow: view === 'calendar' ? '0 2px 4px rgba(29, 78, 216, 0.2)' : '0 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            Calendar View
          </button>
          <button 
            onClick={() => setView('table')}
            style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              background: view === 'table' ? '#1d4ed8' : 'white',
              color: view === 'table' ? 'white' : '#1f2937',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              boxShadow: view === 'table' ? '0 2px 4px rgba(29, 78, 216, 0.2)' : '0 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            Table View
          </button>
          <button 
            onClick={() => setView('templates')}
            style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              background: view === 'templates' ? '#1d4ed8' : 'white',
              color: view === 'templates' ? 'white' : '#1f2937',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              boxShadow: view === 'templates' ? '0 2px 4px rgba(29, 78, 216, 0.2)' : '0 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            Templates
          </button>
          <button 
            onClick={() => setView('recurring')}
            style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              background: view === 'recurring' ? '#1d4ed8' : 'white',
              color: view === 'recurring' ? 'white' : '#1f2937',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              boxShadow: view === 'recurring' ? '0 2px 4px rgba(29, 78, 216, 0.2)' : '0 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            Recurring
          </button>
          <button 
            onClick={() => setView('availability')}
            style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              background: view === 'availability' ? '#1d4ed8' : 'white',
              color: view === 'availability' ? 'white' : '#1f2937',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              boxShadow: view === 'availability' ? '0 2px 4px rgba(29, 78, 216, 0.2)' : '0 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            Availability
          </button>
          <button 
            onClick={() => setView('export')}
            style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              background: view === 'export' ? '#1d4ed8' : 'white',
              color: view === 'export' ? 'white' : '#1f2937',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              boxShadow: view === 'export' ? '0 2px 4px rgba(29, 78, 216, 0.2)' : '0 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            Export
          </button>
          <button 
            onClick={() => setShowModal(true)}
            style={{
              background: '#047857',
              color: 'white',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(4, 120, 87, 0.2)'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#065f46'}
            onMouseOut={(e) => e.currentTarget.style.background = '#047857'}
          >
            + New Session
          </button>
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {actionSuccess && <p style={{ color: 'green' }}>{actionSuccess}</p>}
      {actionError && <p style={{ color: 'red' }}>{actionError}</p>}

      {view === 'calendar' ? (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {(['month', 'week', 'day'] as const).map(viewType => (
              <button
                key={viewType}
                onClick={() => setCalendarView(viewType)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  background: calendarView === viewType ? '#1d4ed8' : 'white',
                  color: calendarView === viewType ? 'white' : '#1f2937',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  boxShadow: calendarView === viewType ? '0 2px 4px rgba(29, 78, 216, 0.2)' : '0 1px 2px rgba(0,0,0,0.1)'
                }}
              >
                {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
              </button>
            ))}
          </div>
          <Calendar
            sessions={sessions}
            view={calendarView}
            onSessionClick={handleSessionClick}
            onDateClick={handleDateClick}
            onSessionMove={handleSessionMove}
          />
        </div>
      ) : view === 'templates' ? (
        <SessionTemplates />
      ) : view === 'recurring' ? (
        <RecurringSessions />
      ) : view === 'availability' ? (
        <AvailabilityManager />
      ) : view === 'export' ? (
        <CalendarExport userType="trainer" />
      ) : (
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          background: 'white',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              <th style={{ 
                padding: '12px 16px', 
                textAlign: 'left', 
                fontWeight: '600',
                color: '#374151',
                fontSize: '0.875rem',
                borderBottom: '1px solid #e5e7eb'
              }}>Client</th>
              <th style={{ 
                padding: '12px 16px', 
                textAlign: 'left', 
                fontWeight: '600',
                color: '#374151',
                fontSize: '0.875rem',
                borderBottom: '1px solid #e5e7eb'
              }}>Date/Time</th>
              <th style={{ 
                padding: '12px 16px', 
                textAlign: 'left', 
                fontWeight: '600',
                color: '#374151',
                fontSize: '0.875rem',
                borderBottom: '1px solid #e5e7eb'
              }}>Status</th>
              <th style={{ 
                padding: '12px 16px', 
                textAlign: 'left', 
                fontWeight: '600',
                color: '#374151',
                fontSize: '0.875rem',
                borderBottom: '1px solid #e5e7eb'
              }}>Type</th>
              <th style={{ 
                padding: '12px 16px', 
                textAlign: 'left', 
                fontWeight: '600',
                color: '#374151',
                fontSize: '0.875rem',
                borderBottom: '1px solid #e5e7eb'
              }}>Location</th>
              <th style={{ 
                padding: '12px 16px', 
                textAlign: 'left', 
                fontWeight: '600',
                color: '#374151',
                fontSize: '0.875rem',
                borderBottom: '1px solid #e5e7eb'
              }}>Notes</th>
              <th style={{ 
                padding: '12px 16px', 
                textAlign: 'left', 
                fontWeight: '600',
                color: '#374151',
                fontSize: '0.875rem',
                borderBottom: '1px solid #e5e7eb'
              }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s, index) => (
              <tr key={s.id} style={{ 
                background: index % 2 === 0 ? 'white' : '#f9fafb',
                borderBottom: '1px solid #f3f4f6'
              }}>
                <td style={{ 
                  padding: '12px 16px', 
                  color: '#1f2937',
                  fontSize: '0.875rem'
                }}>{s.client?.firstName} {s.client?.lastName} ({s.client?.codeName})</td>
                <td style={{ 
                  padding: '12px 16px', 
                  color: '#1f2937',
                  fontSize: '0.875rem'
                }}>{new Date(s.startTime).toLocaleString()}</td>
                <td style={{ 
                  padding: '12px 16px', 
                  color: '#1f2937',
                  fontSize: '0.875rem'
                }}>
                  <span style={{ 
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: getSessionStatusColor(s.status),
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}>
                    {s.status}
                  </span>
                </td>
                <td style={{ 
                  padding: '12px 16px', 
                  color: '#1f2937',
                  fontSize: '0.875rem'
                }}>{s.type}</td>
                <td style={{ 
                  padding: '12px 16px', 
                  color: '#1f2937',
                  fontSize: '0.875rem'
                }}>{s.location || '-'}</td>
                <td style={{ 
                  padding: '12px 16px', 
                  color: '#1f2937',
                  fontSize: '0.875rem'
                }}>{s.notes || '-'}</td>
                <td style={{ padding: '12px 16px' }}>
                  <button 
                    onClick={() => handleEdit(s)} 
                    style={{ 
                      marginRight: 8,
                      background: '#1d4ed8',
                      color: 'white',
                      padding: '6px 12px',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#1e40af'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#1d4ed8'}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(s.id)} 
                    style={{ 
                      background: '#dc2626',
                      color: 'white',
                      padding: '6px 12px',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#b91c1c'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#dc2626'}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Session Creation Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <form onSubmit={handleCreate} style={{ 
            background: 'white', 
            padding: 32, 
            borderRadius: 12, 
            minWidth: 320,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ 
              margin: '0 0 20px 0', 
              color: '#1f2937', 
              fontSize: '1.5rem', 
              fontWeight: '600' 
            }}>New Session</h3>
            {formError && <p style={{ color: '#dc2626', marginBottom: '16px', fontWeight: '500' }}>{formError}</p>}
            <div style={{ marginBottom: 16 }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px', 
                color: '#374151', 
                fontWeight: '600',
                fontSize: '0.875rem'
              }}>Client:</label>
              <select 
                name="clientId" 
                value={form.clientId} 
                onChange={handleFormChange} 
                required 
                style={{ 
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  color: '#1f2937',
                  background: 'white'
                }}
              >
                <option value="">Select client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.codeName})</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px', 
                color: '#374151', 
                fontWeight: '600',
                fontSize: '0.875rem'
              }}>Start Time:</label>
              <input 
                type="datetime-local" 
                name="startTime" 
                value={form.startTime} 
                onChange={handleFormChange} 
                required 
                style={{ 
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  color: '#1f2937',
                  background: 'white'
                }} 
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px', 
                color: '#374151', 
                fontWeight: '600',
                fontSize: '0.875rem'
              }}>End Time:</label>
              <input 
                type="datetime-local" 
                name="endTime" 
                value={form.endTime} 
                onChange={handleFormChange} 
                style={{ 
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  color: '#1f2937',
                  background: 'white'
                }} 
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px', 
                color: '#374151', 
                fontWeight: '600',
                fontSize: '0.875rem'
              }}>Type:</label>
              <select 
                name="type" 
                value={form.type} 
                onChange={handleFormChange} 
                style={{ 
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  color: '#1f2937',
                  background: 'white'
                }}
              >
                <option value="IN_PERSON">In-Person</option>
                <option value="VIRTUAL">Virtual</option>
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px', 
                color: '#374151', 
                fontWeight: '600',
                fontSize: '0.875rem'
              }}>Location:</label>
              <input 
                type="text" 
                name="location" 
                value={form.location} 
                onChange={handleFormChange} 
                style={{ 
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  color: '#1f2937',
                  background: 'white'
                }} 
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px', 
                color: '#374151', 
                fontWeight: '600',
                fontSize: '0.875rem'
              }}>Notes:</label>
              <textarea 
                name="notes" 
                value={form.notes} 
                onChange={handleFormChange} 
                style={{ 
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  color: '#1f2937',
                  background: 'white',
                  minHeight: '80px',
                  resize: 'vertical'
                }} 
              />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button 
                type="submit" 
                style={{ 
                  background: '#1d4ed8', 
                  color: 'white', 
                  padding: '10px 20px', 
                  border: 'none', 
                  borderRadius: 6, 
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#1e40af'}
                onMouseOut={(e) => e.currentTarget.style.background = '#1d4ed8'}
              >
                Create
              </button>
              <button 
                type="button" 
                onClick={() => setShowModal(false)} 
                style={{ 
                  background: '#6b7280', 
                  color: 'white', 
                  padding: '10px 20px', 
                  border: 'none', 
                  borderRadius: 6,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#4b5563'}
                onMouseOut={(e) => e.currentTarget.style.background = '#6b7280'}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Session Edit Modal */}
      {editModal.open && editModal.session && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <form onSubmit={handleEditSubmit} style={{ 
            background: 'white', 
            padding: 32, 
            borderRadius: 12, 
            minWidth: 320,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ 
              margin: '0 0 20px 0', 
              color: '#1f2937', 
              fontSize: '1.5rem', 
              fontWeight: '600' 
            }}>Edit Session</h3>
                        {actionError && <p style={{ color: '#dc2626', marginBottom: '16px', fontWeight: '500' }}>{actionError}</p>}
            <div style={{ marginBottom: 16 }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px', 
                color: '#374151', 
                fontWeight: '600',
                fontSize: '0.875rem'
              }}>Client:</label>
              <select 
                name="clientId" 
                value={editModal.session.clientId} 
                onChange={e => setEditModal(m => ({ ...m, session: { ...m.session!, clientId: e.target.value } }))} 
                required 
                style={{ 
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  color: '#1f2937',
                  background: 'white'
                }}
              >
                <option value="">Select client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.codeName})</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px', 
                color: '#374151', 
                fontWeight: '600',
                fontSize: '0.875rem'
              }}>Start Time:</label>
              <input 
                type="datetime-local" 
                name="startTime" 
                value={editModal.session.startTime?.slice(0,16)} 
                onChange={e => setEditModal(m => ({ ...m, session: { ...m.session!, startTime: e.target.value } }))} 
                required 
                style={{ 
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  color: '#1f2937',
                  background: 'white'
                }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px', 
                color: '#374151', 
                fontWeight: '600',
                fontSize: '0.875rem'
              }}>End Time:</label>
              <input 
                type="datetime-local" 
                name="endTime" 
                value={editModal.session.endTime?.slice(0,16) || ''} 
                onChange={e => setEditModal(m => ({ ...m, session: { ...m.session!, endTime: e.target.value } }))} 
                style={{ 
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  color: '#1f2937',
                  background: 'white'
                }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px', 
                color: '#374151', 
                fontWeight: '600',
                fontSize: '0.875rem'
              }}>Type:</label>
              <select 
                name="type" 
                value={editModal.session.type} 
                onChange={e => setEditModal(m => ({ ...m, session: { ...m.session!, type: e.target.value as 'IN_PERSON' | 'VIRTUAL' } }))} 
                style={{ 
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  color: '#1f2937',
                  background: 'white'
                }}
              >
                <option value="IN_PERSON">In-Person</option>
                <option value="VIRTUAL">Virtual</option>
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px', 
                color: '#374151', 
                fontWeight: '600',
                fontSize: '0.875rem'
              }}>Location:</label>
              <input 
                type="text" 
                name="location" 
                value={editModal.session.location || ''} 
                onChange={e => setEditModal(m => ({ ...m, session: { ...m.session!, location: e.target.value } }))} 
                style={{ 
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  color: '#1f2937',
                  background: 'white'
                }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px', 
                color: '#374151', 
                fontWeight: '600',
                fontSize: '0.875rem'
              }}>Notes:</label>
              <textarea 
                name="notes" 
                value={editModal.session.notes || ''} 
                onChange={e => setEditModal(m => ({ ...m, session: { ...m.session!, notes: e.target.value } }))} 
                style={{ 
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  color: '#1f2937',
                  background: 'white',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button 
                type="submit" 
                style={{ 
                  background: '#1d4ed8', 
                  color: 'white', 
                  padding: '10px 20px', 
                  border: 'none', 
                  borderRadius: 6, 
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#1e40af'}
                onMouseOut={(e) => e.currentTarget.style.background = '#1d4ed8'}
              >
                Save
              </button>
              <button 
                type="button" 
                onClick={() => setEditModal({ open: false, session: null })} 
                style={{ 
                  background: '#6b7280', 
                  color: 'white', 
                  padding: '10px 20px', 
                  border: 'none', 
                  borderRadius: 6,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#4b5563'}
                onMouseOut={(e) => e.currentTarget.style.background = '#6b7280'}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Session Detail Modal */}
      {sessionDetailModal && renderSessionDetailModal()}
    </div>
  );
} 