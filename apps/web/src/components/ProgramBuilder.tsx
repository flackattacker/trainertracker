'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Badge } from '@repo/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { 
  Search, 
  Play, 
  Plus, 
  Dumbbell, 
  Target, 
  Users,
  Trash2,
  Save,
  Calendar,
  Clock,
  TrendingUp,
  Zap,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Bot,
  MessageSquare,
  User,
  Sparkles,
  Edit3,
  FileText
} from 'lucide-react';

interface Client {
  id: string;
  codeName: string;
  firstName: string;
  lastName: string;
  status: string;
  dateOfBirth: string;
  gender: string;
}

interface Exercise {
  id: string;
  name: string;
  description: string;
  category: {
    id: string;
    name: string;
  };
  muscleGroups: string[];
  equipment: string[];
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  instructions: string;
  videoUrl?: string;
  imageUrl?: string;
}

interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exercise: Exercise;
  sets: number;
  reps?: number;
  weight?: number;
  duration?: number;
  distance?: number;
  restTime?: number;
  tempo?: string;
  rpe?: number;
  notes?: string;
  order: number;
}

interface WorkoutDay {
  id: string;
  name: string;
  exercises: WorkoutExercise[];
  notes?: string;
}

interface Program {
  id?: string;
  name: string;
  description?: string;
  goal: string;
  experienceLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  duration: number;
  workouts: WorkoutDay[];
  notes?: string;
  clientId?: string;
  startDate?: string;
  endDate?: string;
  optPhase?: string;
  primaryGoal?: string;
  secondaryGoals?: string;
  aiGenerated?: boolean;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const ProgramBuilder: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [program, setProgram] = useState<Program | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [showSuccess, setShowSuccess] = useState(false);
  const [aiAdjustmentPrompt, setAiAdjustmentPrompt] = useState('');
  const [showAiAdjustment, setShowAiAdjustment] = useState(false);
  const [draggedExercise, setDraggedExercise] = useState<Exercise | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedWorkoutDay, setSelectedWorkoutDay] = useState<string | null>(null);

  // Program form state
  const [programForm, setProgramForm] = useState({
    clientId: '',
    programName: '',
    startDate: '',
    endDate: '',
    optPhase: 'STABILIZATION_ENDURANCE' as const,
    primaryGoal: '',
    secondaryGoals: '',
    notes: '',
    experienceLevel: 'BEGINNER' as const,
    duration: 12
  });

  useEffect(() => {
    fetchClients();
    fetchExercises();
    fetchCategories();
  }, []);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('trainer-tracker-token');
      const response = await fetch(`${API_BASE}/api/clients`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchExercises = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedDifficulty && selectedDifficulty !== 'all') params.append('difficulty', selectedDifficulty);
      if (selectedMuscleGroup && selectedMuscleGroup !== 'all') params.append('muscleGroup', selectedMuscleGroup);
      if (selectedEquipment && selectedEquipment !== 'all') params.append('equipment', selectedEquipment);

      const response = await fetch(`${API_BASE}/api/exercises?${params}`);
      if (response.ok) {
        const data = await response.json();
        setExercises(data);
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/exercise-categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const generateAiProgram = async () => {
    if (!programForm.clientId || !programForm.primaryGoal) {
      setAiError('Please select a client and enter a primary goal before generating a program.');
      return;
    }

    setAiGenerating(true);
    setAiError(null);

    try {
      const token = localStorage.getItem('trainer-tracker-token');
      const response = await fetch(`${API_BASE}/api/programs/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          clientId: programForm.clientId,
          primaryGoal: programForm.primaryGoal,
          secondaryGoals: programForm.secondaryGoals,
          optPhase: programForm.optPhase,
          experienceLevel: programForm.experienceLevel,
          duration: programForm.duration,
          notes: programForm.notes
        }),
      });

      if (response.ok) {
        const generatedProgram = await response.json();
        setProgram(generatedProgram);
        setCurrentStep(2);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        const errorData = await response.json();
        setAiError(errorData.error || 'Failed to generate program');
      }
    } catch (error) {
      console.error('Error generating program:', error);
      setAiError('Failed to generate program. Please try again.');
    } finally {
      setAiGenerating(false);
    }
  };

  const adjustProgramWithAi = async () => {
    if (!program || !aiAdjustmentPrompt.trim()) return;

    setAiGenerating(true);
    setAiError(null);

    try {
      const token = localStorage.getItem('trainer-tracker-token');
      const response = await fetch(`${API_BASE}/api/programs/adjust`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          programId: program.id,
          adjustmentPrompt: aiAdjustmentPrompt,
        }),
      });

      if (response.ok) {
        const adjustedProgram = await response.json();
        setProgram(adjustedProgram);
        setShowAiAdjustment(false);
        setAiAdjustmentPrompt('');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        const errorData = await response.json();
        setAiError(errorData.error || 'Failed to adjust program');
      }
    } catch (error) {
      console.error('Error adjusting program:', error);
      setAiError('Failed to adjust program. Please try again.');
    } finally {
      setAiGenerating(false);
    }
  };

  const saveProgram = async () => {
    if (!program) return;

    try {
      const token = localStorage.getItem('trainer-tracker-token');
      const response = await fetch(`${API_BASE}/api/programs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...program,
          clientId: programForm.clientId,
          startDate: programForm.startDate,
          endDate: programForm.endDate,
        }),
      });

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        const errorData = await response.json();
        setAiError(errorData.error || 'Failed to save program');
      }
    } catch (error) {
      console.error('Error saving program:', error);
      setAiError('Failed to save program. Please try again.');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER': return 'bg-green-100 text-green-800';
      case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800';
      case 'ADVANCED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGoalColor = (goal: string) => {
    const goalLower = goal.toLowerCase();
    if (goalLower.includes('strength')) return 'bg-blue-100 text-blue-800';
    if (goalLower.includes('endurance')) return 'bg-green-100 text-green-800';
    if (goalLower.includes('weight loss')) return 'bg-purple-100 text-purple-800';
    if (goalLower.includes('muscle')) return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  };

  const handleDragStart = (exercise: Exercise) => {
    setDraggedExercise(exercise);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, workoutDayId: string) => {
    e.preventDefault();
    if (!draggedExercise || !program) return;

    const newWorkoutExercise: WorkoutExercise = {
      id: `exercise-${Date.now()}`,
      exerciseId: draggedExercise.id,
      exercise: draggedExercise,
      sets: 3,
      reps: 10,
      order: 0,
    };

    setProgram(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        workouts: prev.workouts.map(workout => {
          if (workout.id === workoutDayId) {
            return {
              ...workout,
              exercises: [...workout.exercises, newWorkoutExercise],
            };
          }
          return workout;
        }),
      };
    });

    setDraggedExercise(null);
  };

  const removeExercise = (workoutDayId: string, exerciseId: string) => {
    setProgram(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        workouts: prev.workouts.map(workout => {
          if (workout.id === workoutDayId) {
            return {
              ...workout,
              exercises: workout.exercises.filter(ex => ex.id !== exerciseId),
            };
          }
          return workout;
        }),
      };
    });
  };

  const updateExercise = (workoutDayId: string, exerciseId: string, updates: Partial<WorkoutExercise>) => {
    setProgram(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        workouts: prev.workouts.map(workout => {
          if (workout.id === workoutDayId) {
            return {
              ...workout,
              exercises: workout.exercises.map(ex => {
                if (ex.id === exerciseId) {
                  return { ...ex, ...updates };
                }
                return ex;
              }),
            };
          }
          return workout;
        }),
      };
    });
  };

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || exercise.category.name === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || exercise.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--primary-color)' }}></div>
          <p style={{ color: 'var(--text-color)' }}>Loading program builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--bg-primary)', color: 'var(--text-color)' }}>
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--primary-color)' }}>
              AI-Powered Program Builder
            </h1>
            <p style={{ color: 'var(--text-light)' }}>
              Create personalized training programs with AI assistance
            </p>
          </div>
          {showSuccess && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#166534', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
              <CheckCircle className="h-5 w-5" />
              <span>Success!</span>
            </div>
          )}
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[
              { step: 0, title: 'Client & Goals', icon: User },
              { step: 1, title: 'AI Generation', icon: Bot },
              { step: 2, title: 'Review & Edit', icon: Edit3 },
            ].map(({ step, title, icon: Icon }, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-300 text-gray-500'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="ml-2 font-medium" style={{ color: currentStep >= step ? 'var(--primary-color)' : 'var(--text-light)' }}>
                  {title}
                </span>
                {index < 2 && (
                  <div
                    className={`w-16 h-0.5 mx-4 ${
                      currentStep > step ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 0: Client Selection and Goals */}
        {currentStep === 0 && (
          <div className="max-w-2xl mx-auto">
            <Card style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: 'var(--primary-color)' }}>
                  <User className="h-5 w-5" />
                  Select Client & Define Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
                    Select Client *
                  </label>
                  <Select value={programForm.clientId} onValueChange={(value) => setProgramForm(prev => ({ ...prev, clientId: value }))}>
                    <SelectTrigger style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}>
                      <SelectValue placeholder="Choose a client" />
                    </SelectTrigger>
                    <SelectContent style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id} style={{ color: 'var(--text-color)' }}>
                          {client.firstName} {client.lastName} ({client.codeName})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
                    Primary Goal *
                  </label>
                  <Input
                    value={programForm.primaryGoal}
                    onChange={(e) => setProgramForm(prev => ({ ...prev, primaryGoal: e.target.value }))}
                    placeholder="e.g., Improve strength and muscle mass"
                    style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
                    Secondary Goals
                  </label>
                  <Input
                    value={programForm.secondaryGoals}
                    onChange={(e) => setProgramForm(prev => ({ ...prev, secondaryGoals: e.target.value }))}
                    placeholder="e.g., Improve endurance and flexibility"
                    style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
                      OPT Phase
                    </label>
                    <Select value={programForm.optPhase} onValueChange={(value) => setProgramForm(prev => ({ ...prev, optPhase: value as any }))}>
                      <SelectTrigger style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                        <SelectItem value="STABILIZATION_ENDURANCE" style={{ color: 'var(--text-color)' }}>Stabilization Endurance</SelectItem>
                        <SelectItem value="STRENGTH_ENDURANCE" style={{ color: 'var(--text-color)' }}>Strength Endurance</SelectItem>
                        <SelectItem value="HYPERTROPHY" style={{ color: 'var(--text-color)' }}>Hypertrophy</SelectItem>
                        <SelectItem value="MAXIMAL_STRENGTH" style={{ color: 'var(--text-color)' }}>Maximal Strength</SelectItem>
                        <SelectItem value="POWER" style={{ color: 'var(--text-color)' }}>Power</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
                      Experience Level
                    </label>
                    <Select value={programForm.experienceLevel} onValueChange={(value) => setProgramForm(prev => ({ ...prev, experienceLevel: value as any }))}>
                      <SelectTrigger style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                        <SelectItem value="BEGINNER" style={{ color: 'var(--text-color)' }}>Beginner</SelectItem>
                        <SelectItem value="INTERMEDIATE" style={{ color: 'var(--text-color)' }}>Intermediate</SelectItem>
                        <SelectItem value="ADVANCED" style={{ color: 'var(--text-color)' }}>Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
                    Program Duration (weeks)
                  </label>
                  <Input
                    type="number"
                    value={programForm.duration}
                    onChange={(e) => setProgramForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 12 }))}
                    min="4"
                    max="52"
                    style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
                    Additional Notes
                  </label>
                  <textarea
                    value={programForm.notes}
                    onChange={(e) => setProgramForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any specific requirements, injuries, or preferences..."
                    rows={3}
                    className="w-full p-3 rounded-md resize-none"
                    style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}
                  />
                </div>

                <Button
                  onClick={() => setCurrentStep(1)}
                  disabled={!programForm.clientId || !programForm.primaryGoal}
                  className="w-full flex items-center justify-center gap-2"
                  style={{ background: 'var(--primary-color)', color: 'var(--bg-primary)' }}
                >
                  <ArrowRight className="h-4 w-4" />
                  Continue to AI Generation
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 1: AI Generation */}
        {currentStep === 1 && (
          <div className="max-w-2xl mx-auto">
            <Card style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: 'var(--primary-color)' }}>
                  <Bot className="h-5 w-4" />
                  Generate Program with AI
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center p-6 rounded-lg" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                  <Bot className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--primary-color)' }} />
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-color)' }}>
                    Ready to Generate Your Program
                  </h3>
                  <p style={{ color: 'var(--text-light)' }}>
                    Our AI will create a personalized {programForm.duration}-week program based on your client's goals and experience level.
                  </p>
                </div>

                {aiError && (
                  <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <AlertCircle className="h-5 w-5" />
                    <span>{aiError}</span>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={() => setCurrentStep(0)}
                    variant="outline"
                    className="flex-1"
                    style={{ border: '1px solid var(--border-color)', color: 'var(--text-color)' }}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={generateAiProgram}
                    disabled={aiGenerating}
                    className="flex-1 flex items-center justify-center gap-2"
                    style={{ background: 'var(--primary-color)', color: 'var(--bg-primary)' }}
                  >
                    {aiGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Generate Program
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Review and Edit */}
        {currentStep === 2 && program && (
          <div className="space-y-6">
            {/* Program Overview */}
            <Card style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between" style={{ color: 'var(--primary-color)' }}>
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Program Overview
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowAiAdjustment(true)}
                      variant="outline"
                      className="flex items-center gap-2"
                      style={{ border: '1px solid var(--border-color)', color: 'var(--text-color)' }}
                    >
                      <Sparkles className="h-4 w-4" />
                      Adjust with AI
                    </Button>
                    <Button
                      onClick={saveProgram}
                      className="flex items-center gap-2"
                      style={{ background: 'var(--primary-color)', color: 'var(--bg-primary)' }}
                    >
                      <Save className="h-4 w-4" />
                      Save Program
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                    <h4 className="font-semibold mb-2" style={{ color: 'var(--text-color)' }}>Program Name</h4>
                    <p style={{ color: 'var(--text-light)' }}>{program.name}</p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                    <h4 className="font-semibold mb-2" style={{ color: 'var(--text-color)' }}>Primary Goal</h4>
                    <Badge className={getGoalColor(program.primaryGoal || '')}>
                      {program.primaryGoal}
                    </Badge>
                  </div>
                  <div className="p-4 rounded-lg" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                    <h4 className="font-semibold mb-2" style={{ color: 'var(--text-color)' }}>Duration</h4>
                    <p style={{ color: 'var(--text-light)' }}>{program.duration} weeks</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Exercise Library */}
              <Card style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ color: 'var(--primary-color)' }}>
                    <Dumbbell className="h-5 w-5" />
                    Exercise Library
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Input
                      placeholder="Search exercises..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                      style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}
                    />

                    <div className="flex flex-wrap gap-2">
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-32" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                          <SelectItem value="all" style={{ color: 'var(--text-color)' }}>All Categories</SelectItem>
                          {categories.map(category => (
                            <SelectItem key={category.id} value={category.name} style={{ color: 'var(--text-color)' }}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                        <SelectTrigger className="w-32" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                          <SelectItem value="all" style={{ color: 'var(--text-color)' }}>All Levels</SelectItem>
                          <SelectItem value="BEGINNER" style={{ color: 'var(--text-color)' }}>Beginner</SelectItem>
                          <SelectItem value="INTERMEDIATE" style={{ color: 'var(--text-color)' }}>Intermediate</SelectItem>
                          <SelectItem value="ADVANCED" style={{ color: 'var(--text-color)' }}>Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="max-h-96 overflow-y-auto space-y-2">
                      {filteredExercises.map(exercise => (
                        <div
                          key={exercise.id}
                          draggable
                          onDragStart={() => handleDragStart(exercise)}
                          className="p-3 border rounded-md cursor-move hover:bg-gray-50"
                          style={{ 
                            border: '1px solid var(--border-color)', 
                            background: 'var(--bg-primary)',
                            color: 'var(--text-color)'
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-sm" style={{ color: 'var(--text-color)' }}>{exercise.name}</h4>
                              <p className="text-xs" style={{ color: 'var(--text-light)' }}>{exercise.category.name}</p>
                            </div>
                            <Badge className={getDifficultyColor(exercise.difficulty)}>
                              {exercise.difficulty}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Workout Builder */}
              <div className="lg:col-span-2">
                <Card style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2" style={{ color: 'var(--primary-color)' }}>
                      <Calendar className="h-5 w-5" />
                      Workout Builder
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {program.workouts.map(workout => {
                        // Ensure workout has required properties
                        if (!workout || !workout.id || !workout.name) {
                          return null;
                        }
                        
                        const exercises = workout.exercises || [];
                        
                        return (
                          <div
                            key={workout.id}
                            className={`p-4 border-2 border-dashed rounded-lg min-h-48 ${
                              selectedWorkoutDay === workout.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                            style={{ 
                              background: selectedWorkoutDay === workout.id ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-primary)',
                              border: `2px dashed ${selectedWorkoutDay === workout.id ? 'var(--primary-color)' : 'var(--border-color)'}`
                            }}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, workout.id)}
                            onClick={() => setSelectedWorkoutDay(workout.id)}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-semibold" style={{ color: 'var(--text-color)' }}>{workout.name}</h3>
                              <Badge variant="secondary" style={{ background: 'var(--bg-secondary)', color: 'var(--text-color)' }}>
                                {exercises.length} exercises
                              </Badge>
                            </div>

                            <div className="space-y-2">
                              {exercises.map(exercise => {
                                // Ensure exercise has required properties
                                if (!exercise || !exercise.id || !exercise.exercise) {
                                  return null;
                                }
                                
                                return (
                                  <div
                                    key={exercise.id}
                                    className="p-2 border rounded text-sm"
                                    style={{ 
                                      background: 'var(--bg-secondary)', 
                                      border: '1px solid var(--border-color)',
                                      color: 'var(--text-color)'
                                    }}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium" style={{ color: 'var(--text-color)' }}>{exercise.exercise.name}</span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeExercise(workout.id, exercise.id)}
                                        className="h-6 w-6 p-0"
                                        style={{ color: 'var(--text-color)' }}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                    <div className="text-xs mt-1" style={{ color: 'var(--text-light)' }}>
                                      {exercise.sets} sets × {exercise.reps} reps
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {exercises.length === 0 && (
                              <div className="text-center text-sm py-8" style={{ color: 'var(--text-light)' }}>
                                Drag exercises here
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Adjustment Modal */}
      {showAiAdjustment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="rounded-lg p-6 w-full max-w-md" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-color)' }}>Adjust Program with AI</h3>
            <textarea
              value={aiAdjustmentPrompt}
              onChange={(e) => setAiAdjustmentPrompt(e.target.value)}
              placeholder="Describe how you'd like to adjust the program..."
              className="w-full p-3 border rounded-md mb-4"
              style={{ 
                background: 'var(--bg-secondary)', 
                border: '1px solid var(--border-color)', 
                color: 'var(--text-color)' 
              }}
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowAiAdjustment(false)}
                disabled={aiGenerating}
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-color)', border: '1px solid var(--border-color)' }}
              >
                Cancel
              </Button>
              <Button
                onClick={adjustProgramWithAi}
                disabled={aiGenerating || !aiAdjustmentPrompt.trim()}
                className="flex items-center gap-2"
                style={{ background: 'var(--primary-color)', color: 'var(--bg-primary)' }}
              >
                {aiGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Adjusting...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Adjust
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramBuilder; 