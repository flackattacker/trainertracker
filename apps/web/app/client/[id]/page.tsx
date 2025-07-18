"use client";

import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/button';
import { Card } from '@repo/ui/card';
import { Badge } from '@repo/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/tabs';
import styles from './page.module.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED';
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
  createdAt: string;
}

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

interface Assessment {
  id: string;
  clientId: string;
  type: 'PARQ' | 'FITNESS_ASSESSMENT' | 'BODY_COMPOSITION' | 'FLEXIBILITY' | 'STRENGTH' | 'CARDIOVASCULAR' | 'OTHER';
  assessmentDate: string;
  assessor: string;
  notes?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [client, setClient] = useState<Client | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clientId, setClientId] = useState<string>('');

  useEffect(() => {
    const getClientId = async () => {
      const { id } = await params;
      setClientId(id);
    };
    getClientId();
  }, [params]);

  useEffect(() => {
    const fetchClientData = async () => {
      if (!clientId) return;
      
      try {
        const token = localStorage.getItem('trainer-tracker-token');
        if (!token) {
          setError('Authentication required');
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        // Fetch all client-related data
        const [clientRes, programsRes, progressRes, sessionsRes, assessmentsRes] = await Promise.all([
          fetch(`${API_BASE}/api/clients/${clientId}`, { headers }),
          fetch(`${API_BASE}/api/programs?clientId=${clientId}`, { headers }),
          fetch(`${API_BASE}/api/progress?clientId=${clientId}`, { headers }),
          fetch(`${API_BASE}/api/sessions?clientId=${clientId}`, { headers }),
          fetch(`${API_BASE}/api/assessments?clientId=${clientId}`, { headers })
        ]);

        if (!clientRes.ok) throw new Error('Failed to fetch client');
        
        const clientData = await clientRes.json();
        const programsData = programsRes.ok ? await programsRes.json() : [];
        const progressData = progressRes.ok ? await progressRes.json() : [];
        const sessionsData = sessionsRes.ok ? await sessionsRes.json() : [];
        const assessmentsData = assessmentsRes.ok ? await assessmentsRes.json() : [];

        setClient(clientData);
        setPrograms(programsData);
        setProgress(progressData);
        setSessions(sessionsData);
        setAssessments(assessmentsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load client data');
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [clientId]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading client information...</p>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className={styles.errorContainer}>
        <h2>Error</h2>
        <p>{error || 'Client not found'}</p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'prospect': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgramStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'PAUSED': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const upcomingSessions = sessions
    .filter(s => s.status === 'SCHEDULED' && new Date(s.startTime) > new Date())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 3);

  const recentProgress = progress
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const activePrograms = programs.filter(p => p.status === 'ACTIVE');

  return (
    <div className={styles.clientDetailContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.clientInfo}>
            <h1>{client.firstName} {client.lastName}</h1>
            <p className={styles.clientCode}>Code: {client.codeName}</p>
            <Badge className={getStatusColor(client.status)}>
              {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
            </Badge>
          </div>
          <div className={styles.headerActions}>
            <Button variant="outline" onClick={() => window.history.back()}>
              ← Back to Clients
            </Button>
            <Button>Edit Client</Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className={styles.quickStats}>
        <Card className={styles.statCard}>
          <h3>{activePrograms.length}</h3>
          <p>Active Programs</p>
        </Card>
        <Card className={styles.statCard}>
          <h3>{upcomingSessions.length}</h3>
          <p>Upcoming Sessions</p>
        </Card>
        <Card className={styles.statCard}>
          <h3>{assessments.filter(a => a.status === 'COMPLETED').length}</h3>
          <p>Completed Assessments</p>
        </Card>
        <Card className={styles.statCard}>
          <h3>{progress.length}</h3>
          <p>Progress Records</p>
        </Card>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        <Tabs defaultValue="overview" className={styles.tabs}>
          <TabsList className={styles.tabsList}>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="programs">Programs</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className={styles.tabContent}>
            <div className={styles.overviewGrid}>
              {/* Client Information */}
              <Card className={styles.infoCard}>
                <h3>Client Information</h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <label>Email:</label>
                    <span>{client.email || 'Not provided'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Phone:</label>
                    <span>{client.phone || 'Not provided'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Date of Birth:</label>
                    <span>{client.dateOfBirth ? new Date(client.dateOfBirth).toLocaleDateString() : 'Not provided'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Gender:</label>
                    <span>{client.gender.charAt(0).toUpperCase() + client.gender.slice(1)}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Member Since:</label>
                    <span>{new Date(client.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                {client.notes && (
                  <div className={styles.notes}>
                    <label>Notes:</label>
                    <p>{client.notes}</p>
                  </div>
                )}
              </Card>

              {/* Upcoming Sessions */}
              <Card className={styles.infoCard}>
                <h3>Upcoming Sessions</h3>
                {upcomingSessions.length > 0 ? (
                  <div className={styles.sessionList}>
                    {upcomingSessions.map(session => (
                      <div key={session.id} className={styles.sessionItem}>
                        <div className={styles.sessionTime}>
                          {new Date(session.startTime).toLocaleDateString()} at {new Date(session.startTime).toLocaleTimeString()}
                        </div>
                        <div className={styles.sessionType}>
                          {session.type} • {session.location || 'Location TBD'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.noData}>No upcoming sessions</p>
                )}
                <Button variant="outline" className={styles.viewAllButton}>
                  View All Sessions
                </Button>
              </Card>

              {/* Recent Progress */}
              <Card className={styles.infoCard}>
                <h3>Recent Progress</h3>
                {recentProgress.length > 0 ? (
                  <div className={styles.progressList}>
                    {recentProgress.map(record => (
                      <div key={record.id} className={styles.progressItem}>
                        <div className={styles.progressDate}>
                          {new Date(record.date).toLocaleDateString()}
                        </div>
                        <div className={styles.progressMetrics}>
                          {record.weight && <span>Weight: {record.weight}kg</span>}
                          {record.bodyFat && <span>Body Fat: {record.bodyFat}%</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.noData}>No progress records</p>
                )}
                <Button variant="outline" className={styles.viewAllButton}>
                  View All Progress
                </Button>
              </Card>

              {/* Active Programs */}
              <Card className={styles.infoCard}>
                <h3>Active Programs</h3>
                {activePrograms.length > 0 ? (
                  <div className={styles.programList}>
                    {activePrograms.map(program => (
                      <div key={program.id} className={styles.programItem}>
                        <div className={styles.programName}>{program.programName}</div>
                        <div className={styles.programPhase}>{program.optPhase.replace(/_/g, ' ')}</div>
                        <div className={styles.programGoal}>{program.primaryGoal}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.noData}>No active programs</p>
                )}
                <Button variant="outline" className={styles.viewAllButton}>
                  View All Programs
                </Button>
              </Card>
            </div>
          </TabsContent>

          {/* Programs Tab */}
          <TabsContent value="programs" className={styles.tabContent}>
            <div className={styles.programsHeader}>
              <h3>Training Programs</h3>
              <Button>Create New Program</Button>
            </div>
            <div className={styles.programsGrid}>
              {programs.map(program => (
                <Card key={program.id} className={styles.programCard}>
                  <div className={styles.programHeader}>
                    <h4>{program.programName}</h4>
                    <Badge className={getProgramStatusColor(program.status)}>
                      {program.status}
                    </Badge>
                  </div>
                  <div className={styles.programDetails}>
                    <p><strong>Phase:</strong> {program.optPhase.replace(/_/g, ' ')}</p>
                    <p><strong>Goal:</strong> {program.primaryGoal}</p>
                    <p><strong>Start Date:</strong> {new Date(program.startDate).toLocaleDateString()}</p>
                    {program.endDate && (
                      <p><strong>End Date:</strong> {new Date(program.endDate).toLocaleDateString()}</p>
                    )}
                  </div>
                  <div className={styles.programActions}>
                    <Button variant="outline" size="sm">View Details</Button>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className={styles.tabContent}>
            <div className={styles.progressHeader}>
              <h3>Progress Tracking</h3>
              <Button>Add Progress Record</Button>
            </div>
            <div className={styles.progressTable}>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Weight (kg)</th>
                    <th>Body Fat (%)</th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {progress.map(record => (
                    <tr key={record.id}>
                      <td>{new Date(record.date).toLocaleDateString()}</td>
                      <td>{record.weight || '-'}</td>
                      <td>{record.bodyFat || '-'}</td>
                      <td>{record.notes || '-'}</td>
                      <td>
                        <Button variant="outline" size="sm">View</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className={styles.tabContent}>
            <div className={styles.sessionsHeader}>
              <h3>Training Sessions</h3>
              <Button>Schedule Session</Button>
            </div>
            <div className={styles.sessionsGrid}>
              {sessions.map(session => (
                <Card key={session.id} className={styles.sessionCard}>
                  <div className={styles.sessionHeader}>
                    <h4>{new Date(session.startTime).toLocaleDateString()}</h4>
                    <Badge variant={session.status === 'COMPLETED' ? 'default' : 'secondary'}>
                      {session.status}
                    </Badge>
                  </div>
                  <div className={styles.sessionDetails}>
                    <p><strong>Time:</strong> {new Date(session.startTime).toLocaleTimeString()}</p>
                    <p><strong>Type:</strong> {session.type}</p>
                    {session.location && <p><strong>Location:</strong> {session.location}</p>}
                    {session.notes && <p><strong>Notes:</strong> {session.notes}</p>}
                  </div>
                  <div className={styles.sessionActions}>
                    <Button variant="outline" size="sm">View Details</Button>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Assessments Tab */}
          <TabsContent value="assessments" className={styles.tabContent}>
            <div className={styles.assessmentsHeader}>
              <h3>Assessments</h3>
              <Button>Create Assessment</Button>
            </div>
            <div className={styles.assessmentsGrid}>
              {assessments.map(assessment => (
                <Card key={assessment.id} className={styles.assessmentCard}>
                  <div className={styles.assessmentHeader}>
                    <h4>{assessment.type.replace(/_/g, ' ')}</h4>
                    <Badge variant={assessment.status === 'COMPLETED' ? 'default' : 'secondary'}>
                      {assessment.status}
                    </Badge>
                  </div>
                  <div className={styles.assessmentDetails}>
                    <p><strong>Date:</strong> {new Date(assessment.assessmentDate).toLocaleDateString()}</p>
                    <p><strong>Assessor:</strong> {assessment.assessor}</p>
                    {assessment.notes && <p><strong>Notes:</strong> {assessment.notes}</p>}
                  </div>
                  <div className={styles.assessmentActions}>
                    <Button variant="outline" size="sm">View Details</Button>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 