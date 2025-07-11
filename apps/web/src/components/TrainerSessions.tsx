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
      background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{ background: 'white', padding: 32, borderRadius: 12, minWidth: 400, maxWidth: 500 }}>
        <h3>Session Details</h3>
        {selectedSession && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ marginBottom: 12 }}>
              <strong>Client:</strong> {selectedSession.client?.firstName} {selectedSession.client?.lastName} ({selectedSession.client?.codeName})
            </div>
            <div style={{ marginBottom: 12 }}>
              <strong>Date/Time:</strong> {new Date(selectedSession.startTime).toLocaleString()}
            </div>
            {selectedSession.endTime && (
              <div style={{ marginBottom: 12 }}>
                <strong>End Time:</strong> {new Date(selectedSession.endTime).toLocaleString()}
              </div>
            )}
            <div style={{ marginBottom: 12 }}>
              <strong>Status:</strong> {selectedSession.status}
            </div>
            <div style={{ marginBottom: 12 }}>
              <strong>Type:</strong> {selectedSession.type}
            </div>
            {selectedSession.location && (
              <div style={{ marginBottom: 12 }}>
                <strong>Location:</strong> {selectedSession.location}
              </div>
            )}
            {selectedSession.notes && (
              <div style={{ marginBottom: 12 }}>
                <strong>Notes:</strong> {selectedSession.notes}
              </div>
            )}
          </div>
        )}
        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            onClick={() => selectedSession && handleEdit(selectedSession)}
            style={{ background: '#3b82f6', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 6, fontWeight: 500 }}
          >
            Edit Session
          </button>
          <button 
            onClick={() => selectedSession && handleDelete(selectedSession.id)}
            style={{ background: '#ef4444', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 6, fontWeight: 500 }}
          >
            Delete Session
          </button>
          <button 
            onClick={() => setSessionDetailModal(false)}
            style={{ background: '#eee', color: '#222', padding: '10px 20px', border: 'none', borderRadius: 6 }}
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
        <h2>Scheduled Sessions</h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            onClick={() => setView('calendar')}
            style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              background: view === 'calendar' ? '#3b82f6' : 'white',
              color: view === 'calendar' ? 'white' : '#374151',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Calendar View
          </button>
          <button 
            onClick={() => setView('table')}
            style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              background: view === 'table' ? '#3b82f6' : 'white',
              color: view === 'table' ? 'white' : '#374151',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Table View
          </button>
          <button 
            onClick={() => setView('templates')}
            style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              background: view === 'templates' ? '#3b82f6' : 'white',
              color: view === 'templates' ? 'white' : '#374151',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Templates
          </button>
          <button 
            onClick={() => setView('recurring')}
            style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              background: view === 'recurring' ? '#3b82f6' : 'white',
              color: view === 'recurring' ? 'white' : '#374151',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Recurring
          </button>
          <button 
            onClick={() => setView('availability')}
            style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              background: view === 'availability' ? '#3b82f6' : 'white',
              color: view === 'availability' ? 'white' : '#374151',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Availability
          </button>
          <button 
            onClick={() => setView('export')}
            style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              background: view === 'export' ? '#3b82f6' : 'white',
              color: view === 'export' ? 'white' : '#374151',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Export
          </button>
          <button 
            onClick={() => setShowModal(true)}
            style={{
              background: '#10b981',
              color: 'white',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
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
                  background: calendarView === viewType ? '#3b82f6' : 'white',
                  color: calendarView === viewType ? 'white' : '#374151',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
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
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Client</th>
              <th>Date/Time</th>
              <th>Status</th>
              <th>Type</th>
              <th>Location</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id}>
                <td>{s.client?.firstName} {s.client?.lastName} ({s.client?.codeName})</td>
                <td>{new Date(s.startTime).toLocaleString()}</td>
                <td>{s.status}</td>
                <td>{s.type}</td>
                <td>{s.location || '-'}</td>
                <td>{s.notes || '-'}</td>
                <td>
                  <button onClick={() => handleEdit(s)} style={{ marginRight: 8 }}>Edit</button>
                  <button onClick={() => handleDelete(s.id)} style={{ color: 'red' }}>Delete</button>
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
          background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <form onSubmit={handleCreate} style={{ background: 'white', padding: 32, borderRadius: 12, minWidth: 320 }}>
            <h3>New Session</h3>
            {formError && <p style={{ color: 'red' }}>{formError}</p>}
            <div style={{ marginBottom: 12 }}>
              <label>Client:</label><br />
              <select name="clientId" value={form.clientId} onChange={handleFormChange} required style={{ width: '100%' }}>
                <option value="">Select client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.codeName})</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Start Time:</label><br />
              <input type="datetime-local" name="startTime" value={form.startTime} onChange={handleFormChange} required style={{ width: '100%' }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>End Time:</label><br />
              <input type="datetime-local" name="endTime" value={form.endTime} onChange={handleFormChange} style={{ width: '100%' }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Type:</label><br />
              <select name="type" value={form.type} onChange={handleFormChange} style={{ width: '100%' }}>
                <option value="IN_PERSON">In-Person</option>
                <option value="VIRTUAL">Virtual</option>
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Location:</label><br />
              <input type="text" name="location" value={form.location} onChange={handleFormChange} style={{ width: '100%' }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Notes:</label><br />
              <textarea name="notes" value={form.notes} onChange={handleFormChange} style={{ width: '100%' }} />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button type="submit" style={{ background: '#3b82f6', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 6, fontWeight: 500 }}>Create</button>
              <button type="button" onClick={() => setShowModal(false)} style={{ background: '#eee', color: '#222', padding: '10px 20px', border: 'none', borderRadius: 6 }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Session Edit Modal */}
      {editModal.open && editModal.session && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <form onSubmit={handleEditSubmit} style={{ background: 'white', padding: 32, borderRadius: 12, minWidth: 320 }}>
            <h3>Edit Session</h3>
            {actionError && <p style={{ color: 'red' }}>{actionError}</p>}
            <div style={{ marginBottom: 12 }}>
              <label>Client:</label><br />
              <select 
                name="clientId" 
                value={editModal.session.clientId} 
                onChange={e => setEditModal(m => ({ ...m, session: { ...m.session!, clientId: e.target.value } }))} 
                required 
                style={{ width: '100%' }}
              >
                <option value="">Select client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.codeName})</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Start Time:</label><br />
              <input 
                type="datetime-local" 
                name="startTime" 
                value={editModal.session.startTime?.slice(0,16)} 
                onChange={e => setEditModal(m => ({ ...m, session: { ...m.session!, startTime: e.target.value } }))} 
                required 
                style={{ width: '100%' }} 
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>End Time:</label><br />
              <input 
                type="datetime-local" 
                name="endTime" 
                value={editModal.session.endTime?.slice(0,16) || ''} 
                onChange={e => setEditModal(m => ({ ...m, session: { ...m.session!, endTime: e.target.value } }))} 
                style={{ width: '100%' }} 
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Type:</label><br />
              <select 
                name="type" 
                value={editModal.session.type} 
                onChange={e => setEditModal(m => ({ ...m, session: { ...m.session!, type: e.target.value as 'IN_PERSON' | 'VIRTUAL' } }))} 
                style={{ width: '100%' }}
              >
                <option value="IN_PERSON">In-Person</option>
                <option value="VIRTUAL">Virtual</option>
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Location:</label><br />
              <input 
                type="text" 
                name="location" 
                value={editModal.session.location || ''} 
                onChange={e => setEditModal(m => ({ ...m, session: { ...m.session!, location: e.target.value } }))} 
                style={{ width: '100%' }} 
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Notes:</label><br />
              <textarea 
                name="notes" 
                value={editModal.session.notes || ''} 
                onChange={e => setEditModal(m => ({ ...m, session: { ...m.session!, notes: e.target.value } }))} 
                style={{ width: '100%' }} 
              />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button type="submit" style={{ background: '#3b82f6', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 6, fontWeight: 500 }}>Save</button>
              <button type="button" onClick={() => setEditModal({ open: false, session: null })} style={{ background: '#eee', color: '#222', padding: '10px 20px', border: 'none', borderRadius: 6 }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Session Detail Modal */}
      {sessionDetailModal && renderSessionDetailModal()}
    </div>
  );
} 