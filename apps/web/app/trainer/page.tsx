'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@repo/ui/button';
import { ThemeToggle } from '../../src/components/ThemeToggle';
import styles from './trainer.module.css';


// Import components
import { AssessmentForm } from '../../src/components/AssessmentForm';
import OnboardingFlow from '../../src/components/OnboardingFlow';
import TrainerSessions from '../../src/components/TrainerSessions';
import ProgramBuilder from '../../src/components/ProgramBuilder';

// Import data utilities
import { clearAuth } from '../../src/utils/clearAuth';
import { assessmentDefaults } from '../../src/lib/assessmentData';
import { optPhaseTemplates } from '../../src/lib/programData';
import { progressTrackingTemplates } from '../../src/lib/progressData';

// Types
type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'trainer' | 'client';
};

type Client = {
  id: string;
  codeName: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'undisclosed';
  email: string;
  phone: string;
  notes: string;
  status: 'prospect' | 'active' | 'inactive';
  experienceLevel: string;
  createdAt: string;
  updatedAt: string;
};

type Assessment = {
  id: string;
  clientId: string;
  type: 'PARQ' | 'FITNESS_ASSESSMENT' | 'BODY_COMPOSITION' | 'FLEXIBILITY' | 'STRENGTH' | 'CARDIOVASCULAR' | 'FMS' | 'POSTURAL' | 'BALANCE' | 'MOBILITY' | 'OTHER';
  assessmentDate: string;
  assessor: string;
  notes: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  data: any;
  createdAt: string;
  updatedAt: string;
};

type Program = {
  id: string;
  clientId: string;
  programName: string;
  startDate: string;
  endDate: string | null;
  optPhase: string;
  primaryGoal: string;
  secondaryGoals: string;
  notes: string;
  data: any;
  createdAt: string;
  updatedAt: string;
};

type Progress = {
  id: string;
  clientId: string;
  programId: string;
  date: string;
  weight: number | null;
  bodyFat: number | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

type View = 'dashboard' | 'clients' | 'assessments' | 'progress' | 'scheduling' | 'program-builder' | 'onboarding' | 'client-creation' | 'client-detail';

export default function TrainerPortal() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [selectedProgressProgram, setSelectedProgressProgram] = useState<Program | null>(null);
  const [progressUpdateType, setProgressUpdateType] = useState<'general' | 'workout' | 'assessment'>('general');
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [workoutProgress, setWorkoutProgress] = useState<any>({});
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);

  // Data state
  const [clients, setClients] = useState<Client[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);

  // Form states
  const [newClient, setNewClient] = useState({ 
    codeName: '', 
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'undisclosed' as const,
    email: '',
    phone: '',
    notes: '',
    status: 'prospect' as const 
  });
  const [newAssessment, setNewAssessment] = useState({ 
    clientId: '', 
    type: 'PARQ' as const, 
    assessmentDate: '', 
    assessor: '', 
    notes: '',
    status: 'COMPLETED' as const,
    data: assessmentDefaults.PARQ as any
  });

  const [newProgress, setNewProgress] = useState({ 
    clientId: '', 
    programId: '', 
    date: '', 
    weight: '', 
    bodyFat: '', 
    notes: '' 
  });

  // API call helper
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const url = `${baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  };

  // Authentication
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    
    setAuthLoading(false);
  }, []);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const response = await apiCall('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      console.log('Debug - Login response:', response);
      console.log('Debug - Token from response:', response.token);
      console.log('Debug - Token type:', typeof response.token);
      console.log('Debug - Token length:', response.token ? response.token.length : 0);
      console.log('Debug - Token starts with:', response.token ? response.token.substring(0, 20) + '...' : 'N/A');
      console.log('Debug - Token ends with:', response.token ? '...' + response.token.substring(response.token.length - 20) : 'N/A');
      
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem('token', response.token);
      localStorage.setItem('trainer-tracker-token', response.token); // <-- Add this line
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Verify what was stored
      console.log('Debug - Stored token (token):', localStorage.getItem('token'));
      console.log('Debug - Stored token (trainer-tracker-token):', localStorage.getItem('trainer-tracker-token'));
      console.log('Debug - Stored token length (token):', localStorage.getItem('token')?.length || 0);
      console.log('Debug - Stored token length (trainer-tracker-token):', localStorage.getItem('trainer-tracker-token')?.length || 0);
      
      showMessage('Login successful!');
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    setToken(null);
    setUser(null);
    setCurrentView('dashboard');
  };

  // Message display
  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 5000);
  };

  // Data fetching
  const fetchClients = async () => {
    try {
      const data = await apiCall('/api/clients');
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchAssessments = async () => {
    try {
      const data = await apiCall('/api/assessments');
      setAssessments(data);
    } catch (error) {
      console.error('Error fetching assessments:', error);
    }
  };

  const fetchPrograms = async () => {
    try {
      const data = await apiCall('/api/programs');
      setPrograms(data);
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  };

  const fetchProgress = async () => {
    try {
      const data = await apiCall('/api/progress');
      setProgress(data);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  // Load data when authenticated
  useEffect(() => {
    if (token && user) {
      fetchClients();
      fetchAssessments();
      fetchPrograms();
      fetchProgress();
    }
  }, [token, user]);

  // Client management
  const createClient = async () => {
    try {
      await apiCall('/api/clients', {
        method: 'POST',
        body: JSON.stringify(newClient),
      });
      setNewClient({ 
        codeName: '', 
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: 'undisclosed',
        email: '',
        phone: '',
        notes: '',
        status: 'prospect' 
      });
      await fetchClients();
      showMessage('Client created successfully!');
      setCurrentView('clients');
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'Failed to create client');
    }
  };

  // Assessment management
  const createAssessment = async () => {
    try {
      await apiCall('/api/assessments', {
        method: 'POST',
        body: JSON.stringify(newAssessment),
      });
      setNewAssessment({ 
        clientId: '', 
        type: 'PARQ', 
        assessmentDate: '', 
        assessor: '', 
        notes: '',
        status: 'COMPLETED',
        data: assessmentDefaults.PARQ
      });
      await fetchAssessments();
      showMessage('Assessment created successfully!');
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'Failed to create assessment');
    }
  };

  // Progress management
  const createProgress = async () => {
    try {
      setLoading(true);
      await apiCall('/api/progress', {
        method: 'POST',
        body: JSON.stringify(newProgress),
      });
      
      showMessage('Progress recorded successfully!');
      setNewProgress({ clientId: '', programId: '', date: '', weight: '', bodyFat: '', notes: '' });
      await fetchProgress();
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'Failed to record progress');
    } finally {
      setLoading(false);
    }
  };

  const handleViewClientDetails = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setCurrentView('client-detail');
      setSelectedClient(client);
    }
  };

  const handleEditClient = () => {
    setEditClient(selectedClient);
    setEditMode(true);
  };

  const handleEditChange = (field: keyof Client, value: any) => {
    if (!editClient) return;
    setEditClient({ ...editClient, [field]: value });
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditClient(null);
  };

  const handleSaveEdit = async () => {
    if (!editClient) return;
    try {
      setLoading(true);
      await apiCall(`/api/clients/${editClient.id}`, {
        method: 'PUT',
        body: JSON.stringify(editClient),
      });
      // Update local state
      setClients(clients.map(c => c.id === editClient.id ? editClient : c));
      setSelectedClient(editClient);
      setEditMode(false);
      setEditClient(null);
      showMessage('Client updated successfully!');
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'Failed to update client');
    } finally {
      setLoading(false);
    }
  };

  // Login Screen
  if (!token || !user) {
    return (
      <div className={styles.trainerLoginContainer}>
        <div className={styles.trainerLoginCard}>
          <div className={styles.trainerLoginHeader}>
            <div className={styles.trainerLogo}>
              <span className={styles.trainerLogoIcon}>💪</span>
            </div>
            <h1>Trainer Portal</h1>
            <p>Sign in to access your client management dashboard</p>
          </div>
          
          {message && <div className={styles.trainerMessage}>{message}</div>}
          
          <div className={styles.trainerLoginForm}>
            <div className={styles.trainerInputGroup}>
              <label htmlFor="trainer-email">Email Address</label>
              <input
                id="trainer-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.trainerInput}
              />
            </div>
            
            <div className={styles.trainerInputGroup}>
              <label htmlFor="trainer-password">Password</label>
              <input
                id="trainer-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.trainerInput}
              />
            </div>
            
            <div className={styles.trainerLoginButtons}>
              <Button appName="web" onClick={handleLogin} disabled={loading} className={styles.trainerPrimaryButton}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
              <Link href="/" className={styles.trainerSecondaryButton}>
                Back to Home
              </Link>
            </div>
            
            <div className={styles.trainerDemoInfo}>
              <p><strong>Demo Credentials:</strong></p>
              <p>Email: trainer@example.com</p>
              <p>Password: password</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Application
  return (
    <div className={styles.trainerPortal}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Trainer Portal</h1>
          <div className={styles.userInfo}>
            <span>Welcome, {user.firstName} {user.lastName}</span>
            <ThemeToggle />
            <Button appName="web" onClick={handleLogout} className={styles.logoutButton}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className={styles.navigation}>
        <button
          className={`${styles.navButton} ${currentView === 'dashboard' ? styles.active : ''}`}
          onClick={() => setCurrentView('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`${styles.navButton} ${currentView === 'clients' ? styles.active : ''}`}
          onClick={() => setCurrentView('clients')}
        >
          Clients
        </button>
        <button
          className={`${styles.navButton} ${currentView === 'assessments' ? styles.active : ''}`}
          onClick={() => setCurrentView('assessments')}
        >
          Assessments
        </button>
        <button
          className={`${styles.navButton} ${currentView === 'progress' ? styles.active : ''}`}
          onClick={() => setCurrentView('progress')}
        >
          Progress
        </button>
        <button
          className={`${styles.navButton} ${currentView === 'scheduling' ? styles.active : ''}`}
          onClick={() => setCurrentView('scheduling')}
        >
          Scheduling
        </button>
        <button
          className={`${styles.navButton} ${currentView === 'program-builder' ? styles.active : ''}`}
          onClick={() => setCurrentView('program-builder')}
        >
          Program Builder
        </button>
      </nav>

      {/* Quick Actions - moved and streamlined */}
      {/* REMOVED: Quick Actions row */}

      {/* Main Content */}
      <main className={styles.main}>
        {message && <div className={styles.message}>{message}</div>}

        {/* Dashboard View */}
        {currentView === 'dashboard' && (
          <div className={styles.dashboard}>
            <div className={styles.dashboardHeader}>
              <h2>Welcome to Your Dashboard</h2>
              <p>Manage your clients, programs, and track progress all in one place</p>
            </div>

            {/* Metrics Grid */}
            <div className={styles.metricsGrid}>
              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>👥</div>
                <div className={styles.metricContent}>
                  <h3>{clients.length}</h3>
                  <p>Total Clients</p>
                  <div className={styles.metricBreakdown}>
                    <span className={clients.filter(c => c.status === 'active').length > 0 ? styles.activeMetric : ''}>
                      {clients.filter(c => c.status === 'active').length} Active
                    </span>
                    <span className={clients.filter(c => c.status === 'prospect').length > 0 ? styles.prospectMetric : ''}>
                      {clients.filter(c => c.status === 'prospect').length} Prospects
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>📊</div>
                <div className={styles.metricContent}>
                  <h3>{assessments.length}</h3>
                  <p>Assessments</p>
                  <div className={styles.metricBreakdown}>
                    <span className={assessments.filter(a => a.status === 'COMPLETED').length > 0 ? styles.completedMetric : ''}>
                      {assessments.filter(a => a.status === 'COMPLETED').length} Completed
                    </span>
                                    <span className={assessments.filter(a => a.status === 'SCHEDULED').length > 0 ? styles.recentMetric : ''}>
                  {assessments.filter(a => a.status === 'SCHEDULED').length} Scheduled
                </span>
                  </div>
                </div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>💪</div>
                <div className={styles.metricContent}>
                  <h3>{programs.length}</h3>
                  <p>Active Programs</p>
                  <div className={styles.metricBreakdown}>
                    <span className={styles.activeMetric}>
                      {programs.filter(p => p.endDate === null).length} Active
                    </span>
                    <span className={styles.completedMetric}>
                      {programs.filter(p => p.endDate !== null).length} Completed
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricIcon}>📈</div>
                <div className={styles.metricContent}>
                  <h3>{progress.length}</h3>
                  <p>Progress Records</p>
                  <div className={styles.metricBreakdown}>
                    <span className={styles.recentMetric}>
                      {progress.filter(p => new Date(p.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length} This Month
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            {/* REMOVED: <div className={styles.quickActions}>...</div> */}
          </div>
        )}

        {/* Clients View */}
        {currentView === 'clients' && (
          <div className={styles.clientsView}>
            <div className={styles.viewHeader}>
              <h2>Client Management</h2>
              <div className={styles.headerActions}>
                <Button appName="web" onClick={() => setCurrentView('client-creation')} className={styles.addButton}>
                  + Add New Client
                </Button>
              </div>
            </div>

            <div className={styles.clientsList}>
              <h3>All Clients ({clients.length})</h3>
              <div className={styles.clientGrid}>
                {clients.map((client) => (
                  <div key={client.id} className={styles.clientCard}>
                    <div className={styles.clientHeader}>
                      <h4>{client.firstName} {client.lastName}</h4>
                      <span className={`${styles.status} ${styles[client.status]}`}>
                        {client.status}
                      </span>
                    </div>
                    <div className={styles.clientCode}>Code: {client.codeName}</div>
                    {client.email && <div className={styles.clientEmail}>📧 {client.email}</div>}
                    {client.phone && <div className={styles.clientPhone}>📞 {client.phone}</div>}
                    <div className={styles.clientDate}>
                      Added: {new Date(client.createdAt).toLocaleDateString()}
                    </div>
                    <div className={styles.clientActions}>
                      <Button appName="web" onClick={() => handleViewClientDetails(client.id)} className={styles.viewButton}>
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Assessments View */}
        {currentView === 'assessments' && (
          <div className={styles.assessmentsView}>
            <div className={styles.viewHeader}>
              <h2>Assessment Management</h2>
              <div className={styles.headerActions}>
                <Button appName="web" onClick={() => setCurrentView('assessments')} className={styles.addButton}>
                  + New Assessment
                </Button>
              </div>
            </div>

            <div className={styles.createSection}>
              <h3>Create New Assessment</h3>
              <AssessmentForm
                assessment={newAssessment}
                onChange={setNewAssessment}
                clients={clients}
              />
              <div className={styles.formActions}>
                <Button appName="web" onClick={createAssessment} className={styles.createButton}>
                  Create Assessment
                </Button>
              </div>
            </div>

            <div className={styles.assessmentsList}>
              <h3>Recent Assessments ({assessments.length})</h3>
              <div className={styles.assessmentGrid}>
                {assessments.map((assessment) => (
                  <div key={assessment.id} className={styles.assessmentCard}>
                    <div className={styles.assessmentHeader}>
                      <h4>{assessment.type} Assessment</h4>
                      <span className={styles.assessmentType}>{assessment.type}</span>
                    </div>
                    <div className={styles.assessmentClient}>
                      Client: {clients.find(c => c.id === assessment.clientId)?.firstName} {clients.find(c => c.id === assessment.clientId)?.lastName}
                    </div>
                    <div className={styles.assessmentDate}>
                      Date: {new Date(assessment.assessmentDate).toLocaleDateString()}
                    </div>
                    <div className={styles.assessmentAssessor}>
                      Assessor: {assessment.assessor}
                    </div>
                    <div className={styles.assessmentActions}>
                      <Button appName="web" className={styles.viewButton}>
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Progress View */}
        {currentView === 'progress' && (
          <div className={styles.progressView}>
            <div className={styles.viewHeader}>
              <h2>Progress Tracking</h2>
            </div>

            <div className={styles.createSection}>
              <h3>Record Progress</h3>
              <div className={styles.createForm}>
                <div className={styles.formGroup}>
                  <label>Client *</label>
                  <select
                    value={newProgress.clientId}
                    onChange={(e) => setNewProgress({...newProgress, clientId: e.target.value})}
                    className={styles.select}
                  >
                    <option value="">Select a client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.firstName} {client.lastName} ({client.codeName})
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Program (Optional)</label>
                  <select
                    value={newProgress.programId}
                    onChange={(e) => setNewProgress({...newProgress, programId: e.target.value})}
                    className={styles.select}
                  >
                    <option value="">Select a program</option>
                    {programs.filter(p => p.clientId === newProgress.clientId).map((program) => (
                      <option key={program.id} value={program.id}>
                        {program.programName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Date *</label>
                  <input
                    type="date"
                    value={newProgress.date}
                    onChange={(e) => setNewProgress({...newProgress, date: e.target.value})}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Weight (lbs)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newProgress.weight}
                    onChange={(e) => setNewProgress({...newProgress, weight: e.target.value})}
                    className={styles.input}
                    placeholder="Enter weight"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Body Fat %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newProgress.bodyFat}
                    onChange={(e) => setNewProgress({...newProgress, bodyFat: e.target.value})}
                    className={styles.input}
                    placeholder="Enter body fat percentage"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Notes</label>
                  <textarea
                    value={newProgress.notes}
                    onChange={(e) => setNewProgress({...newProgress, notes: e.target.value})}
                    className={styles.textarea}
                    placeholder="Additional notes..."
                  />
                </div>
                <div className={styles.formActions}>
                  <Button appName="web" onClick={createProgress} className={styles.createButton}>
                    Record Progress
                  </Button>
                </div>
              </div>
            </div>

            <div className={styles.progressList}>
              <h3>Progress History ({progress.length})</h3>
              <div className={styles.progressGrid}>
                {progress.map((prog) => (
                  <div key={prog.id} className={styles.progressCard}>
                    <div className={styles.progressHeader}>
                      <h4>Progress Record</h4>
                    </div>
                    <div className={styles.progressClient}>
                      Client: {clients.find(c => c.id === prog.clientId)?.firstName} {clients.find(c => c.id === prog.clientId)?.lastName}
                    </div>
                    <div className={styles.progressProgram}>
                      Program: {programs.find(p => p.id === prog.programId)?.programName || 'General'}
                    </div>
                    <div className={styles.progressDate}>
                      Date: {new Date(prog.date).toLocaleDateString()}
                    </div>
                    {prog.weight && <div className={styles.progressWeight}>Weight: {prog.weight} lbs</div>}
                    {prog.bodyFat && <div className={styles.progressBodyFat}>Body Fat: {prog.bodyFat}%</div>}
                    {prog.notes && <div className={styles.progressNotes}>Notes: {prog.notes}</div>}
                    <div className={styles.progressActions}>
                      <Button appName="web" className={styles.viewButton}>
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Client Detail View */}
        {currentView === 'client-detail' && selectedClient && (
          <div className={styles.clientDetailView}>
            <div className={styles.clientDetailCard}>
              <div className={styles.clientDetailHeader}>
                <Button appName="web" onClick={() => setCurrentView('clients')} className={styles.backButton}>
                  ← Back to Clients
                </Button>
                <h2><span className={styles.detailIcon}>👤</span> {selectedClient.firstName} {selectedClient.lastName}</h2>
                <span className={`${styles.status} ${styles[selectedClient.status]}`}>{selectedClient.status}</span>
                <Button appName="web" onClick={handleEditClient} className={styles.quickActionButton} style={{marginLeft: '1rem'}}>
                  ✏️ Edit
                </Button>
              </div>
              {editMode && editClient ? (
                <form className={styles.clientEditForm} onSubmit={e => { e.preventDefault(); handleSaveEdit(); }}>
                  <div className={styles.clientDetailSections}>
                    <div className={styles.clientDetailSection}>
                      <h3 className={styles.sectionTitle}><span className={styles.detailIcon}>📝</span> Basic Information</h3>
                      <div className={styles.detailGrid}>
                        <div className={styles.detailItem}><label>Code Name:</label><input className={styles.input} value={editClient.codeName} onChange={e => handleEditChange('codeName', e.target.value)} /></div>
                        <div className={styles.detailItem}><label>First Name:</label><input className={styles.input} value={editClient.firstName} onChange={e => handleEditChange('firstName', e.target.value)} /></div>
                        <div className={styles.detailItem}><label>Last Name:</label><input className={styles.input} value={editClient.lastName} onChange={e => handleEditChange('lastName', e.target.value)} /></div>
                        <div className={styles.detailItem}><label>Date of Birth:</label><input className={styles.input} type="date" value={editClient.dateOfBirth.slice(0,10)} onChange={e => handleEditChange('dateOfBirth', e.target.value)} /></div>
                        <div className={styles.detailItem}><label>Gender:</label><select className={styles.select} value={editClient.gender} onChange={e => handleEditChange('gender', e.target.value)}><option value="male">Male</option><option value="female">Female</option><option value="undisclosed">Undisclosed</option></select></div>
                      </div>
                    </div>
                    <div className={styles.sectionDivider}></div>
                    <div className={styles.clientDetailSection}>
                      <h3 className={styles.sectionTitle}><span className={styles.detailIcon}>📞</span> Contact</h3>
                      <div className={styles.detailGrid}>
                        <div className={styles.detailItem}><label>Email:</label><input className={styles.input} value={editClient.email} onChange={e => handleEditChange('email', e.target.value)} /></div>
                        <div className={styles.detailItem}><label>Phone:</label><input className={styles.input} value={editClient.phone} onChange={e => handleEditChange('phone', e.target.value)} /></div>
                      </div>
                    </div>
                    <div className={styles.sectionDivider}></div>
                    <div className={styles.clientDetailSection}>
                      <h3 className={styles.sectionTitle}><span className={styles.detailIcon}>📚</span> Additional</h3>
                      <div className={styles.detailGrid}>
                        <div className={styles.detailItem}><label>Experience Level:</label><input className={styles.input} value={editClient.experienceLevel} onChange={e => handleEditChange('experienceLevel', e.target.value)} /></div>
                        <div className={styles.detailItem}><label>Notes:</label><input className={styles.input} value={editClient.notes} onChange={e => handleEditChange('notes', e.target.value)} /></div>
                      </div>
                    </div>
                  </div>
                  <div style={{display: 'flex', gap: '1rem', marginTop: '1.5rem'}}>
                    <Button appName="web" type="submit" className={styles.quickActionButton}>💾 Save</Button>
                    <Button appName="web" type="button" onClick={handleCancelEdit} className={styles.quickActionButton}>Cancel</Button>
                  </div>
                </form>
              ) : (
                <div className={styles.clientDetailSections}>
                  <div className={styles.clientDetailSection}>
                    <h3 className={styles.sectionTitle}><span className={styles.detailIcon}>📝</span> Basic Information</h3>
                    <div className={styles.detailGrid}>
                      <div className={styles.detailItem}><label>Code Name:</label><span>{selectedClient.codeName}</span></div>
                      <div className={styles.detailItem}><label>First Name:</label><span>{selectedClient.firstName}</span></div>
                      <div className={styles.detailItem}><label>Last Name:</label><span>{selectedClient.lastName}</span></div>
                      <div className={styles.detailItem}><label>Date of Birth:</label><span>{new Date(selectedClient.dateOfBirth).toLocaleDateString()}</span></div>
                      <div className={styles.detailItem}><label>Gender:</label><span>{selectedClient.gender}</span></div>
                    </div>
                  </div>
                  <div className={styles.sectionDivider}></div>
                  <div className={styles.clientDetailSection}>
                    <h3 className={styles.sectionTitle}><span className={styles.detailIcon}>📞</span> Contact</h3>
                    <div className={styles.detailGrid}>
                      <div className={styles.detailItem}><label>Email:</label><span>{selectedClient.email || 'Not provided'}</span></div>
                      <div className={styles.detailItem}><label>Phone:</label><span>{selectedClient.phone || 'Not provided'}</span></div>
                    </div>
                  </div>
                  <div className={styles.sectionDivider}></div>
                  <div className={styles.clientDetailSection}>
                    <h3 className={styles.sectionTitle}><span className={styles.detailIcon}>📚</span> Additional</h3>
                    <div className={styles.detailGrid}>
                      <div className={styles.detailItem}><label>Experience Level:</label><span>{selectedClient.experienceLevel || 'Not specified'}</span></div>
                      <div className={styles.detailItem}><label>Notes:</label><span>{selectedClient.notes || 'No notes'}</span></div>
                      <div className={styles.detailItem}><label>Member Since:</label><span>{new Date(selectedClient.createdAt).toLocaleDateString()}</span></div>
                      <div className={styles.detailItem}><label>Last Updated:</label><span>{new Date(selectedClient.updatedAt).toLocaleDateString()}</span></div>
                    </div>
                  </div>
                  <div className={styles.sectionDivider}></div>
                  <div className={styles.clientDetailSection}>
                    <h3 className={styles.sectionTitle}><span className={styles.detailIcon}>⚡</span> Quick Actions</h3>
                    <div className={styles.quickActionGrid}>
                      <Button appName="web" onClick={() => setCurrentView('assessments')} className={styles.quickActionButton}>
                        📝 Create Assessment
                      </Button>
                      <Button appName="web" onClick={() => setCurrentView('program-builder')} className={styles.quickActionButton}>
                        🏋️ Build Program
                      </Button>
                      <Button appName="web" onClick={() => setCurrentView('progress')} className={styles.quickActionButton}>
                        📈 Record Progress
                      </Button>
                      <Button appName="web" onClick={() => setCurrentView('scheduling')} className={styles.quickActionButton}>
                        📅 Schedule Session
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Scheduling View */}
        {currentView === 'scheduling' && (
          <div className={styles.schedulingView}>
            <div className={styles.viewHeader}>
              <h2>Scheduling & Sessions</h2>
            </div>
            <TrainerSessions />
          </div>
        )}

        {/* Program Builder View */}
        {currentView === 'program-builder' && (
          <div className={styles.programBuilderView}>
            <ProgramBuilder />
          </div>
        )}

        {/* Client Creation View */}
        {currentView === 'client-creation' && (
          <div className={styles.clientCreationView}>
            <div className={styles.viewHeader}>
              <h2>Add New Client</h2>
              <p>Create a new client profile with essential information</p>
            </div>

            <div className={styles.createSection}>
              <h3>Client Information</h3>
              <div className={styles.createForm}>
                <div className={styles.formGroup}>
                  <label>Code Name *</label>
                  <input
                    type="text"
                    value={newClient.codeName}
                    onChange={(e) => setNewClient({...newClient, codeName: e.target.value})}
                    className={styles.input}
                    placeholder="Enter code name"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>First Name *</label>
                  <input
                    type="text"
                    value={newClient.firstName}
                    onChange={(e) => setNewClient({...newClient, firstName: e.target.value})}
                    className={styles.input}
                    placeholder="Enter first name"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Last Name *</label>
                  <input
                    type="text"
                    value={newClient.lastName}
                    onChange={(e) => setNewClient({...newClient, lastName: e.target.value})}
                    className={styles.input}
                    placeholder="Enter last name"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Date of Birth *</label>
                  <input
                    type="date"
                    value={newClient.dateOfBirth}
                    onChange={(e) => setNewClient({...newClient, dateOfBirth: e.target.value})}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Gender</label>
                  <select
                    value={newClient.gender}
                    onChange={(e) => setNewClient({...newClient, gender: e.target.value as any})}
                    className={styles.select}
                  >
                    <option value="undisclosed">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Status *</label>
                  <select
                    value={newClient.status}
                    onChange={(e) => setNewClient({...newClient, status: e.target.value as any})}
                    className={styles.select}
                  >
                    <option value="prospect">Prospect</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                    className={styles.input}
                    placeholder="Enter email address"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                    className={styles.input}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Notes</label>
                  <textarea
                    value={newClient.notes}
                    onChange={(e) => setNewClient({...newClient, notes: e.target.value})}
                    className={styles.textarea}
                    placeholder="Additional notes about the client..."
                  />
                </div>
                <div className={styles.formActions}>
                  <Button appName="web" onClick={createClient} className={styles.createButton}>
                    Create Client
                  </Button>
                  <Button appName="web" onClick={() => setCurrentView('clients')} className={styles.secondaryButton}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 