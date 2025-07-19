"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { Button } from '@repo/ui/button';
import { Badge } from '@repo/ui/badge';
import { Progress } from '@repo/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/tabs';

interface AssessmentIntegrationProps {
  clientId: string;
  onTemplateSelect: (template: any) => void;
}

interface AssessmentData {
  id: string;
  type: string;
  assessmentDate: string;
  data: any;
  weight?: number;
  height?: number;
  bmi?: number;
  bodyFatPercentage?: number;
  restingHeartRate?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
}

interface TemplateRecommendation {
  templateId: string;
  templateName: string;
  score: number;
  reasoning: string[];
  assessmentFactors: string[];
  suitability: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'POOR';
}

interface ClientProfile {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  experienceLevel?: string;
  assessments: AssessmentData[];
  recommendations: TemplateRecommendation[];
}

export function AssessmentIntegration({ clientId, onTemplateSelect }: AssessmentIntegrationProps) {
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<string | null>(null);

  useEffect(() => {
    fetchClientAssessmentData();
  }, [clientId]);

  const fetchClientAssessmentData = async () => {
    try {
      setLoading(true);
      let token = localStorage.getItem('trainer-tracker-token');
      if (!token) {
        token = localStorage.getItem('trainer-tracker-token') || localStorage.getItem('token');
      }
      
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE}/api/clients/${clientId}/assessment-recommendations`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch assessment data');
      }
      const data = await response.json();
      setClientProfile(data);
      if (data.assessments.length > 0) {
        setSelectedAssessment(data.assessments[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getSuitabilityColor = (suitability: string) => {
    switch (suitability) {
      case 'EXCELLENT': return 'bg-green-100 text-green-800';
      case 'GOOD': return 'bg-blue-100 text-blue-800';
      case 'MODERATE': return 'bg-yellow-100 text-yellow-800';
      case 'POOR': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSuitabilityIcon = (suitability: string) => {
    switch (suitability) {
      case 'EXCELLENT': return '⭐';
      case 'GOOD': return '👍';
      case 'MODERATE': return '⚠️';
      case 'POOR': return '❌';
      default: return '❓';
    }
  };

  const formatAssessmentDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getAssessmentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'PARQ': 'Health Screening',
      'FITNESS_ASSESSMENT': 'Fitness Assessment',
      'BODY_COMPOSITION': 'Body Composition',
      'FLEXIBILITY': 'Flexibility',
      'STRENGTH': 'Strength',
      'CARDIOVASCULAR': 'Cardiovascular',
      'FMS': 'Functional Movement',
      'POSTURAL': 'Postural',
      'BALANCE': 'Balance',
      'MOBILITY': 'Mobility'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Analyzing assessment data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-600">
            <p>Error loading assessment data: {error}</p>
            <Button onClick={fetchClientAssessmentData} className="mt-2">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!clientProfile) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>No client data available</p>
        </CardContent>
      </Card>
    );
  }

  const selectedAssessmentData = clientProfile.assessments.find(
    a => a.id === selectedAssessment
  );

  return (
    <div className="space-y-6">
      {/* Client Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Assessment-Based Recommendations</span>
            <Badge variant="outline">
              {clientProfile.assessments.length} Assessment{clientProfile.assessments.length !== 1 ? 's' : ''}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Client</p>
              <p className="font-semibold">{clientProfile.firstName} {clientProfile.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Age</p>
              <p className="font-semibold">
                {Math.floor((Date.now() - new Date(clientProfile.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Experience Level</p>
              <p className="font-semibold">{clientProfile.experienceLevel || 'Not assessed'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="recommendations" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations">Template Recommendations</TabsTrigger>
          <TabsTrigger value="assessments">Assessment Data</TabsTrigger>
          <TabsTrigger value="analysis">Analysis Details</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid gap-4">
            {clientProfile.recommendations.map((rec, index) => (
              <Card key={rec.templateId} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{rec.templateName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getSuitabilityColor(rec.suitability)}>
                          {getSuitabilityIcon(rec.suitability)} {rec.suitability}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          Score: {Math.round(rec.score * 100)}%
                        </span>
                      </div>
                    </div>
                    <Button 
                      onClick={() => onTemplateSelect({ id: rec.templateId, name: rec.templateName })}
                      className="ml-4"
                    >
                      Select Template
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1">Key Factors:</h4>
                      <div className="flex flex-wrap gap-1">
                        {rec.assessmentFactors.map((factor, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1">Reasoning:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {rec.reasoning.map((reason, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-4">
          <div className="grid gap-4">
            {/* Assessment Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Assessment to View:
              </label>
              <select
                value={selectedAssessment || ''}
                onChange={(e) => setSelectedAssessment(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                {clientProfile.assessments.map((assessment) => (
                  <option key={assessment.id} value={assessment.id}>
                    {getAssessmentTypeLabel(assessment.type)} - {formatAssessmentDate(assessment.assessmentDate)}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Assessment Details */}
            {selectedAssessmentData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{getAssessmentTypeLabel(selectedAssessmentData.type)}</span>
                    <Badge variant="outline">
                      {formatAssessmentDate(selectedAssessmentData.assessmentDate)}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Standardized Metrics */}
                    {selectedAssessmentData.weight && (
                      <div>
                        <p className="text-sm text-gray-600">Weight</p>
                        <p className="font-semibold">{selectedAssessmentData.weight} kg</p>
                      </div>
                    )}
                    {selectedAssessmentData.height && (
                      <div>
                        <p className="text-sm text-gray-600">Height</p>
                        <p className="font-semibold">{selectedAssessmentData.height} cm</p>
                      </div>
                    )}
                    {selectedAssessmentData.bmi && (
                      <div>
                        <p className="text-sm text-gray-600">BMI</p>
                        <p className="font-semibold">{selectedAssessmentData.bmi.toFixed(1)}</p>
                      </div>
                    )}
                    {selectedAssessmentData.bodyFatPercentage && (
                      <div>
                        <p className="text-sm text-gray-600">Body Fat %</p>
                        <p className="font-semibold">{selectedAssessmentData.bodyFatPercentage}%</p>
                      </div>
                    )}
                    {selectedAssessmentData.restingHeartRate && (
                      <div>
                        <p className="text-sm text-gray-600">Resting Heart Rate</p>
                        <p className="font-semibold">{selectedAssessmentData.restingHeartRate} bpm</p>
                      </div>
                    )}
                    {selectedAssessmentData.bloodPressureSystolic && selectedAssessmentData.bloodPressureDiastolic && (
                      <div>
                        <p className="text-sm text-gray-600">Blood Pressure</p>
                        <p className="font-semibold">
                          {selectedAssessmentData.bloodPressureSystolic}/{selectedAssessmentData.bloodPressureDiastolic} mmHg
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Assessment-specific data */}
                  <div className="mt-4">
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Assessment Details:</h4>
                    <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto">
                      {JSON.stringify(selectedAssessmentData.data, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Analysis Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Assessment Coverage</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['PARQ', 'FITNESS_ASSESSMENT', 'BODY_COMPOSITION', 'STRENGTH'].map((type) => {
                      const hasAssessment = clientProfile.assessments.some(a => a.type === type);
                      return (
                        <div key={type} className="text-center">
                          <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${
                            hasAssessment ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                          }`}>
                            {hasAssessment ? '✓' : '○'}
                          </div>
                          <p className="text-xs mt-1">{getAssessmentTypeLabel(type)}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Recommendation Factors</h4>
                  <div className="space-y-2">
                    {clientProfile.recommendations[0]?.assessmentFactors.map((factor, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-sm">{factor}</span>
                        <Progress value={Math.random() * 100} className="w-24" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 