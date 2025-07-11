import React, { useState, useEffect } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface RecurringSession {
  id: string;
  clientId: string;
  clientName: string;
  startTime: string;
  endTime?: string;
  type: 'IN_PERSON' | 'VIRTUAL';
  location?: string;
  notes?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number; // every X days/weeks/months
  daysOfWeek?: number[]; // for weekly: 0=Sunday, 1=Monday, etc.
  endDate?: string;
  isActive: boolean;
}

export default function RecurringSessions() {
  const [recurringSessions, setRecurringSessions] = useState<RecurringSession[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState<RecurringSession | null>(null);
  const [form, setForm] = useState({
    clientId: '',
    startTime: '',
    endTime: '',
    type: 'IN_PERSON' as 'IN_PERSON' | 'VIRTUAL',
    location: '',
    notes: '',
    frequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
    interval: 1,
    daysOfWeek: [] as number[],
    endDate: '',
    isActive: true
  });

  useEffect(() => {
    fetchClients();
    // For now, we'll use mock data
    setRecurringSessions([
      {
        id: 'recurring-1',
        clientId: 'client-1',
        clientName: 'Sarah Johnson',
        startTime: '2025-07-15T09:00:00Z',
        endTime: '2025-07-15T10:00:00Z',
        type: 'IN_PERSON',
        location: 'Gym - Weight Room',
        notes: 'Weekly strength training',
        frequency: 'weekly',
        interval: 1,
        daysOfWeek: [1, 3, 5], // Monday, Wednesday, Friday
        endDate: '2025-12-31',
        isActive: true
      }
    ]);
    setLoading(false);
  }, []);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('trainer-tracker-token');
      const res = await fetch(`${API_BASE}/api/clients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      if (name === 'daysOfWeek') {
        const dayValue = parseInt(value);
        setForm(prev => ({
          ...prev,
          daysOfWeek: checked 
            ? [...prev.daysOfWeek, dayValue]
            : prev.daysOfWeek.filter(d => d !== dayValue)
        }));
      } else {
        setForm(prev => ({ ...prev, [name]: checked }));
      }
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientId || !form.startTime) {
      setError('Client and start time are required');
      return;
    }

    if (form.frequency === 'weekly' && form.daysOfWeek.length === 0) {
      setError('Please select at least one day of the week');
      return;
    }

    const client = clients.find(c => c.id === form.clientId);
    const newRecurringSession: RecurringSession = {
      id: editingSession?.id || `recurring-${Date.now()}`,
      clientId: form.clientId,
      clientName: client ? `${client.firstName} ${client.lastName}` : 'Unknown Client',
      startTime: form.startTime,
      endTime: form.endTime || undefined,
      type: form.type,
      location: form.location,
      notes: form.notes,
      frequency: form.frequency,
      interval: form.interval,
      daysOfWeek: form.frequency === 'weekly' ? form.daysOfWeek : undefined,
      endDate: form.endDate || undefined,
      isActive: form.isActive
    };

    if (editingSession) {
      setRecurringSessions(prev => 
        prev.map(s => s.id === editingSession.id ? newRecurringSession : s)
      );
      setEditingSession(null);
    } else {
      setRecurringSessions(prev => [...prev, newRecurringSession]);
    }

    resetForm();
    setShowModal(false);
    setError('');
  };

  const handleEdit = (session: RecurringSession) => {
    setEditingSession(session);
    setForm({
      clientId: session.clientId,
      startTime: session.startTime.slice(0, 16),
      endTime: session.endTime?.slice(0, 16) || '',
      type: session.type,
      location: session.location || '',
      notes: session.notes || '',
      frequency: session.frequency,
      interval: session.interval,
      daysOfWeek: session.daysOfWeek || [],
      endDate: session.endDate || '',
      isActive: session.isActive
    });
    setShowModal(true);
    setError('');
  };

  const handleDelete = (sessionId: string) => {
    if (window.confirm('Are you sure you want to delete this recurring session?')) {
      setRecurringSessions(prev => prev.filter(s => s.id !== sessionId));
    }
  };

  const handleToggleActive = (sessionId: string) => {
    setRecurringSessions(prev => 
      prev.map(s => s.id === sessionId ? { ...s, isActive: !s.isActive } : s)
    );
  };

  const resetForm = () => {
    setForm({
      clientId: '',
      startTime: '',
      endTime: '',
      type: 'IN_PERSON',
      location: '',
      notes: '',
      frequency: 'weekly',
      interval: 1,
      daysOfWeek: [],
      endDate: '',
      isActive: true
    });
  };

  const formatFrequency = (frequency: string, interval: number, daysOfWeek?: number[]) => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    switch (frequency) {
      case 'daily':
        return interval === 1 ? 'Daily' : `Every ${interval} days`;
      case 'weekly':
        if (daysOfWeek && daysOfWeek.length > 0) {
          const days = daysOfWeek.map(d => dayNames[d]).join(', ');
          return interval === 1 ? `Weekly on ${days}` : `Every ${interval} weeks on ${days}`;
        }
        return interval === 1 ? 'Weekly' : `Every ${interval} weeks`;
      case 'monthly':
        return interval === 1 ? 'Monthly' : `Every ${interval} months`;
      default:
        return 'Unknown';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const weekDays = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>Recurring Sessions</h2>
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
          + New Recurring Session
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red', marginBottom: 16 }}>{error}</p>}

      <div style={{ display: 'grid', gap: '16px' }}>
        {recurringSessions.map((session) => (
          <div 
            key={session.id}
            style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
              opacity: session.isActive ? 1 : 0.6
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>
                  {session.clientName}
                </h3>
                <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '0.875rem' }}>
                  {formatTime(session.startTime)} - {session.endTime ? formatTime(session.endTime) : 'No end time'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleToggleActive(session.id)}
                  style={{
                    padding: '4px 8px',
                    border: '1px solid #d1d5db',
                    background: session.isActive ? '#10b981' : '#6b7280',
                    color: 'white',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.75rem'
                  }}
                >
                  {session.isActive ? 'Active' : 'Inactive'}
                </button>
                <button
                  onClick={() => handleEdit(session)}
                  style={{
                    padding: '4px 8px',
                    border: '1px solid #d1d5db',
                    background: 'white',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.75rem'
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(session.id)}
                  style={{
                    padding: '4px 8px',
                    border: '1px solid #ef4444',
                    background: 'white',
                    color: '#ef4444',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.75rem'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                <strong>Pattern:</strong> {formatFrequency(session.frequency, session.interval, session.daysOfWeek)}
              </span>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                <strong>Type:</strong> {session.type === 'IN_PERSON' ? 'In-Person' : 'Virtual'}
              </span>
            </div>

            {session.location && (
              <div style={{ marginBottom: '8px' }}>
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  <strong>Location:</strong> {session.location}
                </span>
              </div>
            )}

            {session.notes && (
              <div style={{ marginBottom: '8px' }}>
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  <strong>Notes:</strong> {session.notes}
                </span>
              </div>
            )}

            {session.endDate && (
              <div>
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  <strong>Ends:</strong> {new Date(session.endDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Recurring Session Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <form onSubmit={handleSubmit} style={{ background: 'white', padding: 32, borderRadius: 12, minWidth: 500, maxHeight: '90vh', overflow: 'auto' }}>
            <h3>{editingSession ? 'Edit Recurring Session' : 'New Recurring Session'}</h3>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            <div style={{ marginBottom: 12 }}>
              <label>Client:</label><br />
              <select 
                name="clientId" 
                value={form.clientId} 
                onChange={handleFormChange} 
                required 
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
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
                value={form.startTime} 
                onChange={handleFormChange} 
                required 
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label>End Time (optional):</label><br />
              <input 
                type="datetime-local" 
                name="endTime" 
                value={form.endTime} 
                onChange={handleFormChange} 
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label>Type:</label><br />
              <select 
                name="type" 
                value={form.type} 
                onChange={handleFormChange} 
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
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
                value={form.location} 
                onChange={handleFormChange} 
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label>Frequency:</label><br />
              <select 
                name="frequency" 
                value={form.frequency} 
                onChange={handleFormChange} 
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label>Interval:</label><br />
              <input 
                type="number" 
                name="interval" 
                value={form.interval} 
                onChange={handleFormChange} 
                min="1" 
                max="52"
                required 
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
              />
            </div>

            {form.frequency === 'weekly' && (
              <div style={{ marginBottom: 12 }}>
                <label>Days of Week:</label><br />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {weekDays.map(day => (
                    <label key={day.value} style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}>
                      <input
                        type="checkbox"
                        name="daysOfWeek"
                        value={day.value}
                        checked={form.daysOfWeek.includes(day.value)}
                        onChange={handleFormChange}
                        style={{ marginRight: '8px' }}
                      />
                      {day.label}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginBottom: 12 }}>
              <label>End Date (optional):</label><br />
              <input 
                type="date" 
                name="endDate" 
                value={form.endDate} 
                onChange={handleFormChange} 
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label>Notes:</label><br />
              <textarea 
                name="notes" 
                value={form.notes} 
                onChange={handleFormChange} 
                rows={3}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleFormChange}
                  style={{ marginRight: '8px' }}
                />
                Active
              </label>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                type="submit" 
                style={{ 
                  background: '#3b82f6', 
                  color: 'white', 
                  padding: '10px 20px', 
                  border: 'none', 
                  borderRadius: 6, 
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                {editingSession ? 'Update' : 'Create'}
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setShowModal(false);
                  setEditingSession(null);
                  resetForm();
                }}
                style={{ 
                  background: '#eee', 
                  color: '#222', 
                  padding: '10px 20px', 
                  border: 'none', 
                  borderRadius: 6,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 