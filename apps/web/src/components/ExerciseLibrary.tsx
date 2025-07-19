'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Badge } from '@repo/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { 
  Search, 
  Filter,
  Play,
  Eye,
  EyeOff,
  Video,
  Image,
  Dumbbell,
  Target,
  Calendar,
  Clock,
  Star,
  Heart,
  Share2,
  Download,
  BookOpen,
  X,
  ChevronDown,
  ChevronUp,
  Grid,
  List
} from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  description?: string;
  category: {
    id: string;
    name: string;
  };
  muscleGroups: string[];
  equipment: string[];
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  instructions?: string;
  videoUrl?: string;
  imageUrl?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  cpt?: {
    id: string;
    firstName?: string;
    lastName?: string;
  };
}

interface ExerciseCategory {
  id: string;
  name: string;
  description?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const ExerciseLibrary: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [categories, setCategories] = useState<ExerciseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');
  const [hasVideo, setHasVideo] = useState<boolean | null>(null);
  const [hasImage, setHasImage] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<string>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false
  });

  // Muscle groups and equipment options
  const muscleGroups = [
    'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Forearms',
    'Core', 'Abs', 'Obliques', 'Lower Back', 'Glutes', 'Quadriceps',
    'Hamstrings', 'Calves', 'Adductors', 'Abductors', 'Full Body'
  ];

  const equipmentOptions = [
    'Barbell', 'Dumbbell', 'Kettlebell', 'Cable Machine', 'Smith Machine',
    'Resistance Band', 'Bodyweight', 'Medicine Ball', 'Stability Ball',
    'Foam Roller', 'Pull-up Bar', 'Dip Bars', 'Bench', 'Incline Bench',
    'Decline Bench', 'Squat Rack', 'Leg Press', 'Treadmill', 'Elliptical',
    'Rowing Machine', 'Bike', 'StairMaster'
  ];

  useEffect(() => {
    fetchExercises();
    fetchCategories();
    loadFavorites();
  }, [searchTerm, selectedCategory, selectedDifficulty, selectedMuscleGroup, selectedEquipment, hasVideo, hasImage, sortBy, sortOrder, pagination.offset]);

  const fetchExercises = async () => {
    try {
      let token = localStorage.getItem('trainer-tracker-token');
      if (!token) {
        token = localStorage.getItem('token');
      }

      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString(),
        sortBy,
        sortOrder
      });

      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedDifficulty !== 'all') params.append('difficulty', selectedDifficulty);
      if (selectedMuscleGroup !== 'all') params.append('muscleGroup', selectedMuscleGroup);
      if (selectedEquipment !== 'all') params.append('equipment', selectedEquipment);
      if (hasVideo !== null) params.append('hasVideo', hasVideo.toString());
      if (hasImage !== null) params.append('hasImage', hasImage.toString());

      const response = await fetch(`${API_BASE}/api/exercises?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (pagination.offset === 0) {
          setExercises(data.exercises);
        } else {
          setExercises(prev => [...prev, ...data.exercises]);
        }
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          hasMore: data.pagination.hasMore
        }));
      } else {
        console.error('Error fetching exercises:', response.status);
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      let token = localStorage.getItem('trainer-tracker-token');
      if (!token) {
        token = localStorage.getItem('token');
      }

      const response = await fetch(`${API_BASE}/api/exercise-categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        console.error('Error fetching categories:', response.status);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const loadFavorites = () => {
    const savedFavorites = localStorage.getItem('exercise-favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  };

  const toggleFavorite = (exerciseId: string) => {
    const newFavorites = favorites.includes(exerciseId)
      ? favorites.filter(id => id !== exerciseId)
      : [...favorites, exerciseId];
    
    setFavorites(newFavorites);
    localStorage.setItem('exercise-favorites', JSON.stringify(newFavorites));
  };

  const loadMore = () => {
    setPagination(prev => ({
      ...prev,
      offset: prev.offset + prev.limit
    }));
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedDifficulty('all');
    setSelectedMuscleGroup('all');
    setSelectedEquipment('all');
    setHasVideo(null);
    setHasImage(null);
    setSortBy('name');
    setSortOrder('asc');
    setPagination(prev => ({ ...prev, offset: 0 }));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER': return 'bg-green-100 text-green-800';
      case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800';
      case 'ADVANCED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEquipmentIcon = (equipment: string[]) => {
    if (equipment.includes('Barbell')) return '🏋️';
    if (equipment.includes('Dumbbell')) return '💪';
    if (equipment.includes('Kettlebell')) return '🔔';
    if (equipment.includes('Bodyweight')) return '👤';
    if (equipment.includes('Resistance Band')) return '🎯';
    return '🏃';
  };

  const openVideoModal = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setShowVideoModal(true);
  };

  if (loading && exercises.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 border-primary"></div>
          <p>Loading exercise library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-primary">
            Exercise Library
          </h1>
          <p className="text-muted-foreground">
            Browse and search through our comprehensive exercise database
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search exercises..."
                    className="pl-10"
                  />
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
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
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Difficulty</label>
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
                  <label className="block text-sm font-medium mb-2">Muscle Group</label>
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

                <div>
                  <label className="block text-sm font-medium mb-2">Equipment</label>
                  <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Equipment</SelectItem>
                      {equipmentOptions.map(equipment => (
                        <SelectItem key={equipment} value={equipment}>
                          {equipment}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="difficulty">Difficulty</SelectItem>
                      <SelectItem value="createdAt">Date Added</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Sort Order</label>
                  <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={hasVideo === true}
                      onChange={(e) => setHasVideo(e.target.checked ? true : null)}
                      className="rounded"
                    />
                    <Video className="h-4 w-4" />
                    Has Video
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={hasImage === true}
                      onChange={(e) => setHasImage(e.target.checked ? true : null)}
                      className="rounded"
                    />
                    <Image className="h-4 w-4" />
                    Has Image
                  </label>
                </div>

                <div>
                  <Button variant="outline" onClick={resetFilters} className="w-full">
                    Reset Filters
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-muted-foreground">
            {pagination.total} exercises found
          </p>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {exercises.length} loaded
            </Badge>
          </div>
        </div>

        {/* Exercise Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {exercises.map(exercise => (
              <Card key={exercise.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  {/* Exercise Image/Video Preview */}
                  <div className="relative mb-4 h-48 bg-gray-100 rounded-lg overflow-hidden">
                    {exercise.imageUrl ? (
                      <img
                        src={exercise.imageUrl}
                        alt={exercise.name}
                        className="w-full h-full object-cover"
                      />
                    ) : exercise.videoUrl ? (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <Video className="h-12 w-12 text-gray-400" />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <Dumbbell className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(exercise.id);
                        }}
                      >
                        <Heart 
                          className={`h-4 w-4 ${favorites.includes(exercise.id) ? 'fill-red-500 text-red-500' : ''}`} 
                        />
                      </Button>
                      {exercise.videoUrl && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            openVideoModal(exercise);
                          }}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Exercise Info */}
                  <div>
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{exercise.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {exercise.description}
                    </p>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">
                        {exercise.category.name}
                      </Badge>
                      <Badge className={`text-xs ${getDifficultyColor(exercise.difficulty)}`}>
                        {exercise.difficulty}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{getEquipmentIcon(exercise.equipment)} {exercise.equipment[0]}</span>
                      <span>{exercise.muscleGroups[0]}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {exercises.map(exercise => (
              <Card key={exercise.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Thumbnail */}
                    <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {exercise.imageUrl ? (
                        <img
                          src={exercise.imageUrl}
                          alt={exercise.name}
                          className="w-full h-full object-cover"
                        />
                      ) : exercise.videoUrl ? (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <Video className="h-8 w-8 text-gray-400" />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <Dumbbell className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg">{exercise.name}</h3>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleFavorite(exercise.id)}
                          >
                            <Heart 
                              className={`h-4 w-4 ${favorites.includes(exercise.id) ? 'fill-red-500 text-red-500' : ''}`} 
                            />
                          </Button>
                          {exercise.videoUrl && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openVideoModal(exercise)}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground mb-3 line-clamp-2">
                        {exercise.description}
                      </p>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="text-xs">
                          {exercise.category.name}
                        </Badge>
                        <Badge className={`text-xs ${getDifficultyColor(exercise.difficulty)}`}>
                          {exercise.difficulty}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{getEquipmentIcon(exercise.equipment)} {exercise.equipment.join(', ')}</span>
                        <span>•</span>
                        <span>{exercise.muscleGroups.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {pagination.hasMore && (
          <div className="flex justify-center mt-8">
            <Button onClick={loadMore} variant="outline">
              Load More Exercises
            </Button>
          </div>
        )}

        {/* Video Modal */}
        {showVideoModal && selectedExercise && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{selectedExercise.name}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowVideoModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {selectedExercise.videoUrl && (
                <div className="aspect-video mb-4">
                  <iframe
                    src={selectedExercise.videoUrl}
                    title={selectedExercise.name}
                    className="w-full h-full rounded-lg"
                    allowFullScreen
                  />
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Instructions</h4>
                  <p className="text-muted-foreground">
                    {selectedExercise.instructions || 'No instructions available.'}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Equipment</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedExercise.equipment.map(item => (
                        <Badge key={item} variant="outline" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Muscle Groups</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedExercise.muscleGroups.map(group => (
                        <Badge key={group} variant="outline" className="text-xs">
                          {group}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExerciseLibrary; 