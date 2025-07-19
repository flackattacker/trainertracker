'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { Badge } from '@repo/ui/badge';
import { Progress } from '@repo/ui/progress';
import { Button } from '@repo/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Calendar,
  Target,
  BarChart3
} from 'lucide-react';

interface ProgramProgressProps {
  programId: string;
  clientId: string;
  token?: string; // Optional token prop for flexibility
}

interface WeeklyProgress {
  week: number;
  plannedWorkouts: number;
  completedWorkouts: number;
  completionPercentage: number;
  sessions: SessionData[];
  performance: WeekPerformance;
}

interface SessionData {
  id: string;
  workoutId: string;
  workoutName: string;
  status: string;
  sessionDate: string;
  sessionStatus: string;
  performance: any[];
}

interface WeekPerformance {
  totalExercises: number;
  completedExercises: number;
  averageWeightProgress: number;
  averageRepProgress: number;
  difficultyTrend: string;
  formQualityTrend: string;
}

interface OverallPerformance {
  totalSessions: number;
  completedSessions: number;
  totalExercises: number;
  completedExercises: 0;
  averageWeightProgress: number;
  averageRepProgress: number;
  strengthTrend: string;
  volumeTrend: string;
}

interface AdjustmentTriggers {
  needsAdjustment: boolean;
  reasons: string[];
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface ProgressData {
  program: {
    id: string;
    name: string;
    duration: number;
    totalWorkouts: number;
    status: string;
    startDate: string;
    endDate: string;
  };
  client: {
    id: string;
    firstName: string;
    lastName: string;
    codeName: string;
  };
  overallProgress: {
    completionPercentage: number;
    completedWorkouts: number;
    totalWorkouts: number;
    performance: OverallPerformance;
  };
  weeklyProgress: WeeklyProgress[];
  adjustmentTriggers: AdjustmentTriggers;
  lastUpdated: string;
}

export default function ProgramProgress({ programId, clientId, token }: ProgramProgressProps) {
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProgressData();
  }, [programId]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://trainer-tracker-api.onrender.com';
      
      // Get authentication token - use prop first, then check localStorage
      let authToken = token;
      if (!authToken) {
        // Check for client portal token first, then trainer token
        authToken = localStorage.getItem('client-portal-token') || undefined;
        if (!authToken) {
          authToken = localStorage.getItem('trainer-tracker-token') || undefined;
        }
        if (!authToken) {
          authToken = localStorage.getItem('token') || undefined;
        }
      }
      
      if (!authToken) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`${baseUrl}/api/programs/${programId}/progress`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setProgressData(data);
    } catch (err) {
      console.error('Error fetching progress data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'IMPROVING':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'DECLINING':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'CANCELLED':
      case 'MISSED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Calendar className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading progress data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">{error}</p>
          <Button onClick={fetchProgressData} className="mt-2">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!progressData) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-600">No progress data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{progressData.program.name}</h2>
          <p className="text-gray-600">
            {progressData.client.firstName} {progressData.client.lastName} ({progressData.client.codeName})
          </p>
        </div>
        <Badge variant={progressData.program.status === 'ACTIVE' ? 'default' : 'secondary'}>
          {progressData.program.status}
        </Badge>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Overall Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {progressData.overallProgress.completionPercentage}%
              </div>
              <p className="text-sm text-gray-600">Completion</p>
              <Progress 
                value={progressData.overallProgress.completionPercentage} 
                className="mt-2"
              />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {progressData.overallProgress.completedWorkouts}/{progressData.overallProgress.totalWorkouts}
              </div>
              <p className="text-sm text-gray-600">Workouts Completed</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {progressData.overallProgress.performance.completedSessions}/{progressData.overallProgress.performance.totalSessions}
              </div>
              <p className="text-sm text-gray-600">Sessions Completed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Strength Progress</h4>
              <div className="flex items-center gap-2">
                {getTrendIcon(progressData.overallProgress.performance.strengthTrend)}
                <span className="text-lg font-medium">
                  {progressData.overallProgress.performance.averageWeightProgress}%
                </span>
                <span className="text-sm text-gray-600">weight change</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Volume Progress</h4>
              <div className="flex items-center gap-2">
                {getTrendIcon(progressData.overallProgress.performance.volumeTrend)}
                <span className="text-lg font-medium">
                  {progressData.overallProgress.performance.averageRepProgress}%
                </span>
                <span className="text-sm text-gray-600">rep change</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Adjustment Triggers */}
      {progressData.adjustmentTriggers.needsAdjustment && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Program Adjustment Recommended
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge className={getPriorityColor(progressData.adjustmentTriggers.priority)}>
                {progressData.adjustmentTriggers.priority} Priority
              </Badge>
              <ul className="list-disc list-inside space-y-1">
                {progressData.adjustmentTriggers.reasons.map((reason, index) => (
                  <li key={index} className="text-orange-700">{reason}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="week-1" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              {progressData.weeklyProgress.map((week) => (
                <TabsTrigger key={week.week} value={`week-${week.week}`}>
                  Week {week.week}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {progressData.weeklyProgress.map((week) => (
              <TabsContent key={week.week} value={`week-${week.week}`}>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {week.completionPercentage}%
                      </div>
                      <p className="text-sm text-gray-600">Completion</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {week.completedWorkouts}/{week.plannedWorkouts}
                      </div>
                      <p className="text-sm text-gray-600">Workouts</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {week.performance.completedExercises}/{week.performance.totalExercises}
                      </div>
                      <p className="text-sm text-gray-600">Exercises</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Sessions</h4>
                    {week.sessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(session.status)}
                          <div>
                            <p className="font-medium">{session.workoutName}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(session.sessionDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant={session.status === 'COMPLETED' ? 'default' : 'secondary'}>
                          {session.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 