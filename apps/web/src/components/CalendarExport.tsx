import React, { useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface CalendarExportProps {
  userType: 'trainer' | 'client';
}

export default function CalendarExport({ userType }: CalendarExportProps) {
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleExport = async () => {
    setExporting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem(userType === 'trainer' ? 'trainer-tracker-token' : 'client-portal-token');
      const url = `${API_BASE}/api/sessions/export?format=ical&startDate=${startDate}&endDate=${endDate}`;
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to export calendar');
      }

      // Create download link
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `trainertracker-sessions-${userType}-${new Date().toISOString().split('T')[0]}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      setSuccess('Calendar exported successfully! You can now import it into your calendar application.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export calendar');
    } finally {
      setExporting(false);
    }
  };

  const getQuickDateRange = (days: number) => {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + days);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  return (
    <div style={{ 
      background: 'white', 
      padding: '24px', 
      borderRadius: '12px', 
      border: '1px solid #e5e7eb',
      maxWidth: '500px'
    }}>
      <h3 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>Export Calendar</h3>
      
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

      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '1rem' }}>Quick Date Ranges</h4>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => getQuickDateRange(7)}
            style={{
              padding: '6px 12px',
              border: '1px solid #d1d5db',
              background: 'white',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Next 7 days
          </button>
          <button
            onClick={() => getQuickDateRange(30)}
            style={{
              padding: '6px 12px',
              border: '1px solid #d1d5db',
              background: 'white',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Next 30 days
          </button>
          <button
            onClick={() => getQuickDateRange(90)}
            style={{
              padding: '6px 12px',
              border: '1px solid #d1d5db',
              background: 'white',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Next 90 days
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', color: '#374151', fontSize: '0.875rem' }}>
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
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
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '8px', 
              border: '1px solid #d1d5db', 
              borderRadius: '6px' 
            }}
          />
        </div>
      </div>

      <button
        onClick={handleExport}
        disabled={exporting}
        style={{
          width: '100%',
          background: exporting ? '#9ca3af' : '#3b82f6',
          color: 'white',
          border: 'none',
          padding: '12px',
          borderRadius: '6px',
          cursor: exporting ? 'not-allowed' : 'pointer',
          fontSize: '1rem',
          fontWeight: '500'
        }}
      >
        {exporting ? 'Exporting...' : 'Export to Calendar (.ics)'}
      </button>

      <div style={{ marginTop: '16px', padding: '12px', background: '#f8fafc', borderRadius: '6px' }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '0.875rem' }}>How to Import</h4>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#6b7280', fontSize: '0.875rem' }}>
          <li><strong>Google Calendar:</strong> Import the .ics file in Settings → Import & Export</li>
          <li><strong>Outlook:</strong> Open the .ics file or import via Calendar → Add Calendar</li>
          <li><strong>Apple Calendar:</strong> Double-click the .ics file to import</li>
          <li><strong>Other apps:</strong> Most calendar apps support .ics file import</li>
        </ul>
      </div>
    </div>
  );
} 