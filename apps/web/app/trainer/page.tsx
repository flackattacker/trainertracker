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
import ProgramProgress from '../../src/components/ProgramProgress';
import SessionWorkoutEntry from '../../src/components/SessionWorkoutEntry';

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
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';
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
  const [selectedProgressClient, setSelectedProgressClient] = useState<Client | null>(null);
  const [showCompletedPrograms, setShowCompletedPrograms] = useState(false);
  const [selectedWorkoutForEntry, setSelectedWorkoutForEntry] = useState<string | null>(null);

  // Utility function to format OPT phase names
  const formatOptPhase = (phase: string) => {
    return phase
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };
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
    // Check both possible token storage locations
    let savedToken = localStorage.getItem('trainer-tracker-token');
    let savedUser = localStorage.getItem('user');
    
    // Fallback to old token key if new one doesn't exist
    if (!savedToken) {
      savedToken = localStorage.getItem('token');
    }
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      // Ensure consistent storage
      localStorage.setItem('trainer-tracker-token', savedToken);
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
      
      setToken(response.token);
      setUser(response.user);
      // Store token consistently
      localStorage.setItem('trainer-tracker-token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
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

  const handleUpdateProgramStatus = async (programId: string, newStatus: Program['status']) => {
    try {
      setLoading(true);
      
      // If activating a program, ensure only one active program per client
      if (newStatus === 'ACTIVE') {
        const programToActivate = programs.find(p => p.id === programId);
        if (programToActivate) {
          // Check if client already has an active program
          const existingActiveProgram = programs.find(p => 
            p.clientId === programToActivate.clientId && 
            p.status === 'ACTIVE' && 
            p.id !== programId
          );
          
          if (existingActiveProgram) {
            const confirmActivate = window.confirm(
              `Client ${programToActivate.clientId} already has an active program. Do you want to deactivate the current program and activate this one?`
            );
            
            if (!confirmActivate) {
              setLoading(false);
              return;
            }
          }
        }
      }
      
      await apiCall(`/api/programs`, {
        method: 'PATCH',
        body: JSON.stringify({ id: programId, status: newStatus }),
      });
      
      // Update the local programs state
      setPrograms(prevPrograms => 
        prevPrograms.map(program => 
          program.id === programId 
            ? { ...program, status: newStatus }
            : program
        )
      );
      
      showMessage(`Program status updated to ${newStatus}!`);
    } catch (error) {
      showMessage(`Error updating program status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSessionWorkout = async (sessionData: any) => {
    try {
      setLoading(true);
      const response = await apiCall('/api/sessions/workout', {
        method: 'POST',
        body: JSON.stringify(sessionData)
      });
      
      showMessage('Session workout saved successfully!');
      setSelectedWorkoutForEntry(null);
      fetchProgress(); // Refresh progress data
    } catch (error) {
      console.error('Error saving session workout:', error);
      showMessage('Failed to save session workout');
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
          className={`${styles.navButton} ${currentView === 'program-builder' ? styles.active : ''}`}
          onClick={() => setCurrentView('program-builder')}
        >
          Program Builder
        </button>
        <button
          className={`${styles.navButton} ${currentView === 'scheduling' ? styles.active : ''}`}
          onClick={() => setCurrentView('scheduling')}
        >
          Scheduling
        </button>
        <button
          className={`${styles.navButton} ${currentView === 'progress' ? styles.active : ''}`}
          onClick={() => setCurrentView('progress')}
        >
          Progress
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
                  <h3>{programs.filter(p => (p.status || 'ACTIVE') === 'ACTIVE').length}</h3>
                  <p>Active Programs</p>
                  <div className={styles.metricBreakdown}>
                    <span className={styles.activeMetric}>
                      {programs.filter(p => (p.status || 'ACTIVE') === 'ACTIVE').length} Active
                    </span>
                    <span className={styles.completedMetric}>
                      {programs.filter(p => (p.status || 'ACTIVE') === 'COMPLETED').length} Completed
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
                    <div className={styles.clientCode}>
                      <strong>Code:</strong> {client.codeName}
                    </div>
                    {client.email && (
                      <div className={styles.clientEmail}>
                        <strong>Email:</strong> 📧 {client.email}
                      </div>
                    )}
                    {client.phone && (
                      <div className={styles.clientPhone}>
                        <strong>Phone:</strong> 📞 {client.phone}
                      </div>
                    )}
                    <div className={styles.clientDate}>
                      <strong>Member Since:</strong> {new Date(client.createdAt).toLocaleDateString()}
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
              <h2>Program Progress Tracking</h2>
              <p>Track client progress through their training programs with detailed performance analytics</p>
            </div>

            {!selectedProgressProgram ? (
              <div className={styles.programSelection}>
                <h3>Select a Program to View Progress</h3>
                
                {/* Active Programs */}
                <div className={styles.programSection}>
                  <h4>Active Programs</h4>
                  <div className={styles.programGrid}>
                    {programs
                      .filter(program => (program.status || 'ACTIVE') === 'ACTIVE')
                      .map((program) => {
                        const client = clients.find(c => c.id === program.clientId);
                        
                        return (
                          <div 
                            key={program.id} 
                            className={`${styles.programCard} ${styles.active}`}
                          >
                            <div className={styles.programHeader}>
                              <div>
                                <h4>{program.programName}</h4>
                                <span className={styles.programPhase}>{formatOptPhase(program.optPhase)}</span>
                              </div>
                              <div className={styles.programStatusContainer}>
                                <span className={`${styles.programStatus} ${styles.active}`}>
                                  ACTIVE
                                </span>
                              </div>
                            </div>
                            <div className={styles.programClient}>
                              <strong>Client:</strong> {client?.firstName} {client?.lastName} ({client?.codeName})
                            </div>
                            <div className={styles.programDates}>
                              <strong>Duration:</strong> {new Date(program.startDate).toLocaleDateString()} - {program.endDate ? new Date(program.endDate).toLocaleDateString() : 'Ongoing'}
                            </div>
                            <div className={styles.programGoal}>
                              <strong>Goal:</strong> {program.primaryGoal}
                            </div>
                            <div className={styles.programActions}>
                              <Button 
                                appName="web" 
                                onClick={() => {
                                  setSelectedProgressProgram(program);
                                  setSelectedProgressClient(client || null);
                                }}
                                className={styles.viewButton}
                              >
                                View Progress
                              </Button>
                              <Button 
                                appName="web" 
                                onClick={() => handleUpdateProgramStatus(program.id, 'COMPLETED')}
                                className={`${styles.statusButton} ${styles.completed}`}
                              >
                                Mark Complete
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Completed Programs Accordion */}
                {programs.filter(program => (program.status || 'ACTIVE') === 'COMPLETED').length > 0 && (
                  <div className={styles.completedProgramsSection}>
                    <div 
                      className={styles.accordionHeader}
                      onClick={() => setShowCompletedPrograms(!showCompletedPrograms)}
                    >
                      <h4>Completed Programs ({programs.filter(program => (program.status || 'ACTIVE') === 'COMPLETED').length})</h4>
                      <span className={styles.accordionIcon}>
                        {showCompletedPrograms ? '▼' : '▶'}
                      </span>
                    </div>
                    {showCompletedPrograms && (
                      <div className={styles.programGrid}>
                        {programs
                          .filter(program => (program.status || 'ACTIVE') === 'COMPLETED')
                          .map((program) => {
                            const client = clients.find(c => c.id === program.clientId);
                            
                            return (
                              <div 
                                key={program.id} 
                                className={`${styles.programCard} ${styles.completed}`}
                              >
                                <div className={styles.programHeader}>
                                  <div>
                                    <h4>{program.programName}</h4>
                                    <span className={styles.programPhase}>{formatOptPhase(program.optPhase)}</span>
                                  </div>
                                  <div className={styles.programStatusContainer}>
                                    <span className={`${styles.programStatus} ${styles.completed}`}>
                                      COMPLETED
                                    </span>
                                  </div>
                                </div>
                                <div className={styles.programClient}>
                                  <strong>Client:</strong> {client?.firstName} {client?.lastName} ({client?.codeName})
                                </div>
                                <div className={styles.programDates}>
                                  <strong>Duration:</strong> {new Date(program.startDate).toLocaleDateString()} - {program.endDate ? new Date(program.endDate).toLocaleDateString() : 'Ongoing'}
                                </div>
                                <div className={styles.programGoal}>
                                  <strong>Goal:</strong> {program.primaryGoal}
                                </div>
                                <div className={styles.programActions}>
                                  <Button 
                                    appName="web" 
                                    onClick={() => {
                                      setSelectedProgressProgram(program);
                                      setSelectedProgressClient(client || null);
                                    }}
                                    className={styles.viewButton}
                                  >
                                    View Progress
                                  </Button>
                                  <Button 
                                    appName="web" 
                                    onClick={() => handleUpdateProgramStatus(program.id, 'ACTIVE')}
                                    className={`${styles.statusButton} ${styles.active}`}
                                  >
                                    Reactivate
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.progressDetail}>
                <div className={styles.progressHeader}>
                  <Button 
                    appName="web" 
                    onClick={() => {
                      setSelectedProgressProgram(null);
                      setSelectedProgressClient(null);
                    }}
                    className={styles.backButton}
                  >
                    ← Back to Programs
                  </Button>
                  {selectedProgressProgram && selectedProgressProgram.status === 'ACTIVE' && (
                    <Button 
                      appName="web" 
                      onClick={() => setSelectedWorkoutForEntry('new-session')}
                      className={styles.primaryButton}
                    >
                      📝 Record Workout Session
                    </Button>
                  )}
                </div>
                
                {selectedWorkoutForEntry ? (
                  <SessionWorkoutEntry
                    programId={selectedProgressProgram.id}
                    clientId={selectedProgressProgram.clientId}
                    onSave={handleSaveSessionWorkout}
                    onCancel={() => setSelectedWorkoutForEntry(null)}
                  />
                ) : (
                  <ProgramProgress 
                    programId={selectedProgressProgram.id}
                    clientId={selectedProgressProgram.clientId}
                  />
                )}
              </div>
            )}
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