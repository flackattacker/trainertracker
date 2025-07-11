import React, { useState, useEffect } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface TimeSlot {
  startTime: string;
  endTime: string;
  duration: number;
}

interface Trainer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function ClientBooking() {
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sessionType, setSessionType] = useState<'IN_PERSON' | 'VIRTUAL'>('IN_PERSON');
  const [sessionDuration, setSessionDuration] = useState(60);

  useEffect(() => {
    fetchTrainerInfo();
  }, []);

  useEffect(() => {
    if (trainer) {
      fetchAvailableSlots();
    }
  }, [trainer, selectedDate, sessionDuration]);

  const fetchTrainerInfo = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('client-portal-token');
      const res = await fetch(`${API_BASE}/api/client/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch client data');
      const data = await res.json();
      
      // For now, we'll use a mock trainer. In a real app, you'd get this from the client's trainer relationship
      setTrainer({
        id: 'mock-trainer-id', // This would come from the client's trainer relationship
        firstName: 'Your',
        lastName: 'Trainer',
        email: 'trainer@example.com'
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trainer info');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    if (!trainer) return;
    
    setError('');
    try {
      const token = localStorage.getItem('client-portal-token');
      const res = await fetch(
        `${API_BASE}/api/availability/slots?trainerId=${trainer.id}&date=${selectedDate}&duration=${sessionDuration}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error('Failed to fetch available slots');
      const data = await res.json();
      setAvailableSlots(data.slots || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch available slots');
    }
  };

  const handleBookSession = async () => {
    if (!selectedSlot || !trainer) return;
    
    setBooking(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('client-portal-token');
      const res = await fetch(`${API_BASE}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          clientId: 'self', // The API will get the client ID from the token
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          type: sessionType,
          location: sessionType === 'IN_PERSON' ? 'Gym' : 'Virtual',
          notes: 'Booked by client'
        })
      });
      
      if (res.status === 409) {
        setError('This time slot is no longer available. Please select another time.');
        await fetchAvailableSlots(); // Refresh slots
        return;
      }
      
      if (!res.ok) throw new Error('Failed to book session');
      
      setSuccess('Session booked successfully!');
      setSelectedSlot(null);
      await fetchAvailableSlots(); // Refresh slots
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to book session');
    } finally {
      setBooking(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>Loading booking options...</div>;
  }

  if (!trainer) {
    return <div style={{ textAlign: 'center', padding: '20px', color: '#ef4444' }}>Unable to load trainer information</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ marginBottom: '24px', color: '#1f2937' }}>Book a Session</h2>
      
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

      {/* Trainer Info */}
      <div style={{ 
        background: '#f8fafc', 
        padding: '16px', 
        borderRadius: '8px', 
        marginBottom: '24px' 
      }}>
        <h3 style={{ margin: '0 0 8px 0', color: '#374151' }}>
          {trainer.firstName} {trainer.lastName}
        </h3>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>
          {trainer.email}
        </p>
      </div>

      {/* Booking Options */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px', color: '#374151' }}>Session Details</h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr 1fr', 
          gap: '16px',
          marginBottom: '16px'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', color: '#374151', fontSize: '0.875rem' }}>
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              style={{ 
                width: '100%', 
                padding: '8px', 
                border: '1px solid #d1d5db', 
                borderRadius: '6px' 
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '4px', color: '#374151', fontSize: '0.875rem' }}>
              Duration
            </label>
            <select
              value={sessionDuration}
              onChange={(e) => setSessionDuration(parseInt(e.target.value))}
              style={{ 
                width: '100%', 
                padding: '8px', 
                border: '1px solid #d1d5db', 
                borderRadius: '6px' 
              }}
            >
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '4px', color: '#374151', fontSize: '0.875rem' }}>
              Type
            </label>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value as 'IN_PERSON' | 'VIRTUAL')}
              style={{ 
                width: '100%', 
                padding: '8px', 
                border: '1px solid #d1d5db', 
                borderRadius: '6px' 
              }}
            >
              <option value="IN_PERSON">In-Person</option>
              <option value="VIRTUAL">Virtual</option>
            </select>
          </div>
        </div>
      </div>

      {/* Available Slots */}
      <div>
        <h3 style={{ marginBottom: '16px', color: '#374151' }}>
          Available Times for {selectedDate ? formatDate(selectedDate) : 'Selected Date'}
        </h3>
        
        {availableSlots.length === 0 ? (
          <div style={{ 
            background: '#f9fafb', 
            padding: '24px', 
            borderRadius: '8px', 
            textAlign: 'center',
            color: '#6b7280' 
          }}>
            <p style={{ margin: '0 0 8px 0' }}>No available slots for this date</p>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>
              Try selecting a different date or contact your trainer
            </p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
            gap: '12px' 
          }}>
            {availableSlots.map((slot, index) => (
              <button
                key={index}
                onClick={() => setSelectedSlot(slot)}
                style={{
                  background: selectedSlot === slot ? '#3b82f6' : 'white',
                  color: selectedSlot === slot ? 'white' : '#374151',
                  border: `1px solid ${selectedSlot === slot ? '#3b82f6' : '#d1d5db'}`,
                  padding: '12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
              >
                {formatTime(slot.startTime)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Booking Confirmation */}
      {selectedSlot && (
        <div style={{ 
          background: '#f0f9ff', 
          border: '1px solid #0ea5e9', 
          borderRadius: '8px', 
          padding: '20px', 
          marginTop: '24px' 
        }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#0c4a6e' }}>Confirm Your Booking</h4>
          
          <div style={{ marginBottom: '16px' }}>
            <p style={{ margin: '0 0 4px 0', color: '#0c4a6e' }}>
              <strong>Date:</strong> {formatDate(selectedSlot.startTime)}
            </p>
            <p style={{ margin: '0 0 4px 0', color: '#0c4a6e' }}>
              <strong>Time:</strong> {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
            </p>
            <p style={{ margin: '0 0 4px 0', color: '#0c4a6e' }}>
              <strong>Duration:</strong> {sessionDuration} minutes
            </p>
            <p style={{ margin: 0, color: '#0c4a6e' }}>
              <strong>Type:</strong> {sessionType === 'IN_PERSON' ? 'In-Person' : 'Virtual'}
            </p>
          </div>
          
          <button
            onClick={handleBookSession}
            disabled={booking}
            style={{
              background: booking ? '#9ca3af' : '#0ea5e9',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              cursor: booking ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            {booking ? 'Booking...' : 'Confirm Booking'}
          </button>
        </div>
      )}
    </div>
  );
} 