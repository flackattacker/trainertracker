import React, { useEffect, useState } from 'react';
import Calendar from './Calendar';
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

export default function ClientSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<'calendar' | 'table' | 'export'>('calendar');
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [sessionDetailModal, setSessionDetailModal] = useState(false);

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('client-portal-token');
        const res = await fetch(`${API_BASE}/api/sessions?role=client`, {
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
    fetchSessions();
  }, []);

  const handleSessionClick = (session: Session) => {
    setSelectedSession(session);
    setSessionDetailModal(true);
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
            onClick={() => setSessionDetailModal(false)}
            style={{ background: '#3b82f6', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 6, fontWeight: 500 }}
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
        <h2>My Sessions</h2>
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
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

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
          />
        </div>
      ) : view === 'export' ? (
        <CalendarExport userType="client" />
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Date/Time</th>
              <th>Status</th>
              <th>Type</th>
              <th>Location</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id} style={{ cursor: 'pointer' }} onClick={() => handleSessionClick(s)}>
                <td>{new Date(s.startTime).toLocaleString()}</td>
                <td>{s.status}</td>
                <td>{s.type}</td>
                <td>{s.location || '-'}</td>
                <td>{s.notes || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Session Detail Modal */}
      {sessionDetailModal && renderSessionDetailModal()}
    </div>
  );
} 