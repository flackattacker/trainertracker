'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Badge } from '@repo/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/tabs';
import { Search, Filter, Play, Info, Plus, Dumbbell, Target, Users } from 'lucide-react';

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
  exerciseVariations?: ExerciseVariation[];
  cpt?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface ExerciseVariation {
  id: string;
  name: string;
  description: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  equipment: string[];
  instructions: string;
  videoUrl?: string;
}

interface ExerciseCategory {
  id: string;
  name: string;
  description: string;
  _count: {
    exercises: number;
  };
}

const ExerciseLibrary: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [categories, setCategories] = useState<ExerciseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  // Fetch exercises and categories
  useEffect(() => {
    fetchExercises();
    fetchCategories();
  }, []);

  const fetchExercises = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedDifficulty && selectedDifficulty !== 'all') params.append('difficulty', selectedDifficulty);
      if (selectedMuscleGroup && selectedMuscleGroup !== 'all') params.append('muscleGroup', selectedMuscleGroup);
      if (selectedEquipment && selectedEquipment !== 'all') params.append('equipment', selectedEquipment);
      params.append('includeVariations', 'true');

      const response = await fetch(`/api/exercises?${params}`);
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
      const response = await fetch('/api/exercise-categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Filter exercises based on search term
  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'compound') {
      return matchesSearch && exercise.category.name === 'Compound Movements';
    } else if (activeTab === 'isolation') {
      return matchesSearch && exercise.category.name === 'Isolation Movements';
    } else if (activeTab === 'bodyweight') {
      return matchesSearch && exercise.category.name === 'Bodyweight';
    } else if (activeTab === 'cardio') {
      return matchesSearch && exercise.category.name === 'Cardiovascular';
    }
    
    return matchesSearch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER': return 'bg-green-100 text-green-800';
      case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800';
      case 'ADVANCED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleExerciseClick = (exercise: Exercise) => {
    setSelectedExercise(exercise);
  };

  const closeExerciseDetails = () => {
    setSelectedExercise(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exercise Library</h1>
          <p className="text-gray-600 mt-2">
            Browse and search exercises for your training programs
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Exercise
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search exercises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name} ({category._count.exercises})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Difficulty Filter */}
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="All Difficulties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="BEGINNER">Beginner</SelectItem>
                <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                <SelectItem value="ADVANCED">Advanced</SelectItem>
              </SelectContent>
            </Select>

            {/* Muscle Group Filter */}
            <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
              <SelectTrigger>
                <SelectValue placeholder="All Muscle Groups" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Muscle Groups</SelectItem>
                <SelectItem value="Chest">Chest</SelectItem>
                <SelectItem value="Back">Back</SelectItem>
                <SelectItem value="Shoulders">Shoulders</SelectItem>
                <SelectItem value="Biceps">Biceps</SelectItem>
                <SelectItem value="Triceps">Triceps</SelectItem>
                <SelectItem value="Quadriceps">Quadriceps</SelectItem>
                <SelectItem value="Hamstrings">Hamstrings</SelectItem>
                <SelectItem value="Glutes">Glutes</SelectItem>
                <SelectItem value="Core">Core</SelectItem>
              </SelectContent>
            </Select>

            {/* Equipment Filter */}
            <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
              <SelectTrigger>
                <SelectValue placeholder="All Equipment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Equipment</SelectItem>
                <SelectItem value="Barbell">Barbell</SelectItem>
                <SelectItem value="Dumbbells">Dumbbells</SelectItem>
                <SelectItem value="Bodyweight">Bodyweight</SelectItem>
                <SelectItem value="Bench">Bench</SelectItem>
                <SelectItem value="Pull-up Bar">Pull-up Bar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Exercise Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Exercises</TabsTrigger>
          <TabsTrigger value="compound">Compound</TabsTrigger>
          <TabsTrigger value="isolation">Isolation</TabsTrigger>
          <TabsTrigger value="bodyweight">Bodyweight</TabsTrigger>
          <TabsTrigger value="cardio">Cardio</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExercises.map((exercise) => (
              <Card 
                key={exercise.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleExerciseClick(exercise)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{exercise.name}</CardTitle>
                    <Badge className={getDifficultyColor(exercise.difficulty)}>
                      {exercise.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{exercise.category.name}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                    {exercise.description}
                  </p>
                  
                  {/* Muscle Groups */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {exercise.muscleGroups.map((muscle) => (
                      <Badge key={muscle} variant="outline" className="text-xs">
                        <Target className="h-3 w-3 mr-1" />
                        {muscle}
                      </Badge>
                    ))}
                  </div>

                  {/* Equipment */}
                  <div className="flex flex-wrap gap-1">
                    {exercise.equipment.map((equip) => (
                      <Badge key={equip} variant="secondary" className="text-xs">
                        <Dumbbell className="h-3 w-3 mr-1" />
                        {equip}
                      </Badge>
                    ))}
                  </div>

                  {/* Variations */}
                  {exercise.exerciseVariations && exercise.exerciseVariations.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-gray-500 mb-1">
                        {exercise.exerciseVariations.length} variation(s)
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredExercises.length === 0 && (
            <div className="text-center py-12">
              <Dumbbell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No exercises found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Exercise Details Modal */}
      {selectedExercise && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedExercise.name}</h2>
                  <p className="text-gray-600">{selectedExercise.category.name}</p>
                </div>
                <Button variant="ghost" onClick={closeExerciseDetails}>
                  ×
                </Button>
              </div>

              <div className="space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-gray-700">{selectedExercise.description}</p>
                </div>

                {/* Instructions */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Instructions</h3>
                  <p className="text-gray-700">{selectedExercise.instructions}</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Muscle Groups</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedExercise.muscleGroups.map((muscle) => (
                        <Badge key={muscle} variant="outline">
                          {muscle}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Equipment</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedExercise.equipment.map((equip) => (
                        <Badge key={equip} variant="secondary">
                          {equip}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Variations */}
                {selectedExercise.exerciseVariations && selectedExercise.exerciseVariations.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Variations</h3>
                    <div className="space-y-3">
                      {selectedExercise.exerciseVariations.map((variation) => (
                        <Card key={variation.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium">{variation.name}</h4>
                              <Badge className={getDifficultyColor(variation.difficulty)}>
                                {variation.difficulty}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{variation.description}</p>
                            <p className="text-sm text-gray-700">{variation.instructions}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Video */}
                {selectedExercise.videoUrl && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Demo Video</h3>
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      <Play className="h-12 w-12 text-gray-400" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseLibrary; 