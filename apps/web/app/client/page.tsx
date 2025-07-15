'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@repo/ui/button';
import { ThemeToggle } from '../../src/components/ThemeToggle';
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
    actions: true
  });

  // Navigation states
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [selectedProgress, setSelectedProgress] = useState<any>(null);
  const [selectedSession, setSelectedSession] = useState<any>(null);

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
  const handleLogWorkout = () => {
    setCurrentView('workout-logger');
    showMessage('Workout logging interface loaded!');
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
    const progress = client?.progress?.find((p: any) => p.id === progressId);
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
              <p><strong>Demo Credentials:</strong></p>
              <p>Email: sarah.johnson@email.com | Password: wellness2024</p>
              <p><em>Note: This will load your real programs, progress, and sessions from the database.</em></p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Program Detail View
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
              <p>Detailed program information and workout schedules</p>
            </div>

            <div className={styles.clientSection}>
              <div className={styles.clientSectionHeader}>
                <h3>Program Overview</h3>
              </div>
              <div className={styles.clientProgramGrid}>
                <div className={styles.clientProgramCard}>
                  <div className={styles.clientProgramHeader}>
                    <h4>Program Information</h4>
                    <span className={`${styles.clientStatus} ${styles.active}`}>
                      Active
                    </span>
                  </div>
                  <div className={styles.clientProgramDetails}>
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
                  <div className={styles.clientProgramActions}>
                    <Button appName="web" onClick={handleLogWorkout} className={styles.clientViewButton}>
                      Log Today's Workout
                    </Button>
                    <Button appName="web" onClick={navigateToDashboard} className={styles.clientSecondaryButton}>
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
                <div className={styles.clientProgramGrid}>
                  {selectedProgram.data.workouts.slice(0, 6).map((workout: any, index: number) => (
                    <div key={workout.id || index} className={styles.clientProgramCard}>
                      <div className={styles.clientProgramHeader}>
                        <h4>{workout.name}</h4>
                        <span className={styles.clientProgressDate}>
                          {workout.exercises?.length || 0} exercises
                        </span>
                      </div>
                      <div className={styles.clientProgramDetails}>
                        {workout.exercises?.slice(0, 3).map((exercise: any, exIndex: number) => (
                          <p key={exIndex}><strong>•</strong> {exercise.exercise?.name || 'Exercise'}</p>
                        ))}
                        {workout.exercises?.length > 3 && (
                          <p><em>... and {workout.exercises.length - 3} more exercises</em></p>
                        )}
                      </div>
                      <div className={styles.clientProgramActions}>
                        <Button appName="web" onClick={handleLogWorkout} className={styles.clientViewButton}>
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
          {message && <div className={styles.clientMessage}>{message}</div>}

          <div className={styles.clientDashboard}>
            <div className={styles.clientDashboardHeader}>
              <h2>Progress Update - {new Date(selectedProgress.date).toLocaleDateString()}</h2>
              <p>Detailed progress metrics and notes</p>
            </div>

            <div className={styles.clientSection}>
              <div className={styles.clientSectionHeader}>
                <h3>Progress Metrics</h3>
              </div>
              <div className={styles.clientProgramGrid}>
                <div className={styles.clientProgramCard}>
                  <div className={styles.clientProgramHeader}>
                    <h4>Physical Metrics</h4>
                  </div>
                  <div className={styles.clientProgramDetails}>
                    {selectedProgress.weight && <p><strong>Weight:</strong> {selectedProgress.weight} lbs</p>}
                    {selectedProgress.bodyFat && <p><strong>Body Fat:</strong> {selectedProgress.bodyFat}%</p>}
                    {selectedProgress.notes && <p><strong>Notes:</strong> {selectedProgress.notes}</p>}
                  </div>
                </div>

                {selectedProgress.data && (
                  <div className={styles.clientProgramCard}>
                    <div className={styles.clientProgramHeader}>
                      <h4>Wellness Metrics</h4>
                    </div>
                    <div className={styles.clientProgramDetails}>
                      {selectedProgress.data.metrics && (
                        <>
                          <p><strong>Energy Level:</strong> {selectedProgress.data.metrics.energyLevel}/10</p>
                          <p><strong>Sleep Quality:</strong> {selectedProgress.data.metrics.sleepQuality}/10</p>
                          <p><strong>Stress Level:</strong> {selectedProgress.data.metrics.stressLevel}/10</p>
                          <p><strong>Motivation:</strong> {selectedProgress.data.metrics.motivation}/10</p>
                        </>
                      )}
                      {selectedProgress.data.mood && <p><strong>Mood:</strong> {selectedProgress.data.mood}</p>}
                      {selectedProgress.data.workoutCompleted && <p><strong>Workout Completed:</strong> Yes</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.clientSection}>
              <div className={styles.clientSectionHeader}>
                <h3>Actions</h3>
              </div>
              <div className={styles.clientActionGrid}>
                <div className={styles.clientActionCard}>
                  <div className={styles.clientActionIcon}>📝</div>
                  <h4>Log New Progress</h4>
                  <p>Record your latest progress update</p>
                  <Button appName="web" onClick={handleLogWorkout} className={styles.clientActionButton}>
                    Log Progress
                  </Button>
                </div>

                <div className={styles.clientActionCard}>
                  <div className={styles.clientActionIcon}>📊</div>
                  <h4>View Progress Charts</h4>
                  <p>See your progress over time</p>
                  <Button appName="web" onClick={handleViewCharts} className={styles.clientActionButton}>
                    View Charts
                  </Button>
                </div>

                <div className={styles.clientActionCard}>
                  <div className={styles.clientActionIcon}>💬</div>
                  <h4>Message Trainer</h4>
                  <p>Discuss your progress with your trainer</p>
                  <Button appName="web" onClick={handleMessageTrainer} className={styles.clientActionButton}>
                    Send Message
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
                  <Button appName="web" onClick={handleLogWorkout} className={styles.clientActionButton}>
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

  // Other views (workout-logger, progress-charts, session-booking, messaging)
  if (['workout-logger', 'progress-charts', 'session-booking', 'messaging'].includes(currentView)) {
    const viewTitles = {
      'workout-logger': 'Workout Logger',
      'progress-charts': 'Progress Charts',
      'session-booking': 'Session Booking',
      'messaging': 'Messaging'
    };

    const viewDescriptions = {
      'workout-logger': 'Log your completed workouts and track your progress',
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
                    <span className={styles.clientStatus}>Coming Soon</span>
                  </div>
                  <div className={styles.clientProgramDetails}>
                    <p>This feature is currently under development and will be available soon!</p>
                    <p>You'll be able to:</p>
                    <ul>
                      {currentView === 'workout-logger' && (
                        <>
                          <li>Log completed exercises with sets, reps, and weights</li>
                          <li>Track your workout duration and intensity</li>
                          <li>Record how you felt during the workout</li>
                          <li>View your workout history</li>
                        </>
                      )}
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
            <Button appName="web" onClick={refreshClientData} className={styles.clientRefreshButton}>
              🔄 Refresh
            </Button>
            <Button appName="web" onClick={handleLogout} className={styles.clientLogoutButton}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.clientMain}>
        {message && <div className={styles.clientMessage}>{message}</div>}

        <div className={styles.clientDashboard}>
          <div className={styles.clientDashboardHeader}>
            <h2>Your Wellness Dashboard</h2>
            <p>Track your progress and view your personalized programs</p>
          </div>

          {/* Quick Stats */}
          <div className={styles.clientMetricsGrid}>
            <div className={styles.clientMetricCard} onClick={() => handleMetricClick('Active Programs')}>
              <div className={styles.clientMetricIcon}>💪</div>
              <div className={styles.clientMetricContent}>
                <h3>{client?.programs?.length || 0}</h3>
                <p>Active Programs</p>
              </div>
            </div>

            <div className={styles.clientMetricCard} onClick={() => handleMetricClick('Progress Records')}>
              <div className={styles.clientMetricIcon}>📊</div>
              <div className={styles.clientMetricContent}>
                <h3>{client?.progress?.length || 0}</h3>
                <p>Progress Records</p>
              </div>
            </div>

            <div className={styles.clientMetricCard} onClick={() => handleMetricClick('Goal Progress')}>
              <div className={styles.clientMetricIcon}>🎯</div>
              <div className={styles.clientMetricContent}>
                <h3>85%</h3>
                <p>Goal Progress</p>
              </div>
            </div>

            <div className={styles.clientMetricCard} onClick={() => handleMetricClick('Upcoming Sessions')}>
              <div className={styles.clientMetricIcon}>📅</div>
              <div className={styles.clientMetricContent}>
                <h3>{client?.sessions?.filter((s: any) => new Date(s.startTime) > new Date()).length || 0}</h3>
                <p>Upcoming Sessions</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className={styles.clientSection}>
            <div className={styles.clientSectionHeader} onClick={() => toggleSection('actions')}>
              <h3>Quick Actions</h3>
              <span className={styles.clientAccordionIcon}>
                {expandedSections.actions ? '▼' : '▶'}
              </span>
            </div>
            {expandedSections.actions && (
              <div className={styles.clientActionGrid}>
                <div className={styles.clientActionCard}>
                  <div className={styles.clientActionIcon}>📝</div>
                  <h4>Log Today's Workout</h4>
                  <p>Record your completed exercises and progress</p>
                  <Button appName="web" onClick={handleLogWorkout} className={styles.clientActionButton}>
                    Log Workout
                  </Button>
                </div>

                <div className={styles.clientActionCard}>
                  <div className={styles.clientActionIcon}>📊</div>
                  <h4>View Progress Charts</h4>
                  <p>See your progress over time with detailed charts</p>
                  <Button appName="web" onClick={handleViewCharts} className={styles.clientActionButton}>
                    View Charts
                  </Button>
                </div>

                <div className={styles.clientActionCard}>
                  <div className={styles.clientActionIcon}>📅</div>
                  <h4>Schedule Session</h4>
                  <p>Book your next session with your trainer</p>
                  <Button appName="web" onClick={handleBookSession} className={styles.clientActionButton}>
                    Book Session
                  </Button>
                </div>

                <div className={styles.clientActionCard}>
                  <div className={styles.clientActionIcon}>💬</div>
                  <h4>Message Trainer</h4>
                  <p>Send a message to your trainer</p>
                  <Button appName="web" onClick={handleMessageTrainer} className={styles.clientActionButton}>
                    Send Message
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Current Programs */}
          <div className={styles.clientSection}>
            <div className={styles.clientSectionHeader} onClick={() => toggleSection('programs')}>
              <h3>Your Programs ({client?.programs?.length || 0})</h3>
              <span className={styles.clientAccordionIcon}>
                {expandedSections.programs ? '▼' : '▶'}
              </span>
            </div>
            {expandedSections.programs && (
              <div className={styles.clientProgramGrid}>
                {client?.programs?.length > 0 ? (
                  client.programs.map((program: any) => (
                    <div key={program.id} className={styles.clientProgramCard}>
                      <div className={styles.clientProgramHeader}>
                        <h4>{program.programName}</h4>
                        <span className={`${styles.clientStatus} ${styles.active}`}>
                          Active
                        </span>
                      </div>
                      <div className={styles.clientProgramDetails}>
                        <p><strong>Start Date:</strong> {new Date(program.startDate).toLocaleDateString()}</p>
                        {program.endDate && (
                          <p><strong>End Date:</strong> {new Date(program.endDate).toLocaleDateString()}</p>
                        )}
                        <p><strong>Goal:</strong> {program.primaryGoal}</p>
                        {program.optPhase && (
                          <p><strong>Phase:</strong> {program.optPhase.replace(/_/g, ' ')}</p>
                        )}
                      </div>
                      <div className={styles.clientProgramActions}>
                        <Button appName="web" onClick={() => handleViewProgram(program.id)} className={styles.clientViewButton}>
                          View Program
                        </Button>
                        <Button appName="web" onClick={handleLogWorkout} className={styles.clientSecondaryButton}>
                          Log Workout
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.clientEmptyState}>
                    <p>No programs assigned yet. Contact your trainer to get started!</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recent Progress */}
          <div className={styles.clientSection}>
            <div className={styles.clientSectionHeader} onClick={() => toggleSection('progress')}>
              <h3>Recent Progress ({client?.progress?.length || 0})</h3>
              <span className={styles.clientAccordionIcon}>
                {expandedSections.progress ? '▼' : '▶'}
              </span>
            </div>
            {expandedSections.progress && (
              <div className={styles.clientProgressGrid}>
                {client?.progress?.length > 0 ? (
                  client.progress.slice(0, 10).map((prog: any, index: number) => (
                    <div key={prog.id || index} className={styles.clientProgressCard} onClick={() => handleViewProgressDetails(prog.id)}>
                      <div className={styles.clientProgressHeader}>
                        <h4>Progress Update</h4>
                        <span className={styles.clientProgressDate}>
                          {new Date(prog.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className={styles.clientProgressDetails}>
                        {prog.weight && <p><strong>Weight:</strong> {prog.weight} lbs</p>}
                        {prog.bodyFat && <p><strong>Body Fat:</strong> {prog.bodyFat}%</p>}
                        {prog.notes && <p><strong>Notes:</strong> {prog.notes.substring(0, 100)}...</p>}
                      </div>
                      <div className={styles.clientProgressActions}>
                        <Button appName="web" onClick={(e) => { e.stopPropagation(); handleViewProgressDetails(prog.id); }} className={styles.clientViewButton}>
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.clientEmptyState}>
                    <p>No progress records yet. Start logging your workouts to track your progress!</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Upcoming Sessions */}
          <div className={styles.clientSection}>
            <div className={styles.clientSectionHeader} onClick={() => toggleSection('sessions')}>
              <h3>Upcoming Sessions ({client?.sessions?.filter((s: any) => new Date(s.startTime) > new Date()).length || 0})</h3>
              <span className={styles.clientAccordionIcon}>
                {expandedSections.sessions ? '▼' : '▶'}
              </span>
            </div>
            {expandedSections.sessions && (
              <div className={styles.clientSessionGrid}>
                {client?.sessions?.length > 0 ? (
                  client.sessions
                    .filter((session: any) => new Date(session.startTime) > new Date())
                    .slice(0, 10)
                    .map((session: any) => (
                      <div key={session.id} className={styles.clientSessionCard} onClick={() => handleViewSessionDetails(session.id)}>
                        <div className={styles.clientSessionHeader}>
                          <h4>{session.type === 'IN_PERSON' ? 'In-Person Session' : 'Virtual Session'}</h4>
                          <span className={`${styles.clientSessionStatus} ${styles[session.status.toLowerCase()]}`}>
                            {session.status}
                          </span>
                        </div>
                        <div className={styles.clientSessionDetails}>
                          <p><strong>Date:</strong> {new Date(session.startTime).toLocaleDateString()}</p>
                          <p><strong>Time:</strong> {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          {session.location && <p><strong>Location:</strong> {session.location}</p>}
                          {session.notes && <p><strong>Notes:</strong> {session.notes.substring(0, 100)}...</p>}
                        </div>
                        <div className={styles.clientSessionActions}>
                          <Button appName="web" onClick={(e) => { e.stopPropagation(); handleViewSessionDetails(session.id); }} className={styles.clientViewButton}>
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className={styles.clientEmptyState}>
                    <p>No upcoming sessions scheduled. Contact your trainer to book a session!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 