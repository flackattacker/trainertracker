'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Badge } from '@repo/ui/badge';
import { Progress } from '@repo/ui/progress';
import { 
  TrendingUp, 
  Target, 
  Calendar, 
  BarChart3, 
  Settings,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

interface ProgressiveOverloadProps {
  clientId: string;
  programId: string;
  currentPhase: keyof typeof OPT_PHASE_GUIDELINES;
  experienceLevel: string;
}

interface ExerciseProgress {
  exerciseId: string;
  exerciseName: string;
  currentWeight: number;
  currentReps: number;
  currentSets: number;
  lastSessionDate: string;
  progressionHistory: ProgressionEntry[];
  recommendedProgression: ProgressionRecommendation;
}

interface ProgressionEntry {
  date: string;
  weight: number;
  reps: number;
  sets: number;
  rpe: number;
  notes?: string;
}

interface ProgressionRecommendation {
  type: 'WEIGHT' | 'REPS' | 'SETS' | 'VOLUME' | 'INTENSITY';
  currentValue: number;
  recommendedValue: number;
  increase: number;
  percentage: number;
  reason: string;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  nextSessionDate: string;
}

interface PhaseGuidelines {
  sets: { min: number; max: number };
  reps: { min: number; max: number };
  intensity: { min: number; max: number };
  tempo: string;
  restTime: { min: number; max: number };
  rpe: { min: number; max: number };
  progressionRules: {
    weightIncrease: number;
    repIncrease: number;
    volumeIncrease: number;
    frequency: string;
  };
}

const OPT_PHASE_GUIDELINES: Record<string, PhaseGuidelines> = {
  STABILIZATION_ENDURANCE: {
    sets: { min: 1, max: 3 },
    reps: { min: 12, max: 20 },
    intensity: { min: 50, max: 70 },
    tempo: '4-2-2',
    restTime: { min: 0, max: 90 },
    rpe: { min: 4, max: 6 },
    progressionRules: {
      weightIncrease: 0,
      repIncrease: 2,
      volumeIncrease: 10,
      frequency: 'weekly'
    }
  },
  STRENGTH_ENDURANCE: {
    sets: { min: 2, max: 4 },
    reps: { min: 8, max: 12 },
    intensity: { min: 70, max: 80 },
    tempo: '3-1-2',
    restTime: { min: 60, max: 120 },
    rpe: { min: 6, max: 8 },
    progressionRules: {
      weightIncrease: 5,
      repIncrease: 1,
      volumeIncrease: 5,
      frequency: 'weekly'
    }
  },
  MUSCULAR_DEVELOPMENT: {
    sets: { min: 3, max: 5 },
    reps: { min: 6, max: 12 },
    intensity: { min: 75, max: 85 },
    tempo: '2-1-2',
    restTime: { min: 90, max: 180 },
    rpe: { min: 7, max: 9 },
    progressionRules: {
      weightIncrease: 2.5,
      repIncrease: 0,
      volumeIncrease: 5,
      frequency: 'bi-weekly'
    }
  },
  MAXIMAL_STRENGTH: {
    sets: { min: 2, max: 6 },
    reps: { min: 1, max: 5 },
    intensity: { min: 85, max: 100 },
    tempo: '2-1-1',
    restTime: { min: 180, max: 300 },
    rpe: { min: 8, max: 10 },
    progressionRules: {
      weightIncrease: 2.5,
      repIncrease: 0,
      volumeIncrease: 0,
      frequency: 'bi-weekly'
    }
  },
  POWER: {
    sets: { min: 2, max: 4 },
    reps: { min: 1, max: 5 },
    intensity: { min: 30, max: 45 },
    tempo: '1-0-1',
    restTime: { min: 180, max: 300 },
    rpe: { min: 7, max: 9 },
    progressionRules: {
      weightIncrease: 2.5,
      repIncrease: 0,
      volumeIncrease: 3,
      frequency: 'weekly'
    }
  }
};

export default function ProgressiveOverload({ 
  clientId, 
  programId, 
  currentPhase, 
  experienceLevel 
}: ProgressiveOverloadProps) {
  const [exerciseProgress, setExerciseProgress] = useState<ExerciseProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    fetchExerciseProgress();
  }, [clientId, programId]);

  const fetchExerciseProgress = async () => {
    try {
      setLoading(true);
      // This would fetch from your API
      // const response = await fetch(`/api/programs/${programId}/progressive-overload?clientId=${clientId}`);
      // const data = await response.json();
      
      // Mock data for demonstration
      const mockData: ExerciseProgress[] = [
        {
          exerciseId: 'bench-press',
          exerciseName: 'Barbell Bench Press',
          currentWeight: 135,
          currentReps: 8,
          currentSets: 3,
          lastSessionDate: '2025-07-15',
          progressionHistory: [
            { date: '2025-07-01', weight: 125, reps: 8, sets: 3, rpe: 7 },
            { date: '2025-07-08', weight: 130, reps: 8, sets: 3, rpe: 7 },
            { date: '2025-07-15', weight: 135, reps: 8, sets: 3, rpe: 7 }
          ],
          recommendedProgression: {
            type: 'WEIGHT',
            currentValue: 135,
            recommendedValue: 140,
            increase: 5,
            percentage: 3.7,
            reason: 'Consistent performance at current weight for 2 weeks',
            confidence: 'HIGH',
            nextSessionDate: '2025-07-22'
          }
        },
        {
          exerciseId: 'squat',
          exerciseName: 'Barbell Back Squat',
          currentWeight: 185,
          currentReps: 6,
          currentSets: 4,
          lastSessionDate: '2025-07-14',
          progressionHistory: [
            { date: '2025-07-01', weight: 175, reps: 6, sets: 4, rpe: 8 },
            { date: '2025-07-08', weight: 180, reps: 6, sets: 4, rpe: 8 },
            { date: '2025-07-14', weight: 185, reps: 6, sets: 4, rpe: 8 }
          ],
          recommendedProgression: {
            type: 'REPS',
            currentValue: 6,
            recommendedValue: 8,
            increase: 2,
            percentage: 33.3,
            reason: 'RPE indicates capacity for increased volume',
            confidence: 'MEDIUM',
            nextSessionDate: '2025-07-21'
          }
        }
      ];
      
      setExerciseProgress(mockData);
    } catch (error) {
      console.error('Error fetching exercise progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPhaseGuidelines = (): PhaseGuidelines => {
    const guidelines = OPT_PHASE_GUIDELINES[currentPhase];
    return guidelines ?? OPT_PHASE_GUIDELINES.STABILIZATION_ENDURANCE;
  };

  const calculateProgressionRecommendation = (exercise: ExerciseProgress): ProgressionRecommendation => {
    const guidelines = getPhaseGuidelines();
    const history = exercise.progressionHistory;
    
    if (history.length < 2) {
      return {
        type: 'WEIGHT',
        currentValue: exercise.currentWeight,
        recommendedValue: exercise.currentWeight,
        increase: 0,
        percentage: 0,
        reason: 'Insufficient data for progression recommendation',
        confidence: 'LOW',
        nextSessionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
    }

    const recentSessions = history.slice(-3);
    const avgRPE = recentSessions.reduce((sum, session) => sum + session.rpe, 0) / recentSessions.length;
    const weightStable = recentSessions.every(session => session.weight === exercise.currentWeight);
    const repStable = recentSessions.every(session => session.reps === exercise.currentReps);

    // Determine progression type based on phase and performance
    if (currentPhase === 'STABILIZATION_ENDURANCE') {
      if (avgRPE <= 5 && repStable) {
        return {
          type: 'REPS',
          currentValue: exercise.currentReps,
          recommendedValue: Math.min(exercise.currentReps + guidelines.progressionRules.repIncrease, guidelines.reps.max),
          increase: guidelines.progressionRules.repIncrease,
          percentage: (guidelines.progressionRules.repIncrease / exercise.currentReps) * 100,
          reason: 'Low RPE indicates capacity for increased reps',
          confidence: 'HIGH',
          nextSessionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };
      }
    } else if (currentPhase === 'STRENGTH_ENDURANCE' || currentPhase === 'MUSCULAR_DEVELOPMENT') {
      if (avgRPE >= 7 && weightStable && repStable) {
        return {
          type: 'WEIGHT',
          currentValue: exercise.currentWeight,
          recommendedValue: exercise.currentWeight + guidelines.progressionRules.weightIncrease,
          increase: guidelines.progressionRules.weightIncrease,
          percentage: (guidelines.progressionRules.weightIncrease / exercise.currentWeight) * 100,
          reason: 'High RPE and consistent performance indicate readiness for weight increase',
          confidence: 'HIGH',
          nextSessionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };
      }
    }

    return {
      type: 'VOLUME',
      currentValue: exercise.currentSets,
      recommendedValue: Math.min(exercise.currentSets + 1, guidelines.sets.max),
      increase: 1,
      percentage: (1 / exercise.currentSets) * 100,
      reason: 'Maintain current weight/reps, increase volume',
      confidence: 'MEDIUM',
      nextSessionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'HIGH': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressionIcon = (type: string) => {
    switch (type) {
      case 'WEIGHT': return <TrendingUp className="h-4 w-4" />;
      case 'REPS': return <Target className="h-4 w-4" />;
      case 'SETS': return <BarChart3 className="h-4 w-4" />;
      case 'VOLUME': return <BarChart3 className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading progression data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Progressive Overload</h2>
          <p className="text-gray-600">Automatic progression recommendations based on performance</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </div>

      {/* Phase Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {currentPhase.replace('_', ' ')} Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {getPhaseGuidelines().sets.min}-{getPhaseGuidelines().sets.max}
              </div>
              <div className="text-sm text-gray-600">Sets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {getPhaseGuidelines().reps.min}-{getPhaseGuidelines().reps.max}
              </div>
              <div className="text-sm text-gray-600">Reps</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {getPhaseGuidelines().intensity.min}-{getPhaseGuidelines().intensity.max}%
              </div>
              <div className="text-sm text-gray-600">Intensity</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {getPhaseGuidelines().rpe.min}-{getPhaseGuidelines().rpe.max}
              </div>
              <div className="text-sm text-gray-600">RPE</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exercise Progress */}
      <div className="space-y-4">
        {exerciseProgress.map((exercise) => (
          <Card key={exercise.exerciseId} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{exercise.exerciseName}</CardTitle>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Last: {new Date(exercise.lastSessionDate).toLocaleDateString()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Current Performance */}
                <div>
                  <h4 className="font-semibold mb-3">Current Performance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Weight:</span>
                      <span className="font-medium">{exercise.currentWeight} lbs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reps:</span>
                      <span className="font-medium">{exercise.currentReps}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sets:</span>
                      <span className="font-medium">{exercise.currentSets}</span>
                    </div>
                  </div>
                </div>

                {/* Progression History */}
                <div>
                  <h4 className="font-semibold mb-3">Recent Progress</h4>
                  <div className="space-y-2">
                    {exercise.progressionHistory.slice(-3).map((entry, index) => (
                      <div key={index} className="text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            {new Date(entry.date).toLocaleDateString()}
                          </span>
                          <span className="font-medium">
                            {entry.weight}lbs × {entry.reps} × {entry.sets}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">RPE: {entry.rpe}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendation */}
                <div>
                  <h4 className="font-semibold mb-3">Next Session Recommendation</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {getProgressionIcon(exercise.recommendedProgression.type)}
                      <span className="font-medium">
                        {exercise.recommendedProgression.type}
                      </span>
                      <Badge className={getConfidenceColor(exercise.recommendedProgression.confidence)}>
                        {exercise.recommendedProgression.confidence}
                      </Badge>
                    </div>
                    
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">
                        {exercise.recommendedProgression.recommendedValue}
                        {exercise.recommendedProgression.type === 'WEIGHT' && ' lbs'}
                        {exercise.recommendedProgression.type === 'REPS' && ' reps'}
                        {exercise.recommendedProgression.type === 'SETS' && ' sets'}
                      </div>
                      <div className="text-sm text-blue-600">
                        +{exercise.recommendedProgression.increase} 
                        ({exercise.recommendedProgression.percentage.toFixed(1)}%)
                      </div>
                    </div>

                    <div className="text-sm text-gray-600">
                      {exercise.recommendedProgression.reason}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {new Date(exercise.recommendedProgression.nextSessionDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle>Progression Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Progression Aggressiveness
                </label>
                <select className="w-full p-2 border rounded-md" defaultValue="moderate">
                  <option value="conservative">Conservative</option>
                  <option value="moderate">Moderate</option>
                  <option value="aggressive">Aggressive</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Minimum Sessions Before Progression
                </label>
                <input 
                  type="number" 
                  min="1" 
                  max="10" 
                  defaultValue="2"
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  RPE Threshold for Weight Increase
                </label>
                <input 
                  type="number" 
                  min="6" 
                  max="10" 
                  defaultValue="7"
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div className="flex gap-2">
                <Button>Save Settings</Button>
                <Button variant="outline" onClick={() => setShowSettings(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 