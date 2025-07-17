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
  FileText,
  X
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
  programName?: string; // Add this field to match database schema
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
  const [existingPrograms, setExistingPrograms] = useState<any[]>([]);
  const [showLoadProgramModal, setShowLoadProgramModal] = useState(false);
  const [loadingExistingPrograms, setLoadingExistingPrograms] = useState(false);

  // Program form state
  const [programForm, setProgramForm] = useState({
    clientId: '',
    programName: '',
    clientAge: '',
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

  // Fetch existing programs when client is selected
  useEffect(() => {
    if (programForm.clientId) {
      fetchExistingPrograms(programForm.clientId);
    } else {
      setExistingPrograms([]);
    }
  }, [programForm.clientId]);

  const fetchClients = async () => {
    try {
      let token = localStorage.getItem('trainer-tracker-token');
      if (!token) {
        token = localStorage.getItem('token');
      }
      if (!token) {
        console.error('No auth token found');
        setClients([]);
        return;
      }
      const response = await fetch(`${API_BASE}/api/clients`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      } else {
        const errorText = await response.text();
        console.error('Error fetching clients:', response.status, errorText);
        setClients([]);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      setClients([]);
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

  const fetchExistingPrograms = async (clientId: string) => {
    setLoadingExistingPrograms(true);
    try {
      let token = localStorage.getItem('trainer-tracker-token');
      if (!token) {
        token = localStorage.getItem('token');
      }
      const response = await fetch(`${API_BASE}/api/programs?clientId=${clientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setExistingPrograms(data);
      } else {
        console.error('Error fetching existing programs:', response.status);
        setExistingPrograms([]);
      }
    } catch (error) {
      console.error('Error fetching existing programs:', error);
      setExistingPrograms([]);
    } finally {
      setLoadingExistingPrograms(false);
    }
  };

  const loadExistingProgram = async (programId: string) => {
    try {
      let token = localStorage.getItem('trainer-tracker-token');
      if (!token) {
        token = localStorage.getItem('token');
      }
      const response = await fetch(`${API_BASE}/api/programs/${programId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const existingProgram = await response.json();
        
        // Transform the existing program to match our Program interface
        const transformedProgram: Program = {
          id: existingProgram.id,
          name: existingProgram.programName,
          description: existingProgram.secondaryGoals,
          goal: existingProgram.primaryGoal,
          experienceLevel: existingProgram.data?.experienceLevel || 'BEGINNER',
          duration: existingProgram.data?.duration || 12,
          optPhase: existingProgram.optPhase,
          primaryGoal: existingProgram.primaryGoal,
          secondaryGoals: existingProgram.secondaryGoals,
          notes: existingProgram.notes,
          clientId: existingProgram.clientId,
          startDate: existingProgram.startDate,
          endDate: existingProgram.endDate,
          workouts: existingProgram.data?.workouts || []
        };
        
        setProgram(transformedProgram);
        setCurrentStep(2);
        setShowLoadProgramModal(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        console.error('Error loading existing program:', response.status);
      }
    } catch (error) {
      console.error('Error loading existing program:', error);
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
      let token = localStorage.getItem('trainer-tracker-token');
      if (!token) {
        token = localStorage.getItem('token');
      }
      
      // Debug: Log what we're sending to the backend
      const requestBody = {
        clientId: programForm.clientId,
        programName: programForm.programName,
        clientAge: parseInt(programForm.clientAge),
        primaryGoal: programForm.primaryGoal,
        secondaryGoals: programForm.secondaryGoals,
        optPhase: programForm.optPhase,
        experienceLevel: programForm.experienceLevel,
        duration: programForm.duration,
        notes: programForm.notes
      };
      console.log('Frontend: Sending request to backend:', requestBody);
      
      const response = await fetch(`${API_BASE}/api/programs/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const generatedProgram = await response.json();
        setProgram(generatedProgram.program); // Fix: use the .program property
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

    // Check if program has an ID
    if (!program.id) {
      setAiError('Program must be saved before it can be adjusted with AI. Please save the program first.');
      return;
    }

    setAiGenerating(true);
    setAiError(null);

    try {
      // Try multiple token keys
      let token = localStorage.getItem('trainer-tracker-token');
      if (!token) {
        token = localStorage.getItem('token');
      }
      
      if (!token) {
        setAiError('Authentication token not found. Please log in through the trainer portal first.');
        return;
      }
      
      console.log('Debug - Making request to:', `${API_BASE}/api/programs/adjust`);
      console.log('Debug - Request headers:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token ? 'Present' : 'Missing'}`,
      });
      console.log('Debug - Request body:', {
        programId: program.id,
        adjustment: aiAdjustmentPrompt,
      });
      
      const response = await fetch(`${API_BASE}/api/programs/adjust`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          programId: program.id,
          adjustment: aiAdjustmentPrompt,
        }),
      });
      
      console.log('Debug - Response status:', response.status);
      console.log('Debug - Response ok:', response.ok);

      if (response.ok) {
        const adjustedProgram = await response.json();
        console.log('Received adjusted program:', adjustedProgram);
        
        // Map the adjusted program to ensure proper field names for frontend
        const mappedProgram = adjustedProgram.program || adjustedProgram;
        if (mappedProgram.programName && !mappedProgram.name) {
          mappedProgram.name = mappedProgram.programName;
        }
        
        setProgram(mappedProgram);
        setShowAiAdjustment(false);
        setAiAdjustmentPrompt('');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        const errorData = await response.json();
        console.error('Adjust API error:', errorData);
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
      let token = localStorage.getItem('trainer-tracker-token');
      if (!token) {
        token = localStorage.getItem('token');
      }
      const response = await fetch(`${API_BASE}/api/programs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...program,
          name: program.name || program.programName || programForm.programName || 'Untitled Program',
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
    <div className="min-h-screen p-6 bg-background text-foreground">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-primary">
              AI-Powered Program Builder
            </h1>
            <p className="text-muted-foreground">
              Create personalized training programs with AI assistance
            </p>
          </div>
          {showSuccess && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 text-green-800 border border-green-200">
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
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-muted-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className={`ml-2 font-medium ${currentStep >= step ? 'text-primary' : 'text-muted-foreground'}`}>
                  {title}
                </span>
                {index < 2 && (
                  <div
                    className={`w-16 h-0.5 mx-4 ${
                      currentStep > step ? 'bg-primary' : 'bg-border'
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <User className="h-5 w-5" />
                  Select Client & Define Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Program Name *
                  </label>
                  <Input
                    value={programForm.programName}
                    onChange={(e) => setProgramForm(prev => ({ ...prev, programName: e.target.value }))}
                    placeholder="e.g., 12-Week Strength Program"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Select Client *
                  </label>
                  <Select value={programForm.clientId} onValueChange={(value) => setProgramForm(prev => ({ ...prev, clientId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.length === 0 ? (
                        <SelectItem value="no-clients" disabled>
                          No clients found
                        </SelectItem>
                      ) : (
                        clients.map(client => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.firstName} {client.lastName} ({client.codeName})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Load Existing Program Section */}
                {programForm.clientId && existingPrograms.length > 0 && (
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-blue-900">
                        Existing Programs for {clients.find(c => c.id === programForm.clientId)?.firstName} {clients.find(c => c.id === programForm.clientId)?.lastName}
                      </h3>
                      <Button
                        onClick={() => setShowLoadProgramModal(true)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        style={{
                          backgroundColor: 'transparent',
                          color: '#1e40af',
                          border: '1px solid #1e40af',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '0.375rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#1e40af';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#1e40af';
                        }}
                      >
                        <FileText className="h-3 w-3" />
                        Load Existing Program
                      </Button>
                    </div>
                    <p className="text-xs text-blue-700 mb-2">
                      This client has {existingPrograms.length} existing program{existingPrograms.length !== 1 ? 's' : ''}. 
                      You can load and edit an existing program instead of creating a new one.
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Client Age *
                  </label>
                  <Input
                    type="number"
                    value={programForm.clientAge}
                    onChange={(e) => setProgramForm(prev => ({ ...prev, clientAge: e.target.value }))}
                    placeholder="e.g., 25"
                    min="13"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Primary Goal *
                  </label>
                  <Input
                    value={programForm.primaryGoal}
                    onChange={(e) => setProgramForm(prev => ({ ...prev, primaryGoal: e.target.value }))}
                    placeholder="e.g., Improve strength and muscle mass"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Secondary Goals
                  </label>
                  <Input
                    value={programForm.secondaryGoals}
                    onChange={(e) => setProgramForm(prev => ({ ...prev, secondaryGoals: e.target.value }))}
                    placeholder="e.g., Improve endurance and flexibility"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      OPT Phase
                    </label>
                    <Select value={programForm.optPhase} onValueChange={(value) => setProgramForm(prev => ({ ...prev, optPhase: value as any }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STABILIZATION_ENDURANCE">Stabilization Endurance</SelectItem>
                        <SelectItem value="STRENGTH_ENDURANCE">Strength Endurance</SelectItem>
                        <SelectItem value="MUSCULAR_DEVELOPMENT">Muscular Development</SelectItem>
                        <SelectItem value="MAXIMAL_STRENGTH">Maximal Strength</SelectItem>
                        <SelectItem value="POWER">Power</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Experience Level
                    </label>
                    <Select value={programForm.experienceLevel} onValueChange={(value) => setProgramForm(prev => ({ ...prev, experienceLevel: value as any }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BEGINNER">Beginner</SelectItem>
                        <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                        <SelectItem value="ADVANCED">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Program Duration (weeks)
                  </label>
                  <Input
                    type="number"
                    value={programForm.duration}
                    onChange={(e) => setProgramForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 12 }))}
                    min="4"
                    max="52"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={programForm.notes}
                    onChange={(e) => setProgramForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any specific requirements, injuries, or preferences..."
                    rows={3}
                    className="w-full p-3 rounded-md resize-none"
                  />
                </div>

                <Button
                  onClick={() => setCurrentStep(1)}
                  disabled={!programForm.clientId || !programForm.primaryGoal || !programForm.programName || !programForm.clientAge}
                  className="w-full flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: !programForm.clientId || !programForm.primaryGoal || !programForm.programName || !programForm.clientAge 
                      ? '#9ca3af' 
                      : '#5a7c65',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    cursor: !programForm.clientId || !programForm.primaryGoal || !programForm.programName || !programForm.clientAge ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    transform: 'translateY(0)',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    if (!(!programForm.clientId || !programForm.primaryGoal || !programForm.programName || !programForm.clientAge)) {
                      e.currentTarget.style.backgroundColor = '#4a6b55';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(90, 124, 101, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!(!programForm.clientId || !programForm.primaryGoal || !programForm.programName || !programForm.clientAge)) {
                      e.currentTarget.style.backgroundColor = '#5a7c65';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                    }
                  }}
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Bot className="h-5 w-4" />
                  Generate Program with AI
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center p-6 rounded-lg bg-card border border-border">
                  <Bot className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-lg font-semibold mb-2">
                    Ready to Generate Your Program
                  </h3>
                  <p className="text-muted-foreground">
                    Our AI will create a personalized {programForm.duration}-week program based on your client's goals and experience level.
                  </p>
                </div>

                {aiError && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-800 border border-red-200">
                    <AlertCircle className="h-5 w-5" />
                    <span>{aiError}</span>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={() => setCurrentStep(0)}
                    variant="outline"
                    className="flex-1"
                    style={{
                      backgroundColor: 'transparent',
                      color: '#5a7c65',
                      border: '2px solid #5a7c65',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '0.5rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      transform: 'translateY(0)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#5a7c65';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#5a7c65';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={generateAiProgram}
                    disabled={aiGenerating}
                    className="flex-1 flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: aiGenerating ? '#9ca3af' : '#5a7c65',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '0.5rem',
                      fontWeight: '600',
                      cursor: aiGenerating ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      transform: 'translateY(0)',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                      if (!aiGenerating) {
                        e.currentTarget.style.backgroundColor = '#4a6b55';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(90, 124, 101, 0.3)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!aiGenerating) {
                        e.currentTarget.style.backgroundColor = '#5a7c65';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                      }
                    }}
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-primary">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Program Overview
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowAiAdjustment(true)}
                      variant="outline"
                      className="flex items-center gap-2"
                      style={{
                        backgroundColor: 'transparent',
                        color: '#5a7c65',
                        border: '2px solid #5a7c65',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#5a7c65';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#5a7c65';
                      }}
                    >
                      <Sparkles className="h-4 w-4" />
                      Adjust with AI
                    </Button>
                    <Button
                      onClick={saveProgram}
                      className="flex items-center gap-2"
                      style={{
                        backgroundColor: '#5a7c65',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#4a6b55';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(90, 124, 101, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#5a7c65';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                      }}
                    >
                      <Save className="h-4 w-4" />
                      Save Program
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-card border border-border">
                    <h4 className="font-semibold mb-2">Program Name</h4>
                    <p className="text-muted-foreground">{program.name}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-card border border-border">
                    <h4 className="font-semibold mb-2">Primary Goal</h4>
                    <Badge className={getGoalColor(program.primaryGoal || '')}>
                      {program.primaryGoal}
                    </Badge>
                  </div>
                  <div className="p-4 rounded-lg bg-card border border-border">
                    <h4 className="font-semibold mb-2">Duration</h4>
                    <p className="text-muted-foreground">{program.duration} weeks</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Exercise Library */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
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
                    />

                    <div className="flex flex-wrap gap-2">
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.map(category => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          <SelectItem value="BEGINNER">Beginner</SelectItem>
                          <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                          <SelectItem value="ADVANCED">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="max-h-96 overflow-y-auto space-y-2">
                      {filteredExercises.map(exercise => (
                        <div
                          key={exercise.id}
                          draggable
                          onDragStart={() => handleDragStart(exercise)}
                          className="p-3 border rounded-md cursor-move hover:bg-accent transition-all duration-200 bg-card border-border"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-sm">{exercise.name}</h4>
                              <p className="text-xs text-muted-foreground">{exercise.category.name}</p>
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
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-primary">
                      <Calendar className="h-5 w-5" />
                      Workout Builder
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(program.workouts ?? []).map(workout => {
                        // Ensure workout has required properties
                        if (!workout || !workout.id || !workout.name) {
                          return null;
                        }
                        
                        const exercises = workout.exercises || [];
                        
                        return (
                          <div
                            key={workout.id}
                            className={`p-4 border-2 border-dashed rounded-lg min-h-48 transition-all duration-200 ${
                              selectedWorkoutDay === workout.id
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50 bg-card'
                            }`}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, workout.id)}
                            onClick={() => setSelectedWorkoutDay(workout.id)}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-semibold">{workout.name}</h3>
                              <Badge variant="secondary">
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
                                    className="p-2 border rounded text-sm bg-card border-border"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium">{exercise.exercise.name}</span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeExercise(workout.id, exercise.id)}
                                        className="h-6 w-6 p-0"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                    <div className="text-xs mt-1 text-muted-foreground">
                                      {exercise.sets} sets × {exercise.reps} reps
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {exercises.length === 0 && (
                              <div className="text-center text-sm py-8 text-muted-foreground">
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

      {/* Load Existing Program Modal */}
      {showLoadProgramModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="rounded-lg p-6 w-full max-w-2xl bg-card border border-border shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Load Existing Program</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLoadProgramModal(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {loadingExistingPrograms ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: '#5a7c65' }}></div>
                <p>Loading existing programs...</p>
              </div>
            ) : existingPrograms.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No existing programs found for this client.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {existingPrograms.map((existingProgram) => (
                  <div
                    key={existingProgram.id}
                    className="p-4 border rounded-lg hover:bg-accent transition-all duration-200 cursor-pointer bg-card border-border"
                    onClick={() => loadExistingProgram(existingProgram.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{existingProgram.programName}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {existingProgram.primaryGoal}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {existingProgram.optPhase}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {existingProgram.data?.duration || 'Unknown'} weeks
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {existingProgram.data?.workouts?.length || 0} workouts
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(existingProgram.createdAt).toLocaleDateString()}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            loadExistingProgram(existingProgram.id);
                          }}
                          className="flex items-center gap-2"
                          style={{
                            backgroundColor: 'transparent',
                            color: '#5a7c65',
                            border: '1px solid #5a7c65',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '0.375rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#5a7c65';
                            e.currentTarget.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#5a7c65';
                          }}
                        >
                          <Edit3 className="h-3 w-3" />
                          Load & Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                onClick={() => setShowLoadProgramModal(false)}
                style={{
                  backgroundColor: 'transparent',
                  color: '#6b7280',
                  border: '1px solid #d1d5db',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#5a7c65';
                  e.currentTarget.style.color = '#5a7c65';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.color = '#6b7280';
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* AI Adjustment Modal */}
      {showAiAdjustment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="rounded-lg p-6 w-full max-w-md bg-card border border-border shadow-lg">
                          <h3 className="text-lg font-semibold mb-4">Adjust Program with AI</h3>
            <textarea
              value={aiAdjustmentPrompt}
              onChange={(e) => setAiAdjustmentPrompt(e.target.value)}
              placeholder="Describe how you'd like to adjust the program..."
              className="w-full p-3 border rounded-md mb-4"
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowAiAdjustment(false)}
                disabled={aiGenerating}
                style={{
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: '2px solid #d1d5db',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: aiGenerating ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!aiGenerating) {
                    e.currentTarget.style.borderColor = '#5a7c65';
                    e.currentTarget.style.color = '#5a7c65';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!aiGenerating) {
                    e.currentTarget.style.borderColor = '#d1d5db';
                    e.currentTarget.style.color = '#374151';
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={adjustProgramWithAi}
                disabled={aiGenerating || !aiAdjustmentPrompt.trim()}
                className="flex items-center gap-2"
                style={{
                  backgroundColor: aiGenerating || !aiAdjustmentPrompt.trim() ? '#9ca3af' : '#5a7c65',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: aiGenerating || !aiAdjustmentPrompt.trim() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  if (!aiGenerating && aiAdjustmentPrompt.trim()) {
                    e.currentTarget.style.backgroundColor = '#4a6b55';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(90, 124, 101, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!aiGenerating && aiAdjustmentPrompt.trim()) {
                    e.currentTarget.style.backgroundColor = '#5a7c65';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                  }
                }}
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