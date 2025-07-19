'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Badge } from '@repo/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { AssessmentIntegration } from './AssessmentIntegration';
import { 
  Dumbbell, 
  Trash2,
  Save,
  Calendar,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Bot,
  User,
  Edit3,
  FileText,
  X,
  Layers,
  Lightbulb,
  Filter,
  ChevronUp,
  ChevronDown,
  ClipboardList
} from 'lucide-react';

interface Client {
  id: string;
  codeName: string;
  firstName: string;
  lastName: string;
  status: string;
  dateOfBirth: string;
  gender: string;
  experienceLevel: string;
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

interface ProgramTemplate {
  id: string;
  name: string;
  description: string;
  goal: string;
  experienceLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  duration: number;
  periodizationType: string;
  isPublic: boolean;
  optPhase: 'STABILIZATION_ENDURANCE' | 'STRENGTH_ENDURANCE' | 'HYPERTROPHY' | 'MAXIMAL_STRENGTH' | 'POWER';
  splitType: 'full-body' | 'push-pull-legs' | 'upper-lower' | 'bro-split' | 'custom';
  workoutsPerWeek: number;
  focus: string[];
  equipment: string[];
  intensity: 'LOW' | 'MODERATE' | 'HIGH';
}

interface Program {
  id?: string;
  name: string;
  programName?: string;
  description?: string;
  goal: string;
  experienceLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  duration: number;
  workouts: WorkoutDay[];
  data?: Record<string, unknown>;
  notes?: string;
  clientId?: string;
  startDate?: string;
  endDate?: string;
  optPhase?: string;
  primaryGoal?: string;
  secondaryGoals?: string;
  aiGenerated?: boolean;
}

interface AIReview {
  originalProgram: Program;
  suggestedChanges: {
    type: 'exercise' | 'progression' | 'volume' | 'order';
    description: string;
    reasoning: string;
    suggestedAction: string;
  }[];
  overallAssessment: {
    strengths: string[];
    areasForImprovement: string[];
    recommendations: string[];
  };
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://trainer-tracker-api.onrender.com';

const ProgramBuilder: React.FC = () => {
  // Core state
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [program, setProgram] = useState<Program | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Data state
  const [clients, setClients] = useState<Client[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [templates, setTemplates] = useState<ProgramTemplate[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ProgramTemplate | null>(null);

  // Form state
  const [programForm, setProgramForm] = useState({
    clientId: '',
    programName: '',
    startDate: '',
    endDate: '',
    notes: '',
    goal: '',
    experienceLevel: 'BEGINNER' as const,
    duration: 12
  });

  // Template filtering state
  const [templateFilters, setTemplateFilters] = useState({
    goal: 'all',
    experienceLevel: 'all',
    optPhase: 'all',
    splitType: 'all',
    intensity: 'all',
    duration: 'all'
  });

  // AI Review state
  const [showAIReview, setShowAIReview] = useState(false);
  const [aiReview, setAiReview] = useState<AIReview | null>(null);
  const [aiReviewing, setAiReviewing] = useState(false);
  
  // Assessment Integration state
  const [showAssessmentIntegration, setShowAssessmentIntegration] = useState(false);
  const [assessmentRecommendations, setAssessmentRecommendations] = useState<any[]>([]);
  
  // Program completion state
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [existingProgram, setExistingProgram] = useState<{ id: string; name: string } | null>(null);
  const [completingProgram, setCompletingProgram] = useState(false);
  
  // Loading states
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Builder state
  const [draggedExercise, setDraggedExercise] = useState<Exercise | null>(null);
  const [selectedWorkoutDay, setSelectedWorkoutDay] = useState<string | null>(null);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        fetchClients(),
        fetchExercises(),
        fetchTemplates()
      ]);
      setLoading(false);
    };
    
    initializeData();
  }, []);

  // API call helper function (similar to trainer portal)
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://trainer-tracker-api.onrender.com';
    const url = `${baseUrl}${endpoint}`;
    
    // Get token from localStorage
    let token = localStorage.getItem('trainer-tracker-token');
    if (!token) {
      token = localStorage.getItem('token');
    }
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    console.log('ProgramBuilder: API call details:', {
      url,
      method: config.method || 'GET',
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'none',
      headers: config.headers
    });

    try {
      const response = await fetch(url, config);
      
      console.log('ProgramBuilder: Response status:', response.status);
      console.log('ProgramBuilder: Response ok:', response.ok);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('ProgramBuilder: Error response data:', errorData);
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('ProgramBuilder: Fetch error:', error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Network error: Unable to connect to the server. Please check if the API server is running.');
      }
      throw error;
    }
  };

  const fetchClients = async () => {
    try {
      const data = await apiCall('/api/clients');
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setClients([]);
    }
  };

  const fetchExercises = async () => {
    try {
      const data = await apiCall('/api/exercises');
      setExercises(data.exercises || []);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      setExercises([]);
    }
  };

  const fetchTemplates = async () => {
    try {
      setLoadingTemplates(true);
      // Always use comprehensive OPT model templates for now
      // This ensures all filters have data and we have a complete template library
      const templatesArray = createOptModelTemplates();
      setTemplates(templatesArray);
    } catch (error) {
      console.error('Error creating templates:', error);
      // Create comprehensive OPT model templates as fallback
      const fallbackTemplates = createOptModelTemplates();
      setTemplates(fallbackTemplates);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const createOptModelTemplates = (): ProgramTemplate[] => {
    return [
      // Phase 1: Stabilization Endurance (6 templates)
      {
        id: 'stabilization-beginner',
        name: 'Beginner Stability Foundation',
        description: 'Focus on improving movement quality, core stability, and neuromuscular efficiency',
        goal: 'General Fitness',
        experienceLevel: 'BEGINNER',
        duration: 4,
        periodizationType: 'linear',
        isPublic: true,
        optPhase: 'STABILIZATION_ENDURANCE',
        splitType: 'full-body',
        workoutsPerWeek: 3,
        focus: ['Core Stability', 'Balance', 'Movement Quality'],
        equipment: ['Bodyweight', 'Resistance Bands', 'Stability Ball'],
        intensity: 'LOW'
      },
      {
        id: 'stabilization-beginner-2',
        name: 'Core & Balance Essentials',
        description: 'Fundamental core strengthening and balance training for beginners',
        goal: 'General Fitness',
        experienceLevel: 'BEGINNER',
        duration: 6,
        periodizationType: 'linear',
        isPublic: true,
        optPhase: 'STABILIZATION_ENDURANCE',
        splitType: 'full-body',
        workoutsPerWeek: 2,
        focus: ['Core Strength', 'Balance', 'Posture'],
        equipment: ['Bodyweight', 'Resistance Bands'],
        intensity: 'LOW'
      },
      {
        id: 'stabilization-intermediate',
        name: 'Intermediate Stability & Endurance',
        description: 'Advanced stability training with endurance focus for intermediate clients',
        goal: 'Endurance',
        experienceLevel: 'INTERMEDIATE',
        duration: 6,
        periodizationType: 'linear',
        isPublic: true,
        optPhase: 'STABILIZATION_ENDURANCE',
        splitType: 'upper-lower',
        workoutsPerWeek: 4,
        focus: ['Stability', 'Endurance', 'Movement Control'],
        equipment: ['Dumbbells', 'Resistance Bands', 'Stability Ball'],
        intensity: 'MODERATE'
      },
      {
        id: 'stabilization-intermediate-2',
        name: 'Advanced Movement Control',
        description: 'Enhanced movement patterns and stability for intermediate athletes',
        goal: 'Endurance',
        experienceLevel: 'INTERMEDIATE',
        duration: 8,
        periodizationType: 'linear',
        isPublic: true,
        optPhase: 'STABILIZATION_ENDURANCE',
        splitType: 'push-pull-legs',
        workoutsPerWeek: 4,
        focus: ['Movement Quality', 'Stability', 'Endurance'],
        equipment: ['Dumbbells', 'Cable Machine', 'Stability Ball'],
        intensity: 'MODERATE'
      },
      {
        id: 'stabilization-advanced',
        name: 'Elite Stability Training',
        description: 'High-level stability and movement control for advanced athletes',
        goal: 'Endurance',
        experienceLevel: 'ADVANCED',
        duration: 8,
        periodizationType: 'undulating',
        isPublic: true,
        optPhase: 'STABILIZATION_ENDURANCE',
        splitType: 'custom',
        workoutsPerWeek: 5,
        focus: ['Elite Stability', 'Movement Mastery', 'Recovery'],
        equipment: ['Advanced Equipment', 'Stability Tools', 'Recovery Equipment'],
        intensity: 'MODERATE'
      },
      {
        id: 'stabilization-senior',
        name: 'Senior Fitness & Stability',
        description: 'Age-appropriate stability training focusing on functional movement',
        goal: 'General Fitness',
        experienceLevel: 'BEGINNER',
        duration: 12,
        periodizationType: 'linear',
        isPublic: true,
        optPhase: 'STABILIZATION_ENDURANCE',
        splitType: 'full-body',
        workoutsPerWeek: 3,
        focus: ['Functional Movement', 'Balance', 'Joint Health'],
        equipment: ['Bodyweight', 'Resistance Bands', 'Chair'],
        intensity: 'LOW'
      },

      // Phase 2: Strength Endurance (8 templates)
      {
        id: 'strength-endurance-beginner',
        name: 'Strength Endurance Foundation',
        description: 'Build muscular endurance and strength with controlled movements',
        goal: 'Strength',
        experienceLevel: 'BEGINNER',
        duration: 6,
        periodizationType: 'linear',
        isPublic: true,
        optPhase: 'STRENGTH_ENDURANCE',
        splitType: 'full-body',
        workoutsPerWeek: 3,
        focus: ['Muscular Endurance', 'Strength', 'Form'],
        equipment: ['Dumbbells', 'Barbell', 'Cable Machine'],
        intensity: 'MODERATE'
      },
      {
        id: 'strength-endurance-beginner-2',
        name: 'Beginner Circuit Training',
        description: 'Circuit-based strength endurance for beginners',
        goal: 'Strength',
        experienceLevel: 'BEGINNER',
        duration: 4,
        periodizationType: 'linear',
        isPublic: true,
        optPhase: 'STRENGTH_ENDURANCE',
        splitType: 'full-body',
        workoutsPerWeek: 3,
        focus: ['Circuit Training', 'Endurance', 'Strength'],
        equipment: ['Dumbbells', 'Resistance Bands', 'Bodyweight'],
        intensity: 'MODERATE'
      },
      {
        id: 'strength-endurance-intermediate',
        name: 'Intermediate Strength Endurance',
        description: 'Balanced strength and endurance development',
        goal: 'Strength',
        experienceLevel: 'INTERMEDIATE',
        duration: 8,
        periodizationType: 'linear',
        isPublic: true,
        optPhase: 'STRENGTH_ENDURANCE',
        splitType: 'upper-lower',
        workoutsPerWeek: 4,
        focus: ['Strength', 'Endurance', 'Progressive Overload'],
        equipment: ['Barbell', 'Dumbbells', 'Cable Machine'],
        intensity: 'MODERATE'
      },
      {
        id: 'strength-endurance-intermediate-2',
        name: 'Volume Training Specialist',
        description: 'High-volume training for strength endurance',
        goal: 'Endurance',
        experienceLevel: 'INTERMEDIATE',
        duration: 10,
        periodizationType: 'undulating',
        isPublic: true,
        optPhase: 'STRENGTH_ENDURANCE',
        splitType: 'push-pull-legs',
        workoutsPerWeek: 5,
        focus: ['Volume', 'Endurance', 'Recovery'],
        equipment: ['Barbell', 'Dumbbells', 'Cable Machine'],
        intensity: 'HIGH'
      },
      {
        id: 'strength-endurance-advanced',
        name: 'Advanced Strength Endurance',
        description: 'High-volume strength training with endurance focus',
        goal: 'Strength',
        experienceLevel: 'ADVANCED',
        duration: 8,
        periodizationType: 'undulating',
        isPublic: true,
        optPhase: 'STRENGTH_ENDURANCE',
        splitType: 'push-pull-legs',
        workoutsPerWeek: 5,
        focus: ['Strength', 'Endurance', 'Volume'],
        equipment: ['Barbell', 'Dumbbells', 'Cable Machine'],
        intensity: 'HIGH'
      },
      {
        id: 'strength-endurance-advanced-2',
        name: 'Elite Endurance Builder',
        description: 'Maximum endurance with strength maintenance',
        goal: 'Endurance',
        experienceLevel: 'ADVANCED',
        duration: 12,
        periodizationType: 'undulating',
        isPublic: true,
        optPhase: 'STRENGTH_ENDURANCE',
        splitType: 'custom',
        workoutsPerWeek: 6,
        focus: ['Maximum Endurance', 'Strength Maintenance', 'Recovery'],
        equipment: ['Full Gym Equipment', 'Cardio Equipment'],
        intensity: 'HIGH'
      },
      {
        id: 'strength-endurance-athlete',
        name: 'Athletic Performance',
        description: 'Sport-specific strength endurance for athletes',
        goal: 'Power',
        experienceLevel: 'INTERMEDIATE',
        duration: 8,
        periodizationType: 'linear',
        isPublic: true,
        optPhase: 'STRENGTH_ENDURANCE',
        splitType: 'upper-lower',
        workoutsPerWeek: 4,
        focus: ['Athletic Performance', 'Sport-Specific', 'Endurance'],
        equipment: ['Barbell', 'Dumbbells', 'Plyometric Equipment'],
        intensity: 'HIGH'
      },
      {
        id: 'strength-endurance-functional',
        name: 'Functional Strength Endurance',
        description: 'Real-world strength and endurance applications',
        goal: 'General Fitness',
        experienceLevel: 'INTERMEDIATE',
        duration: 6,
        periodizationType: 'linear',
        isPublic: true,
        optPhase: 'STRENGTH_ENDURANCE',
        splitType: 'full-body',
        workoutsPerWeek: 3,
        focus: ['Functional Movement', 'Real-world Strength', 'Endurance'],
        equipment: ['Dumbbells', 'Kettlebells', 'Bodyweight'],
        intensity: 'MODERATE'
      },

      // Phase 3: Hypertrophy (10 templates)
      {
        id: 'hypertrophy-beginner',
        name: 'Beginner Muscle Building',
        description: 'Introduction to muscle building for beginners',
        goal: 'Muscle Mass',
        experienceLevel: 'BEGINNER',
        duration: 8,
        periodizationType: 'linear',
        isPublic: true,
        optPhase: 'HYPERTROPHY',
        splitType: 'full-body',
        workoutsPerWeek: 3,
        focus: ['Muscle Growth', 'Form', 'Progressive Overload'],
        equipment: ['Dumbbells', 'Barbell', 'Cable Machine'],
        intensity: 'MODERATE'
      },
      {
        id: 'hypertrophy-intermediate',
        name: 'Muscle Building Program',
        description: 'Focused on muscle growth with moderate to high volume training',
        goal: 'Muscle Mass',
        experienceLevel: 'INTERMEDIATE',
        duration: 8,
        periodizationType: 'linear',
        isPublic: true,
        optPhase: 'HYPERTROPHY',
        splitType: 'bro-split',
        workoutsPerWeek: 5,
        focus: ['Muscle Growth', 'Volume', 'Progressive Overload'],
        equipment: ['Barbell', 'Dumbbells', 'Cable Machine'],
        intensity: 'HIGH'
      },
      {
        id: 'hypertrophy-intermediate-2',
        name: 'Upper-Lower Hypertrophy',
        description: 'Muscle building with upper-lower split focus',
        goal: 'Muscle Mass',
        experienceLevel: 'INTERMEDIATE',
        duration: 10,
        periodizationType: 'linear',
        isPublic: true,
        optPhase: 'HYPERTROPHY',
        splitType: 'upper-lower',
        workoutsPerWeek: 4,
        focus: ['Muscle Growth', 'Balanced Development', 'Volume'],
        equipment: ['Barbell', 'Dumbbells', 'Cable Machine'],
        intensity: 'HIGH'
      },
      {
        id: 'hypertrophy-intermediate-3',
        name: 'Push-Pull-Legs Hypertrophy',
        description: 'Comprehensive muscle building with PPL split',
        goal: 'Muscle Mass',
        experienceLevel: 'INTERMEDIATE',
        duration: 12,
        periodizationType: 'undulating',
        isPublic: true,
        optPhase: 'HYPERTROPHY',
        splitType: 'push-pull-legs',
        workoutsPerWeek: 6,
        focus: ['Muscle Growth', 'Volume', 'Recovery'],
        equipment: ['Barbell', 'Dumbbells', 'Cable Machine'],
        intensity: 'HIGH'
      },
      {
        id: 'hypertrophy-advanced',
        name: 'Advanced Hypertrophy',
        description: 'Advanced muscle building with periodization and varied techniques',
        goal: 'Muscle Mass',
        experienceLevel: 'ADVANCED',
        duration: 12,
        periodizationType: 'undulating',
        isPublic: true,
        optPhase: 'HYPERTROPHY',
        splitType: 'push-pull-legs',
        workoutsPerWeek: 6,
        focus: ['Hypertrophy', 'Volume', 'Technique Variation'],
        equipment: ['Barbell', 'Dumbbells', 'Cable Machine', 'Smith Machine'],
        intensity: 'HIGH'
      },
      {
        id: 'hypertrophy-advanced-2',
        name: 'Elite Muscle Building',
        description: 'Maximum muscle growth with advanced techniques',
        goal: 'Muscle Mass',
        experienceLevel: 'ADVANCED',
        duration: 16,
        periodizationType: 'undulating',
        isPublic: true,
        optPhase: 'HYPERTROPHY',
        splitType: 'bro-split',
        workoutsPerWeek: 6,
        focus: ['Maximum Hypertrophy', 'Advanced Techniques', 'Recovery'],
        equipment: ['Full Gym Equipment', 'Advanced Machines'],
        intensity: 'HIGH'
      },
      {
        id: 'hypertrophy-bodybuilding',
        name: 'Bodybuilding Specialist',
        description: 'Classic bodybuilding approach to muscle development',
        goal: 'Muscle Mass',
        experienceLevel: 'ADVANCED',
        duration: 12,
        periodizationType: 'undulating',
        isPublic: true,
        optPhase: 'HYPERTROPHY',
        splitType: 'bro-split',
        workoutsPerWeek: 6,
        focus: ['Bodybuilding', 'Muscle Definition', 'Symmetry'],
        equipment: ['Full Gym Equipment', 'Isolation Machines'],
        intensity: 'HIGH'
      },
      {
        id: 'hypertrophy-functional',
        name: 'Functional Hypertrophy',
        description: 'Muscle building with functional movement focus',
        goal: 'Muscle Mass',
        experienceLevel: 'INTERMEDIATE',
        duration: 8,
        periodizationType: 'linear',
        isPublic: true,
        optPhase: 'HYPERTROPHY',
        splitType: 'full-body',
        workoutsPerWeek: 4,
        focus: ['Functional Hypertrophy', 'Movement Quality', 'Strength'],
        equipment: ['Dumbbells', 'Kettlebells', 'Cable Machine'],
        intensity: 'HIGH'
      },
      {
        id: 'hypertrophy-athletic',
        name: 'Athletic Hypertrophy',
        description: 'Muscle building for athletic performance',
        goal: 'Muscle Mass',
        experienceLevel: 'INTERMEDIATE',
        duration: 10,
        periodizationType: 'linear',
        isPublic: true,
        optPhase: 'HYPERTROPHY',
        splitType: 'upper-lower',
        workoutsPerWeek: 4,
        focus: ['Athletic Muscle', 'Power', 'Performance'],
        equipment: ['Barbell', 'Dumbbells', 'Plyometric Equipment'],
        intensity: 'HIGH'
      },
      {
        id: 'hypertrophy-strength',
        name: 'Strength-Focused Hypertrophy',
        description: 'Muscle building with strength development focus',
        goal: 'Muscle Mass',
        experienceLevel: 'INTERMEDIATE',
        duration: 8,
        periodizationType: 'linear',
        isPublic: true,
        optPhase: 'HYPERTROPHY',
        splitType: 'push-pull-legs',
        workoutsPerWeek: 5,
        focus: ['Strength', 'Muscle Growth', 'Compound Movements'],
        equipment: ['Barbell', 'Dumbbells', 'Squat Rack'],
        intensity: 'HIGH'
      },

      // Phase 4: Maximal Strength (8 templates)
      {
        id: 'maximal-strength-beginner',
        name: 'Beginner Strength Foundation',
        description: 'Introduction to maximal strength training',
        goal: 'Strength',
        experienceLevel: 'BEGINNER',
        duration: 8,
        periodizationType: 'linear',
        isPublic: true,
        optPhase: 'MAXIMAL_STRENGTH',
        splitType: 'full-body',
        workoutsPerWeek: 3,
        focus: ['Strength Foundation', 'Form', 'Progressive Overload'],
        equipment: ['Barbell', 'Dumbbells', 'Squat Rack'],
        intensity: 'MODERATE'
      },
      {
        id: 'maximal-strength-intermediate',
        name: 'Maximal Strength Builder',
        description: 'Focus on increasing maximal strength with heavy compound movements',
        goal: 'Strength',
        experienceLevel: 'INTERMEDIATE',
        duration: 8,
        periodizationType: 'linear',
        isPublic: true,
        optPhase: 'MAXIMAL_STRENGTH',
        splitType: 'upper-lower',
        workoutsPerWeek: 4,
        focus: ['Maximal Strength', 'Compound Movements', 'Power'],
        equipment: ['Barbell', 'Squat Rack', 'Bench'],
        intensity: 'HIGH'
      },
      {
        id: 'maximal-strength-intermediate-2',
        name: 'Powerlifting Foundation',
        description: 'Classic powerlifting approach to maximal strength',
        goal: 'Strength',
        experienceLevel: 'INTERMEDIATE',
        duration: 12,
        periodizationType: 'linear',
        isPublic: true,
        optPhase: 'MAXIMAL_STRENGTH',
        splitType: 'push-pull-legs',
        workoutsPerWeek: 4,
        focus: ['Powerlifting', 'Big Three', 'Strength'],
        equipment: ['Barbell', 'Squat Rack', 'Bench', 'Deadlift Platform'],
        intensity: 'HIGH'
      },
      {
        id: 'maximal-strength-advanced',
        name: 'Advanced Maximal Strength',
        description: 'Advanced strength training with periodization and peak programming',
        goal: 'Strength',
        experienceLevel: 'ADVANCED',
        duration: 12,
        periodizationType: 'undulating',
        isPublic: true,
        optPhase: 'MAXIMAL_STRENGTH',
        splitType: 'push-pull-legs',
        workoutsPerWeek: 5,
        focus: ['Maximal Strength', 'Peak Performance', 'Recovery'],
        equipment: ['Barbell', 'Squat Rack', 'Bench', 'Specialty Bars'],
        intensity: 'HIGH'
      },
      {
        id: 'maximal-strength-advanced-2',
        name: 'Elite Strength Program',
        description: 'Maximum strength development for elite athletes',
        goal: 'Strength',
        experienceLevel: 'ADVANCED',
        duration: 16,
        periodizationType: 'undulating',
        isPublic: true,
        optPhase: 'MAXIMAL_STRENGTH',
        splitType: 'custom',
        workoutsPerWeek: 5,
        focus: ['Elite Strength', 'Peak Performance', 'Advanced Techniques'],
        equipment: ['Full Gym Equipment', 'Specialty Equipment'],
        intensity: 'HIGH'
      },
      {
        id: 'maximal-strength-powerlifting',
        name: 'Competitive Powerlifting',
        description: 'Competition-focused powerlifting program',
        goal: 'Strength',
        experienceLevel: 'ADVANCED',
        duration: 12,
        periodizationType: 'undulating',
        isPublic: true,
        optPhase: 'MAXIMAL_STRENGTH',
        splitType: 'custom',
        workoutsPerWeek: 4,
        focus: ['Competition Prep', 'Peak Performance', 'Recovery'],
        equipment: ['Competition Equipment', 'Specialty Bars'],
        intensity: 'HIGH'
      },
      {
        id: 'maximal-strength-functional',
        name: 'Functional Maximal Strength',
        description: 'Maximal strength with functional movement applications',
        goal: 'Strength',
        experienceLevel: 'INTERMEDIATE',
        duration: 8,
        periodizationType: 'linear',
        isPublic: true,
        optPhase: 'MAXIMAL_STRENGTH',
        splitType: 'full-body',
        workoutsPerWeek: 3,
        focus: ['Functional Strength', 'Real-world Applications', 'Movement Quality'],
        equipment: ['Barbell', 'Dumbbells', 'Kettlebells'],
        intensity: 'HIGH'
      },
      {
        id: 'maximal-strength-athletic',
        name: 'Athletic Maximal Strength',
        description: 'Maximal strength for athletic performance',
        goal: 'Strength',
        experienceLevel: 'INTERMEDIATE',
        duration: 10,
        periodizationType: 'linear',
        isPublic: true,
        optPhase: 'MAXIMAL_STRENGTH',
        splitType: 'upper-lower',
        workoutsPerWeek: 4,
        focus: ['Athletic Strength', 'Sport Performance', 'Power'],
        equipment: ['Barbell', 'Dumbbells', 'Plyometric Equipment'],
        intensity: 'HIGH'
      },

      // Phase 5: Power (8 templates)
      {
        id: 'power-beginner',
        name: 'Beginner Power Development',
        description: 'Introduction to power training for beginners',
        goal: 'Power',
        experienceLevel: 'BEGINNER',
        duration: 6,
        periodizationType: 'linear',
        isPublic: true,
        optPhase: 'POWER',
        splitType: 'full-body',
        workoutsPerWeek: 3,
        focus: ['Power Foundation', 'Explosiveness', 'Form'],
        equipment: ['Dumbbells', 'Resistance Bands', 'Bodyweight'],
        intensity: 'MODERATE'
      },
      {
        id: 'power-intermediate',
        name: 'Power Development',
        description: 'Focus on explosive movements and power development',
        goal: 'Power',
        experienceLevel: 'INTERMEDIATE',
        duration: 6,
        periodizationType: 'linear',
        isPublic: true,
        optPhase: 'POWER',
        splitType: 'full-body',
        workoutsPerWeek: 3,
        focus: ['Power', 'Explosiveness', 'Speed'],
        equipment: ['Barbell', 'Dumbbells', 'Plyometric Equipment'],
        intensity: 'HIGH'
      },
      {
        id: 'power-intermediate-2',
        name: 'Athletic Power Training',
        description: 'Power development for athletic performance',
        goal: 'Power',
        experienceLevel: 'INTERMEDIATE',
        duration: 8,
        periodizationType: 'linear',
        isPublic: true,
        optPhase: 'POWER',
        splitType: 'upper-lower',
        workoutsPerWeek: 4,
        focus: ['Athletic Power', 'Sport Performance', 'Speed'],
        equipment: ['Barbell', 'Dumbbells', 'Plyometric Equipment'],
        intensity: 'HIGH'
      },
      {
        id: 'power-advanced',
        name: 'Advanced Power Training',
        description: 'Advanced power development with sport-specific applications',
        goal: 'Power',
        experienceLevel: 'ADVANCED',
        duration: 8,
        periodizationType: 'undulating',
        isPublic: true,
        optPhase: 'POWER',
        splitType: 'custom',
        workoutsPerWeek: 4,
        focus: ['Power', 'Sport Performance', 'Recovery'],
        equipment: ['Barbell', 'Dumbbells', 'Plyometric Equipment', 'Olympic Lifting'],
        intensity: 'HIGH'
      },
      {
        id: 'power-advanced-2',
        name: 'Elite Power Development',
        description: 'Maximum power development for elite athletes',
        goal: 'Power',
        experienceLevel: 'ADVANCED',
        duration: 12,
        periodizationType: 'undulating',
        isPublic: true,
        optPhase: 'POWER',
        splitType: 'custom',
        workoutsPerWeek: 5,
        focus: ['Elite Power', 'Peak Performance', 'Advanced Techniques'],
        equipment: ['Full Gym Equipment', 'Olympic Lifting', 'Advanced Equipment'],
        intensity: 'HIGH'
      },
      {
        id: 'power-olympic',
        name: 'Olympic Lifting Power',
        description: 'Power development through Olympic lifting',
        goal: 'Power',
        experienceLevel: 'ADVANCED',
        duration: 10,
        periodizationType: 'undulating',
        isPublic: true,
        optPhase: 'POWER',
        splitType: 'custom',
        workoutsPerWeek: 4,
        focus: ['Olympic Lifting', 'Power', 'Technique'],
        equipment: ['Olympic Barbell', 'Bumper Plates', 'Platform'],
        intensity: 'HIGH'
      },
      {
        id: 'power-functional',
        name: 'Functional Power Training',
        description: 'Power development with functional movement applications',
        goal: 'Power',
        experienceLevel: 'INTERMEDIATE',
        duration: 6,
        periodizationType: 'linear',
        isPublic: true,
        optPhase: 'POWER',
        splitType: 'full-body',
        workoutsPerWeek: 3,
        focus: ['Functional Power', 'Real-world Applications', 'Movement Quality'],
        equipment: ['Dumbbells', 'Kettlebells', 'Plyometric Equipment'],
        intensity: 'HIGH'
      },
      {
        id: 'power-sport',
        name: 'Sport-Specific Power',
        description: 'Power training tailored for specific sports',
        goal: 'Power',
        experienceLevel: 'INTERMEDIATE',
        duration: 8,
        periodizationType: 'linear',
        isPublic: true,
        optPhase: 'POWER',
        splitType: 'upper-lower',
        workoutsPerWeek: 4,
        focus: ['Sport-Specific Power', 'Performance', 'Recovery'],
        equipment: ['Barbell', 'Dumbbells', 'Sport-Specific Equipment'],
        intensity: 'HIGH'
      }
    ];
  };

  const selectTemplate = (template: ProgramTemplate) => {
    setSelectedTemplate(template);
    
    // Generate workouts based on template type and split type
    const generatedWorkouts = generateWorkoutsFromTemplate(template, exercises, template.splitType);
    
    // Auto-populate program from template
    const populatedProgram: Program = {
      name: template.name,
      programName: `${selectedClient?.firstName} ${selectedClient?.lastName} - ${template.name}`,
      description: template.description,
      goal: template.goal,
      experienceLevel: template.experienceLevel,
      duration: template.duration,
      workouts: generatedWorkouts,
      clientId: selectedClient?.id,
      startDate: programForm.startDate,
      endDate: programForm.endDate,
      notes: programForm.notes,
      primaryGoal: template.goal,
      optPhase: template.optPhase
    };
    
    setProgram(populatedProgram);
    setCurrentStep(1); // Move to Program Builder (step 1)
  };

  const handleAssessmentTemplateSelect = (template: any) => {
    // Find the template in our database
    const foundTemplate = templates.find(t => t.id === template.id) || 
                         createOptModelTemplates().find(t => t.id === template.id);
    
    if (foundTemplate) {
      selectTemplate(foundTemplate);
      setShowAssessmentIntegration(false);
    } else {
      console.error('Template not found:', template);
    }
  };

  const generateWorkoutsFromTemplate = (template: ProgramTemplate, availableExercises: Exercise[], splitType: string = 'auto'): WorkoutDay[] => {
    const workouts: WorkoutDay[] = [];
    const usedExerciseIds = new Set<string>();
    
    // Helper function to find exercises by keywords, avoiding duplicates
    const findExercisesByKeywords = (keywords: string[], muscleGroups?: string[], maxCount: number = 4) => {
      const filtered = availableExercises.filter(exercise => {
        // Skip if already used
        if (usedExerciseIds.has(exercise.id)) return false;
        
        const nameMatch = keywords.some(keyword => 
          exercise.name.toLowerCase().includes(keyword.toLowerCase())
        );
        const muscleMatch = muscleGroups ? 
          muscleGroups.some(muscle => 
            exercise.muscleGroups.some(mg => 
              mg.toLowerCase().includes(muscle.toLowerCase())
            )
          ) : true;
        return nameMatch || muscleMatch;
      });
      
      // Mark exercises as used and return limited count
      const selected = filtered.slice(0, maxCount);
      selected.forEach(ex => usedExerciseIds.add(ex.id));
      return selected;
    };

    // Helper function to create exercise
    const createExercise = (exercise: Exercise, sets: number, reps: number, order: number, notes?: string) => ({
      id: `ex-${Date.now()}-${Math.random()}-${order}`,
      exerciseId: exercise.id,
      exercise: exercise,
      sets,
      reps,
      order,
      notes
    });

    // Helper function to create warmup exercises
    const createWarmupExercises = (workoutName: string) => {
      // Use more general keywords to find warmup exercises
      const cardioWarmup = findExercisesByKeywords(['jog', 'walk', 'march', 'jumping jack', 'high knee'], [], 1);
      const mobilityWarmup = findExercisesByKeywords(['arm circle', 'shoulder roll', 'hip circle', 'ankle mobility'], [], 2);
      const dynamicWarmup = findExercisesByKeywords(['lunge', 'squat', 'push-up', 'plank'], [], 1);
      
      return [
        ...cardioWarmup.map((ex, i) => createExercise(ex, 1, 0, i + 1, '5-10 minutes cardio warmup')),
        ...mobilityWarmup.map((ex, i) => createExercise(ex, 1, 10, i + 2, 'Mobility warmup')),
        ...dynamicWarmup.map((ex, i) => createExercise(ex, 1, 8, i + 4, 'Dynamic warmup'))
      ];
    };

    // Helper function to create cooldown exercises
    const createCooldownExercises = (workoutName: string) => {
      // Use more general keywords to find cooldown exercises
      const staticStretches = findExercisesByKeywords(['stretch', 'hamstring', 'quad', 'calf', 'chest', 'shoulder'], [], 3);
      const foamRolling = findExercisesByKeywords(['foam roll', 'roll', 'massage'], [], 1);
      
      return [
        ...staticStretches.map((ex, i) => createExercise(ex, 1, 30, i + 1, '30 second hold')),
        ...foamRolling.map((ex, i) => createExercise(ex, 1, 60, i + 4, '60 seconds foam rolling'))
      ];
    };

    // Determine split type based on goal and user preference
    const effectiveSplitType = splitType === 'auto' ? 
      (template.goal.toLowerCase().includes('strength') ? 'push-pull-legs' : 
       template.goal.toLowerCase().includes('muscle') || template.goal.toLowerCase().includes('hypertrophy') ? 'upper-lower' : 
       'full-body') : splitType;

    // Generate workouts based on split type
    if (effectiveSplitType === 'push-pull-legs') {
      // Strength program - Push/Pull/Legs split
      const pushExercises = findExercisesByKeywords(['bench press', 'shoulder press', 'dip', 'push-up'], ['chest', 'triceps', 'shoulders'], 3);
      const pullExercises = findExercisesByKeywords(['barbell row', 'pull-up', 'lat pulldown', 'face pull'], ['back', 'biceps'], 3);
      const legExercises = findExercisesByKeywords(['squat', 'deadlift', 'leg press', 'lunge'], ['quadriceps', 'glutes', 'hamstrings'], 3);

      // Push Day - Single workout with warmup, main exercises, and cooldown
      workouts.push({
        id: 'workout-1',
        name: 'Push Day',
        exercises: [
          // Warmup exercises (order 1-4)
          ...createWarmupExercises('Push Day'),
          // Main exercises (order 5+)
          ...pushExercises.map((ex, i) => createExercise(ex, 4, 6, i + 5)),
          ...findExercisesByKeywords(['tricep', 'shoulder'], ['triceps', 'shoulders'], 2).map((ex, i) => 
            createExercise(ex, 3, 8, i + 8)
          ),
          // Cooldown exercises (order 11+)
          ...createCooldownExercises('Push Day').map((ex, i) => ({
            ...ex,
            order: ex.order + 10
          }))
        ]
      });

      // Pull Day - Single workout with warmup, main exercises, and cooldown
      workouts.push({
        id: 'workout-2',
        name: 'Pull Day',
        exercises: [
          // Warmup exercises (order 1-4)
          ...createWarmupExercises('Pull Day'),
          // Main exercises (order 5+)
          ...pullExercises.map((ex, i) => createExercise(ex, 4, 6, i + 5)),
          ...findExercisesByKeywords(['bicep', 'rear delt'], ['biceps'], 2).map((ex, i) => 
            createExercise(ex, 3, 8, i + 8)
          ),
          // Cooldown exercises (order 11+)
          ...createCooldownExercises('Pull Day').map((ex, i) => ({
            ...ex,
            order: ex.order + 10
          }))
        ]
      });

      // Legs Day - Single workout with warmup, main exercises, and cooldown
      workouts.push({
        id: 'workout-3',
        name: 'Legs Day',
        exercises: [
          // Warmup exercises (order 1-4)
          ...createWarmupExercises('Legs Day'),
          // Main exercises (order 5+)
          ...legExercises.map((ex, i) => createExercise(ex, 4, 6, i + 5)),
          ...findExercisesByKeywords(['calf', 'core'], ['calves', 'abs'], 2).map((ex, i) => 
            createExercise(ex, 3, 12, i + 8)
          ),
          // Cooldown exercises (order 11+)
          ...createCooldownExercises('Legs Day').map((ex, i) => ({
            ...ex,
            order: ex.order + 10
          }))
        ]
      });
    } else if (effectiveSplitType === 'upper-lower') {
      // Upper/Lower split
      const upperExercises = findExercisesByKeywords(['bench press', 'shoulder press', 'barbell row', 'pull-up'], ['chest', 'back', 'shoulders'], 4);
      const lowerExercises = findExercisesByKeywords(['squat', 'deadlift', 'leg press', 'lunge'], ['quadriceps', 'glutes', 'hamstrings'], 4);

      // Upper Body - Single workout with warmup, main exercises, and cooldown
      workouts.push({
        id: 'workout-1',
        name: 'Upper Body',
        exercises: [
          // Warmup exercises (order 1-4)
          ...createWarmupExercises('Upper Body'),
          // Main exercises (order 5+)
          ...upperExercises.map((ex, i) => createExercise(ex, 4, 8, i + 5)),
          ...findExercisesByKeywords(['bicep', 'tricep'], ['biceps', 'triceps'], 2).map((ex, i) => 
            createExercise(ex, 3, 10, i + 9)
          ),
          // Cooldown exercises (order 12+)
          ...createCooldownExercises('Upper Body').map((ex, i) => ({
            ...ex,
            order: ex.order + 11
          }))
        ]
      });

      // Lower Body - Single workout with warmup, main exercises, and cooldown
      workouts.push({
        id: 'workout-2',
        name: 'Lower Body',
        exercises: [
          // Warmup exercises (order 1-4)
          ...createWarmupExercises('Lower Body'),
          // Main exercises (order 5+)
          ...lowerExercises.map((ex, i) => createExercise(ex, 4, 8, i + 5)),
          ...findExercisesByKeywords(['calf', 'core'], ['calves', 'abs'], 2).map((ex, i) => 
            createExercise(ex, 3, 12, i + 9)
          ),
          // Cooldown exercises (order 12+)
          ...createCooldownExercises('Lower Body').map((ex, i) => ({
            ...ex,
            order: ex.order + 11
          }))
        ]
      });
    } else if (effectiveSplitType === 'full-body') {
      // Full body workouts
      if (template.goal.toLowerCase().includes('endurance')) {
        // Endurance program - Full body
        const fullBodyExercises = findExercisesByKeywords(['squat', 'push-up', 'row', 'plank', 'lunge'], [], 6);
        
        workouts.push({
          id: 'workout-1',
          name: 'Full Body Endurance',
          exercises: [
            // Warmup exercises (order 1-4)
            ...createWarmupExercises('Full Body Endurance'),
            // Main exercises (order 5+)
            ...fullBodyExercises.map((ex, i) => createExercise(ex, 3, 15, i + 5)),
            // Cooldown exercises (order 11+)
            ...createCooldownExercises('Full Body Endurance').map((ex, i) => ({
              ...ex,
              order: ex.order + 10
            }))
          ]
        });
      } else if (template.goal.toLowerCase().includes('weight loss')) {
        // Weight loss program - Circuit training
        const circuitExercises = findExercisesByKeywords(['burpee', 'mountain climber', 'jumping jack', 'plank', 'squat'], [], 8);
        
        workouts.push({
          id: 'workout-1',
          name: 'Full Body Circuit',
          exercises: [
            // Warmup exercises (order 1-4)
            ...createWarmupExercises('Full Body Circuit'),
            // Main exercises (order 5+)
            ...circuitExercises.map((ex, i) => createExercise(ex, 3, 12, i + 5)),
            // Cooldown exercises (order 13+)
            ...createCooldownExercises('Full Body Circuit').map((ex, i) => ({
              ...ex,
              order: ex.order + 12
            }))
          ]
        });
      } else {
        // Default workout for other goals
        const defaultExercises = findExercisesByKeywords(['squat', 'push-up', 'row', 'plank'], [], 4);
        workouts.push({
          id: 'workout-1',
          name: 'Full Body',
          exercises: [
            // Warmup exercises (order 1-4)
            ...createWarmupExercises('Full Body'),
            // Main exercises (order 5+)
            ...defaultExercises.map((ex, i) => createExercise(ex, 3, 10, i + 5)),
            // Cooldown exercises (order 9+)
            ...createCooldownExercises('Full Body').map((ex, i) => ({
              ...ex,
              order: ex.order + 8
            }))
          ]
        });
      }
    }
    
    return workouts;
  };

  const getAIReview = async () => {
    if (!program || !selectedClient) return;

    setAiReviewing(true);
    try {
      // Debug authentication
      const token = localStorage.getItem('trainer-tracker-token') || localStorage.getItem('token');
      console.log('AI Review: Token exists:', !!token);
      console.log('AI Review: Token length:', token ? token.length : 0);
      console.log('AI Review: Program exists:', !!program);
      console.log('AI Review: Client exists:', !!selectedClient);
      
      const data = await apiCall('/api/programs/ai-review', {
        method: 'POST',
        body: JSON.stringify({
          program: program,
          clientData: selectedClient,
          goals: programForm.goal
        }),
      });
      setAiReview(data);
      setShowAIReview(true);
    } catch (error) {
      console.error('Error getting AI review:', error);
      // Show more detailed error information
      if (error instanceof Error) {
        console.error('AI Review: Error message:', error.message);
        console.error('AI Review: Error stack:', error.stack);
      }
    } finally {
      setAiReviewing(false);
    }
  };

  const applyAIRecommendations = (review: AIReview) => {
    if (!program) return;

    console.log('Applying AI recommendations:', review.suggestedChanges);
    console.log('AI recommendations:', review.overallAssessment.recommendations);
    
    let updatedProgram = { ...program };
    
    // First, try to apply specific suggested changes
    review.suggestedChanges.forEach((change, index) => {
      console.log(`Applying specific change ${index + 1}:`, change);
      
      switch (change.type) {
        case 'volume':
          // Apply volume changes
          if (change.description.toLowerCase().includes('increase') || change.description.toLowerCase().includes('add')) {
            updatedProgram = applyVolumeIncrease(updatedProgram);
          } else if (change.description.toLowerCase().includes('decrease') || change.description.toLowerCase().includes('reduce')) {
            updatedProgram = applyVolumeDecrease(updatedProgram);
          }
          break;
          
        case 'exercise':
          // Apply exercise selection changes
          if (change.description.toLowerCase().includes('add') || change.description.toLowerCase().includes('include')) {
            updatedProgram = applyExerciseAddition(updatedProgram, change);
          } else if (change.description.toLowerCase().includes('remove') || change.description.toLowerCase().includes('replace')) {
            updatedProgram = applyExerciseReplacement(updatedProgram, change);
          }
          break;
          
        case 'progression':
          // Apply progression changes
          updatedProgram = applyProgressionChanges(updatedProgram, change);
          break;
          
        case 'order':
          // Apply exercise order changes
          updatedProgram = applyOrderChanges(updatedProgram, change);
          break;
          
        default:
          console.log('Unknown change type:', change.type);
      }
    });
    
    // Then, intelligently interpret high-level recommendations
    const recommendations = review.overallAssessment.recommendations;
    const areasForImprovement = review.overallAssessment.areasForImprovement;
    
    console.log('Interpreting high-level recommendations:', recommendations);
    console.log('Areas for improvement:', areasForImprovement);
    
    // Apply intelligent recommendations based on content analysis
    recommendations.forEach((recommendation, index) => {
      console.log(`Interpreting recommendation ${index + 1}:`, recommendation);
      updatedProgram = interpretAndApplyRecommendation(updatedProgram, recommendation);
    });
    
    areasForImprovement.forEach((area, index) => {
      console.log(`Interpreting improvement area ${index + 1}:`, area);
      updatedProgram = interpretAndApplyImprovement(updatedProgram, area);
    });
    
    setProgram(updatedProgram);
    console.log('Program updated with AI recommendations');
  };

  const applyVolumeIncrease = (currentProgram: Program): Program => {
    const updatedWorkouts = currentProgram.workouts.map(workout => ({
      ...workout,
      exercises: workout.exercises.map(exercise => ({
        ...exercise,
        sets: Math.min(exercise.sets + 1, 5), // Increase sets but cap at 5
        reps: exercise.reps ? Math.min(exercise.reps + 2, 15) : exercise.reps // Increase reps but cap at 15
      }))
    }));
    
    return { ...currentProgram, workouts: updatedWorkouts };
  };

  const applyVolumeDecrease = (currentProgram: Program): Program => {
    const updatedWorkouts = currentProgram.workouts.map(workout => ({
      ...workout,
      exercises: workout.exercises.map(exercise => ({
        ...exercise,
        sets: Math.max(exercise.sets - 1, 1), // Decrease sets but minimum 1
        reps: exercise.reps ? Math.max(exercise.reps - 2, 5) : exercise.reps // Decrease reps but minimum 5
      }))
    }));
    
    return { ...currentProgram, workouts: updatedWorkouts };
  };

  const applyExerciseAddition = (currentProgram: Program, change: any): Program => {
    // Find exercises that match the recommendation
    const targetMuscleGroups = extractMuscleGroupsFromChange(change);
    const matchingExercises = exercises.filter(ex => 
      targetMuscleGroups.some(mg => ex.muscleGroups.includes(mg))
    );
    
    if (matchingExercises.length > 0) {
      const newExercise = matchingExercises[0];
      if (newExercise) {
        // Find the most appropriate workout for this exercise
        const targetWorkoutIndex = findBestWorkoutForExercise(currentProgram.workouts, newExercise);
        
        if (targetWorkoutIndex !== -1) {
          const updatedWorkouts = [...currentProgram.workouts];
          const targetWorkout = updatedWorkouts[targetWorkoutIndex];
          if (targetWorkout) {
            updatedWorkouts[targetWorkoutIndex] = {
              ...targetWorkout,
              exercises: [
                ...targetWorkout.exercises,
                {
                  id: `ai-added-${Date.now()}-${Math.random()}`,
                  exerciseId: newExercise.id,
                  exercise: newExercise,
                  sets: 3,
                  reps: 10,
                  order: targetWorkout.exercises.length + 1
                } as WorkoutExercise
              ]
            };
            
            return { ...currentProgram, workouts: updatedWorkouts };
          }
        }
      }
    }
    
    return currentProgram;
  };

  const findBestWorkoutForExercise = (workouts: WorkoutDay[], exercise: Exercise): number => {
    // Skip warmup and cooldown workouts
    const mainWorkouts = workouts.filter(workout => 
      !workout.name.toLowerCase().includes('warmup') && 
      !workout.name.toLowerCase().includes('cooldown')
    );
    
    if (mainWorkouts.length === 0) return -1;
    
    // Score each workout based on how well it matches the exercise
    const workoutScores = mainWorkouts.map((workout, index) => {
      let score = 0;
      
      // Check workout name for muscle group hints
      const workoutName = workout.name.toLowerCase();
      const exerciseMuscleGroups = exercise.muscleGroups.map(mg => mg.toLowerCase());
      
      // Push/Pull/Legs split logic
      if (workoutName.includes('push') || workoutName.includes('chest') || workoutName.includes('shoulder')) {
        if (exerciseMuscleGroups.includes('chest') || exerciseMuscleGroups.includes('shoulders') || exerciseMuscleGroups.includes('triceps')) {
          score += 10;
        }
      }
      
      if (workoutName.includes('pull') || workoutName.includes('back')) {
        if (exerciseMuscleGroups.includes('back') || exerciseMuscleGroups.includes('biceps')) {
          score += 10;
        }
      }
      
      if (workoutName.includes('leg') || workoutName.includes('lower')) {
        if (exerciseMuscleGroups.includes('quads') || exerciseMuscleGroups.includes('hamstrings') || exerciseMuscleGroups.includes('glutes') || exerciseMuscleGroups.includes('calves')) {
          score += 10;
        }
      }
      
      // Check existing exercises in the workout
      const existingMuscleGroups = new Set<string>();
      workout.exercises.forEach(ex => {
        ex.exercise.muscleGroups.forEach(mg => existingMuscleGroups.add(mg.toLowerCase()));
      });
      
      // Bonus for muscle group consistency
      if (exerciseMuscleGroups.some(mg => existingMuscleGroups.has(mg))) {
        score += 5;
      }
      
      // Penalty for muscle group conflicts
      if (exerciseMuscleGroups.includes('chest') && existingMuscleGroups.has('back')) {
        score -= 3;
      }
      if (exerciseMuscleGroups.includes('back') && existingMuscleGroups.has('chest')) {
        score -= 3;
      }
      
      return { index: workouts.indexOf(workout), score };
    });
    
          // Return the workout with the highest score
      workoutScores.sort((a, b) => b.score - a.score);
      return workoutScores[0] && workoutScores[0].score > 0 ? workoutScores[0].index : -1;
  };

  const applyExerciseReplacement = (currentProgram: Program, change: any): Program => {
    // For now, just return the current program
    // This would require more sophisticated logic to identify which exercises to replace
    return currentProgram;
  };

  const applyProgressionChanges = (currentProgram: Program, change: any): Program => {
    // Apply progressive overload principles
    const updatedWorkouts = currentProgram.workouts.map((workout, workoutIndex) => ({
      ...workout,
      exercises: workout.exercises.map((exercise, exerciseIndex) => ({
        ...exercise,
        sets: Math.min(exercise.sets + workoutIndex, 5), // Progressive sets
        reps: exercise.reps ? Math.max(exercise.reps - workoutIndex, 5) : exercise.reps // Progressive reps
      }))
    }));
    
    return { ...currentProgram, workouts: updatedWorkouts };
  };

  const applyOrderChanges = (currentProgram: Program, change: any): Program => {
    // Reorder exercises based on compound movements first
    const updatedWorkouts = currentProgram.workouts.map(workout => ({
      ...workout,
      exercises: [...workout.exercises].sort((a, b) => {
        const aIsCompound = a.exercise.muscleGroups.length > 1;
        const bIsCompound = b.exercise.muscleGroups.length > 1;
        return bIsCompound ? 1 : aIsCompound ? -1 : 0;
      }).map((exercise, index) => ({ ...exercise, order: index + 1 }))
    }));
    
    return { ...currentProgram, workouts: updatedWorkouts };
  };

  const extractMuscleGroupsFromChange = (change: any): string[] => {
    const text = change.description.toLowerCase() + ' ' + change.suggestedAction.toLowerCase();
    const muscleGroups: string[] = [];
    
    if (text.includes('chest') || text.includes('push')) muscleGroups.push('CHEST');
    if (text.includes('back') || text.includes('pull')) muscleGroups.push('BACK');
    if (text.includes('leg') || text.includes('squat') || text.includes('deadlift')) {
      muscleGroups.push('QUADS', 'HAMSTRINGS', 'GLUTES');
    }
    if (text.includes('shoulder')) muscleGroups.push('SHOULDERS');
    if (text.includes('arm') || text.includes('bicep')) muscleGroups.push('BICEPS');
    if (text.includes('tricep')) muscleGroups.push('TRICEPS');
    if (text.includes('core') || text.includes('abs')) muscleGroups.push('CORE');
    
    return muscleGroups;
  };

  const interpretAndApplyRecommendation = (currentProgram: Program, recommendation: string): Program => {
    const rec = recommendation.toLowerCase();
    let updatedProgram = { ...currentProgram };
    
    console.log('Interpreting recommendation:', recommendation);
    
    // Volume and intensity recommendations
    if (rec.includes('increase volume') || rec.includes('add more sets') || rec.includes('higher volume')) {
      console.log('Applying volume increase based on recommendation');
      updatedProgram = applyVolumeIncrease(updatedProgram);
    }
    
    if (rec.includes('decrease volume') || rec.includes('reduce sets') || rec.includes('lower volume')) {
      console.log('Applying volume decrease based on recommendation');
      updatedProgram = applyVolumeDecrease(updatedProgram);
    }
    
    // Exercise variety recommendations
    if (rec.includes('add compound') || rec.includes('include compound') || rec.includes('more compound')) {
      console.log('Adding compound exercises based on recommendation');
      const compoundExercises = exercises.filter(ex => 
        ex.muscleGroups.length > 2 && 
        ['squat', 'deadlift', 'bench', 'press', 'row', 'pull-up', 'dip'].some(term => 
          ex.name.toLowerCase().includes(term)
        )
      );
      if (compoundExercises.length > 0 && compoundExercises[0]) {
        updatedProgram = addExerciseToProgram(updatedProgram, compoundExercises[0]);
      }
    }
    
    if (rec.includes('add isolation') || rec.includes('include isolation') || rec.includes('more isolation')) {
      console.log('Adding isolation exercises based on recommendation');
      const isolationExercises = exercises.filter(ex => 
        ex.muscleGroups.length === 1 && 
        !['squat', 'deadlift', 'bench', 'press', 'row', 'pull-up', 'dip'].some(term => 
          ex.name.toLowerCase().includes(term)
        )
      );
      if (isolationExercises.length > 0 && isolationExercises[0]) {
        updatedProgram = addExerciseToProgram(updatedProgram, isolationExercises[0]);
      }
    }
    
    // Progression recommendations
    if (rec.includes('progressive overload') || rec.includes('increase weight') || rec.includes('progressive')) {
      console.log('Applying progressive overload based on recommendation');
      updatedProgram = applyProgressionChanges(updatedProgram, { type: 'progression' });
    }
    
    // Frequency recommendations
    if (rec.includes('increase frequency') || rec.includes('more workouts') || rec.includes('add workout')) {
      console.log('Adding workout day based on recommendation');
      updatedProgram = addWorkoutDay(updatedProgram);
    }
    
    // Rest and recovery recommendations
    if (rec.includes('rest') || rec.includes('recovery') || rec.includes('deload')) {
      console.log('Adding rest day based on recommendation');
      updatedProgram = addRestDay(updatedProgram);
    }
    
    return updatedProgram;
  };

  const interpretAndApplyImprovement = (currentProgram: Program, area: string): Program => {
    const improvement = area.toLowerCase();
    let updatedProgram = { ...currentProgram };
    
    console.log('Interpreting improvement area:', area);
    
    // Address specific improvement areas
    if (improvement.includes('volume') || improvement.includes('intensity')) {
      console.log('Addressing volume/intensity improvement');
      updatedProgram = applyVolumeIncrease(updatedProgram);
    }
    
    if (improvement.includes('variety') || improvement.includes('diversity')) {
      console.log('Addressing exercise variety improvement');
      const diverseExercises = exercises.filter(ex => 
        !currentProgram.workouts.some(workout => 
          workout.exercises.some(we => we.exercise.id === ex.id)
        )
      );
      if (diverseExercises.length > 0 && diverseExercises[0]) {
        updatedProgram = addExerciseToProgram(updatedProgram, diverseExercises[0]);
      }
    }
    
    if (improvement.includes('balance') || improvement.includes('symmetry')) {
      console.log('Addressing muscle balance improvement');
      updatedProgram = improveMuscleBalance(updatedProgram);
    }
    
    if (improvement.includes('progression') || improvement.includes('overload')) {
      console.log('Addressing progression improvement');
      updatedProgram = applyProgressionChanges(updatedProgram, { type: 'progression' });
    }
    
    return updatedProgram;
  };

  const addExerciseToProgram = (currentProgram: Program, exercise: Exercise): Program => {
    const targetWorkoutIndex = findBestWorkoutForExercise(currentProgram.workouts, exercise);
    
    if (targetWorkoutIndex !== -1) {
      const updatedWorkouts = [...currentProgram.workouts];
      const targetWorkout = updatedWorkouts[targetWorkoutIndex];
      if (targetWorkout) {
        updatedWorkouts[targetWorkoutIndex] = {
          ...targetWorkout,
          exercises: [
            ...targetWorkout.exercises,
            {
              id: `ai-added-${Date.now()}-${Math.random()}`,
              exerciseId: exercise.id,
              exercise: exercise,
              sets: 3,
              reps: 10,
              order: targetWorkout.exercises.length + 1
            } as WorkoutExercise
          ]
        };
        
        return { ...currentProgram, workouts: updatedWorkouts };
      }
    }
    
    return currentProgram;
  };

  const addWorkoutDay = (currentProgram: Program): Program => {
    const newWorkout: WorkoutDay = {
      id: `ai-added-workout-${Date.now()}`,
      name: 'Additional Training Day',
      exercises: []
    };
    
    return {
      ...currentProgram,
      workouts: [...currentProgram.workouts, newWorkout]
    };
  };

  const addRestDay = (currentProgram: Program): Program => {
    const restWorkout: WorkoutDay = {
      id: `ai-rest-day-${Date.now()}`,
      name: 'Rest & Recovery',
      exercises: []
    };
    
    return {
      ...currentProgram,
      workouts: [...currentProgram.workouts, restWorkout]
    };
  };

  const improveMuscleBalance = (currentProgram: Program): Program => {
    // Analyze muscle group distribution and add exercises to balance
    const muscleGroupCounts: { [key: string]: number } = {};
    
    currentProgram.workouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        exercise.exercise.muscleGroups.forEach(mg => {
          muscleGroupCounts[mg] = (muscleGroupCounts[mg] || 0) + 1;
        });
      });
    });
    
    // Find underrepresented muscle groups
    const avgCount = Object.values(muscleGroupCounts).reduce((a, b) => a + b, 0) / Object.keys(muscleGroupCounts).length;
    const underrepresented = Object.entries(muscleGroupCounts)
      .filter(([_, count]) => count < avgCount * 0.5)
      .map(([mg, _]) => mg);
    
    if (underrepresented.length > 0 && underrepresented[0]) {
      const targetMuscleGroup = underrepresented[0];
      const matchingExercises = exercises.filter(ex => 
        ex.muscleGroups.includes(targetMuscleGroup)
      );
      
      if (matchingExercises.length > 0 && matchingExercises[0]) {
        return addExerciseToProgram(currentProgram, matchingExercises[0]);
      }
    }
    
    return currentProgram;
  };

  const saveProgram = async () => {
    if (!program) return;

    try {
      const data = await apiCall('/api/programs', {
        method: 'POST',
        body: JSON.stringify({
          ...program,
          programName: program.programName || program.name,
          clientId: selectedClient?.id,
          startDate: programForm.startDate,
          endDate: programForm.endDate,
        }),
      });
      setShowSuccess(true);
      setSaveError(null);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving program:', error);
      
      // Check if this is a 409 conflict (client already has active program)
      if (error instanceof Error && error.message.includes('409')) {
        // Extract existing program info from error message or use defaults
        setExistingProgram({
          id: 'unknown', // We'll need to get this from the error response
          name: 'Active Program'
        });
        setShowCompletionModal(true);
        setSaveError(null);
      } else {
        setSaveError(error instanceof Error ? error.message : 'Failed to save program');
      }
    }
  };

  const completeExistingProgram = async () => {
    if (!existingProgram) return;

    setCompletingProgram(true);
    try {
      const data = await apiCall('/api/programs', {
        method: 'PATCH',
        body: JSON.stringify({ 
          id: existingProgram.id, 
          status: 'COMPLETED' 
        }),
      });
      setShowCompletionModal(false);
      setExistingProgram(null);
      // Now try to save the new program
      await saveProgram();
    } catch (error) {
      console.error('Error completing program:', error);
      setSaveError('Failed to complete existing program. Please try again.');
    } finally {
      setCompletingProgram(false);
    }
  };

  // Drag and drop handlers
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

  // Filter exercises based on search and filter criteria
  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = !searchTerm || 
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.muscleGroups.some(group => group.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || exercise.category.name === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || exercise.difficulty === selectedDifficulty;
    const matchesMuscleGroup = selectedMuscleGroup === 'all' || exercise.muscleGroups.includes(selectedMuscleGroup);
    
    return matchesSearch && matchesCategory && matchesDifficulty && matchesMuscleGroup;
  });

  // Get unique categories, muscle groups for filter options
  const categories = Array.from(new Set(exercises.map(e => e.category.name))).sort();
  const muscleGroups = Array.from(new Set(exercises.flatMap(e => e.muscleGroups))).sort();

  // Filter templates based on criteria
  const filteredTemplates = (templates || []).filter(template => {
    const matchesGoal = templateFilters.goal === 'all' || template.goal === templateFilters.goal;
    const matchesExperience = templateFilters.experienceLevel === 'all' || template.experienceLevel === templateFilters.experienceLevel;
    const matchesOptPhase = templateFilters.optPhase === 'all' || template.optPhase === templateFilters.optPhase;
    const matchesSplitType = templateFilters.splitType === 'all' || template.splitType === templateFilters.splitType;
    const matchesIntensity = templateFilters.intensity === 'all' || template.intensity === templateFilters.intensity;
    const matchesDuration = templateFilters.duration === 'all' || template.duration === parseInt(templateFilters.duration);
    
    return matchesGoal && matchesExperience && matchesOptPhase && matchesSplitType && matchesIntensity && matchesDuration;
  });

  // Get unique filter options from templates
  const templateGoals = Array.from(new Set((templates || []).map(t => t.goal).filter(Boolean))).sort();
  const templateOptPhases = Array.from(new Set((templates || []).map(t => t.optPhase).filter(Boolean))).sort();
  const templateSplitTypes = Array.from(new Set((templates || []).map(t => t.splitType).filter(Boolean))).sort();
  const templateIntensities = Array.from(new Set((templates || []).map(t => t.intensity).filter(Boolean))).sort();
  const templateDurations = Array.from(new Set((templates || []).map(t => t.duration).filter(Boolean))).sort();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 border-primary"></div>
          <p>Loading program builder...</p>
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
              Program Builder
            </h1>
            <p className="text-muted-foreground">
              Create personalized training programs using templates and AI validation
            </p>
          </div>
          {showSuccess && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 text-green-800 border border-green-200">
              <CheckCircle className="h-5 w-5" />
              <span>Program saved successfully!</span>
            </div>
          )}
          {saveError && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-800 border border-red-200">
              <AlertCircle className="h-5 w-5" />
              <span>{saveError}</span>
            </div>
          )}
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[
              { step: 0, title: 'Client & Template', icon: User },
              { step: 1, title: 'Program Builder', icon: Edit3 },
              { step: 2, title: 'AI Review', icon: Bot },
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

        {/* Step 0: Client & Template Selection */}
        {currentStep === 0 && (
          <div className="max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <User className="h-5 w-5" />
                  Select Client & Template
                </CardTitle>
                <p className="text-muted-foreground">
                  Choose a client and select a program template that best matches their goals
                </p>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Client Selection */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Client Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Select Client *
                        </label>
                        <Select 
                          value={programForm.clientId} 
                          onValueChange={(value) => {
                            setProgramForm(prev => ({ ...prev, clientId: value }));
                            setSelectedClient(clients.find(c => c.id === value) || null);
                          }}
                        >
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

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Start Date
                          </label>
                          <Input
                            type="date"
                            value={programForm.startDate}
                            onChange={(e) => {
                              const startDate = e.target.value;
                              setProgramForm(prev => ({ ...prev, startDate }));
                              // Auto-calculate end date when template is selected
                              if (startDate && selectedTemplate) {
                                const start = new Date(startDate);
                                const end = new Date(start);
                                end.setDate(start.getDate() + (selectedTemplate.duration * 7));
                                setProgramForm(prev => ({ 
                                  ...prev, 
                                  startDate,
                                  endDate: end.toISOString().split('T')[0] || ''
                                }));
                              }
                            }}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            End Date
                          </label>
                          <Input
                            type="date"
                            value={programForm.endDate}
                            onChange={(e) => setProgramForm(prev => ({ ...prev, endDate: e.target.value }))}
                            disabled={!selectedTemplate}
                          />
                        </div>
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
                          className="w-full p-3 rounded-md resize-none border border-input"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Template Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Program Template</h3>
                      {selectedClient && (
                        <Button
                          onClick={() => setShowAssessmentIntegration(true)}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <ClipboardList className="h-4 w-4" />
                          Assessment-Based Recommendations
                        </Button>
                      )}
                    </div>
                    {loadingTemplates ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4 border-primary"></div>
                        <p>Loading templates...</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Template Filters */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-sm font-medium mb-1">Goal</label>
                            <Select value={templateFilters.goal} onValueChange={(value) => setTemplateFilters(prev => ({ ...prev, goal: value }))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Goals</SelectItem>
                                {templateGoals.map(goal => (
                                  <SelectItem key={goal} value={goal}>{goal}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-1">Experience</label>
                            <Select value={templateFilters.experienceLevel} onValueChange={(value) => setTemplateFilters(prev => ({ ...prev, experienceLevel: value }))}>
                              <SelectTrigger>
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
                        </div>

                        <div className="text-sm text-muted-foreground">
                          {filteredTemplates.length} templates found
                        </div>

                        {/* Template Cards */}
                        <div className="max-h-96 overflow-y-auto space-y-3">
                          {filteredTemplates.map(template => (
                            <Card 
                              key={template.id} 
                              className={`cursor-pointer transition-all hover:shadow-lg ${
                                selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : ''
                              }`}
                              onClick={() => {
                                selectTemplate(template);
                                // Auto-calculate end date if start date is set
                                if (programForm.startDate) {
                                  const start = new Date(programForm.startDate);
                                  const end = new Date(start);
                                  end.setDate(start.getDate() + (template.duration * 7));
                                  setProgramForm(prev => ({ 
                                    ...prev,
                                    endDate: end.toISOString().split('T')[0] || ''
                                  }));
                                }
                              }}
                            >
                              <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <CardTitle className="text-base">{template.name}</CardTitle>
                                    <div className="flex gap-2 mt-2">
                                      <Badge className={getGoalColor(template.goal)}>
                                        {template.goal}
                                      </Badge>
                                      <Badge variant="outline" className={getDifficultyColor(template.experienceLevel)}>
                                        {template.experienceLevel}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <p className="text-sm text-muted-foreground mb-3">
                                  {template.description}
                                </p>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div className="flex justify-between">
                                    <span>Duration:</span>
                                    <span>{template.duration} weeks</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Workouts:</span>
                                    <span>{template.workoutsPerWeek}/week</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Split:</span>
                                    <span>{template.splitType?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Intensity:</span>
                                    <span>{template.intensity}</span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 1: Program Builder */}
        {currentStep === 1 && program && (
          <>
            {console.log('Program Builder Debug:', { currentStep, program, hasWorkouts: program.workouts?.length > 0 })}
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
                      onClick={getAIReview}
                      disabled={aiReviewing}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      {aiReviewing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                          Reviewing...
                        </>
                      ) : (
                        <>
                          <Lightbulb className="h-4 w-4" />
                          Get AI Review
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={saveProgram}
                      className="flex items-center gap-2 bg-[#5a7c65] hover:bg-[#4a6b55] text-white border-[#5a7c65] hover:border-[#4a6b55]"
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
                    <p className="text-muted-foreground">{program.programName}</p>
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

            {/* Workout Builder */}
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
                    {/* Search and Filters */}
                    <div className="space-y-3">
                      <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search exercises..."
                        className="w-full"
                      />
                      
                      <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 w-full"
                      >
                        <Filter className="h-4 w-4" />
                        Filters
                        {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>

                    {/* Advanced Filters */}
                    {showFilters && (
                      <div className="space-y-3 p-3 border rounded-lg bg-muted/50">
                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <label className="block text-sm font-medium mb-1">Category</label>
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map(category => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-1">Difficulty</label>
                            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                              <SelectTrigger>
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

                          <div>
                            <label className="block text-sm font-medium mb-1">Muscle Group</label>
                            <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Muscle Groups</SelectItem>
                                {muscleGroups.map(group => (
                                  <SelectItem key={group} value={group}>
                                    {group}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setSearchTerm('');
                              setSelectedCategory('all');
                              setSelectedDifficulty('all');
                              setSelectedMuscleGroup('all');
                            }}
                            className="w-full"
                          >
                            Reset Filters
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Results Count */}
                    <div className="text-sm text-muted-foreground">
                      {filteredExercises.length} exercises found
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
                      {program.workouts.map(workout => (
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
                              {workout.exercises.length} exercises
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            {workout.exercises.map(exercise => (
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
                                  {exercise.sets} sets &times; {exercise.reps} reps
                                </div>
                              </div>
                            ))}
                          </div>

                          {workout.exercises.length === 0 && (
                            <div className="text-center text-sm py-8 text-muted-foreground">
                              Drag exercises here
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          </>
        )}

        {/* Step 2: AI Review Modal */}
        {showAIReview && aiReview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card border border-border shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">AI Program Review</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAIReview(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Original Program */}
                <div>
                  <h4 className="font-semibold mb-3 text-green-600">Current Program</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <h5 className="font-medium">{aiReview.originalProgram.programName}</h5>
                      <p className="text-sm text-muted-foreground">{aiReview.originalProgram.primaryGoal}</p>
                    </div>
                    
                    <div className="space-y-2">
                      {aiReview.overallAssessment.strengths.map((strength, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 bg-green-50 rounded">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                          <span className="text-sm">{strength}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI Suggestions */}
                <div>
                  <h4 className="font-semibold mb-3 text-blue-600">AI Recommendations</h4>
                  <div className="space-y-3">
                    {aiReview.suggestedChanges.map((change, index) => (
                      <div key={index} className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-start gap-2 mb-2">
                          <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
                          <div>
                            <h5 className="font-medium text-sm">{change.description}</h5>
                            <p className="text-xs text-muted-foreground">{change.reasoning}</p>
                          </div>
                        </div>
                        <p className="text-sm font-medium text-blue-800">{change.suggestedAction}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowAIReview(false)}
                >
                  Keep Current Program
                </Button>
                <Button
                  onClick={() => {
                    applyAIRecommendations(aiReview);
                    setShowAIReview(false);
                  }}
                  className="bg-[#5a7c65] hover:bg-[#4a6b55] text-white border-[#5a7c65] hover:border-[#4a6b55]"
                >
                  Apply Suggestions
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Assessment Integration Modal */}
        {showAssessmentIntegration && selectedClient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-card border border-border shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Assessment-Based Template Recommendations</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAssessmentIntegration(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <AssessmentIntegration
                clientId={selectedClient.id}
                onTemplateSelect={handleAssessmentTemplateSelect}
              />
            </div>
          </div>
        )}

        {/* Program Completion Modal */}
        {showCompletionModal && existingProgram && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="rounded-lg p-6 w-full max-w-md bg-card border border-border shadow-lg">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Active Program Found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {selectedClient?.firstName} {selectedClient?.lastName} already has an active program:
                </p>
                <div className="p-3 bg-muted rounded-lg mb-6">
                  <p className="font-medium">{existingProgram.name}</p>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  To create a new program, you need to mark the existing program as complete first.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCompletionModal(false);
                      setExistingProgram(null);
                    }}
                    disabled={completingProgram}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={completeExistingProgram}
                    disabled={completingProgram}
                    className="flex items-center gap-2 bg-[#5a7c65] hover:bg-[#4a6b55] text-white border-[#5a7c65] hover:border-[#4a6b55]"
                  >
                    {completingProgram ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Completing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Complete & Create New
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgramBuilder; 