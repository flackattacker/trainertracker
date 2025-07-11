import React, { useState, useEffect } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface SessionTemplate {
  id: string;
  name: string;
  duration: number; // in minutes
  type: 'IN_PERSON' | 'VIRTUAL';
  location?: string;
  notes?: string;
  color?: string;
  isDefault?: boolean;
}

export default function SessionTemplates() {
  const [templates, setTemplates] = useState<SessionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SessionTemplate | null>(null);
  const [form, setForm] = useState({
    name: '',
    duration: 60,
    type: 'IN_PERSON' as 'IN_PERSON' | 'VIRTUAL',
    location: '',
    notes: '',
    color: '#3b82f6'
  });

  const defaultTemplates: SessionTemplate[] = [
    {
      id: 'default-1',
      name: 'Initial Consultation',
      duration: 60,
      type: 'IN_PERSON',
      location: 'Gym - Main Floor',
      notes: 'Initial fitness assessment and goal setting',
      color: '#3b82f6',
      isDefault: true
    },
    {
      id: 'default-2',
      name: 'Strength Training',
      duration: 60,
      type: 'IN_PERSON',
      location: 'Gym - Weight Room',
      notes: 'Progressive strength training session',
      color: '#10b981',
      isDefault: true
    },
    {
      id: 'default-3',
      name: 'Cardio Session',
      duration: 45,
      type: 'IN_PERSON',
      location: 'Gym - Cardio Zone',
      notes: 'Cardiovascular training and endurance work',
      color: '#f59e0b',
      isDefault: true
    },
    {
      id: 'default-4',
      name: 'Virtual Training',
      duration: 45,
      type: 'VIRTUAL',
      location: 'Zoom Meeting',
      notes: 'Remote training session',
      color: '#8b5cf6',
      isDefault: true
    }
  ];

  useEffect(() => {
    // For now, we'll use default templates
    // In a real app, these would be fetched from the API
    setTemplates(defaultTemplates);
    setLoading(false);
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Template name is required');
      return;
    }

    if (editingTemplate) {
      // Update existing template
      const updatedTemplates = templates.map(t => 
        t.id === editingTemplate.id 
          ? { ...t, ...form }
          : t
      );
      setTemplates(updatedTemplates);
      setEditingTemplate(null);
    } else {
      // Create new template
      const newTemplate: SessionTemplate = {
        id: `template-${Date.now()}`,
        ...form,
        isDefault: false
      };
      setTemplates([...templates, newTemplate]);
    }

    setForm({
      name: '',
      duration: 60,
      type: 'IN_PERSON',
      location: '',
      notes: '',
      color: '#3b82f6'
    });
    setShowModal(false);
    setError('');
  };

  const handleEdit = (template: SessionTemplate) => {
    if (template.isDefault) {
      setError('Default templates cannot be edited');
      return;
    }
    setEditingTemplate(template);
    setForm({
      name: template.name,
      duration: template.duration,
      type: template.type,
      location: template.location || '',
      notes: template.notes || '',
      color: template.color || '#3b82f6'
    });
    setShowModal(true);
  };

  const handleDelete = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template?.isDefault) {
      setError('Default templates cannot be deleted');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this template?')) {
      setTemplates(templates.filter(t => t.id !== templateId));
    }
  };

  const handleCreateNew = () => {
    setEditingTemplate(null);
    setForm({
      name: '',
      duration: 60,
      type: 'IN_PERSON',
      location: '',
      notes: '',
      color: '#3b82f6'
    });
    setShowModal(true);
    setError('');
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>Session Templates</h2>
        <button 
          onClick={handleCreateNew}
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
          + New Template
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red', marginBottom: 16 }}>{error}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {templates.map((template) => (
          <div 
            key={template.id}
            style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <div 
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: template.color,
                  marginRight: '8px'
                }}
              />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>
                {template.name}
                {template.isDefault && (
                  <span style={{ 
                    fontSize: '0.75rem', 
                    background: '#f3f4f6', 
                    padding: '2px 6px', 
                    borderRadius: '4px', 
                    marginLeft: '8px',
                    color: '#6b7280'
                  }}>
                    Default
                  </span>
                )}
              </h3>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                Duration: {formatDuration(template.duration)}
              </span>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                Type: {template.type === 'IN_PERSON' ? 'In-Person' : 'Virtual'}
              </span>
            </div>

            {template.location && (
              <div style={{ marginBottom: '8px' }}>
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  Location: {template.location}
                </span>
              </div>
            )}

            {template.notes && (
              <div style={{ marginBottom: '12px' }}>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#374151' }}>
                  {template.notes}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleEdit(template)}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #d1d5db',
                  background: 'white',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  opacity: template.isDefault ? 0.5 : 1
                }}
                disabled={template.isDefault}
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(template.id)}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #ef4444',
                  background: 'white',
                  color: '#ef4444',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  opacity: template.isDefault ? 0.5 : 1
                }}
                disabled={template.isDefault}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Template Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <form onSubmit={handleSubmit} style={{ background: 'white', padding: 32, borderRadius: 12, minWidth: 400 }}>
            <h3>{editingTemplate ? 'Edit Template' : 'New Template'}</h3>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            <div style={{ marginBottom: 12 }}>
              <label>Template Name:</label><br />
              <input 
                type="text" 
                name="name" 
                value={form.name} 
                onChange={handleFormChange} 
                required 
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label>Duration (minutes):</label><br />
              <input 
                type="number" 
                name="duration" 
                value={form.duration} 
                onChange={handleFormChange} 
                min="15" 
                max="240"
                required 
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
              <label>Color:</label><br />
              <input 
                type="color" 
                name="color" 
                value={form.color} 
                onChange={handleFormChange} 
                style={{ width: '100%', height: '40px', borderRadius: '4px', border: '1px solid #d1d5db' }}
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
                {editingTemplate ? 'Update' : 'Create'}
              </button>
              <button 
                type="button" 
                onClick={() => setShowModal(false)}
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