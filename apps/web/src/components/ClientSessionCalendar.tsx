import React, { useState } from 'react';

interface Session {
  id: string;
  clientId: string;
  startTime: string;
  endTime?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'MISSED';
  type: 'IN_PERSON' | 'VIRTUAL';
  location?: string;
  notes?: string;
}

interface ClientSessionCalendarProps {
  sessions: Session[];
  onSessionClick?: (session: Session) => void;
  compact?: boolean;
}

export default function ClientSessionCalendar({ 
  sessions, 
  onSessionClick, 
  compact = true 
}: ClientSessionCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    while (current <= lastDay || current.getDay() !== 0) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const getSessionsForDate = (date: Date) => {
    return sessions.filter(session => {
      const sessionDate = new Date(session.startTime);
      return sessionDate.toDateString() === date.toDateString();
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'IN_PERSON': return '#3b82f6'; // Blue for in-person
      case 'VIRTUAL': return '#10b981'; // Green for virtual
      default: return '#6b7280';
    }
  };

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return '#1d4ed8';
      case 'COMPLETED': return '#047857';
      case 'CANCELLED': return '#dc2626';
      case 'MISSED': return '#d97706';
      default: return '#374151';
    }
  };

  const handleSessionClick = (session: Session, e: React.MouseEvent) => {
    e.stopPropagation();
    onSessionClick?.(session);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div style={{ 
      width: '100%',
      maxWidth: compact ? '400px' : '600px',
      margin: '0 auto'
    }}>
      {/* Calendar Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '12px',
        padding: '0 8px'
      }}>
        <button
          onClick={() => navigateMonth('prev')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.2rem',
            cursor: 'pointer',
            color: '#6b7280',
            padding: '4px 8px',
            borderRadius: '4px',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          ‹
        </button>
        <h3 style={{ 
          margin: 0, 
          fontSize: compact ? '1rem' : '1.25rem',
          fontWeight: '600',
          color: '#374151'
        }}>
          {currentDate.toLocaleDateString([], { month: 'long', year: 'numeric' })}
        </h3>
        <button
          onClick={() => navigateMonth('next')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.2rem',
            cursor: 'pointer',
            color: '#6b7280',
            padding: '4px 8px',
            borderRadius: '4px',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          ›
        </button>
      </div>

      {/* Calendar Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gap: '1px', 
        background: '#e5e7eb',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden',
        fontSize: compact ? '0.75rem' : '0.875rem'
      }}>
        {/* Week day headers */}
        {weekDays.map(day => (
          <div key={day} style={{
            background: '#f9fafb',
            padding: compact ? '8px 4px' : '12px 8px',
            textAlign: 'center',
            fontWeight: '600',
            color: '#374151',
            fontSize: compact ? '0.7rem' : '0.875rem'
          }}>
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {days.map((date, index) => {
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();
          const isToday = date.toDateString() === new Date().toDateString();
          const daySessions = getSessionsForDate(date);
          
          return (
            <div
              key={index}
              style={{
                background: 'white',
                minHeight: compact ? '60px' : '80px',
                padding: compact ? '4px 2px' : '8px 6px',
                opacity: isCurrentMonth ? 1 : 0.5,
                position: 'relative',
                border: isToday ? '2px solid #3b82f6' : 'none'
              }}
            >
              <div style={{
                fontWeight: isToday ? '600' : '400',
                color: isToday ? '#3b82f6' : isCurrentMonth ? '#374151' : '#9ca3af',
                fontSize: compact ? '0.7rem' : '0.875rem',
                marginBottom: '2px',
                textAlign: 'center'
              }}>
                {date.getDate()}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                {daySessions.slice(0, compact ? 2 : 3).map(session => (
                  <div
                    key={session.id}
                    onClick={(e) => handleSessionClick(session, e)}
                    style={{
                      background: getSessionTypeColor(session.type),
                      color: 'white',
                      padding: compact ? '1px 3px' : '2px 4px',
                      borderRadius: '3px',
                      fontSize: compact ? '0.6rem' : '0.7rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      textAlign: 'center',
                      border: `1px solid ${getSessionStatusColor(session.status)}`,
                      position: 'relative'
                    }}
                    title={`${session.type === 'IN_PERSON' ? 'In-Person' : 'Virtual'} - ${formatTime(session.startTime)} - ${session.status}`}
                  >
                    {compact ? 
                      `${session.type === 'IN_PERSON' ? '🏢' : '💻'} ${formatTime(session.startTime)}` :
                      `${session.type === 'IN_PERSON' ? 'In-Person' : 'Virtual'} ${formatTime(session.startTime)}`
                    }
                  </div>
                ))}
                {daySessions.length > (compact ? 2 : 3) && (
                  <div style={{
                    color: '#6b7280',
                    fontSize: compact ? '0.6rem' : '0.7rem',
                    textAlign: 'center'
                  }}>
                    +{daySessions.length - (compact ? 2 : 3)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ 
        marginTop: '12px', 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '16px',
        fontSize: compact ? '0.7rem' : '0.8rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            backgroundColor: '#3b82f6',
            borderRadius: '2px',
            border: '1px solid #1d4ed8'
          }}></div>
          <span>In-Person</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            backgroundColor: '#10b981',
            borderRadius: '2px',
            border: '1px solid #047857'
          }}></div>
          <span>Virtual</span>
        </div>
      </div>
    </div>
  );
} 