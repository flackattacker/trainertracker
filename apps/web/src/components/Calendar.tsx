import React, { useState, useEffect } from 'react';

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

interface CalendarProps {
  sessions: Session[];
  onSessionClick?: (session: Session) => void;
  onDateClick?: (date: Date) => void;
  onSessionMove?: (sessionId: string, newDate: Date) => void;
  view?: 'month' | 'week' | 'day';
}

export default function Calendar({ 
  sessions, 
  onSessionClick, 
  onDateClick, 
  onSessionMove, 
  view = 'month' 
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return '#3b82f6';
      case 'COMPLETED': return '#10b981';
      case 'CANCELLED': return '#ef4444';
      case 'MISSED': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateClick?.(date);
  };

  const handleSessionClick = (session: Session, e: React.MouseEvent) => {
    e.stopPropagation();
    onSessionClick?.(session);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setDate(newDate.getDate() - 7);
      } else {
        newDate.setDate(newDate.getDate() + 7);
      }
      return newDate;
    });
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setDate(newDate.getDate() - 1);
      } else {
        newDate.setDate(newDate.getDate() + 1);
      }
      return newDate;
    });
  };

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div style={{ width: '100%' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          gap: '1px', 
          background: '#e5e7eb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          {weekDays.map(day => (
            <div key={day} style={{
              background: '#f9fafb',
              padding: '12px',
              textAlign: 'center',
              fontWeight: '600',
              fontSize: '0.875rem',
              color: '#374151'
            }}>
              {day}
            </div>
          ))}
          
          {days.map((date, index) => {
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            const isToday = date.toDateString() === new Date().toDateString();
            const isSelected = selectedDate?.toDateString() === date.toDateString();
            const daySessions = getSessionsForDate(date);
            
            return (
              <div
                key={index}
                onClick={() => handleDateClick(date)}
                style={{
                  background: 'white',
                  minHeight: '120px',
                  padding: '8px',
                  cursor: 'pointer',
                  border: isSelected ? '2px solid #3b82f6' : 'none',
                  opacity: isCurrentMonth ? 1 : 0.5,
                  position: 'relative'
                }}
              >
                <div style={{
                  fontWeight: isToday ? '600' : '400',
                  color: isToday ? '#3b82f6' : isCurrentMonth ? '#374151' : '#9ca3af',
                  fontSize: '0.875rem',
                  marginBottom: '4px'
                }}>
                  {date.getDate()}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {daySessions.slice(0, 3).map(session => (
                    <div
                      key={session.id}
                      onClick={(e) => handleSessionClick(session, e)}
                      style={{
                        background: getSessionStatusColor(session.status),
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                      title={`${session.client?.firstName || 'Client'} ${session.client?.lastName || ''} - ${formatTime(session.startTime)}`}
                    >
                      {session.client?.firstName || 'Client'} - {formatTime(session.startTime)}
                    </div>
                  ))}
                  {daySessions.length > 3 && (
                    <div style={{
                      color: '#6b7280',
                      fontSize: '0.75rem',
                      textAlign: 'center'
                    }}>
                      +{daySessions.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    
    const weekDays: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      weekDays.push(date);
    }

    const timeSlots = [];
    for (let hour = 6; hour <= 22; hour++) {
      timeSlots.push(hour);
    }

    return (
      <div style={{ width: '100%', overflow: 'auto' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '60px repeat(7, 1fr)', 
          gap: '1px',
          background: '#e5e7eb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{ background: '#f9fafb', padding: '12px', textAlign: 'center', fontWeight: '600' }}>
            Time
          </div>
          {weekDays.map(date => (
            <div key={date.toISOString()} style={{
              background: '#f9fafb',
              padding: '12px',
              textAlign: 'center',
              fontWeight: '600',
              fontSize: '0.875rem'
            }}>
              <div>{date.toLocaleDateString([], { weekday: 'short' })}</div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                {date.toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </div>
            </div>
          ))}
          
          {/* Time slots */}
          {timeSlots.map(hour => (
            <React.Fragment key={hour}>
              <div style={{
                background: '#f9fafb',
                padding: '8px',
                textAlign: 'center',
                fontSize: '0.75rem',
                color: '#6b7280',
                borderTop: '1px solid #e5e7eb'
              }}>
                {hour}:00
              </div>
              {weekDays.map(date => {
                const daySessions = getSessionsForDate(date).filter(session => {
                  const sessionHour = new Date(session.startTime).getHours();
                  return sessionHour === hour;
                });
                
                return (
                  <div key={`${date.toISOString()}-${hour}`} style={{
                    background: 'white',
                    minHeight: '60px',
                    padding: '4px',
                    borderTop: '1px solid #e5e7eb',
                    position: 'relative'
                  }}>
                    {daySessions.map(session => (
                      <div
                        key={session.id}
                        onClick={(e) => handleSessionClick(session, e)}
                        style={{
                          background: getSessionStatusColor(session.status),
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          marginBottom: '2px'
                        }}
                      >
                        {session.client?.firstName || 'Client'} {session.client?.lastName || ''}
                      </div>
                    ))}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const daySessions = getSessionsForDate(currentDate);
    const timeSlots = [];
    for (let hour = 6; hour <= 22; hour++) {
      timeSlots.push(hour);
    }

    return (
      <div style={{ width: '100%' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '60px 1fr', 
          gap: '1px',
          background: '#e5e7eb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          {/* Time slots */}
          {timeSlots.map(hour => {
            const hourSessions = daySessions.filter(session => {
              const sessionHour = new Date(session.startTime).getHours();
              return sessionHour === hour;
            });
            
            return (
              <React.Fragment key={hour}>
                <div style={{
                  background: '#f9fafb',
                  padding: '12px 8px',
                  textAlign: 'center',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  {hour}:00
                </div>
                <div style={{
                  background: 'white',
                  minHeight: '80px',
                  padding: '8px',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  {hourSessions.map(session => (
                    <div
                      key={session.id}
                      onClick={(e) => handleSessionClick(session, e)}
                      style={{
                        background: getSessionStatusColor(session.status),
                        color: 'white',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        marginBottom: '4px'
                      }}
                    >
                      <div style={{ fontWeight: '600' }}>
                        {session.client?.firstName || 'Client'} {session.client?.lastName || ''}
                      </div>
                      <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                        {formatTime(session.startTime)} - {session.endTime ? formatTime(session.endTime) : 'No end time'}
                      </div>
                      {session.location && (
                        <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                          📍 {session.location}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  const renderNavigation = () => {
    const getNavigationHandlers = () => {
      switch (view) {
        case 'month':
          return {
            prev: () => navigateMonth('prev'),
            next: () => navigateMonth('next'),
            title: currentDate.toLocaleDateString([], { month: 'long', year: 'numeric' })
          };
        case 'week':
          return {
            prev: () => navigateWeek('prev'),
            next: () => navigateWeek('next'),
            title: `Week of ${currentDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}`
          };
        case 'day':
          return {
            prev: () => navigateDay('prev'),
            next: () => navigateDay('next'),
            title: currentDate.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
          };
        default:
          return { prev: () => {}, next: () => {}, title: '' };
      }
    };

    const handlers = getNavigationHandlers();

    return (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        padding: '16px',
        background: 'white',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        <button
          onClick={handlers.prev}
          style={{
            padding: '8px 16px',
            border: '1px solid #d1d5db',
            background: 'white',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          ← Previous
        </button>
        
        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>
          {handlers.title}
        </h2>
        
        <button
          onClick={handlers.next}
          style={{
            padding: '8px 16px',
            border: '1px solid #d1d5db',
            background: 'white',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          Next →
        </button>
      </div>
    );
  };

  const renderViewToggle = () => (
    <div style={{
      display: 'flex',
      gap: '8px',
      marginBottom: '16px'
    }}>
      {(['month', 'week', 'day'] as const).map(viewType => (
        <button
          key={viewType}
          onClick={() => {/* TODO: Add view change handler */}}
          style={{
            padding: '8px 16px',
            border: '1px solid #d1d5db',
            background: view === viewType ? '#3b82f6' : 'white',
            color: view === viewType ? 'white' : '#374151',
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
  );

  return (
    <div style={{ width: '100%' }}>
      {renderViewToggle()}
      {renderNavigation()}
      
      {view === 'month' && renderMonthView()}
      {view === 'week' && renderWeekView()}
      {view === 'day' && renderDayView()}
    </div>
  );
} 