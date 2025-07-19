'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Badge } from '@repo/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { 
  Search, 
  Plus,
  Edit,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Target,
  Users,
  Star,
  BookOpen,
  Settings,
  Download,
  Share2,
  X,
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
  periodizationType: 'LINEAR' | 'UNDULATING' | 'BLOCK' | 'CONJUGATE' | 'WAVE_LOADING';
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  cpt: {
    id: string;
    firstName?: string;
    lastName?: string;
  };
  _count: {
    macrocycles: number;
  };
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const ProgramTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<ProgramTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<string>('all');
  const [selectedExperienceLevel, setSelectedExperienceLevel] = useState<string>('all');
  const [selectedPeriodizationType, setSelectedPeriodizationType] = useState<string>('all');
  const [showPublicOnly, setShowPublicOnly] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ProgramTemplate | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 12,
    offset: 0,
    hasMore: false
  });

  // Form state for creating/editing templates
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    goal: '',
    experienceLevel: 'BEGINNER' as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
    duration: 12,
    periodizationType: 'LINEAR' as 'LINEAR' | 'UNDULATING' | 'BLOCK' | 'CONJUGATE' | 'WAVE_LOADING',
    isPublic: false
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Goal and periodization options
  const goalOptions = [
    'Strength Training',
    'Muscle Building',
    'Weight Loss',
    'Endurance',
    'Power Development',
    'General Fitness',
    'Sports Performance',
    'Rehabilitation',
    'Functional Training'
  ];

  const periodizationOptions = [
    { value: 'LINEAR', label: 'Linear Periodization', description: 'Gradual increase in intensity, decrease in volume' },
    { value: 'UNDULATING', label: 'Undulating Periodization', description: 'Varying intensity and volume within microcycles' },
    { value: 'BLOCK', label: 'Block Periodization', description: 'Concentrated loading blocks with specific focus' },
    { value: 'CONJUGATE', label: 'Conjugate Periodization', description: 'Multiple training qualities simultaneously' },
    { value: 'WAVE_LOADING', label: 'Wave Loading', description: 'Progressive waves within single training session' }
  ];

  useEffect(() => {
    fetchTemplates();
  }, [searchTerm, selectedGoal, selectedExperienceLevel, selectedPeriodizationType, showPublicOnly, pagination.offset]);

  const fetchTemplates = async () => {
    try {
      let token = localStorage.getItem('trainer-tracker-token');
      if (!token) {
        token = localStorage.getItem('token');
      }

      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString()
      });

      if (searchTerm) params.append('goal', searchTerm);
      if (selectedGoal !== 'all') params.append('goal', selectedGoal);
      if (selectedExperienceLevel !== 'all') params.append('experienceLevel', selectedExperienceLevel);
      if (selectedPeriodizationType !== 'all') params.append('periodizationType', selectedPeriodizationType);
      if (showPublicOnly) params.append('isPublic', 'true');

      const response = await fetch(`${API_BASE}/api/program-templates?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (pagination.offset === 0) {
          setTemplates(data.templates);
        } else {
          setTemplates(prev => [...prev, ...data.templates]);
        }
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          hasMore: data.pagination.hasMore
        }));
      } else {
        console.error('Error fetching templates:', response.status);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async () => {
    // Validate form
    const errors: Record<string, string> = {};
    if (!templateForm.name.trim()) errors.name = 'Template name is required';
    if (!templateForm.goal.trim()) errors.goal = 'Goal is required';
    if (templateForm.duration < 4 || templateForm.duration > 52) {
      errors.duration = 'Duration must be between 4 and 52 weeks';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      let token = localStorage.getItem('trainer-tracker-token');
      if (!token) {
        token = localStorage.getItem('token');
      }

      const response = await fetch(`${API_BASE}/api/program-templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(templateForm),
      });

      if (response.ok) {
        setShowCreateModal(false);
        resetForm();
        setPagination(prev => ({ ...prev, offset: 0 }));
        fetchTemplates();
      } else {
        const errorData = await response.json();
        setFormErrors({ general: errorData.error || 'Failed to create template' });
      }
    } catch (error) {
      console.error('Error creating template:', error);
      setFormErrors({ general: 'Failed to create template' });
    }
  };

  const updateTemplate = async () => {
    if (!selectedTemplate) return;

    // Validate form
    const errors: Record<string, string> = {};
    if (!templateForm.name.trim()) errors.name = 'Template name is required';
    if (!templateForm.goal.trim()) errors.goal = 'Goal is required';
    if (templateForm.duration < 4 || templateForm.duration > 52) {
      errors.duration = 'Duration must be between 4 and 52 weeks';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      let token = localStorage.getItem('trainer-tracker-token');
      if (!token) {
        token = localStorage.getItem('token');
      }

      const response = await fetch(`${API_BASE}/api/program-templates/${selectedTemplate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(templateForm),
      });

      if (response.ok) {
        setShowEditModal(false);
        resetForm();
        fetchTemplates();
      } else {
        const errorData = await response.json();
        setFormErrors({ general: errorData.error || 'Failed to update template' });
      }
    } catch (error) {
      console.error('Error updating template:', error);
      setFormErrors({ general: 'Failed to update template' });
    }
  };

  const deleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      return;
    }

    try {
      let token = localStorage.getItem('trainer-tracker-token');
      if (!token) {
        token = localStorage.getItem('token');
      }

      const response = await fetch(`${API_BASE}/api/program-templates/${templateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchTemplates();
      } else {
        console.error('Error deleting template:', response.status);
      }
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const resetForm = () => {
    setTemplateForm({
      name: '',
      description: '',
      goal: '',
      experienceLevel: 'BEGINNER',
      duration: 12,
      periodizationType: 'LINEAR',
      isPublic: false
    });
    setFormErrors({});
  };

  const openEditModal = (template: ProgramTemplate) => {
    setSelectedTemplate(template);
    setTemplateForm({
      name: template.name,
      description: template.description || '',
      goal: template.goal,
      experienceLevel: template.experienceLevel,
      duration: template.duration,
      periodizationType: template.periodizationType,
      isPublic: template.isPublic
    });
    setShowEditModal(true);
  };

  const getExperienceLevelColor = (level: string) => {
    switch (level) {
      case 'BEGINNER': return 'bg-green-100 text-green-800';
      case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800';
      case 'ADVANCED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPeriodizationColor = (type: string) => {
    switch (type) {
      case 'LINEAR': return 'bg-blue-100 text-blue-800';
      case 'UNDULATING': return 'bg-purple-100 text-purple-800';
      case 'BLOCK': return 'bg-orange-100 text-orange-800';
      case 'CONJUGATE': return 'bg-indigo-100 text-indigo-800';
      case 'WAVE_LOADING': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const loadMore = () => {
    setPagination(prev => ({
      ...prev,
      offset: prev.offset + prev.limit
    }));
  };

  if (loading && templates.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 border-primary"></div>
          <p>Loading program templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-primary">
              Program Templates
            </h1>
            <p className="text-muted-foreground">
              Create and manage reusable program templates
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Template
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search templates..."
                  className="pl-10"
                />
              </div>

              {/* Goal Filter */}
              <Select value={selectedGoal} onValueChange={setSelectedGoal}>
                <SelectTrigger>
                  <SelectValue placeholder="All Goals" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Goals</SelectItem>
                  {goalOptions.map(goal => (
                    <SelectItem key={goal} value={goal}>
                      {goal}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Experience Level Filter */}
              <Select value={selectedExperienceLevel} onValueChange={setSelectedExperienceLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="BEGINNER">Beginner</SelectItem>
                  <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                  <SelectItem value="ADVANCED">Advanced</SelectItem>
                </SelectContent>
              </Select>

              {/* Periodization Type Filter */}
              <Select value={selectedPeriodizationType} onValueChange={setSelectedPeriodizationType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {periodizationOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Public Only Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showPublicOnly}
                  onChange={(e) => setShowPublicOnly(e.target.checked)}
                  className="rounded"
                />
                <label className="text-sm">Public Only</label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-muted-foreground">
            {pagination.total} templates found
          </p>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {templates.length} loaded
            </Badge>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(template => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{template.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                      {template.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    {template.isPublic ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Goal */}
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{template.goal}</span>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    <Badge className={`text-xs ${getExperienceLevelColor(template.experienceLevel)}`}>
                      {template.experienceLevel}
                    </Badge>
                    <Badge className={`text-xs ${getPeriodizationColor(template.periodizationType)}`}>
                      {periodizationOptions.find(p => p.value === template.periodizationType)?.label}
                    </Badge>
                  </div>

                  {/* Duration and Cycles */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{template.duration} weeks</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{template._count.macrocycles} cycles</span>
                    </div>
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>
                      {template.cpt.firstName} {template.cpt.lastName}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditModal(template)}
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteTemplate(template.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More Button */}
        {pagination.hasMore && (
          <div className="flex justify-center mt-8">
            <Button onClick={loadMore} variant="outline">
              Load More Templates
            </Button>
          </div>
        )}

        {/* Create Template Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Create Program Template</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {formErrors.general && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-800 border border-red-200">
                    <AlertCircle className="h-5 w-5" />
                    <span>{formErrors.general}</span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Template Name *</label>
                  <Input
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., 12-Week Strength Program"
                  />
                  {formErrors.name && <p className="text-red-600 text-sm mt-1">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={templateForm.description}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the template..."
                    rows={3}
                    className="w-full p-3 border rounded-md resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Primary Goal *</label>
                  <Select value={templateForm.goal} onValueChange={(value) => setTemplateForm(prev => ({ ...prev, goal: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a goal" />
                    </SelectTrigger>
                    <SelectContent>
                      {goalOptions.map(goal => (
                        <SelectItem key={goal} value={goal}>
                          {goal}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.goal && <p className="text-red-600 text-sm mt-1">{formErrors.goal}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Experience Level</label>
                    <Select value={templateForm.experienceLevel} onValueChange={(value) => setTemplateForm(prev => ({ ...prev, experienceLevel: value as any }))}>
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
                    <label className="block text-sm font-medium mb-2">Duration (weeks) *</label>
                    <Input
                      type="number"
                      value={templateForm.duration}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 12 }))}
                      min="4"
                      max="52"
                    />
                    {formErrors.duration && <p className="text-red-600 text-sm mt-1">{formErrors.duration}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Periodization Type</label>
                  <Select value={templateForm.periodizationType} onValueChange={(value) => setTemplateForm(prev => ({ ...prev, periodizationType: value as any }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {periodizationOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={templateForm.isPublic}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, isPublic: e.target.checked }))}
                    className="rounded"
                  />
                  <label className="text-sm">Make this template public</label>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={createTemplate}>
                    Create Template
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Template Modal */}
        {showEditModal && selectedTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Edit Program Template</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {formErrors.general && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-800 border border-red-200">
                    <AlertCircle className="h-5 w-5" />
                    <span>{formErrors.general}</span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Template Name *</label>
                  <Input
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., 12-Week Strength Program"
                  />
                  {formErrors.name && <p className="text-red-600 text-sm mt-1">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={templateForm.description}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the template..."
                    rows={3}
                    className="w-full p-3 border rounded-md resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Primary Goal *</label>
                  <Select value={templateForm.goal} onValueChange={(value) => setTemplateForm(prev => ({ ...prev, goal: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a goal" />
                    </SelectTrigger>
                    <SelectContent>
                      {goalOptions.map(goal => (
                        <SelectItem key={goal} value={goal}>
                          {goal}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.goal && <p className="text-red-600 text-sm mt-1">{formErrors.goal}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Experience Level</label>
                    <Select value={templateForm.experienceLevel} onValueChange={(value) => setTemplateForm(prev => ({ ...prev, experienceLevel: value as any }))}>
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
                    <label className="block text-sm font-medium mb-2">Duration (weeks) *</label>
                    <Input
                      type="number"
                      value={templateForm.duration}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 12 }))}
                      min="4"
                      max="52"
                    />
                    {formErrors.duration && <p className="text-red-600 text-sm mt-1">{formErrors.duration}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Periodization Type</label>
                  <Select value={templateForm.periodizationType} onValueChange={(value) => setTemplateForm(prev => ({ ...prev, periodizationType: value as any }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {periodizationOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={templateForm.isPublic}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, isPublic: e.target.checked }))}
                    className="rounded"
                  />
                  <label className="text-sm">Make this template public</label>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowEditModal(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={updateTemplate}>
                    Update Template
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

export default ProgramTemplates; 