"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Badge } from '@repo/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/tabs';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  Copy, 
  Eye, 
  EyeOff,
  Search,
  Filter,
  Calendar,
  Target,
  Users,
  Settings,
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface ProgramTemplate {
  id: string;
  name: string;
  description?: string;
  goal: string;
  experienceLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  duration: number;
  periodizationType: string;
  isPublic: boolean;
  optPhase?: string;
  splitType?: string;
  workoutsPerWeek?: number;
  focus?: string[];
  equipment?: string[];
  intensity?: string;
  createdAt: string;
  updatedAt: string;
  cpt?: {
    id: string;
    firstName?: string;
    lastName?: string;
  };
  _count?: {
    macrocycles: number;
  };
}

interface TemplateFormData {
  name: string;
  description: string;
  goal: string;
  experienceLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  duration: number;
  periodizationType: string;
  isPublic: boolean;
  optPhase: string;
  splitType: string;
  workoutsPerWeek: number;
  focus: string[];
  equipment: string[];
  intensity: string;
  assessmentCriteria?: any;
  contraindications?: string[];
}

export function TemplateManagement() {
  const [templates, setTemplates] = useState<ProgramTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ProgramTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGoal, setFilterGoal] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterVisibility, setFilterVisibility] = useState('all');

  // Form state
  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    description: '',
    goal: '',
    experienceLevel: 'BEGINNER',
    duration: 12,
    periodizationType: 'linear',
    isPublic: false,
    optPhase: 'STABILIZATION_ENDURANCE',
    splitType: 'full-body',
    workoutsPerWeek: 3,
    focus: [],
    equipment: [],
    intensity: 'MODERATE',
    assessmentCriteria: {},
    contraindications: []
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      let token = localStorage.getItem('trainer-tracker-token');
      if (!token) {
        token = localStorage.getItem('token');
      }
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE}/api/program-templates`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      description: '',
      goal: '',
      experienceLevel: 'BEGINNER',
      duration: 12,
      periodizationType: 'linear',
      isPublic: false,
      optPhase: 'STABILIZATION_ENDURANCE',
      splitType: 'full-body',
      workoutsPerWeek: 3,
      focus: [],
      equipment: [],
      intensity: 'MODERATE',
      assessmentCriteria: {},
      contraindications: []
    });
    setShowCreateModal(true);
  };

  const handleEditTemplate = (template: ProgramTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      goal: template.goal,
      experienceLevel: template.experienceLevel,
      duration: template.duration,
      periodizationType: template.periodizationType,
      isPublic: template.isPublic,
      optPhase: template.optPhase || 'STABILIZATION_ENDURANCE',
      splitType: template.splitType || 'full-body',
      workoutsPerWeek: template.workoutsPerWeek || 3,
      focus: template.focus || [],
      equipment: template.equipment || [],
      intensity: template.intensity || 'MODERATE',
      assessmentCriteria: {},
      contraindications: []
    });
    setShowCreateModal(true);
  };

  const handleSaveTemplate = async () => {
    try {
      setSaving(true);
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const url = editingTemplate 
        ? `${API_BASE}/api/program-templates/${editingTemplate.id}`
        : `${API_BASE}/api/program-templates`;
      
      const method = editingTemplate ? 'PUT' : 'POST';
      
      let token = localStorage.getItem('trainer-tracker-token');
      if (!token) {
        token = localStorage.getItem('token');
      }
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save template');
      }

      await fetchTemplates();
      setShowCreateModal(false);
      setEditingTemplate(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      return;
    }

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      let token = localStorage.getItem('trainer-tracker-token');
      if (!token) {
        token = localStorage.getItem('token');
      }
      const response = await fetch(`${API_BASE}/api/program-templates/${templateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete template');
      }

      await fetchTemplates();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleDuplicateTemplate = async (template: ProgramTemplate) => {
    setEditingTemplate(null);
    setFormData({
      name: `${template.name} (Copy)`,
      description: template.description || '',
      goal: template.goal,
      experienceLevel: template.experienceLevel,
      duration: template.duration,
      periodizationType: template.periodizationType,
      isPublic: false, // Always make copies private
      optPhase: template.optPhase || 'STABILIZATION_ENDURANCE',
      splitType: template.splitType || 'full-body',
      workoutsPerWeek: template.workoutsPerWeek || 3,
      focus: template.focus || [],
      equipment: template.equipment || [],
      intensity: template.intensity || 'MODERATE',
      assessmentCriteria: {},
      contraindications: []
    });
    setShowCreateModal(true);
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.goal.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGoal = filterGoal === 'all' || template.goal === filterGoal;
    const matchesLevel = filterLevel === 'all' || template.experienceLevel === filterLevel;
    const matchesVisibility = filterVisibility === 'all' || 
                             (filterVisibility === 'public' && template.isPublic) ||
                             (filterVisibility === 'private' && !template.isPublic);

    return matchesSearch && matchesGoal && matchesLevel && matchesVisibility;
  });

  const getGoalColor = (goal: string) => {
    const colors: Record<string, string> = {
      'Strength': 'bg-blue-100 text-blue-800',
      'Muscle Mass': 'bg-purple-100 text-purple-800',
      'Weight Loss': 'bg-green-100 text-green-800',
      'Endurance': 'bg-orange-100 text-orange-800',
      'General Fitness': 'bg-gray-100 text-gray-800'
    };
    return colors[goal] || 'bg-gray-100 text-gray-800';
  };

  const getDifficultyColor = (level: string) => {
    const colors: Record<string, string> = {
      'BEGINNER': 'bg-green-100 text-green-800',
      'INTERMEDIATE': 'bg-yellow-100 text-yellow-800',
      'ADVANCED': 'bg-red-100 text-red-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading templates...</span>
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
          <h1 className="text-3xl font-bold">Template Management</h1>
          <p className="text-gray-600 mt-1">
            Create, edit, and manage your custom program templates
          </p>
        </div>
        <Button onClick={handleCreateTemplate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Template
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Goal</label>
              <Select value={filterGoal} onValueChange={setFilterGoal}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Goals</SelectItem>
                  <SelectItem value="Strength">Strength</SelectItem>
                  <SelectItem value="Muscle Mass">Muscle Mass</SelectItem>
                  <SelectItem value="Weight Loss">Weight Loss</SelectItem>
                  <SelectItem value="Endurance">Endurance</SelectItem>
                  <SelectItem value="General Fitness">General Fitness</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Level</label>
              <Select value={filterLevel} onValueChange={setFilterLevel}>
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
              <label className="block text-sm font-medium mb-1">Visibility</label>
              <Select value={filterVisibility} onValueChange={setFilterVisibility}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Templates</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge className={getGoalColor(template.goal)}>
                      {template.goal}
                    </Badge>
                    <Badge variant="outline" className={getDifficultyColor(template.experienceLevel)}>
                      {template.experienceLevel}
                    </Badge>
                    {template.isPublic && (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Public
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditTemplate(template)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDuplicateTemplate(template)}
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-gray-600 mb-3">
                {template.description || 'No description provided'}
              </p>
              
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{template.duration} weeks</span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  <span>{template.workoutsPerWeek || 'N/A'}/week</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{template.splitType?.replace(/-/g, ' ') || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Settings className="h-3 w-3" />
                  <span>{template.intensity || 'N/A'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Created {formatDate(template.createdAt)}</span>
                {template.cpt && (
                  <span>by {template.cpt.firstName} {template.cpt.lastName}</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No templates found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterGoal !== 'all' || filterLevel !== 'all' || filterVisibility !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first template to get started'}
            </p>
            {!searchTerm && filterGoal === 'all' && filterLevel === 'all' && filterVisibility === 'all' && (
              <Button onClick={handleCreateTemplate}>
                Create Your First Template
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card border border-border shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingTemplate ? 'Edit Template' : 'Create New Template'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateModal(false)}
                className="h-8 w-8 p-0"
              >
                ×
              </Button>
            </div>

            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="programming">Programming</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Template Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter template name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Goal</label>
                    <Select 
                      value={formData.goal} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, goal: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Strength">Strength</SelectItem>
                        <SelectItem value="Muscle Mass">Muscle Mass</SelectItem>
                        <SelectItem value="Weight Loss">Weight Loss</SelectItem>
                        <SelectItem value="Endurance">Endurance</SelectItem>
                        <SelectItem value="General Fitness">General Fitness</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Experience Level</label>
                    <Select 
                      value={formData.experienceLevel} 
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, experienceLevel: value }))}
                    >
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

                  <div>
                    <label className="block text-sm font-medium mb-2">Duration (weeks)</label>
                    <Input
                      type="number"
                      min="4"
                      max="52"
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 12 }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the template and its benefits..."
                    rows={3}
                    className="w-full p-3 rounded-md resize-none border border-input"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="isPublic" className="text-sm">
                    Make this template public (visible to other trainers)
                  </label>
                </div>
              </TabsContent>

              <TabsContent value="programming" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">OPT Phase</label>
                    <Select 
                      value={formData.optPhase} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, optPhase: value }))}
                    >
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
                    <label className="block text-sm font-medium mb-2">Split Type</label>
                    <Select 
                      value={formData.splitType} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, splitType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-body">Full Body</SelectItem>
                        <SelectItem value="upper-lower">Upper/Lower</SelectItem>
                        <SelectItem value="push-pull-legs">Push/Pull/Legs</SelectItem>
                        <SelectItem value="bro-split">Bro Split</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Workouts per Week</label>
                    <Input
                      type="number"
                      min="1"
                      max="7"
                      value={formData.workoutsPerWeek}
                      onChange={(e) => setFormData(prev => ({ ...prev, workoutsPerWeek: parseInt(e.target.value) || 3 }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Intensity</label>
                    <Select 
                      value={formData.intensity} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, intensity: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MODERATE">Moderate</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Periodization Type</label>
                  <Select 
                    value={formData.periodizationType} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, periodizationType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linear">Linear</SelectItem>
                      <SelectItem value="undulating">Undulating</SelectItem>
                      <SelectItem value="block">Block</SelectItem>
                      <SelectItem value="conjugate">Conjugate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Focus Areas</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {['Core Stability', 'Balance', 'Movement Quality', 'Strength', 'Endurance', 'Power', 'Mobility', 'Recovery', 'Sport-Specific'].map(focus => (
                      <label key={focus} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.focus.includes(focus)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({ ...prev, focus: [...prev.focus, focus] }));
                            } else {
                              setFormData(prev => ({ ...prev, focus: prev.focus.filter(f => f !== focus) }));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{focus}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Equipment</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {['Bodyweight', 'Dumbbells', 'Barbell', 'Resistance Bands', 'Stability Ball', 'Kettlebell', 'Cable Machine', 'Smith Machine', 'Cardio Equipment'].map(equipment => (
                      <label key={equipment} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.equipment.includes(equipment)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({ ...prev, equipment: [...prev.equipment, equipment] }));
                            } else {
                              setFormData(prev => ({ ...prev, equipment: prev.equipment.filter(e => e !== equipment) }));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{equipment}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveTemplate}
                disabled={saving || !formData.name || !formData.goal}
                className="flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {editingTemplate ? 'Update Template' : 'Create Template'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
} 