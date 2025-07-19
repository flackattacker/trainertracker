'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { Badge } from '@repo/ui/badge';
import { ThemeToggle } from '../../src/components/ThemeToggle';
import ProgramProgress from '../../src/components/ProgramProgress';
import SessionWorkoutEntry from '../../src/components/SessionWorkoutEntry';
import ClientSessionCalendar from '../../src/components/ClientSessionCalendar';
import styles from './client.module.css';

export default function ClientPortal() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [client, setClient] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  
  // Accordion states
  const [expandedSections, setExpandedSections] = useState({
    programs: true,
    progress: false,
    sessions: false,
    actions: true,
    completedPrograms: false
  });

  // Navigation states
  const [currentView, setCurrentView] = useState<'dashboard' | 'programs' | 'progress' | 'sessions' | 'program-detail' | 'progress-detail' | 'session-detail' | 'workout-logger' | 'progress-charts' | 'session-booking' | 'messaging'>('dashboard');
  const [showSessionWorkoutEntry, setShowSessionWorkoutEntry] = useState(false);
  const [selectedProgramForWorkout, setSelectedProgramForWorkout] = useState<string | null>(null);
  const [showCompletedPrograms, setShowCompletedPrograms] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [selectedProgress, setSelectedProgress] = useState<any>(null);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [selectedWorkoutForEntry, setSelectedWorkoutForEntry] = useState<string | null>(null);

  // Session restoration on page load
  useEffect(() => {
    const savedToken = localStorage.getItem('client-portal-token');
    const savedUser = localStorage.getItem('client-portal-user');
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setClient(JSON.parse(savedUser));
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error restoring client session:', error);
        // Clear invalid data
        localStorage.removeItem('client-portal-token');
        localStorage.removeItem('client-portal-user');
      }
    }
  }, []);
  
  const handleLogin = async () => {
    try {
      setLoading(true);
      
      // Call the API to authenticate and get client data
      const response = await fetch('http://localhost:3001/api/auth/client-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const { token: authToken, client: clientData } = await response.json();
        setIsLoggedIn(true);
        setClient(clientData);
        setToken(authToken);
        
        // Store authentication data in localStorage for persistence
        localStorage.setItem('client-portal-token', authToken);
        localStorage.setItem('client-portal-user', JSON.stringify(clientData));
        
        showMessage('Login successful! Welcome back!');
      } else {
        const errorData = await response.json();
        showMessage(errorData.message || 'Invalid credentials. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      showMessage('Login failed. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setClient(null);
    setToken(null);
    setEmail('');
    setPassword('');
    setCurrentView('dashboard');
    setSelectedProgram(null);
    setSelectedProgress(null);
    setSelectedSession(null);
    setSelectedWorkoutForEntry(null);
    
    // Clear authentication data from localStorage
    localStorage.removeItem('client-portal-token');
    localStorage.removeItem('client-portal-user');
    
    showMessage('Logged out successfully');
  };

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 5000);
  };

  // Toggle accordion sections
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  // Navigation functions
  const navigateToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedProgram(null);
    setSelectedProgress(null);
    setSelectedSession(null);
    setSelectedWorkoutForEntry(null);
  };

  const navigateToProgram = (program: any) => {
    setSelectedProgram(program);
    setCurrentView('program-detail');
  };

  const navigateToProgress = (progress: any) => {
    setSelectedProgress(progress);
    setCurrentView('progress-detail');
  };

  const navigateToSession = (session: any) => {
    setSelectedSession(session);
    setCurrentView('session-detail');
  };

  // Enhanced action handlers with actual functionality
  const handleLogWorkout = (programId?: string) => {
    if (programId) {
      setSelectedProgram(client?.programs?.find((p: any) => p.id === programId));
    }
    setSelectedWorkoutForEntry('new-session');
    setCurrentView('workout-logger');
    showMessage('Workout logging interface loaded!');
  };

  const handleLogWorkoutClick = (e: React.MouseEvent, programId?: string) => {
    e.preventDefault();
    handleLogWorkout(programId);
  };

  const handleViewProgram = (programId: string) => {
    const program = client?.programs?.find((p: any) => p.id === programId);
    if (program) {
      navigateToProgram(program);
    }
  };

  const handleViewCharts = () => {
    setCurrentView('progress-charts');
    showMessage('Progress charts loaded!');
  };

  const handleBookSession = () => {
    setCurrentView('session-booking');
    showMessage('Session booking interface loaded!');
  };

  const handleMessageTrainer = () => {
    setCurrentView('messaging');
    showMessage('Messaging interface loaded!');
  };

  const handleMetricClick = (metricType: string) => {
    switch (metricType) {
      case 'Active Programs':
        setExpandedSections(prev => ({ ...prev, programs: true, progress: false, sessions: false }));
        break;
      case 'Progress Records':
        setExpandedSections(prev => ({ ...prev, progress: true, programs: false, sessions: false }));
        break;
      case 'Upcoming Sessions':
        setExpandedSections(prev => ({ ...prev, sessions: true, programs: false, progress: false }));
        break;
      default:
        showMessage(`${metricType} details - Click on individual items to view details.`);
    }
  };

  const handleViewProgressDetails = (progressId: string) => {
    console.log('Clicked progressId:', progressId);
    console.log('All progress IDs:', client?.progress?.map((p: any) => p.id));
    const progress = client?.progress?.find((p: any) => String(p.id) === String(progressId));
    console.log('Found progress:', progress);
    if (progress) {
      navigateToProgress(progress);
    }
  };

  const handleViewSessionDetails = (sessionId: string) => {
    const session = client?.sessions?.find((s: any) => s.id === sessionId);
    if (session) {
      navigateToSession(session);
    }
  };

  // Function to refresh client data
  const refreshClientData = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('http://localhost:3001/api/clients/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const clientData = await response.json();
        setClient(clientData);
        showMessage('Data refreshed successfully!');
      }
    } catch (error) {
      console.error('Error refreshing client data:', error);
      showMessage('Failed to refresh data. Please try again.');
    }
  };

  // Handle workout session save
  const handleSaveSessionWorkout = async (workoutData: any) => {
    try {
      const response = await fetch('http://localhost:3001/api/sessions/workout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(workoutData),
      });

      if (response.ok) {
        showMessage('Workout session saved successfully!');
        setSelectedWorkoutForEntry(null);
        setCurrentView('dashboard');
        await refreshClientData(); // Refresh to show updated progress
      } else {
        const error = await response.json();
        showMessage(error.message || 'Failed to save workout session');
      }
    } catch (error) {
      console.error('Error saving workout session:', error);
      showMessage('Failed to save workout session. Please try again.');
    }
  };

  // Helper function to determine program status
  const getProgramStatus = (program: any) => {
    // Use the actual status field from the database if available
    if (program.status) {
      return program.status; // Return the exact status value (ACTIVE, COMPLETED, etc.)
    }
    
    // Fallback to date-based logic for backward compatibility
    if (!program.endDate) return 'ACTIVE';
    const endDate = new Date(program.endDate);
    const today = new Date();
    return endDate < today ? 'COMPLETED' : 'ACTIVE';
  };

  // Calculate goal progress based on active programs
  // This represents the average completion percentage across all active programs
  // Uses actual workout completion data when available, falls back to time-based calculation
  const calculateGoalProgress = () => {
    if (activePrograms.length === 0) return 0;
    
    const totalProgress = activePrograms.reduce((sum: number, program: any) => {
      // Try to find actual workout completion data for this program
      const programProgress = client?.progress?.filter((prog: any) => 
        prog.programId === program.id && prog.data?.workoutId
      ) || [];
      
      if (programProgress.length > 0) {
        // Calculate based on actual workout completion
        const programData = program.data as any;
        const totalWorkouts = programData?.workouts?.length || 0;
        const completedWorkouts = programProgress.length;
        
        if (totalWorkouts > 0) {
          return (completedWorkouts / totalWorkouts) * 100;
        }
      }
      
      // Fallback to time-based calculation
      const startDate = new Date(program.startDate);
      const endDate = program.endDate ? new Date(program.endDate) : new Date(startDate.getTime() + (program.duration || 6) * 7 * 24 * 60 * 60 * 1000);
      const today = new Date();
      
      if (today < startDate) return 0;
      if (today > endDate) return 100;
      
      const totalDuration = endDate.getTime() - startDate.getTime();
      const elapsed = today.getTime() - startDate.getTime();
      return Math.min((elapsed / totalDuration) * 100, 100);
    }, 0);
    
    return Math.round(totalProgress / activePrograms.length);
  };

  // Filter programs by status using the exact database enum values
  const activePrograms = client?.programs?.filter((program: any) => getProgramStatus(program) === 'ACTIVE') || [];
  const completedPrograms = client?.programs?.filter((program: any) => getProgramStatus(program) === 'COMPLETED') || [];

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className={styles.clientContainer}>
        <div className={styles.clientCard}>
          <div className={styles.clientHeader}>
            <div className={styles.clientLogo}>
              <span className={styles.clientLogoIcon}>🌿</span>
            </div>
            <h1>Client Portal</h1>
            <p>Access your wellness programs and track your progress</p>
          </div>
          
          {message && <div className={styles.clientMessage}>{message}</div>}
          
          <div className={styles.clientForm}>
            <div className={styles.clientInputGroup}>
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.clientInput}
              />
            </div>
            
            <div className={styles.clientInputGroup}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.clientInput}
              />
            </div>
            
            <div className={styles.clientButtons}>
              <Button appName="web" onClick={handleLogin} disabled={loading} className={styles.clientPrimaryButton}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
              <Link href="/" className={styles.clientSecondaryButton}>
                Back to Home
              </Link>
            </div>
            
            <div className={styles.clientDemoInfo}>
              <p><strong>Demo Login:</strong></p>
              <p>Email: sarah.johnson@email.com</p>
              <p>Password: wellness2024</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Workout Logger View
  if (currentView === 'workout-logger' && selectedWorkoutForEntry) {
    return (
      <div className={styles.clientApp}>
        <header className={styles.clientHeader}>
          <div className={styles.clientHeaderContent}>
            <h1>Log Workout Session</h1>
            <div className={styles.clientUserInfo}>
              <span>Welcome, {client?.firstName} {client?.lastName}</span>
              <ThemeToggle />
              <Button appName="web" onClick={navigateToDashboard} className={styles.clientSecondaryButton}>
                ← Back to Dashboard
              </Button>
              <Button appName="web" onClick={handleLogout} className={styles.clientLogoutButton}>
                Logout
              </Button>
            </div>
          </div>
        </header>

        <main className={styles.clientMain}>
          {message && <div className={styles.clientMessage}>{message}</div>}

          <div className={styles.clientDashboard}>
            <div className={styles.clientDashboardHeader}>
              <h2>Record Your Workout</h2>
              <p>Log your completed exercises and track your progress</p>
            </div>

            {selectedProgram ? (
              <SessionWorkoutEntry
                programId={selectedProgram.id}
                clientId={client.id}
                token={token || undefined}
                onSave={handleSaveSessionWorkout}
                onCancel={() => {
                  setSelectedWorkoutForEntry(null);
                  setCurrentView('dashboard');
                }}
              />
            ) : (
              <div className={styles.clientSection}>
                <div className={styles.clientSectionHeader}>
                  <h3>Select a Program</h3>
                </div>
                <div className={styles.clientProgramGrid}>
                  {activePrograms.map((program: any) => (
                    <Card key={program.id} className={styles.clientProgramCard}>
                      <CardHeader>
                        <CardTitle>{program.programName}</CardTitle>
                        <Badge variant="default">{getProgramStatus(program)}</Badge>
                      </CardHeader>
                      <CardContent>
                        <p><strong>Goal:</strong> {program.primaryGoal}</p>
                        {program.optPhase && (
                          <p><strong>Phase:</strong> {program.optPhase.replace(/_/g, ' ')}</p>
                        )}
                        <Button 
                          onClick={() => {
                            setSelectedProgram(program);
                            setSelectedWorkoutForEntry('new-session');
                          }}
                          className={styles.clientViewButton}
                        >
                          Select Program
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Program Detail View with Progress Tracking
  if (currentView === 'program-detail' && selectedProgram) {
    return (
      <div className={styles.clientApp}>
        <header className={styles.clientHeader}>
          <div className={styles.clientHeaderContent}>
            <h1>Program Details</h1>
            <div className={styles.clientUserInfo}>
              <span>Welcome, {client?.firstName} {client?.lastName}</span>
              <ThemeToggle />
              <Button appName="web" onClick={navigateToDashboard} className={styles.clientSecondaryButton}>
                ← Back to Dashboard
              </Button>
              <Button appName="web" onClick={handleLogout} className={styles.clientLogoutButton}>
                Logout
              </Button>
            </div>
          </div>
        </header>

        <main className={styles.clientMain}>
          {message && <div className={styles.clientMessage}>{message}</div>}

          <div className={styles.clientDashboard}>
            <div className={styles.clientDashboardHeader}>
              <h2>{selectedProgram.programName}</h2>
              <p>Detailed program information and progress tracking</p>
            </div>

            {/* Program Progress Component */}
            <div className={styles.clientSection}>
              <div className={styles.clientSectionHeader}>
                <h3>Program Progress</h3>
              </div>
              <ProgramProgress 
                programId={selectedProgram.id}
                clientId={client.id}
                token={token || undefined}
              />
            </div>

            <div className={styles.clientSection}>
              <div className={styles.clientSectionHeader}>
                <h3>Program Overview</h3>
              </div>
              <div className={styles.programGrid}>
                <div className={styles.programCard}>
                  <div className={styles.programHeader}>
                    <h4>Program Information</h4>
                    <span className={`${styles.status} ${styles[getProgramStatus(selectedProgram)]}`}>
                      {getProgramStatus(selectedProgram)}
                    </span>
                  </div>
                  <div className={styles.programDetails}>
                    <p><strong>Start Date:</strong> {new Date(selectedProgram.startDate).toLocaleDateString()}</p>
                    {selectedProgram.endDate && (
                      <p><strong>End Date:</strong> {new Date(selectedProgram.endDate).toLocaleDateString()}</p>
                    )}
                    <p><strong>Primary Goal:</strong> {selectedProgram.primaryGoal}</p>
                    {selectedProgram.secondaryGoals && (
                      <p><strong>Secondary Goals:</strong> {selectedProgram.secondaryGoals}</p>
                    )}
                    {selectedProgram.optPhase && (
                      <p><strong>Training Phase:</strong> {selectedProgram.optPhase.replace(/_/g, ' ')}</p>
                    )}
                    {selectedProgram.notes && (
                      <p><strong>Notes:</strong> {selectedProgram.notes}</p>
                    )}
                  </div>
                  <div className={styles.programActions}>
                    <Button appName="web" onClick={(e) => handleLogWorkoutClick(e, selectedProgram.id)} className={styles.viewButton}>
                      Log Today's Workout
                    </Button>
                    <Button appName="web" onClick={navigateToDashboard} className={styles.secondaryButton}>
                      Back to Dashboard
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {selectedProgram.data?.workouts && (
              <div className={styles.clientSection}>
                <div className={styles.clientSectionHeader}>
                  <h3>Workout Schedule</h3>
                </div>
                <div className={styles.programGrid}>
                  {selectedProgram.data.workouts.slice(0, 6).map((workout: any, index: number) => (
                    <div key={workout.id || index} className={styles.programCard}>
                      <div className={styles.programHeader}>
                        <h4>{workout.name}</h4>
                        <span className={styles.progressDate}>
                          {workout.exercises?.length || 0} exercises
                        </span>
                      </div>
                      <div className={styles.programDetails}>
                        {workout.exercises?.slice(0, 3).map((exercise: any, exIndex: number) => (
                          <p key={exIndex}><strong>•</strong> {exercise.exercise?.name || 'Exercise'}</p>
                        ))}
                        {workout.exercises?.length > 3 && (
                          <p><em>... and {workout.exercises.length - 3} more exercises</em></p>
                        )}
                      </div>
                      <div className={styles.programActions}>
                        <Button appName="web" onClick={(e) => handleLogWorkoutClick(e, selectedProgram.id)} className={styles.viewButton}>
                          Start Workout
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Progress Detail View
  if (currentView === 'progress-detail' && selectedProgress) {
    return (
      <div className={styles.clientApp}>
        <header className={styles.clientHeader}>
          <div className={styles.clientHeaderContent}>
            <h1>Progress Details</h1>
            <div className={styles.clientUserInfo}>
              <span>Welcome, {client?.firstName} {client?.lastName}</span>
              <ThemeToggle />
              <Button appName="web" onClick={navigateToDashboard} className={styles.clientSecondaryButton}>
                ← Back to Dashboard
              </Button>
              <Button appName="web" onClick={handleLogout} className={styles.clientLogoutButton}>
                Logout
              </Button>
            </div>
          </div>
        </header>
        <main className={styles.clientMain}>
          <div className={styles.clientDashboard}>
            <div className={styles.clientDashboardHeader}>
              <h2>Progress Update</h2>
              <span className={styles.clientProgressDate}>
                {new Date(selectedProgress.date).toLocaleDateString()}
              </span>
            </div>
            <div className={styles.clientProgressDetails}>
              {selectedProgress.weight && <p><strong>Weight:</strong> {selectedProgress.weight} lbs</p>}
              {selectedProgress.bodyFat && <p><strong>Body Fat:</strong> {selectedProgress.bodyFat}%</p>}
              {selectedProgress.notes && <p><strong>Notes:</strong> {selectedProgress.notes}</p>}
              {/* Add more fields as needed */}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Session Detail View
  if (currentView === 'session-detail' && selectedSession) {
    return (
      <div className={styles.clientApp}>
        <header className={styles.clientHeader}>
          <div className={styles.clientHeaderContent}>
            <h1>Session Details</h1>
            <div className={styles.clientUserInfo}>
              <span>Welcome, {client?.firstName} {client?.lastName}</span>
              <ThemeToggle />
              <Button appName="web" onClick={navigateToDashboard} className={styles.clientSecondaryButton}>
                ← Back to Dashboard
              </Button>
              <Button appName="web" onClick={handleLogout} className={styles.clientLogoutButton}>
                Logout
              </Button>
            </div>
          </div>
        </header>

        <main className={styles.clientMain}>
          {message && <div className={styles.clientMessage}>{message}</div>}

          <div className={styles.clientDashboard}>
            <div className={styles.clientDashboardHeader}>
              <h2>{selectedSession.type === 'IN_PERSON' ? 'In-Person Session' : 'Virtual Session'}</h2>
              <p>Session details and preparation information</p>
            </div>

            <div className={styles.clientSection}>
              <div className={styles.clientSectionHeader}>
                <h3>Session Information</h3>
              </div>
              <div className={styles.clientProgramGrid}>
                <div className={styles.clientProgramCard}>
                  <div className={styles.clientProgramHeader}>
                    <h4>Session Details</h4>
                    <span className={`${styles.clientSessionStatus} ${styles[selectedSession.status.toLowerCase()]}`}>
                      {selectedSession.status}
                    </span>
                  </div>
                  <div className={styles.clientProgramDetails}>
                    <p><strong>Date:</strong> {new Date(selectedSession.startTime).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {new Date(selectedSession.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(selectedSession.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p><strong>Type:</strong> {selectedSession.type === 'IN_PERSON' ? 'In-Person' : 'Virtual'}</p>
                    {selectedSession.location && <p><strong>Location:</strong> {selectedSession.location}</p>}
                    {selectedSession.notes && <p><strong>Notes:</strong> {selectedSession.notes}</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.clientSection}>
              <div className={styles.clientSectionHeader}>
                <h3>Session Actions</h3>
              </div>
              <div className={styles.clientActionGrid}>
                <div className={styles.clientActionCard}>
                  <div className={styles.clientActionIcon}>📅</div>
                  <h4>Reschedule Session</h4>
                  <p>Change your session time if needed</p>
                  <Button appName="web" onClick={handleBookSession} className={styles.clientActionButton}>
                    Reschedule
                  </Button>
                </div>

                <div className={styles.clientActionCard}>
                  <div className={styles.clientActionIcon}>💬</div>
                  <h4>Message Trainer</h4>
                  <p>Ask questions about your session</p>
                  <Button appName="web" onClick={handleMessageTrainer} className={styles.clientActionButton}>
                    Send Message
                  </Button>
                </div>

                <div className={styles.clientActionCard}>
                  <div className={styles.clientActionIcon}>📝</div>
                  <h4>Log Pre-Session</h4>
                  <p>Record how you're feeling before the session</p>
                  <Button appName="web" onClick={(e) => handleLogWorkoutClick(e)} className={styles.viewButton}>
                    Log Progress
                  </Button>
                </div>

                <div className={styles.clientActionCard}>
                  <div className={styles.clientActionIcon}>🏠</div>
                  <h4>Back to Dashboard</h4>
                  <p>Return to your main dashboard</p>
                  <Button appName="web" onClick={navigateToDashboard} className={styles.clientActionButton}>
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Other views (progress-charts, session-booking, messaging)
  if (['progress-charts', 'session-booking', 'messaging'].includes(currentView)) {
    const viewTitles = {
      'progress-charts': 'Progress Charts',
      'session-booking': 'Session Booking',
      'messaging': 'Messaging'
    };

    const viewDescriptions = {
      'progress-charts': 'View detailed progress charts and trends',
      'session-booking': 'Book and manage your training sessions',
      'messaging': 'Communicate with your trainer'
    };

    return (
      <div className={styles.clientApp}>
        <header className={styles.clientHeader}>
          <div className={styles.clientHeaderContent}>
            <h1>{viewTitles[currentView as keyof typeof viewTitles]}</h1>
            <div className={styles.clientUserInfo}>
              <span>Welcome, {client?.firstName} {client?.lastName}</span>
              <ThemeToggle />
              <Button appName="web" onClick={navigateToDashboard} className={styles.clientSecondaryButton}>
                ← Back to Dashboard
              </Button>
              <Button appName="web" onClick={handleLogout} className={styles.clientLogoutButton}>
                Logout
              </Button>
            </div>
          </div>
        </header>

        <main className={styles.clientMain}>
          {message && <div className={styles.clientMessage}>{message}</div>}

          <div className={styles.clientDashboard}>
            <div className={styles.clientDashboardHeader}>
              <h2>{viewTitles[currentView as keyof typeof viewTitles]}</h2>
              <p>{viewDescriptions[currentView as keyof typeof viewDescriptions]}</p>
            </div>

            <div className={styles.clientSection}>
              <div className={styles.clientSectionHeader}>
                <h3>Feature Coming Soon</h3>
              </div>
              <div className={styles.clientProgramGrid}>
                <div className={styles.clientProgramCard}>
                  <div className={styles.clientProgramHeader}>
                    <h4>Under Development</h4>
                    <span className={`${styles.clientStatus} ${styles['coming-soon']}`}>Coming Soon</span>
                  </div>
                  <div className={styles.clientProgramDetails}>
                    <p>This feature is currently under development and will be available soon!</p>
                    <p>You'll be able to:</p>
                    <ul>
                      {currentView === 'progress-charts' && (
                        <>
                          <li>View weight and body fat trends over time</li>
                          <li>Track energy levels and motivation</li>
                          <li>See progress toward your goals</li>
                          <li>Compare different time periods</li>
                        </>
                      )}
                      {currentView === 'session-booking' && (
                        <>
                          <li>View available time slots</li>
                          <li>Book sessions with your trainer</li>
                          <li>Reschedule existing sessions</li>
                          <li>Receive session reminders</li>
                        </>
                      )}
                      {currentView === 'messaging' && (
                        <>
                          <li>Send messages to your trainer</li>
                          <li>Ask questions about your program</li>
                          <li>Share progress updates</li>
                          <li>Receive feedback and guidance</li>
                        </>
                      )}
                    </ul>
                  </div>
                  <div className={styles.clientProgramActions}>
                    <Button appName="web" onClick={navigateToDashboard} className={styles.clientViewButton}>
                      Back to Dashboard
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Client Dashboard (default view)
  return (
    <div className={styles.clientApp}>
      {/* Header */}
      <header className={styles.clientHeader}>
        <div className={styles.clientHeaderContent}>
          <h1>Client Portal</h1>
          <div className={styles.clientUserInfo}>
            <span>Welcome, {client?.firstName} {client?.lastName}</span>
            <ThemeToggle />
            <Button appName="web" onClick={refreshClientData} className={styles.clientSecondaryButton}>
              🔄 Refresh
            </Button>
            <Button appName="web" onClick={handleLogout} className={styles.clientLogoutButton}>
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
          className={`${styles.navButton} ${currentView === 'programs' ? styles.active : ''}`}
          onClick={() => setCurrentView('programs')}
        >
          My Programs
        </button>
        <button
          className={`${styles.navButton} ${currentView === 'progress' ? styles.active : ''}`}
          onClick={() => setCurrentView('progress')}
        >
          Progress
        </button>
        <button
          className={`${styles.navButton} ${currentView === 'sessions' ? styles.active : ''}`}
          onClick={() => setCurrentView('sessions')}
        >
          Sessions
        </button>
        <button
          className={`${styles.navButton} ${currentView === 'workout-logger' ? styles.active : ''}`}
          onClick={() => setCurrentView('workout-logger')}
        >
          Log Workout
        </button>
      </nav>

      {/* Main Content */}
      <main className={styles.clientMain}>
        {message && <div className={styles.clientMessage}>{message}</div>}

        {/* Dashboard View */}
        {currentView === 'dashboard' && (
          <div className={styles.clientDashboard}>
            {/* Welcome Header */}
            <div className={styles.clientDashboardHeader}>
              <h2>Welcome back, {client?.firstName}!</h2>
              <p>Track your progress and manage your wellness journey</p>
            </div>

            {/* Quick Actions Bar */}
            <div className={styles.quickActions}>
              <Button appName="web" onClick={() => setCurrentView('workout-logger')} className={styles.quickActionButton}>
                💪 Log Today's Workout
              </Button>
              <Button appName="web" onClick={handleBookSession} className={styles.quickActionButton}>
                📅 Book Session
              </Button>
              <Button appName="web" onClick={handleMessageTrainer} className={styles.quickActionButton}>
                💬 Message Trainer
              </Button>
            </div>

            {/* Metrics Grid - Enhanced */}
            <div className={styles.metricsGrid}>
              <div className={styles.metricCard} onClick={() => handleMetricClick('Active Programs')}>
                <div className={styles.metricIcon}>💪</div>
                <div className={styles.metricContent}>
                  <h3>{activePrograms.length}</h3>
                  <p>Active Programs</p>
                  <span className={styles.metricSubtext}>Currently following</span>
                </div>
              </div>

              <div className={styles.metricCard} onClick={() => handleMetricClick('Progress Records')}>
                <div className={styles.metricIcon}>📊</div>
                <div className={styles.metricContent}>
                  <h3>{client?.progress?.length || 0}</h3>
                  <p>Progress Records</p>
                  <span className={styles.metricSubtext}>Tracked updates</span>
                </div>
              </div>

              <div className={styles.metricCard} onClick={() => handleMetricClick('Goal Progress')}>
                <div className={styles.metricIcon}>🎯</div>
                <div className={styles.metricContent}>
                  <h3>{calculateGoalProgress()}%</h3>
                  <p>Goal Progress</p>
                  <span className={styles.metricSubtext}>Overall completion</span>
                </div>
              </div>

              <div className={styles.metricCard} onClick={() => handleMetricClick('Upcoming Sessions')}>
                <div className={styles.metricIcon}>📅</div>
                <div className={styles.metricContent}>
                  <h3>{client?.sessions?.filter((s: any) => new Date(s.startTime) > new Date()).length || 0}</h3>
                  <p>Upcoming Sessions</p>
                  <span className={styles.metricSubtext}>Scheduled meetings</span>
                </div>
              </div>
            </div>

            {/* Main Content Grid - Optimized Layout */}
            <div className={styles.dashboardGrid}>
              {/* Primary Column - Programs and Calendar */}
              <div className={styles.primaryColumn}>
                {/* Active Programs - Enhanced */}
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <h3>Your Active Programs</h3>
                    <span className={styles.sectionCount}>({activePrograms.length})</span>
                  </div>
                  <div className={styles.programGrid}>
                    {activePrograms.length > 0 ? (
                      activePrograms.map((program: any) => (
                        <div key={program.id} className={styles.programCard}>
                          <div className={styles.programHeader}>
                            <h4>{program.programName}</h4>
                            <span className={`${styles.status} ${styles[getProgramStatus(program)]}`}>
                              {getProgramStatus(program)}
                            </span>
                          </div>
                          <div className={styles.programDetails}>
                            <div className={styles.programInfo}>
                              <p><strong>Goal:</strong> {program.primaryGoal}</p>
                              {program.optPhase && (
                                <p><strong>Phase:</strong> {program.optPhase.replace(/_/g, ' ')}</p>
                              )}
                              <p><strong>Duration:</strong> {new Date(program.startDate).toLocaleDateString()} - {program.endDate ? new Date(program.endDate).toLocaleDateString() : 'Ongoing'}</p>
                            </div>
                          </div>
                          <div className={styles.programActions}>
                            <Button appName="web" onClick={() => handleViewProgram(program.id)} className={styles.viewButton}>
                              View Details
                            </Button>
                            <Button appName="web" onClick={(e) => handleLogWorkoutClick(e, program.id)} className={styles.secondaryButton}>
                              Log Workout
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className={styles.emptyState}>
                        <div className={styles.emptyStateIcon}>📋</div>
                        <h4>No Active Programs</h4>
                        <p>Contact your trainer to get started with a personalized program!</p>
                        <Button appName="web" onClick={handleMessageTrainer} className={styles.primaryButton}>
                          Contact Trainer
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upcoming Sessions Calendar - Enhanced */}
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <h3>Upcoming Sessions</h3>
                    <span className={styles.sectionCount}>({client?.sessions?.filter((s: any) => new Date(s.startTime) > new Date()).length || 0})</span>
                  </div>
                  <div className={styles.calendarContainer}>
                    {client?.sessions?.length > 0 ? (
                      <ClientSessionCalendar
                        sessions={client.sessions.filter((session: any) => new Date(session.startTime) > new Date())}
                        onSessionClick={(session) => handleViewSessionDetails(session.id)}
                        compact={true}
                      />
                    ) : (
                      <div className={styles.emptyState}>
                        <div className={styles.emptyStateIcon}>📅</div>
                        <h4>No Upcoming Sessions</h4>
                        <p>Schedule a session with your trainer to stay on track!</p>
                        <Button appName="web" onClick={handleBookSession} className={styles.primaryButton}>
                          Book Session
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Secondary Column - Progress and Completed Programs */}
              <div className={styles.secondaryColumn}>
                {/* Recent Progress - Enhanced */}
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <h3>Recent Progress</h3>
                    <span className={styles.sectionCount}>({client?.progress?.length || 0})</span>
                  </div>
                  <div className={styles.progressGrid}>
                    {client?.progress?.length > 0 ? (
                      client.progress.slice(0, 4).map((prog: any, index: number) => (
                        <div key={prog.id || index} className={styles.progressCard} onClick={() => handleViewProgressDetails(prog.id)}>
                          <div className={styles.progressHeader}>
                            <h4>Progress Update</h4>
                            <span className={styles.progressDate}>
                              {new Date(prog.date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className={styles.progressDetails}>
                            {prog.weight && <p><strong>Weight:</strong> {prog.weight} lbs</p>}
                            {prog.bodyFat && <p><strong>Body Fat:</strong> {prog.bodyFat}%</p>}
                            {prog.notes && <p><strong>Notes:</strong> {prog.notes.substring(0, 80)}...</p>}
                          </div>
                          <div className={styles.progressActions}>
                            <Button appName="web" onClick={(e) => { e.stopPropagation(); handleViewProgressDetails(prog.id); }} className={styles.viewButton}>
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className={styles.emptyState}>
                        <div className={styles.emptyStateIcon}>📈</div>
                        <h4>No Progress Records</h4>
                        <p>Start logging your workouts to track your progress!</p>
                        <Button appName="web" onClick={() => setCurrentView('workout-logger')} className={styles.primaryButton}>
                          Log Workout
                        </Button>
                      </div>
                    )}
                  </div>
                </div>


              </div>
            </div>
          </div>
        )}

        {/* Programs View */}
        {currentView === 'programs' && (
          <div className={styles.clientDashboard}>
            <div className={styles.clientDashboardHeader}>
              <h2>My Programs</h2>
              <p>View and manage your training programs</p>
            </div>

            {/* Active Programs */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3>Active Programs ({activePrograms.length})</h3>
              </div>
              <div className={styles.programGrid}>
                {activePrograms.length > 0 ? (
                  activePrograms.map((program: any) => (
                    <div key={program.id} className={styles.programCard}>
                      <div className={styles.programHeader}>
                        <h4>{program.programName}</h4>
                        <span className={`${styles.status} ${styles.active}`}>
                          Active
                        </span>
                      </div>
                      <div className={styles.programDetails}>
                        <p><strong>Start Date:</strong> {new Date(program.startDate).toLocaleDateString()}</p>
                        {program.endDate && (
                          <p><strong>End Date:</strong> {new Date(program.endDate).toLocaleDateString()}</p>
                        )}
                        <p><strong>Goal:</strong> {program.primaryGoal}</p>
                        {program.optPhase && (
                          <p><strong>Phase:</strong> {program.optPhase.replace(/_/g, ' ')}</p>
                        )}
                      </div>
                      <div className={styles.programActions}>
                        <Button appName="web" onClick={() => handleViewProgram(program.id)} className={styles.viewButton}>
                          View Program
                        </Button>
                        <Button appName="web" onClick={(e) => handleLogWorkoutClick(e, program.id)} className={styles.secondaryButton}>
                          Log Workout
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    <p>No active programs. Contact your trainer to get started!</p>
                  </div>
                )}
              </div>
          </div>

            {/* Completed Programs */}
            {completedPrograms.length > 0 && (
              <div className={styles.section}>
                <div className={styles.sectionHeader} onClick={() => setShowCompletedPrograms(!showCompletedPrograms)}>
                  <h3>Completed Programs ({completedPrograms.length})</h3>
                  <div className={styles.accordionToggle}>
                    <span className={showCompletedPrograms ? styles.expanded : styles.collapsed}>
                      {showCompletedPrograms ? '▼' : '▶'}
              </span>
            </div>
                </div>
                {showCompletedPrograms && (
                  <div className={styles.programGrid}>
                    {completedPrograms.map((program: any) => (
                      <div key={program.id} className={styles.programCard}>
                        <div className={styles.programHeader}>
                          <h4>{program.programName}</h4>
                          <span className={`${styles.status} ${styles.completed}`}>
                            Completed
                          </span>
                        </div>
                        <div className={styles.programDetails}>
                          <p><strong>Start Date:</strong> {new Date(program.startDate).toLocaleDateString()}</p>
                          {program.endDate && (
                            <p><strong>End Date:</strong> {new Date(program.endDate).toLocaleDateString()}</p>
                          )}
                          <p><strong>Goal:</strong> {program.primaryGoal}</p>
                          {program.optPhase && (
                            <p><strong>Phase:</strong> {program.optPhase.replace(/_/g, ' ')}</p>
                          )}
                        </div>
                        <div className={styles.programActions}>
                          <Button appName="web" onClick={() => handleViewProgram(program.id)} className={styles.viewButton}>
                            View Program
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Progress View */}
        {currentView === 'progress' && (
          <div className={styles.clientDashboard}>
            <div className={styles.clientDashboardHeader}>
              <h2>My Progress</h2>
              <p>Track your fitness journey and achievements</p>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3>Progress Records ({client?.progress?.length || 0})</h3>
              </div>
              <div className={styles.progressGrid}>
                {client?.progress?.length > 0 ? (
                  client.progress.map((prog: any, index: number) => (
                    <div key={prog.id || index} className={styles.progressCard} onClick={() => handleViewProgressDetails(prog.id)}>
                      <div className={styles.progressHeader}>
                        <h4>Progress Update</h4>
                        <span className={styles.progressDate}>
                          {new Date(prog.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className={styles.progressDetails}>
                        {prog.weight && <p><strong>Weight:</strong> {prog.weight} lbs</p>}
                        {prog.bodyFat && <p><strong>Body Fat:</strong> {prog.bodyFat}%</p>}
                        {prog.notes && <p><strong>Notes:</strong> {prog.notes.substring(0, 100)}...</p>}
                      </div>
                      <div className={styles.progressActions}>
                        <Button appName="web" onClick={(e) => { e.stopPropagation(); handleViewProgressDetails(prog.id); }} className={styles.viewButton}>
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    <p>No progress records yet. Start logging your workouts to track your progress!</p>
                  </div>
                )}
              </div>
            </div>
              </div>
            )}

        {/* Sessions View */}
        {currentView === 'sessions' && (
          <div className={styles.clientDashboard}>
            <div className={styles.clientDashboardHeader}>
              <h2>My Sessions</h2>
              <p>View and manage your training sessions</p>
          </div>

            <div className={styles.section}>
              <div className={styles.sectionHeader}>
              <h3>Upcoming Sessions ({client?.sessions?.filter((s: any) => new Date(s.startTime) > new Date()).length || 0})</h3>
            </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                padding: '20px 0',
                background: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                {client?.sessions?.length > 0 ? (
                  <ClientSessionCalendar
                    sessions={client.sessions.filter((session: any) => new Date(session.startTime) > new Date())}
                    onSessionClick={(session) => handleViewSessionDetails(session.id)}
                    compact={false}
                  />
                ) : (
                  <div className={styles.emptyState}>
                    <p>No upcoming sessions scheduled. Contact your trainer to book a session!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Past Sessions */}
            {client?.sessions?.filter((s: any) => new Date(s.startTime) <= new Date()).length > 0 && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h3>Past Sessions ({client?.sessions?.filter((s: any) => new Date(s.startTime) <= new Date()).length || 0})</h3>
                </div>
                <div className={styles.sessionGrid}>
                  {client.sessions
                    .filter((session: any) => new Date(session.startTime) <= new Date())
                    .slice(0, 5)
                    .map((session: any) => (
                      <div key={session.id} className={styles.sessionCard} onClick={() => handleViewSessionDetails(session.id)}>
                        <div className={styles.sessionHeader}>
                          <h4>{session.type === 'IN_PERSON' ? 'In-Person Session' : 'Virtual Session'}</h4>
                          <span className={`${styles.sessionStatus} ${styles[session.status.toLowerCase()]}`}>
                            {session.status}
                          </span>
                        </div>
                        <div className={styles.sessionDetails}>
                          <p><strong>Date:</strong> {new Date(session.startTime).toLocaleDateString()}</p>
                          <p><strong>Time:</strong> {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          {session.location && <p><strong>Location:</strong> {session.location}</p>}
                          {session.notes && <p><strong>Notes:</strong> {session.notes.substring(0, 100)}...</p>}
                        </div>
                        <div className={styles.sessionActions}>
                          <Button appName="web" onClick={(e) => { e.stopPropagation(); handleViewSessionDetails(session.id); }} className={styles.viewButton}>
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
} 