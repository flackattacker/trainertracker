"use client";

import { useState, useEffect } from "react";
import { Button } from "@repo/ui/button";
import styles from "./page.module.css";
import { 
  PARQData, 
  FitnessAssessmentData, 
  BodyCompositionData,
  FlexibilityAssessmentData,
  StrengthAssessmentData,
  CardiovascularAssessmentData,
  AssessmentData,
  defaultPARQData,
  defaultFitnessAssessmentData,
  defaultBodyCompositionData,
  defaultFlexibilityAssessmentData,
  defaultStrengthAssessmentData,
  defaultCardiovascularAssessmentData,
  assessmentDefaults
} from '../src/lib/assessmentData';
import { 
  OPTProgramData, 
  Exercise, 
  Workout, 
  OPTPhase,
  defaultOPTProgramData,
  optPhaseTemplates,
  commonExercises
} from '../src/lib/programData';
import { 
  ProgressData, 
  ProgressMetrics, 
  ProgressGoal,
  ProgressEntry,
  defaultProgressData,
  progressTrackingTemplates
} from '../src/lib/progressData';
import { AssessmentForm } from '../src/components/AssessmentForm';
import OnboardingFlow from '../src/components/OnboardingFlow';
import { clearAuth } from '../src/utils/clearAuth';
import TrainerSessions from '../src/components/TrainerSessions';

interface User {
  id: string;
  email: string;
  role?: string;
}

interface Client {
  id: string;
  codeName: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'undisclosed';
  email?: string;
  phone?: string;
  notes?: string;
  status: 'prospect' | 'active' | 'inactive';
  createdAt: string;
}

interface Assessment {
  id: string;
  clientId: string;
  type: 'PARQ' | 'FITNESS_ASSESSMENT' | 'BODY_COMPOSITION' | 'FLEXIBILITY' | 'STRENGTH' | 'CARDIOVASCULAR' | 'OTHER';
  assessmentDate: string;
  assessor: string;
  notes?: string;
  data: AssessmentData;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

interface Program {
  id: string;
  clientId: string;
  programName: string;
  startDate: string;
  endDate?: string;
  optPhase: string;
  primaryGoal: string;
  secondaryGoals?: string;
  notes?: string;
  data: OPTProgramData;
  createdAt: string;
}

interface Progress {
  id: string;
  clientId: string;
  programId?: string;
  date: string;
  weight?: number;
  bodyFat?: number;
  notes?: string;
  data: ProgressData;
  createdAt: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type View = 'dashboard' | 'clients' | 'assessments' | 'programs' | 'progress';

// Add this component after the existing interfaces and before the main component
const ProgramDetailView = ({ program, onClose }: { program: Program; onClose: () => void }) => {
  const programData = program.data as any;
  
  return (
    <div className={styles.programDetailOverlay}>
      <div className={styles.programDetailModal}>
        <div className={styles.programDetailHeader}>
          <h2>{program.programName}</h2>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>
        
        <div className={styles.programDetailContent}>
          <div className={styles.programOverview}>
            <h3>Program Overview</h3>
            <div className={styles.overviewGrid}>
              <div className={styles.overviewItem}>
                <strong>Phase:</strong> {programData.optPhase?.replace(/_/g, ' ') || 'Not specified'}
              </div>
              <div className={styles.overviewItem}>
                <strong>Duration:</strong> {programData.duration || 'Not specified'} weeks
              </div>
              <div className={styles.overviewItem}>
                <strong>Difficulty:</strong> {programData.difficulty || 'Not specified'}
              </div>
              <div className={styles.overviewItem}>
                <strong>Primary Goal:</strong> {programData.primaryGoal || 'Not specified'}
              </div>
            </div>
          </div>

          {programData.phases && programData.phases.length > 0 && (
            <div className={styles.phasesSection}>
              <h3>Training Phases</h3>
              {programData.phases.map((phase: any, phaseIndex: number) => (
                <div key={phaseIndex} className={styles.phaseCard}>
                  <div className={styles.phaseHeader}>
                    <h4>{phase.name?.replace(/_/g, ' ') || 'Phase'}</h4>
                    <span className={styles.phaseDuration}>{phase.duration} weeks</span>
                  </div>
                  
                  <div className={styles.phaseContent}>
                    <div className={styles.phaseFocus}>
                      <strong>Focus:</strong> {phase.focus}
                    </div>
                    
                    {phase.trainingObjectives && (
                      <div className={styles.trainingObjectives}>
                        <strong>Training Objectives:</strong>
                        <ul>
                          {phase.trainingObjectives.map((objective: string, index: number) => (
                            <li key={index}>{objective}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {phase.weeklyPlans && phase.weeklyPlans.length > 0 && (
                      <div className={styles.weeklyPlans}>
                        <strong>Weekly Workout Plans:</strong>
                        {phase.weeklyPlans.map((weekPlan: any, weekIndex: number) => (
                          <div key={weekIndex} className={styles.weekPlan}>
                            <h5>Week {weekPlan.week}</h5>
                            {weekPlan.workouts && weekPlan.workouts.map((workout: any, workoutIndex: number) => (
                              <div key={workoutIndex} className={styles.workoutCard}>
                                <div className={styles.workoutHeader}>
                                  <h6>{workout.day} - {workout.focus}</h6>
                                </div>
                                
                                {workout.exercises && workout.exercises.length > 0 && (
                                  <div className={styles.exercisesList}>
                                    {workout.exercises.map((exercise: any, exerciseIndex: number) => (
                                      <div key={exerciseIndex} className={styles.exerciseItem}>
                                        <div className={styles.exerciseHeader}>
                                          <span className={styles.exerciseName}>{exercise.name}</span>
                                          <span className={styles.exerciseId}>ID: {exercise.exerciseId}</span>
                                        </div>
                                        
                                        <div className={styles.exerciseDetails}>
                                          <div className={styles.exerciseParams}>
                                            <span className={styles.param}>
                                              <strong>Sets:</strong> {exercise.sets}
                                            </span>
                                            <span className={styles.param}>
                                              <strong>Reps/Duration:</strong> {exercise.reps}
                                            </span>
                                            <span className={styles.param}>
                                              <strong>Rest:</strong> {exercise.rest}
                                            </span>
                                            {exercise.tempo && (
                                              <span className={styles.param}>
                                                <strong>Tempo:</strong> {exercise.tempo}
                                              </span>
                                            )}
                                            {exercise.rpe && (
                                              <span className={styles.param}>
                                                <strong>RPE:</strong> {exercise.rpe}/10
                                              </span>
                                            )}
                                          </div>
                                          
                                          {exercise.notes && (
                                            <div className={styles.exerciseNotes}>
                                              <strong>Notes:</strong> {exercise.notes}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}

                    {phase.progressionRules && (
                      <div className={styles.progressionRules}>
                        <strong>Progression Rules:</strong>
                        <ul>
                          {phase.progressionRules.repIncrease && (
                            <li>Rep Increase: {phase.progressionRules.repIncrease}</li>
                          )}
                          {phase.progressionRules.volumeIncrease && (
                            <li>Volume Increase: {phase.progressionRules.volumeIncrease}%</li>
                          )}
                          {phase.progressionRules.intensityIncrease && (
                            <li>Intensity Increase: {phase.progressionRules.intensityIncrease}%</li>
                          )}
                        </ul>
                      </div>
                    )}

                    {phase.assessmentCriteria && (
                      <div className={styles.assessmentCriteria}>
                        <strong>Assessment Criteria:</strong>
                        <ul>
                          {phase.assessmentCriteria.map((criterion: string, index: number) => (
                            <li key={index}>{criterion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {programData.nutritionGuidelines && (
            <div className={styles.guidelinesSection}>
              <h3>Nutrition Guidelines</h3>
              <p>{programData.nutritionGuidelines}</p>
            </div>
          )}

          {programData.recoveryGuidelines && (
            <div className={styles.guidelinesSection}>
              <h3>Recovery Guidelines</h3>
              <p>{programData.recoveryGuidelines}</p>
            </div>
          )}

          {programData.progressTracking && (
            <div className={styles.progressTrackingSection}>
              <h3>Progress Tracking</h3>
              <div className={styles.trackingDetails}>
                <div className={styles.trackingMetrics}>
                  <strong>Metrics to Track:</strong>
                  <ul>
                    {programData.progressTracking.metrics?.map((metric: string, index: number) => (
                      <li key={index}>{metric}</li>
                    ))}
                  </ul>
                </div>
                
                <div className={styles.trackingFrequency}>
                  <strong>Frequency:</strong> {programData.progressTracking.frequency}
                </div>
                
                {programData.progressTracking.assessments && (
                  <div className={styles.trackingAssessments}>
                    <strong>Assessments:</strong>
                    <ul>
                      {programData.progressTracking.assessments.map((assessment: string, index: number) => (
                        <li key={index}>{assessment}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {program.notes && (
            <div className={styles.notesSection}>
              <h3>Program Notes</h3>
              <p>{program.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedProgressProgram, setSelectedProgressProgram] = useState<Program | null>(null);
  const [progressUpdateType, setProgressUpdateType] = useState<'general' | 'workout' | 'assessment'>('general');
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [workoutProgress, setWorkoutProgress] = useState<any>({});
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [onboardingLoading, setOnboardingLoading] = useState(true);

  // Data state
  const [clients, setClients] = useState<Client[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);

  // Initialize auth state from localStorage on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem('trainer-tracker-token');
    const savedUser = localStorage.getItem('trainer-tracker-user');
    
    if (savedToken && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(userData);
        
        // Validate token by making a test API call
        const validateToken = async () => {
          try {
            await fetch(`${API_BASE}/api/clients`, {
              headers: {
                'Authorization': `Bearer ${savedToken}`,
              },
            });
            // If successful, token is valid
          } catch (error) {
            console.error('Token validation failed:', error);
            // Token is invalid, clear auth state
            setToken('');
            setUser(null);
            localStorage.removeItem('trainer-tracker-token');
            localStorage.removeItem('trainer-tracker-user');
          } finally {
            setAuthLoading(false);
          }
        };
        
        validateToken();
      } catch (error) {
        console.error('Error parsing saved auth data:', error);
        // Clear invalid data
        localStorage.removeItem('trainer-tracker-token');
        localStorage.removeItem('trainer-tracker-user');
        setAuthLoading(false);
      }
    } else {
      setAuthLoading(false);
    }
  }, []);

  // Check onboarding status when user is authenticated
  useEffect(() => {
    if (token && user) {
      checkOnboardingStatus();
    }
  }, [token, user]);

  // Fetch data when user is authenticated
  useEffect(() => {
    if (token && user && onboardingCompleted) {
      fetchClients();
      fetchAssessments();
      fetchPrograms();
      fetchProgress();
    }
  }, [token, user, onboardingCompleted]);

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
    data: defaultPARQData as AssessmentData
  });
  const [newProgram, setNewProgram] = useState({ 
    clientId: '', 
    programName: '', 
    startDate: '', 
    endDate: '', 
    optPhase: 'STABILIZATION_ENDURANCE' as const, 
    primaryGoal: '', 
    secondaryGoals: '', 
    notes: '', 
    data: defaultOPTProgramData 
  });
  const [newProgress, setNewProgress] = useState({ 
    clientId: '', 
    programId: '', 
    date: '', 
    weight: '', 
    bodyFat: '', 
    notes: '', 
    data: defaultProgressData 
  });

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      showMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const checkOnboardingStatus = async () => {
    try {
      console.log('Checking onboarding status...');
      const response = await apiCall('/api/auth/onboarding');
      console.log('Onboarding response:', response);
      
      setOnboardingCompleted(response.onboardingCompleted);
      setOnboardingLoading(false);
      console.log('Onboarding completed set to:', response.onboardingCompleted);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setOnboardingCompleted(false);
      setOnboardingLoading(false);
    }
  };

  // Authentication
  const handleRegister = async () => {
    try {
      await apiCall('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      showMessage('Registration successful!');
    } catch (error) {
      // Registration might fail if user exists, that's okay
    }
  };

  const handleLogin = async () => {
    try {
      const result = await apiCall('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setToken(result.token);
      setUser(result.user);
      
      // Save to localStorage for persistence
      localStorage.setItem('trainer-tracker-token', result.token);
      localStorage.setItem('trainer-tracker-user', JSON.stringify(result.user));
      
      showMessage('Login successful!');
    } catch (error) {
      // Error already shown by apiCall
    }
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    setClients([]);
    setAssessments([]);
    setPrograms([]);
    setProgress([]);
    
    // Clear localStorage
    localStorage.removeItem('trainer-tracker-token');
    localStorage.removeItem('trainer-tracker-user');
    
    showMessage('Logged out');
  };

  // Data fetching
  const fetchClients = async () => {
    try {
      const result = await apiCall('/api/clients');
      setClients(result);
    } catch (error) {
      // Error already shown
    }
  };

  const fetchAssessments = async () => {
    try {
      const result = await apiCall('/api/assessments');
      setAssessments(result);
    } catch (error) {
      // Error already shown
    }
  };

  const fetchPrograms = async () => {
    try {
      const result = await apiCall('/api/programs');
      setPrograms(result);
    } catch (error) {
      // Error already shown
    }
  };

  const fetchProgress = async () => {
    try {
      const result = await apiCall('/api/progress');
      setProgress(result);
    } catch (error) {
      // Error already shown
    }
  };

  // Get programs for a specific client
  const getClientPrograms = (clientId: string) => {
    return programs.filter(program => program.clientId === clientId);
  };

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
    } catch (error) {
      // Error already shown
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
        type: 'PARQ' as const, 
        assessmentDate: '', 
        assessor: '', 
        notes: '',
        status: 'COMPLETED' as const,
        data: defaultPARQData as AssessmentData
      });
      await fetchAssessments();
      showMessage('Assessment created successfully!');
    } catch (error) {
      // Error already shown
    }
  };

  // Program management
  const createProgram = async () => {
    // Validate required fields
    if (!newProgram.clientId || !newProgram.programName || !newProgram.startDate || !newProgram.optPhase || !newProgram.primaryGoal) {
      showMessage('Please fill in all required fields: Client, Program Name, Start Date, OPT Phase, and Primary Goal');
      return;
    }
    
    try {
      console.log('Creating program with data:', newProgram);
      const response = await apiCall('/api/programs', {
        method: 'POST',
        body: JSON.stringify(newProgram),
      });
      console.log('Program creation response:', response);
      setNewProgram({ 
        clientId: '', 
        programName: '', 
        startDate: '', 
        endDate: '', 
        optPhase: 'STABILIZATION_ENDURANCE' as const, 
        primaryGoal: '', 
        secondaryGoals: '', 
        notes: '', 
        data: defaultOPTProgramData 
      });
      setAiGenerated(false); // Reset AI generated state
      await fetchPrograms();
      showMessage('Program created successfully!');
    } catch (error) {
      console.error('Program creation error:', error);
      showMessage(`Program creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const generateProgram = async (clientId: string) => {
    if (!clientId) return;
    
    setAiGenerating(true);
    showMessage('🤖 AI is analyzing client data and generating a personalized program...');
    
    try {
      const result = await apiCall('/api/programs/generate', {
        method: 'POST',
        body: JSON.stringify({ clientId }),
      });
      
      if (result.program) {
        // Auto-fill the program form with the generated data
        const client = clients.find(c => c.id === clientId);
        const generatedProgram = {
          clientId,
          programName: `${client?.codeName || 'Client'} - ${result.program.optPhase.replace(/_/g, ' ')} Program`,
          startDate: new Date().toISOString().split('T')[0] || '',
          endDate: '',
          optPhase: result.program.optPhase as any,
          primaryGoal: result.program.primaryGoal || '',
          secondaryGoals: result.program.secondaryGoals?.join(', ') || '',
          notes: `AI-generated program based on client assessments and progress data.`,
          data: result.program
        };
        
        setNewProgram(generatedProgram);
        setAiGenerated(true);
        showMessage('✅ AI program generated successfully! Review the details below and click "Create Program" to save it.');
      }
    } catch (error) {
      showMessage('❌ AI program generation failed. Please try again.');
    } finally {
      setAiGenerating(false);
    }
  };

  // Progress management
  const createProgress = async () => {
    if (!newProgress.clientId || !newProgress.date) {
      showMessage('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      let progressData: any = {
        ...newProgress,
        weight: newProgress.weight ? parseFloat(newProgress.weight) : undefined,
        bodyFat: newProgress.bodyFat ? parseFloat(newProgress.bodyFat) : undefined,
      };

      // Add specific data based on progress update type
      if (progressUpdateType === 'workout' && selectedWorkout) {
        progressData.data = {
          type: 'workout_performance',
          workout: selectedWorkout,
          performance: workoutProgress,
          ...progressData.data
        };
      } else if (progressUpdateType === 'assessment') {
        progressData.data = {
          type: 'assessment_results',
          assessment: workoutProgress,
          ...progressData.data
        };
      } else {
        progressData.data = {
          type: 'general_progress',
          ...progressData.data
        };
      }

      await apiCall('/api/progress', {
        method: 'POST',
        body: JSON.stringify(progressData),
      });

      showMessage('Progress recorded successfully!');
      setNewProgress({ 
        clientId: '', 
        programId: '', 
        date: '', 
        weight: '', 
        bodyFat: '', 
        notes: '', 
        data: defaultProgressData 
      });
      setWorkoutProgress({});
      setSelectedWorkout(null);
      setProgressUpdateType('general');
      await fetchProgress();
    } catch (error) {
      showMessage('Failed to record progress');
    } finally {
      setLoading(false);
    }
  };

  // Export functionality
  const exportRecord = async (type: string, id: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type, id }),
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}-${id}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        showMessage('Export successful!');
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      showMessage(`Export error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Load data when user logs in
  useEffect(() => {
    if (user && token) {
      fetchClients();
      fetchAssessments();
      fetchPrograms();
      fetchProgress();
    }
  }, [user, token]);

  // Show loading while checking onboarding status
  if (user && token && onboardingLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: 24, fontWeight: 300 }}>
        Checking onboarding status...
      </div>
    );
  }

  // Show onboarding if not completed and not loading
  if (user && token && !onboardingLoading && onboardingCompleted === false) {
    return (
      <OnboardingFlow
        onComplete={() => {
          setOnboardingCompleted(true);
          setOnboardingLoading(false);
        }}
        user={user}
      />
    );
  }

  // Loading screen while checking authentication
  if (authLoading) {
    return (
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <div className={styles.loginHeader}>
            <h1>Trainer Tracker</h1>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Login Screen
  if (!user) {
    return (
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <div className={styles.loginHeader}>
            <h1>Trainer Tracker</h1>
            <p>Professional fitness tracking and client management</p>
          </div>
          
          {message && (
            <div className={styles.message}>
              {message}
            </div>
          )}

          <div className={styles.loginForm}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
            />
            <div className={styles.loginButtons}>
              <Button appName="web" onClick={handleRegister} disabled={loading} className={styles.secondaryButton}>
                Register
              </Button>
              <Button appName="web" onClick={handleLogin} disabled={loading} className={styles.primaryButton}>
                Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Application
  return (
    <div className={styles.app}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Trainer Tracker</h1>
          <div className={styles.userInfo}>
            <span>{user.email}</span>
            <Button appName="web" onClick={clearAuth} className={styles.logoutButton}>
              Clear Auth
            </Button>
            <Button appName="web" onClick={handleLogout} className={styles.logoutButton}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation - Only show when not on dashboard */}
      {currentView !== 'dashboard' && (
        <nav className={styles.navigation}>
          <button 
            className={styles.navButton}
            onClick={() => setCurrentView('dashboard')}
          >
            ← Back to Dashboard
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
            className={`${styles.navButton} ${currentView === 'programs' ? styles.active : ''}`}
            onClick={() => setCurrentView('programs')}
          >
            Programs
          </button>
          <button 
            className={`${styles.navButton} ${currentView === 'progress' ? styles.active : ''}`}
            onClick={() => setCurrentView('progress')}
          >
            Progress
          </button>
        </nav>
      )}

      {/* Main Content */}
      <main className={styles.main}>
        {message && (
          <div className={styles.message}>
            {message}
          </div>
        )}

        {/* Dashboard View */}
        {currentView === 'dashboard' && (
          <div className={styles.dashboard}>
            <div className={styles.dashboardHeader}>
              <h2>Client Lifecycle Dashboard</h2>
              <p>Manage your clients through their complete fitness journey</p>
            </div>

            {/* Client Lifecycle Workflow */}
            <div className={styles.lifecycleWorkflow}>
              <div className={styles.workflowStep}>
                <div className={styles.stepHeader}>
                  <div className={styles.stepIcon}>👤</div>
                  <h3>1. Client Onboarding</h3>
                  <span className={styles.stepCount}>{clients.length} clients</span>
                </div>
                <div className={styles.stepContent}>
                  <p>Add new clients and capture essential information</p>
                  <div className={styles.stepActions}>
                    <Button 
                      appName="web" 
                      onClick={() => setCurrentView('clients')} 
                      className={styles.workflowButton}
                    >
                      Manage Clients
                    </Button>
                    <div className={styles.stepStats}>
                      <span>{clients.filter(c => c.status === 'active').length} active</span>
                      <span>{clients.filter(c => c.status === 'prospect').length} prospects</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.workflowArrow}>→</div>

              <div className={styles.workflowStep}>
                <div className={styles.stepHeader}>
                  <div className={styles.stepIcon}>📋</div>
                  <h3>2. Assessment</h3>
                  <span className={styles.stepCount}>{assessments.length} assessments</span>
                </div>
                <div className={styles.stepContent}>
                  <p>Conduct fitness assessments and evaluations</p>
                  <div className={styles.stepActions}>
                    <Button 
                      appName="web" 
                      onClick={() => setCurrentView('assessments')} 
                      className={styles.workflowButton}
                    >
                      View Assessments
                    </Button>
                    <div className={styles.stepStats}>
                      <span>{assessments.filter(a => a.status === 'COMPLETED').length} completed</span>
                      <span>{assessments.filter(a => a.status === 'SCHEDULED').length} scheduled</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.workflowArrow}>→</div>

              <div className={styles.workflowStep}>
                <div className={styles.stepHeader}>
                  <div className={styles.stepIcon}>🏋️</div>
                  <h3>3. Program Design</h3>
                  <span className={styles.stepCount}>{programs.length} programs</span>
                </div>
                <div className={styles.stepContent}>
                  <p>Create personalized training programs with AI assistance</p>
                  <div className={styles.stepActions}>
                    <Button 
                      appName="web" 
                      onClick={() => setCurrentView('programs')} 
                      className={styles.workflowButton}
                    >
                      Manage Programs
                    </Button>
                    <div className={styles.stepStats}>
                      <span>{programs.filter(p => new Date(p.endDate || '') > new Date()).length} active</span>
                      <span>{programs.filter(p => new Date(p.endDate || '') <= new Date()).length} completed</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.workflowArrow}>→</div>

              <div className={styles.workflowStep}>
                <div className={styles.stepHeader}>
                  <div className={styles.stepIcon}>📊</div>
                  <h3>4. Progress Tracking</h3>
                  <span className={styles.stepCount}>{progress.length} records</span>
                </div>
                <div className={styles.stepContent}>
                  <p>Monitor client progress and adjust programs accordingly</p>
                  <div className={styles.stepActions}>
                    <Button 
                      appName="web" 
                      onClick={() => setCurrentView('progress')} 
                      className={styles.workflowButton}
                    >
                      Track Progress
                    </Button>
                    <div className={styles.stepStats}>
                      <span>{progress.filter(p => new Date(p.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length} this week</span>
                      <span>{progress.filter(p => new Date(p.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length} this month</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className={styles.quickActions}>
              <h3>Quick Actions</h3>
              <div className={styles.actionGrid}>
                <div className={styles.actionCard}>
                  <div className={styles.actionIcon}>➕</div>
                  <h4>Add New Client</h4>
                  <p>Start the client lifecycle</p>
                  <Button 
                    appName="web" 
                    onClick={() => setCurrentView('clients')} 
                    className={styles.actionButton}
                  >
                    Get Started
                  </Button>
                </div>
                
                <div className={styles.actionCard}>
                  <div className={styles.actionIcon}>🤖</div>
                  <h4>AI Program Generation</h4>
                  <p>Create training programs instantly</p>
                  <Button 
                    appName="web" 
                    onClick={() => setCurrentView('programs')} 
                    className={styles.actionButton}
                  >
                    Generate Program
                  </Button>
                </div>
                
                <div className={styles.actionCard}>
                  <div className={styles.actionIcon}>📈</div>
                  <h4>View Analytics</h4>
                  <p>Track performance metrics</p>
                  <Button 
                    appName="web" 
                    onClick={() => setCurrentView('progress')} 
                    className={styles.actionButton}
                  >
                    View Reports
                  </Button>
                </div>
                
                <div className={styles.actionCard}>
                  <div className={styles.actionIcon}>📄</div>
                  <h4>Export Reports</h4>
                  <p>Generate client reports</p>
                  <Button 
                    appName="web" 
                    onClick={() => setCurrentView('clients')} 
                    className={styles.actionButton}
                  >
                    Export Data
                  </Button>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className={styles.recentActivity}>
              <h3>Recent Activity</h3>
              <div className={styles.activityList}>
                {clients.slice(0, 5).map(client => (
                  <div key={client.id} className={styles.activityItem}>
                    <span className={styles.activityIcon}>👤</span>
                    <span>{client.firstName} {client.lastName} - {client.status}</span>
                    <span className={styles.activityDate}>
                      {new Date(client.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Clients View */}
        {currentView === 'clients' && (
          <div className={styles.clientsView}>
            <div className={styles.viewHeader}>
              <h2>Client Management</h2>
              <Button appName="web" onClick={fetchClients} disabled={loading} className={styles.refreshButton}>
                Refresh
              </Button>
            </div>

            <div className={styles.createSection}>
              <h3>Add New Client</h3>
              <div className={styles.createForm}>
                <div className={styles.formGroup}>
                  <label>Code Name</label>
                  <input
                    type="text"
                    placeholder="e.g., John Smith"
                    value={newClient.codeName}
                    onChange={(e) => setNewClient({ ...newClient, codeName: e.target.value })}
                    className={styles.input}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>First Name</label>
                  <input
                    type="text"
                    placeholder="First name"
                    value={newClient.firstName}
                    onChange={(e) => setNewClient({ ...newClient, firstName: e.target.value })}
                    className={styles.input}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Last Name</label>
                  <input
                    type="text"
                    placeholder="Last name"
                    value={newClient.lastName}
                    onChange={(e) => setNewClient({ ...newClient, lastName: e.target.value })}
                    className={styles.input}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    value={newClient.dateOfBirth}
                    onChange={(e) => setNewClient({ ...newClient, dateOfBirth: e.target.value })}
                    className={styles.input}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Gender</label>
                  <select
                    value={newClient.gender}
                    onChange={(e) => setNewClient({ ...newClient, gender: e.target.value as any })}
                    className={styles.select}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="undisclosed">Undisclosed</option>
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    className={styles.input}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Phone</label>
                  <input
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    className={styles.input}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Status</label>
                  <select
                    value={newClient.status}
                    onChange={(e) => setNewClient({ ...newClient, status: e.target.value as any })}
                    className={styles.select}
                  >
                    <option value="prospect">Prospect</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>Notes</label>
                  <textarea
                    placeholder="Additional notes about the client..."
                    value={newClient.notes}
                    onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                    className={styles.textarea}
                  />
                </div>
                
                <div className={styles.formActions}>
                  <Button appName="web" onClick={createClient} disabled={loading} className={styles.createButton}>
                    Add Client
                  </Button>
                </div>
              </div>
            </div>

            <div className={styles.clientsList}>
              <h3>All Clients</h3>
              <div className={styles.clientGrid}>
                {clients.map(client => (
                  <div key={client.id} className={styles.clientCard}>
                    <div className={styles.clientHeader}>
                      <h4>{client.firstName} {client.lastName}</h4>
                      <span className={`${styles.status} ${styles[client.status]}`}>
                        {client.status}
                      </span>
                    </div>
                    <p className={styles.clientCode}>Code: {client.codeName}</p>
                    {client.email && <p className={styles.clientEmail}>{client.email}</p>}
                    {client.phone && <p className={styles.clientPhone}>{client.phone}</p>}
                    <p className={styles.clientDate}>
                      Since {new Date(client.createdAt).toLocaleDateString()}
                    </p>
                    <div className={styles.clientActions}>
                      <Button appName="web" onClick={() => exportRecord('client', client.id)} className={styles.actionButton}>
                        Export
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
              <h2>Assessments</h2>
              <Button appName="web" onClick={fetchAssessments} disabled={loading} className={styles.refreshButton}>
                Refresh
              </Button>
            </div>

            <div className={styles.createSection}>
              <h3>Create Assessment</h3>
              <AssessmentForm
                assessment={newAssessment}
                onChange={setNewAssessment}
                clients={clients}
              />
              <div className={styles.formActions}>
                <Button appName="web" onClick={createAssessment} disabled={loading} className={styles.createButton}>
                  Create Assessment
                </Button>
              </div>
            </div>

            <div className={styles.assessmentsList}>
              <h3>All Assessments</h3>
              <div className={styles.assessmentGrid}>
                {assessments.map(assessment => {
                  const client = clients.find(c => c.id === assessment.clientId);
                  return (
                    <div key={assessment.id} className={styles.assessmentCard}>
                      <div className={styles.assessmentHeader}>
                        <h4>{assessment.type} Assessment</h4>
                        <span className={styles.assessmentType}>{assessment.type}</span>
                      </div>
                      <p className={styles.assessmentClient}>
                        Client: {client?.codeName || 'Unknown'}
                      </p>
                      <p className={styles.assessmentDate}>
                        {new Date(assessment.assessmentDate).toLocaleDateString()}
                      </p>
                      <p className={styles.assessmentAssessor}>
                        Assessor: {assessment.assessor}
                      </p>
                      <div className={styles.assessmentActions}>
                        <Button appName="web" onClick={() => exportRecord('assessment', assessment.id)} className={styles.actionButton}>
                          Export
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Programs View */}
        {currentView === 'programs' && (
          <div className={styles.programsView}>
            <div className={styles.viewHeader}>
              <h2>Training Programs</h2>
              <Button appName="web" onClick={fetchPrograms} disabled={loading} className={styles.refreshButton}>
                Refresh
              </Button>
            </div>

            <div className={styles.createSection}>
              <h3>Create Program</h3>
              <div className={styles.createForm}>
                <div className={styles.formGroup}>
                  <label className={styles.required}>Client *</label>
                  <select
                    value={newProgram.clientId}
                    onChange={(e) => setNewProgram({ ...newProgram, clientId: e.target.value })}
                    className={styles.select}
                  >
                    <option value="">Select a client</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.codeName} - {client.firstName} {client.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.required}>Program Name *</label>
                  <input
                    type="text"
                    value={newProgram.programName}
                    onChange={(e) => setNewProgram({ ...newProgram, programName: e.target.value })}
                    className={styles.input}
                    placeholder="12-Week OPT Program"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.required}>OPT Phase *</label>
                  <select
                    value={newProgram.optPhase}
                    onChange={(e) => setNewProgram({ ...newProgram, optPhase: e.target.value as any })}
                    className={styles.select}
                  >
                    <option value="STABILIZATION_ENDURANCE">Stabilization Endurance</option>
                    <option value="STRENGTH_ENDURANCE">Strength Endurance</option>
                    <option value="MUSCULAR_DEVELOPMENT">Muscular Development</option>
                    <option value="MAXIMAL_STRENGTH">Maximal Strength</option>
                    <option value="POWER">Power</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.required}>Primary Goal *</label>
                  <input
                    type="text"
                    value={newProgram.primaryGoal}
                    onChange={(e) => setNewProgram({ ...newProgram, primaryGoal: e.target.value })}
                    className={styles.input}
                    placeholder="Improve overall fitness and movement quality"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.required}>Start Date *</label>
                  <input
                    type="date"
                    value={newProgram.startDate}
                    onChange={(e) => setNewProgram({ ...newProgram, startDate: e.target.value })}
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>End Date</label>
                  <input
                    type="date"
                    value={newProgram.endDate}
                    onChange={(e) => setNewProgram({ ...newProgram, endDate: e.target.value })}
                    className={styles.input}
                  />
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>Secondary Goals</label>
                  <textarea
                    value={newProgram.secondaryGoals}
                    onChange={(e) => setNewProgram({ ...newProgram, secondaryGoals: e.target.value })}
                    className={styles.textarea}
                    rows={3}
                    placeholder="Additional training objectives..."
                  />
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>Notes</label>
                  <textarea
                    value={newProgram.notes}
                    onChange={(e) => setNewProgram({ ...newProgram, notes: e.target.value })}
                    className={styles.textarea}
                    rows={3}
                    placeholder="Program notes and instructions..."
                  />
                </div>
              </div>
              <div className={styles.formActions}>
                <Button appName="web" onClick={createProgram} disabled={loading} className={styles.createButton}>
                  Create Program
                </Button>
              </div>
            </div>

            <div className={styles.aiSection}>
              <h3>🤖 AI Program Generation</h3>
              <p className={styles.aiDescription}>
                Let AI create a personalized OPT program based on your client's assessments and progress data. 
                The AI will analyze their fitness level, goals, and history to recommend the optimal training phase.
              </p>
              
              {aiGenerating && (
                <div className={styles.aiLoading}>
                  <div className={styles.loadingSpinner}></div>
                  <p>AI is analyzing client data and generating your program...</p>
                  <p className={styles.aiNote}>This may take 10-15 seconds</p>
                </div>
              )}
              
              {aiGenerated && !aiGenerating && (
                <div className={styles.aiSuccess}>
                  <div className={styles.successIcon}>✅</div>
                  <p>AI program generated successfully!</p>
                  <p className={styles.aiNote}>Review the program details below and click "Create Program" to save it.</p>
                </div>
              )}
              
              <div className={styles.createForm}>
                <div className={styles.formGroup}>
                  <label>Select Client for AI Generation</label>
                  <select
                    onChange={(e) => generateProgram(e.target.value)}
                    className={styles.select}
                    disabled={aiGenerating}
                  >
                    <option value="">Choose a client...</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.codeName} - {client.firstName} {client.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                
                {aiGenerating && (
                  <div className={styles.aiProgress}>
                    <p>⏳ Processing client assessments...</p>
                    <p>📊 Analyzing fitness data...</p>
                    <p>🎯 Determining optimal training phase...</p>
                    <p>📝 Generating personalized program...</p>
                  </div>
                )}
              </div>
              
              <div className={styles.aiInfo}>
                <h4>What the AI does:</h4>
                <ul>
                  <li>📋 Reviews all client assessments (PARQ, fitness, body composition)</li>
                  <li>📈 Analyzes progress tracking data</li>
                  <li>🎯 Determines the optimal OPT training phase</li>
                  <li>💪 Creates a personalized program with specific goals</li>
                  <li>📅 Suggests appropriate duration and progression</li>
                </ul>
              </div>
            </div>

            <div className={styles.programsList}>
              <h3>All Programs</h3>
              <div className={styles.programGrid}>
                {programs.map(program => {
                  const client = clients.find(c => c.id === program.clientId);
                  return (
                    <div key={program.id} className={styles.programCard}>
                      <div className={styles.programHeader}>
                        <h4>{program.programName}</h4>
                      </div>
                      <p className={styles.programClient}>
                        Client: {client?.codeName || 'Unknown'}
                      </p>
                      <p className={styles.programDate}>
                        {new Date(program.startDate).toLocaleDateString()} - {program.endDate ? new Date(program.endDate).toLocaleDateString() : 'Present'}
                      </p>
                      <p className={styles.programGoals}>
                        Phase: {program.optPhase.replace(/_/g, ' ')} | Goal: {program.primaryGoal || 'N/A'}
                      </p>
                      <div className={styles.programActions}>
                        <Button appName="web" onClick={() => setSelectedProgram(program)} className={styles.actionButton}>
                          View Details
                        </Button>
                        <Button appName="web" onClick={() => exportRecord('program', program.id)} className={styles.actionButton}>
                          Export
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Progress View */}
        {currentView === 'progress' && (
          <div className={styles.progressView}>
            <div className={styles.viewHeader}>
              <h2>Progress Tracking</h2>
              <Button appName="web" onClick={fetchProgress} disabled={loading} className={styles.refreshButton}>
                Refresh
              </Button>
            </div>

            {/* Client and Program Selection */}
            <div className={styles.selectionSection}>
              <div className={styles.createForm}>
                <div className={styles.formGroup}>
                  <label>Client</label>
                  <select
                    value={newProgress.clientId}
                    onChange={(e) => {
                      setNewProgress({ ...newProgress, clientId: e.target.value, programId: '' });
                      setSelectedProgressProgram(null);
                      setSelectedWorkout(null);
                      setWorkoutProgress({});
                    }}
                    className={styles.select}
                  >
                    <option value="">Select a client</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.codeName} - {client.firstName} {client.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                {newProgress.clientId && (
                  <div className={styles.formGroup}>
                    <label>Program</label>
                    <select
                      value={newProgress.programId}
                      onChange={(e) => {
                        const programId = e.target.value;
                        setNewProgress({ ...newProgress, programId });
                        if (programId) {
                          const program = programs.find(p => p.id === programId);
                          setSelectedProgressProgram(program || null);
                          setSelectedWorkout(null);
                          setWorkoutProgress({});
                        } else {
                          setSelectedProgressProgram(null);
                          setSelectedWorkout(null);
                          setWorkoutProgress({});
                        }
                      }}
                      className={styles.select}
                    >
                      <option value="">No specific program</option>
                      {getClientPrograms(newProgress.clientId).map(program => (
                        <option key={program.id} value={program.id}>
                          {program.programName} - {program.optPhase.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Update Type Selection */}
            {selectedProgressProgram && (
              <div className={styles.updateTypeSection}>
                <h3>Progress Update Type</h3>
                <div className={styles.updateTypeButtons}>
                  <button
                    className={`${styles.updateTypeButton} ${progressUpdateType === 'general' ? styles.active : ''}`}
                    onClick={() => setProgressUpdateType('general')}
                  >
                    📊 General Progress
                  </button>
                  <button
                    className={`${styles.updateTypeButton} ${progressUpdateType === 'workout' ? styles.active : ''}`}
                    onClick={() => setProgressUpdateType('workout')}
                  >
                    💪 Workout Performance
                  </button>
                  <button
                    className={`${styles.updateTypeButton} ${progressUpdateType === 'assessment' ? styles.active : ''}`}
                    onClick={() => setProgressUpdateType('assessment')}
                  >
                    📋 Assessment Results
                  </button>
                </div>
              </div>
            )}

            {/* General Progress Form */}
            {selectedProgressProgram && progressUpdateType === 'general' && (
              <div className={styles.createSection}>
                <h3>General Progress Update</h3>
                <div className={styles.createForm}>
                  <div className={styles.formGroup}>
                    <label>Date</label>
                    <input
                      type="date"
                      value={newProgress.date}
                      onChange={(e) => setNewProgress({ ...newProgress, date: e.target.value })}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newProgress.weight}
                      onChange={(e) => setNewProgress({ ...newProgress, weight: e.target.value })}
                      className={styles.input}
                      placeholder="75.5"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Body Fat (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newProgress.bodyFat}
                      onChange={(e) => setNewProgress({ ...newProgress, bodyFat: e.target.value })}
                      className={styles.input}
                      placeholder="15.2"
                    />
                  </div>

                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label>General Notes</label>
                    <textarea
                      value={newProgress.notes}
                      onChange={(e) => setNewProgress({ ...newProgress, notes: e.target.value })}
                      className={styles.textarea}
                      rows={3}
                      placeholder="General progress notes, observations, or measurements..."
                    />
                  </div>
                </div>
                <div className={styles.formActions}>
                  <Button appName="web" onClick={createProgress} disabled={loading} className={styles.createButton}>
                    Record General Progress
                  </Button>
                </div>
              </div>
            )}

            {/* Workout Performance Form */}
            {selectedProgressProgram && progressUpdateType === 'workout' && (
              <div className={styles.workoutProgressSection}>
                <h3>Workout Performance Update</h3>
                
                {/* Workout Selection */}
                <div className={styles.workoutSelection}>
                  <h4>Select Workout to Update</h4>
                  <div className={styles.workoutGrid}>
                    {selectedProgressProgram.data.phases?.map((phase: any, phaseIndex: number) => 
                      phase.weeklyPlans?.map((weekPlan: any, weekIndex: number) =>
                        weekPlan.workouts?.map((workout: any, workoutIndex: number) => (
                          <button
                            key={`${phaseIndex}-${weekIndex}-${workoutIndex}`}
                            className={`${styles.workoutSelectButton} ${selectedWorkout === workout ? styles.active : ''}`}
                            onClick={() => {
                              setSelectedWorkout(workout);
                              setWorkoutProgress({});
                            }}
                          >
                            <div className={styles.workoutSelectHeader}>
                              <strong>{workout.day}</strong>
                              <span className={styles.workoutSelectFocus}>{workout.focus}</span>
                            </div>
                            <div className={styles.workoutSelectInfo}>
                              Week {weekPlan.week} • {workout.exercises?.length || 0} exercises
                            </div>
                          </button>
                        ))
                      )
                    )}
                  </div>
                </div>

                {/* Workout Progress Form */}
                {selectedWorkout && (
                  <div className={styles.workoutProgressForm}>
                    <h4>Update Performance for {selectedWorkout.day} - {selectedWorkout.focus}</h4>
                    
                    <div className={styles.createForm}>
                      <div className={styles.formGroup}>
                        <label>Date Completed</label>
                        <input
                          type="date"
                          value={newProgress.date}
                          onChange={(e) => setNewProgress({ ...newProgress, date: e.target.value })}
                          className={styles.input}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Overall Workout Rating (1-10)</label>
                        <select
                          value={workoutProgress.overallRating || ''}
                          onChange={(e) => setWorkoutProgress({ ...workoutProgress, overallRating: e.target.value })}
                          className={styles.select}
                        >
                          <option value="">Select rating...</option>
                          {[1,2,3,4,5,6,7,8,9,10].map(rating => (
                            <option key={rating} value={rating}>{rating}/10</option>
                          ))}
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <label>Energy Level (1-10)</label>
                        <select
                          value={workoutProgress.energyLevel || ''}
                          onChange={(e) => setWorkoutProgress({ ...workoutProgress, energyLevel: e.target.value })}
                          className={styles.select}
                        >
                          <option value="">Select energy level...</option>
                          {[1,2,3,4,5,6,7,8,9,10].map(level => (
                            <option key={level} value={level}>{level}/10</option>
                          ))}
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <label>Workout Duration (minutes)</label>
                        <input
                          type="number"
                          value={workoutProgress.duration || ''}
                          onChange={(e) => setWorkoutProgress({ ...workoutProgress, duration: e.target.value })}
                          className={styles.input}
                          placeholder="45"
                        />
                      </div>
                    </div>

                    {/* Exercise Performance */}
                    <div className={styles.exercisePerformanceSection}>
                      <h4>Exercise Performance</h4>
                      {selectedWorkout.exercises?.map((exercise: any, exerciseIndex: number) => (
                        <div key={exerciseIndex} className={styles.exercisePerformanceCard}>
                          <div className={styles.exercisePerformanceHeader}>
                            <h5>{exercise.name}</h5>
                            <span className={styles.exerciseTarget}>
                              Target: {exercise.sets} sets × {exercise.reps} reps
                            </span>
                          </div>
                          
                          <div className={styles.exercisePerformanceForm}>
                            <div className={styles.setPerformance}>
                              <label>Sets Completed</label>
                              <input
                                type="number"
                                min="0"
                                max={exercise.sets}
                                value={workoutProgress[`exercise_${exerciseIndex}_sets`] || ''}
                                onChange={(e) => setWorkoutProgress({
                                  ...workoutProgress,
                                  [`exercise_${exerciseIndex}_sets`]: e.target.value
                                })}
                                className={styles.input}
                                placeholder={exercise.sets.toString()}
                              />
                            </div>
                            
                            <div className={styles.setPerformance}>
                              <label>Average Weight (kg)</label>
                              <input
                                type="number"
                                step="0.5"
                                value={workoutProgress[`exercise_${exerciseIndex}_weight`] || ''}
                                onChange={(e) => setWorkoutProgress({
                                  ...workoutProgress,
                                  [`exercise_${exerciseIndex}_weight`]: e.target.value
                                })}
                                className={styles.input}
                                placeholder="0"
                              />
                            </div>
                            
                            <div className={styles.setPerformance}>
                              <label>RPE (Rate of Perceived Exertion)</label>
                              <select
                                value={workoutProgress[`exercise_${exerciseIndex}_rpe`] || ''}
                                onChange={(e) => setWorkoutProgress({
                                  ...workoutProgress,
                                  [`exercise_${exerciseIndex}_rpe`]: e.target.value
                                })}
                                className={styles.select}
                              >
                                <option value="">Select RPE...</option>
                                {[6,7,8,9,10].map(rpe => (
                                  <option key={rpe} value={rpe}>{rpe}/10</option>
                                ))}
                              </select>
                            </div>
                            
                            <div className={styles.setPerformance}>
                              <label>Notes</label>
                              <input
                                type="text"
                                value={workoutProgress[`exercise_${exerciseIndex}_notes`] || ''}
                                onChange={(e) => setWorkoutProgress({
                                  ...workoutProgress,
                                  [`exercise_${exerciseIndex}_notes`]: e.target.value
                                })}
                                className={styles.input}
                                placeholder="How did this exercise feel?"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                      <label>Workout Notes</label>
                      <textarea
                        value={newProgress.notes}
                        onChange={(e) => setNewProgress({ ...newProgress, notes: e.target.value })}
                        className={styles.textarea}
                        rows={3}
                        placeholder="Overall workout notes, how you felt, any issues..."
                      />
                    </div>

                    <div className={styles.formActions}>
                      <Button appName="web" onClick={createProgress} disabled={loading} className={styles.createButton}>
                        Record Workout Progress
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Assessment Results Form */}
            {selectedProgressProgram && progressUpdateType === 'assessment' && (
              <div className={styles.assessmentProgressSection}>
                <h3>Assessment Results Update</h3>
                
                <div className={styles.createForm}>
                  <div className={styles.formGroup}>
                    <label>Assessment Date</label>
                    <input
                      type="date"
                      value={newProgress.date}
                      onChange={(e) => setNewProgress({ ...newProgress, date: e.target.value })}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Assessment Type</label>
                    <select
                      value={workoutProgress.assessmentType || ''}
                      onChange={(e) => setWorkoutProgress({ ...workoutProgress, assessmentType: e.target.value })}
                      className={styles.select}
                    >
                      <option value="">Select assessment type...</option>
                      <option value="strength">Strength Assessment</option>
                      <option value="endurance">Endurance Assessment</option>
                      <option value="flexibility">Flexibility Assessment</option>
                      <option value="body_composition">Body Composition</option>
                      <option value="movement">Movement Assessment</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Assessment Results</label>
                    <textarea
                      value={workoutProgress.assessmentResults || ''}
                      onChange={(e) => setWorkoutProgress({ ...workoutProgress, assessmentResults: e.target.value })}
                      className={styles.textarea}
                      rows={4}
                      placeholder="Enter assessment results, measurements, and observations..."
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Progress vs Previous Assessment</label>
                    <select
                      value={workoutProgress.progressRating || ''}
                      onChange={(e) => setWorkoutProgress({ ...workoutProgress, progressRating: e.target.value })}
                      className={styles.select}
                    >
                      <option value="">Select progress rating...</option>
                      <option value="significant_improvement">Significant Improvement</option>
                      <option value="moderate_improvement">Moderate Improvement</option>
                      <option value="slight_improvement">Slight Improvement</option>
                      <option value="maintained">Maintained</option>
                      <option value="slight_decline">Slight Decline</option>
                      <option value="moderate_decline">Moderate Decline</option>
                    </select>
                  </div>

                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label>Assessment Notes</label>
                    <textarea
                      value={newProgress.notes}
                      onChange={(e) => setNewProgress({ ...newProgress, notes: e.target.value })}
                      className={styles.textarea}
                      rows={3}
                      placeholder="Assessment notes, recommendations, next steps..."
                    />
                  </div>
                </div>

                <div className={styles.formActions}>
                  <Button appName="web" onClick={createProgress} disabled={loading} className={styles.createButton}>
                    Record Assessment Results
                  </Button>
                </div>
              </div>
            )}

            {/* Training Plan Display */}
            {selectedProgressProgram && (
              <div className={styles.trainingPlanSection}>
                <h3>Current Training Plan</h3>
                <div className={styles.trainingPlanCard}>
                  <div className={styles.trainingPlanHeader}>
                    <h4>{selectedProgressProgram.programName}</h4>
                    <p className={styles.trainingPlanPhase}>
                      Phase: {selectedProgressProgram.optPhase.replace(/_/g, ' ')}
                    </p>
                  </div>
                  
                  <div className={styles.trainingPlanContent}>
                    <div className={styles.programOverview}>
                      <div className={styles.overviewItem}>
                        <strong>Primary Goal:</strong> {selectedProgressProgram.primaryGoal}
                      </div>
                      {selectedProgressProgram.secondaryGoals && (
                        <div className={styles.overviewItem}>
                          <strong>Secondary Goals:</strong> {selectedProgressProgram.secondaryGoals}
                        </div>
                      )}
                    </div>

                    {selectedProgressProgram.data.phases && selectedProgressProgram.data.phases.length > 0 && (
                      <div className={styles.phasesSection}>
                        <h4>Training Phases</h4>
                        {selectedProgressProgram.data.phases.map((phase: any, phaseIndex: number) => (
                          <div key={phaseIndex} className={styles.phaseCard}>
                            <div className={styles.phaseHeader}>
                              <h5>{phase.name?.replace(/_/g, ' ') || 'Phase'}</h5>
                              <span className={styles.phaseDuration}>{phase.duration} weeks</span>
                            </div>
                            
                            <div className={styles.phaseContent}>
                              <div className={styles.phaseFocus}>
                                <strong>Focus:</strong> {phase.focus}
                              </div>
                              
                              {phase.trainingObjectives && (
                                <div className={styles.trainingObjectives}>
                                  <strong>Training Objectives:</strong>
                                  <ul>
                                    {phase.trainingObjectives.map((objective: string, index: number) => (
                                      <li key={index}>{objective}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {phase.weeklyPlans && phase.weeklyPlans.length > 0 && (
                                <div className={styles.weeklyPlans}>
                                  <strong>Weekly Workout Plans:</strong>
                                  {phase.weeklyPlans.map((weekPlan: any, weekIndex: number) => (
                                    <div key={weekIndex} className={styles.weekPlan}>
                                      <h6>Week {weekPlan.week}</h6>
                                      {weekPlan.workouts && weekPlan.workouts.map((workout: any, workoutIndex: number) => (
                                        <div key={workoutIndex} className={styles.workoutCard}>
                                          <div className={styles.workoutHeader}>
                                            <h6>{workout.day} - {workout.focus}</h6>
                                          </div>
                                          
                                          {workout.exercises && workout.exercises.length > 0 && (
                                            <div className={styles.exercisesList}>
                                              {workout.exercises.map((exercise: any, exerciseIndex: number) => (
                                                <div key={exerciseIndex} className={styles.exerciseItem}>
                                                  <div className={styles.exerciseHeader}>
                                                    <span className={styles.exerciseName}>{exercise.name}</span>
                                                    <span className={styles.exerciseId}>ID: {exercise.exerciseId}</span>
                                                  </div>
                                                  
                                                  <div className={styles.exerciseDetails}>
                                                    <div className={styles.exerciseParams}>
                                                      <span className={styles.param}>
                                                        <strong>Sets:</strong> {exercise.sets}
                                                      </span>
                                                      <span className={styles.param}>
                                                        <strong>Reps/Duration:</strong> {exercise.reps}
                                                      </span>
                                                      <span className={styles.param}>
                                                        <strong>Rest:</strong> {exercise.rest}
                                                      </span>
                                                      {exercise.tempo && (
                                                        <span className={styles.param}>
                                                          <strong>Tempo:</strong> {exercise.tempo}
                                                        </span>
                                                      )}
                                                      {exercise.rpe && (
                                                        <span className={styles.param}>
                                                          <strong>RPE:</strong> {exercise.rpe}/10
                                                        </span>
                                                      )}
                                                    </div>
                                                    
                                                    {exercise.notes && (
                                                      <div className={styles.exerciseNotes}>
                                                        {exercise.notes}
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {phase.progressionRules && (
                                <div className={styles.progressionRules}>
                                  <strong>Progression Rules:</strong>
                                  <ul>
                                    <li>Rep Increase: {phase.progressionRules.repIncrease} reps</li>
                                    <li>Volume Increase: {phase.progressionRules.volumeIncrease}%</li>
                                  </ul>
                                </div>
                              )}

                              {phase.assessmentCriteria && (
                                <div className={styles.assessmentCriteria}>
                                  <strong>Assessment Criteria:</strong>
                                  <ul>
                                    {phase.assessmentCriteria.map((criteria: string, index: number) => (
                                      <li key={index}>{criteria}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedProgressProgram.data.nutritionGuidelines && (
                      <div className={styles.nutritionSection}>
                        <h4>Nutrition Guidelines</h4>
                        <p>{selectedProgressProgram.data.nutritionGuidelines}</p>
                      </div>
                    )}

                    {selectedProgressProgram.data.recoveryGuidelines && (
                      <div className={styles.recoverySection}>
                        <h4>Recovery Guidelines</h4>
                        <p>{selectedProgressProgram.data.recoveryGuidelines}</p>
                      </div>
                    )}

                    {selectedProgressProgram.data.progressTracking && (
                      <div className={styles.trackingSection}>
                        <h4>Progress Tracking</h4>
                        <div className={styles.trackingMetrics}>
                          <strong>Metrics to Track:</strong>
                          <ul>
                            {selectedProgressProgram.data.progressTracking.metrics.map((metric: string, index: number) => (
                              <li key={index}>{metric}</li>
                            ))}
                          </ul>
                        </div>
                        <div className={styles.trackingFrequency}>
                          <strong>Frequency:</strong> {selectedProgressProgram.data.progressTracking.frequency}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className={styles.progressList}>
              <h3>All Progress Records</h3>
              <div className={styles.progressGrid}>
                {progress.map(progressRecord => {
                  const client = clients.find(c => c.id === progressRecord.clientId);
                  const program = programs.find(p => p.id === progressRecord.programId);
                  return (
                    <div key={progressRecord.id} className={styles.progressCard}>
                      <div className={styles.progressHeader}>
                        <h4>Progress Record</h4>
                      </div>
                      <p className={styles.progressClient}>
                        Client: {client?.codeName || 'Unknown'}
                      </p>
                      {program && (
                        <p className={styles.progressProgram}>
                          Program: {program.programName}
                        </p>
                      )}
                      <p className={styles.progressDate}>
                        {new Date(progressRecord.date).toLocaleDateString()}
                      </p>
                      {progressRecord.weight && (
                        <p className={styles.progressWeight}>
                          Weight: {progressRecord.weight} kg
                        </p>
                      )}
                      {progressRecord.bodyFat && (
                        <p className={styles.progressBodyFat}>
                          Body Fat: {progressRecord.bodyFat}%
                        </p>
                      )}
                      {progressRecord.notes && (
                        <p className={styles.progressNotes}>
                          Notes: {progressRecord.notes}
                        </p>
                      )}
                      <div className={styles.progressActions}>
                        <Button appName="web" onClick={() => exportRecord('progress', progressRecord.id)} className={styles.actionButton}>
                          Export
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Program Detail View */}
      {selectedProgram && (
        <ProgramDetailView 
          program={selectedProgram} 
          onClose={() => setSelectedProgram(null)} 
        />
      )}
    </div>
  );
}
