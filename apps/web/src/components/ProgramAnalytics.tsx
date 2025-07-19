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
  BarChart3,
  Activity,
  Users,
  Award,
  Clock,
  Zap,
  Target as TargetIcon,
  LineChart,
  PieChart,
  Filter
} from 'lucide-react';

interface ProgramAnalyticsProps {
  programId: string;
  clientId: string;
}

interface AnalyticsData {
  program: {
    id: string;
    name: string;
    duration: number;
    totalWorkouts: number;
    status: string;
    startDate: string;
    endDate: string;
    optPhase: string;
    primaryGoal: string;
  };
  client: {
    id: string;
    firstName: string;
    lastName: string;
    codeName: string;
    experienceLevel: string;
  };
  performance: {
    overall: {
      completionRate: number;
      averageSessionDuration: number;
      totalSessions: number;
      completedSessions: number;
      skippedSessions: number;
      averageRPE: number;
      consistencyScore: number;
    };
    strength: {
      averageWeightProgress: number;
      maxWeightLifted: number;
      strengthTrend: 'IMPROVING' | 'STABLE' | 'DECLINING';
      topExercises: Array<{
        name: string;
        progress: number;
        currentWeight: number;
      }>;
    };
    volume: {
      averageRepsProgress: number;
      totalVolume: number;
      volumeTrend: 'IMPROVING' | 'STABLE' | 'DECLINING';
      weeklyVolume: Array<{
        week: number;
        volume: number;
        sessions: number;
      }>;
    };
    consistency: {
      weeklyAdherence: Array<{
        week: number;
        plannedSessions: number;
        completedSessions: number;
        adherenceRate: number;
      }>;
      bestDays: Array<{
        day: string;
        completionRate: number;
        averageRPE: number;
      }>;
      missedSessions: Array<{
        date: string;
        reason: string;
        impact: 'LOW' | 'MEDIUM' | 'HIGH';
      }>;
    };
    goals: {
      primaryGoalProgress: number;
      secondaryGoals: Array<{
        name: string;
        progress: number;
        target: number;
        current: number;
        unit: string;
      }>;
      milestones: Array<{
        name: string;
        achieved: boolean;
        date?: string;
        description: string;
      }>;
    };
  };
  insights: {
    recommendations: Array<{
      type: 'PROGRESSION' | 'ADJUSTMENT' | 'MOTIVATION' | 'TECHNIQUE';
      priority: 'LOW' | 'MEDIUM' | 'HIGH';
      title: string;
      description: string;
      action: string;
    }>;
    trends: Array<{
      metric: string;
      trend: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
      change: number;
      period: string;
      insight: string;
    }>;
    alerts: Array<{
      type: 'WARNING' | 'SUCCESS' | 'INFO';
      message: string;
      date: string;
    }>;
  };
}

export default function ProgramAnalytics({ programId, clientId }: ProgramAnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'program'>('program');

  useEffect(() => {
    fetchAnalyticsData();
  }, [programId, timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
              let token = localStorage.getItem('trainer-tracker-token');
        if (!token) {
          token = localStorage.getItem('token');
        }
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE}/api/programs/${programId}/analytics?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const data = await response.json();
      setAnalyticsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'IMPROVING':
      case 'POSITIVE':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'DECLINING':
      case 'NEGATIVE':
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      default:
        return <Minus className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="p-8 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Error Loading Analytics</h3>
        <p className="text-gray-600 mb-4">{error || 'Unable to load program analytics'}</p>
        <Button onClick={fetchAnalyticsData}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Program Analytics</h2>
          <p className="text-gray-600">
            {analyticsData.client.firstName} {analyticsData.client.lastName} - {analyticsData.program.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="border rounded-md px-3 py-1 text-sm"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="program">Full Program</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold">{analyticsData.performance.overall.completionRate}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={analyticsData.performance.overall.completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average RPE</p>
                <p className="text-2xl font-bold">{analyticsData.performance.overall.averageRPE}/10</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {analyticsData.performance.overall.averageRPE >= 8 ? 'High Intensity' : 
               analyticsData.performance.overall.averageRPE >= 6 ? 'Moderate Intensity' : 'Low Intensity'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Consistency Score</p>
                <p className="text-2xl font-bold">{analyticsData.performance.overall.consistencyScore}%</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {analyticsData.performance.overall.consistencyScore >= 80 ? 'Excellent' : 
               analyticsData.performance.overall.consistencyScore >= 60 ? 'Good' : 'Needs Improvement'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sessions Completed</p>
                <p className="text-2xl font-bold">{analyticsData.performance.overall.completedSessions}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
            <div className="mt-2 text-sm text-gray-600">
              of {analyticsData.performance.overall.totalSessions} total
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="consistency">Consistency</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Program Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Program Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Program Completion</span>
                      <span>{analyticsData.performance.overall.completionRate}%</span>
                    </div>
                    <Progress value={analyticsData.performance.overall.completionRate} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Program Duration</p>
                      <p className="font-semibold">{analyticsData.program.duration} weeks</p>
                    </div>
                    <div>
                      <p className="text-gray-600">OPT Phase</p>
                      <p className="font-semibold">{analyticsData.program.optPhase.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Primary Goal</p>
                      <p className="font-semibold">{analyticsData.program.primaryGoal}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Status</p>
                      <Badge variant={analyticsData.program.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {analyticsData.program.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Strength Progress</span>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(analyticsData.performance.strength.strengthTrend)}
                      <span className="font-semibold">{analyticsData.performance.strength.averageWeightProgress}%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Volume Progress</span>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(analyticsData.performance.volume.volumeTrend)}
                      <span className="font-semibold">{analyticsData.performance.volume.averageRepsProgress}%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Session Duration</span>
                    <span className="font-semibold">{analyticsData.performance.overall.averageSessionDuration} min</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strength Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Strength Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{analyticsData.performance.strength.averageWeightProgress}%</p>
                    <p className="text-sm text-gray-600">Average Weight Progress</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Top Performing Exercises</h4>
                    <div className="space-y-2">
                      {analyticsData.performance.strength.topExercises.map((exercise, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm">{exercise.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{exercise.progress}%</span>
                            <span className="text-xs text-gray-500">{exercise.currentWeight}kg</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Volume Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Volume Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{analyticsData.performance.volume.totalVolume}</p>
                    <p className="text-sm text-gray-600">Total Volume (kg)</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Weekly Volume Trend</h4>
                    <div className="space-y-2">
                      {analyticsData.performance.volume.weeklyVolume.slice(-4).map((week, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm">Week {week.week}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{week.volume}kg</span>
                            <span className="text-xs text-gray-500">{week.sessions} sessions</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Consistency Tab */}
        <TabsContent value="consistency" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Adherence */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Weekly Adherence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.performance.consistency.weeklyAdherence.slice(-6).map((week, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">Week {week.week}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{week.completedSessions}/{week.plannedSessions}</span>
                        <Badge variant={week.adherenceRate >= 80 ? 'default' : week.adherenceRate >= 60 ? 'secondary' : 'destructive'}>
                          {week.adherenceRate}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Best Performance Days */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Best Performance Days
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.performance.consistency.bestDays.map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-semibold">{day.day}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{day.completionRate}% completion</span>
                        <span className="text-xs text-gray-500">RPE {day.averageRPE}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Primary Goal Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TargetIcon className="h-5 w-5" />
                  Primary Goal Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{analyticsData.performance.goals.primaryGoalProgress}%</p>
                    <p className="text-sm text-gray-600">Goal: {analyticsData.program.primaryGoal}</p>
                  </div>
                  <Progress value={analyticsData.performance.goals.primaryGoalProgress} />
                </div>
              </CardContent>
            </Card>

            {/* Milestones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Milestones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.performance.goals.milestones.map((milestone, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                      {milestone.achieved ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{milestone.name}</p>
                        <p className="text-xs text-gray-600">{milestone.description}</p>
                        {milestone.achieved && milestone.date && (
                          <p className="text-xs text-green-600">Achieved {new Date(milestone.date).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.insights.recommendations.map((rec, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-sm">{rec.title}</h4>
                        <Badge className={getPriorityColor(rec.priority)}>
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                      <p className="text-xs text-blue-600 font-medium">{rec.action}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trends & Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Trends & Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.insights.trends.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="text-sm font-semibold">{trend.metric}</p>
                        <p className="text-xs text-gray-600">{trend.insight}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(trend.trend)}
                        <span className="text-sm font-semibold">{trend.change}%</span>
                      </div>
                    </div>
                  ))}
                  
                  {analyticsData.insights.alerts.map((alert, index) => (
                    <div key={index} className={`p-2 rounded text-sm ${
                      alert.type === 'WARNING' ? 'bg-yellow-50 text-yellow-800' :
                      alert.type === 'SUCCESS' ? 'bg-green-50 text-green-800' :
                      'bg-blue-50 text-blue-800'
                    }`}>
                      <p className="font-semibold">{alert.message}</p>
                      <p className="text-xs opacity-75">{new Date(alert.date).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 