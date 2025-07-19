'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { Badge } from '@repo/ui/badge';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Save, CheckCircle, XCircle } from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
}

interface ProgramExercise {
  id: string;
  exerciseId: string;
  exercise: Exercise;
  sets: number;
  reps: number;
  restTime: number;
  tempo: string;
  rpe: number;
  notes: string;
  order: number;
}

interface Workout {
  id: string;
  name: string;
  exercises: ProgramExercise[];
}

interface SetPerformance {
  setNumber: number;
  weight: number;
  reps: number;
  rpe: number;
  tempo: string;
  notes: string;
  completed: boolean;
}

interface ExercisePerformance {
  exerciseId: string;
  exerciseName: string;
  plannedSets: number;
  plannedReps: number;
  plannedWeight?: number;
  sets: SetPerformance[];
  notes: string;
  completed: boolean;
}

interface SessionWorkoutEntryProps {
  programId: string;
  clientId: string;
  workoutId?: string; // Make optional
  token?: string; // Add token prop
  onSave: (sessionData: any) => void;
  onCancel: () => void;
}

export default function SessionWorkoutEntry({ 
  programId, 
  clientId, 
  workoutId, 
  token, 
  onSave, 
  onCancel 
}: SessionWorkoutEntryProps) {
  const [program, setProgram] = useState<any>(null);
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string>(workoutId || '');
  const [exercisePerformances, setExercisePerformances] = useState<ExercisePerformance[]>([]);
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionNotes, setSessionNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProgramData();
  }, [programId]);

  useEffect(() => {
    if (selectedWorkoutId && program) {
      const selectedWorkout = program.data?.workouts?.find((w: any) => w.id === selectedWorkoutId);
      if (selectedWorkout) {
        setWorkout(selectedWorkout);
        initializeExercisePerformances(selectedWorkout);
      }
    }
  }, [selectedWorkoutId, program]);

  const fetchProgramData = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      // Get authentication token from props or localStorage
      let authToken = token;
      if (!authToken) {
        authToken = localStorage.getItem('trainer-tracker-token') || undefined;
        if (!authToken) {
          authToken = localStorage.getItem('token') || undefined;
        }
      }
      
      if (!authToken) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${baseUrl}/api/programs/${programId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch program data');
      }

      const programData = await response.json();
      setProgram(programData);

      // If a specific workoutId was provided, select it
      if (workoutId) {
        setSelectedWorkoutId(workoutId);
      }
    } catch (error) {
      console.error('Error fetching program data:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeExercisePerformances = (selectedWorkout: Workout) => {
    const performances: ExercisePerformance[] = selectedWorkout.exercises.map((exercise: ProgramExercise) => ({
      exerciseId: exercise.exerciseId,
      exerciseName: exercise.exercise.name,
      plannedSets: exercise.sets,
      plannedReps: exercise.reps,
      plannedWeight: 0,
      sets: Array.from({ length: exercise.sets }, (_, index) => ({
        setNumber: index + 1,
        weight: 0,
        reps: exercise.reps,
        rpe: exercise.rpe,
        tempo: exercise.tempo,
        notes: '',
        completed: false,
      })),
      notes: exercise.notes,
      completed: false,
    }));

    setExercisePerformances(performances);
  };

  const updateSetPerformance = (exerciseIndex: number, setIndex: number, field: keyof SetPerformance, value: any) => {
    const updatedPerformances = [...exercisePerformances];
    if (updatedPerformances[exerciseIndex] && updatedPerformances[exerciseIndex].sets[setIndex]) {
      updatedPerformances[exerciseIndex].sets[setIndex] = {
        ...updatedPerformances[exerciseIndex].sets[setIndex],
        [field]: value,
      };
      setExercisePerformances(updatedPerformances);
    }
  };

  const toggleExerciseCompleted = (exerciseIndex: number) => {
    const updatedPerformances = [...exercisePerformances];
    if (updatedPerformances[exerciseIndex]) {
      updatedPerformances[exerciseIndex].completed = !updatedPerformances[exerciseIndex].completed;
      setExercisePerformances(updatedPerformances);
    }
  };

  const toggleSetCompleted = (exerciseIndex: number, setIndex: number) => {
    const updatedPerformances = [...exercisePerformances];
    if (updatedPerformances[exerciseIndex] && updatedPerformances[exerciseIndex].sets[setIndex]) {
      updatedPerformances[exerciseIndex].sets[setIndex].completed = 
        !updatedPerformances[exerciseIndex].sets[setIndex].completed;
      setExercisePerformances(updatedPerformances);
    }
  };

  const handleSave = async () => {
    if (!selectedWorkoutId || !workout) {
      alert('Please select a workout first');
      return;
    }

    try {
      setSaving(true);
      
      const sessionData = {
        programId,
        clientId,
        workoutId: selectedWorkoutId,
        sessionDate,
        sessionNotes,
        exercisePerformances,
        completed: exercisePerformances.every(ep => ep.completed),
        totalExercises: exercisePerformances.length,
        completedExercises: exercisePerformances.filter(ep => ep.completed).length,
      };

      onSave(sessionData);
    } catch (error) {
      console.error('Error saving session:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading program data...</p>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-red-600">Program not found</p>
      </div>
    );
  }

  const availableWorkouts = program.data?.workouts || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Record Workout Session</h2>
          <p className="text-gray-600">Program: {program.programName}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !selectedWorkoutId}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Session'}
          </Button>
        </div>
      </div>

      {/* Workout Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Workout</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Choose Workout</label>
              <Select value={selectedWorkoutId} onValueChange={setSelectedWorkoutId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a workout to record" />
                </SelectTrigger>
                <SelectContent>
                  {availableWorkouts.map((workout: any) => (
                    <SelectItem key={workout.id} value={workout.id}>
                      {workout.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Details */}
      <Card>
        <CardHeader>
          <CardTitle>Session Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Session Date</label>
              <Input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Session Notes</label>
              <textarea
                placeholder="Overall session notes..."
                value={sessionNotes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSessionNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exercise Performance */}
      {workout && (
        <div className="space-y-4">
          {exercisePerformances.map((exercise, exerciseIndex) => (
            <Card key={exercise.exerciseId}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExerciseCompleted(exerciseIndex)}
                      className={exercise.completed ? 'text-green-600' : 'text-gray-600'}
                    >
                      <CheckCircle className="h-5 w-5" />
                    </Button>
                    <CardTitle className="text-lg">{exercise.exerciseName}</CardTitle>
                    <Badge variant={exercise.completed ? 'default' : 'secondary'}>
                      {exercise.completed ? 'Completed' : 'In Progress'}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    {exercise.plannedSets} sets × {exercise.plannedReps} reps
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Sets */}
                  <div className="space-y-3">
                    <h4 className="font-semibold">Sets</h4>
                    
                    {/* Column Headers */}
                    <div className="grid grid-cols-12 gap-2 items-center p-2 bg-gray-100 rounded-lg text-xs font-medium text-gray-700">
                      <div className="col-span-1 text-center">Done</div>
                      <div className="col-span-2 text-center">Set</div>
                      <div className="col-span-2 text-center">Weight (lbs)</div>
                      <div className="col-span-2 text-center">Reps</div>
                      <div className="col-span-2 text-center">RPE</div>
                      <div className="col-span-2 text-center">Tempo</div>
                      <div className="col-span-1 text-center">Notes</div>
                    </div>
                    
                    {exercise.sets.map((set, setIndex) => (
                      <div key={setIndex} className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 rounded-lg">
                        <div className="col-span-1 flex justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSetCompleted(exerciseIndex, setIndex)}
                            className={set.completed ? 'text-green-600' : 'text-gray-600'}
                            title={set.completed ? 'Mark as incomplete' : 'Mark as complete'}
                          >
                            {set.completed ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                          </Button>
                        </div>
                        <div className="col-span-2 text-sm font-medium text-center">Set {set.setNumber}</div>
                        <div className="col-span-2">
                          <div className="text-xs text-gray-600 mb-1">Weight (lbs)</div>
                          <Input
                            type="number"
                            placeholder="0"
                            value={set.weight}
                            onChange={(e) => updateSetPerformance(exerciseIndex, setIndex, 'weight', parseFloat(e.target.value) || 0)}
                            className="text-sm"
                          />
                        </div>
                        <div className="col-span-2">
                          <div className="text-xs text-gray-600 mb-1">Reps</div>
                          <Input
                            type="number"
                            placeholder="0"
                            value={set.reps}
                            onChange={(e) => updateSetPerformance(exerciseIndex, setIndex, 'reps', parseInt(e.target.value) || 0)}
                            className="text-sm"
                          />
                        </div>
                        <div className="col-span-2">
                          <div className="text-xs text-gray-600 mb-1">RPE (1-10)</div>
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            placeholder="7"
                            value={set.rpe}
                            onChange={(e) => updateSetPerformance(exerciseIndex, setIndex, 'rpe', parseInt(e.target.value) || 0)}
                            className="text-sm"
                          />
                        </div>
                        <div className="col-span-2">
                          <div className="text-xs text-gray-600 mb-1">Tempo (e.g., 2-1-2)</div>
                          <Input
                            placeholder="2-1-2"
                            value={set.tempo}
                            onChange={(e) => updateSetPerformance(exerciseIndex, setIndex, 'tempo', e.target.value)}
                            className="text-sm"
                          />
                        </div>
                        <div className="col-span-1">
                          <div className="text-xs text-gray-600 mb-1">Notes</div>
                          <Input
                            placeholder="..."
                            value={set.notes}
                            onChange={(e) => updateSetPerformance(exerciseIndex, setIndex, 'notes', e.target.value)}
                            className="text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Exercise Notes */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Exercise Notes</label>
                    <textarea
                      placeholder="Notes for this exercise..."
                      value={exercise.notes}
                                              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                          const updatedPerformances = [...exercisePerformances];
                          if (updatedPerformances[exerciseIndex]) {
                            updatedPerformances[exerciseIndex].notes = e.target.value;
                            setExercisePerformances(updatedPerformances);
                          }
                        }}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!workout && selectedWorkoutId && (
        <div className="flex items-center justify-center p-8">
          <p className="text-red-600">Selected workout not found</p>
        </div>
      )}
    </div>
  );
} 