import React, { useState, useEffect } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Availability {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  sessionTypes: {
    inPerson: boolean;
    virtual: boolean;
  };
  maxSessionsPerDay: number;
}

interface AvailabilityException {
  id?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  isAvailable: boolean;
  reason?: string;
}

const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

export default function AvailabilityManager() {
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [exceptions, setExceptions] = useState<AvailabilityException[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('trainer-tracker-token');
      const res = await fetch(`${API_BASE}/api/availability?includeExceptions=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch availability');
      const data = await res.json();
      setAvailabilities(data.availabilities || []);
      setExceptions(data.exceptions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch availability');
    } finally {
      setLoading(false);
    }
  };

  const handleAvailabilityChange = (dayOfWeek: number, field: keyof Availability, value: any) => {
    setAvailabilities(prev => {
      const existing = prev.find(a => a.dayOfWeek === dayOfWeek);
      if (existing) {
        return prev.map(a => 
          a.dayOfWeek === dayOfWeek 
            ? { ...a, [field]: value }
            : a
        );
      } else {
        return [...prev, {
          dayOfWeek,
          startTime: '09:00',
          endTime: '17:00',
          isAvailable: true,
          sessionTypes: { inPerson: true, virtual: true },
          maxSessionsPerDay: 8,
          [field]: value
        }];
      }
    });
  };

  const handleSessionTypeChange = (dayOfWeek: number, type: 'inPerson' | 'virtual', checked: boolean) => {
    setAvailabilities(prev => {
      const existing = prev.find(a => a.dayOfWeek === dayOfWeek);
      if (existing) {
        return prev.map(a => 
          a.dayOfWeek === dayOfWeek 
            ? { 
                ...a, 
                sessionTypes: { 
                  ...a.sessionTypes, 
                  [type]: checked 
                } 
              }
            : a
        );
      } else {
        return [...prev, {
          dayOfWeek,
          startTime: '09:00',
          endTime: '17:00',
          isAvailable: true,
          sessionTypes: { inPerson: true, virtual: true, [type]: checked },
          maxSessionsPerDay: 8
        }];
      }
    });
  };

  const addException = () => {
    setExceptions(prev => [...prev, {
      date: new Date().toISOString().split('T')[0],
      isAvailable: false,
      reason: ''
    } as AvailabilityException]);
  };

  const updateException = (index: number, field: keyof AvailabilityException, value: any) => {
    setExceptions(prev => prev.map((ex, i) => 
      i === index ? { ...ex, [field]: value } : ex
    ));
  };

  const removeException = (index: number) => {
    setExceptions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('trainer-tracker-token');
      const res = await fetch(`${API_BASE}/api/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          availabilities,
          exceptions
        })
      });
      
      if (!res.ok) throw new Error('Failed to save availability');
      
      setSuccess('Availability updated successfully!');
      await fetchAvailability(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>Loading availability...</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ marginBottom: '24px', color: '#1f2937' }}>Manage Availability</h2>
      
      {error && (
        <div style={{ 
          background: '#fee2e2', 
          color: '#dc2626', 
          padding: '12px', 
          borderRadius: '6px', 
          marginBottom: '16px' 
        }}>
          {error}
        </div>
      )}
      
      {success && (
        <div style={{ 
          background: '#d1fae5', 
          color: '#059669', 
          padding: '12px', 
          borderRadius: '6px', 
          marginBottom: '16px' 
        }}>
          {success}
        </div>
      )}

      {/* Weekly Availability */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ marginBottom: '16px', color: '#374151' }}>Weekly Schedule</h3>
        <div style={{ 
          background: 'white', 
          border: '1px solid #e5e7eb', 
          borderRadius: '8px', 
          overflow: 'hidden' 
        }}>
          {DAYS_OF_WEEK.map((day, index) => {
            const availability = availabilities.find(a => a.dayOfWeek === index);
            const isAvailable = availability?.isAvailable ?? false;
            
            return (
              <div key={day} style={{ 
                display: 'grid', 
                gridTemplateColumns: '120px 1fr 100px 120px 120px',
                gap: '12px',
                padding: '12px',
                borderBottom: index < 6 ? '1px solid #f3f4f6' : 'none',
                alignItems: 'center'
              }}>
                <div style={{ fontWeight: '500', color: '#374151' }}>{day}</div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => handleAvailabilityChange(index, 'isAvailable', e.target.checked)}
                  />
                  <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    Available
                  </span>
                </div>
                
                {isAvailable && (
                  <>
                    <input
                      type="time"
                      value={availability?.startTime || '09:00'}
                      onChange={(e) => handleAvailabilityChange(index, 'startTime', e.target.value)}
                      style={{ padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                    />
                    <input
                      type="time"
                      value={availability?.endTime || '17:00'}
                      onChange={(e) => handleAvailabilityChange(index, 'endTime', e.target.value)}
                      style={{ padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <label style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="checkbox"
                          checked={availability?.sessionTypes?.inPerson ?? true}
                          onChange={(e) => handleSessionTypeChange(index, 'inPerson', e.target.checked)}
                        />
                        In-Person
                      </label>
                      <label style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="checkbox"
                          checked={availability?.sessionTypes?.virtual ?? true}
                          onChange={(e) => handleSessionTypeChange(index, 'virtual', e.target.checked)}
                        />
                        Virtual
                      </label>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Exceptions */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ color: '#374151' }}>Exceptions</h3>
          <button
            onClick={addException}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Add Exception
          </button>
        </div>
        
        {exceptions.length === 0 ? (
          <div style={{ 
            background: '#f9fafb', 
            padding: '16px', 
            borderRadius: '6px', 
            textAlign: 'center',
            color: '#6b7280' 
          }}>
            No exceptions set
          </div>
        ) : (
          <div style={{ 
            background: 'white', 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px', 
            overflow: 'hidden' 
          }}>
            {exceptions.map((exception, index) => (
              <div key={index} style={{ 
                display: 'grid', 
                gridTemplateColumns: '120px 120px 120px 1fr 40px',
                gap: '12px',
                padding: '12px',
                borderBottom: index < exceptions.length - 1 ? '1px solid #f3f4f6' : 'none',
                alignItems: 'center'
              }}>
                <input
                  type="date"
                  value={exception.date}
                  onChange={(e) => updateException(index, 'date', e.target.value)}
                  style={{ padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
                <input
                  type="time"
                  value={exception.startTime || ''}
                  onChange={(e) => updateException(index, 'startTime', e.target.value)}
                  placeholder="All day"
                  style={{ padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
                <input
                  type="time"
                  value={exception.endTime || ''}
                  onChange={(e) => updateException(index, 'endTime', e.target.value)}
                  placeholder="All day"
                  style={{ padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
                <input
                  type="text"
                  value={exception.reason || ''}
                  onChange={(e) => updateException(index, 'reason', e.target.value)}
                  placeholder="Reason (optional)"
                  style={{ padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
                <button
                  onClick={() => removeException(index)}
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.75rem'
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            background: saving ? '#9ca3af' : '#10b981',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            cursor: saving ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: '500'
          }}
        >
          {saving ? 'Saving...' : 'Save Availability'}
        </button>
      </div>
    </div>
  );
} 