"use client";

import { useState, useEffect } from 'react';
import { assessmentDefaults, AssessmentType, PARQData, FitnessAssessmentData, BodyCompositionData, FlexibilityAssessmentData, StrengthAssessmentData, CardiovascularAssessmentData, FMSData } from '../lib/assessmentData';

interface AssessmentFormProps {
  assessment: {
    clientId: string;
    type: AssessmentType;
    assessmentDate: string;
    assessor: string;
    notes: string;
    status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    data: any;
  };
  onChange: (assessment: any) => void;
  clients: Array<{ id: string; codeName: string; firstName: string; lastName: string }>;
}

export function AssessmentForm({ assessment, onChange, clients }: AssessmentFormProps) {
  const [currentData, setCurrentData] = useState(assessment.data || {});

  useEffect(() => {
    // Initialize data based on assessment type
    if (assessment.type && !currentData[assessment.type.toLowerCase()]) {
      const defaultData = assessmentDefaults[assessment.type] || {};
      setCurrentData({ ...currentData, [assessment.type.toLowerCase()]: defaultData });
    }
  }, [assessment.type]);

  const updateData = (newData: any) => {
    const updatedData = { ...currentData, [assessment.type.toLowerCase()]: newData };
    setCurrentData(updatedData);
    onChange({ ...assessment, data: updatedData });
  };

  const renderPARQForm = () => {
    const parqData = currentData.parq || assessmentDefaults.PARQ;
    
    const updatePARQ = (field: string, value: any) => {
      updateData({ ...parqData, [field]: value });
    };

    const updateQuestion = (question: string, value: boolean) => {
      const questions = { ...parqData.questions, [question]: value };
      updatePARQ('questions', questions);
    };

    const calculateRiskLevel = () => {
      const questions = parqData.questions || {};
      const yesAnswers = Object.values(questions).filter(q => q === true).length;
      
      if (yesAnswers === 0) return 'LOW';
      if (yesAnswers <= 2) return 'MODERATE';
      return 'HIGH';
    };

    const riskLevel = calculateRiskLevel();
    const clearedForExercise = riskLevel === 'LOW';
    const requiresMedicalClearance = riskLevel === 'HIGH';

    return (
      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Physical Activity Readiness Questionnaire (PAR-Q+)</h3>
          <p className="text-blue-700 text-sm">Please answer the following questions to determine if you're ready for physical activity.</p>
        </div>

        <div className="space-y-4">
          {[
            { key: 'q1', question: 'Has your doctor ever said that you have a heart condition?' },
            { key: 'q2', question: 'Do you feel pain in your chest when you do physical activity?' },
            { key: 'q3', question: 'In the past month, have you had chest pain when you were not doing physical activity?' },
            { key: 'q4', question: 'Do you lose your balance because of dizziness or do you ever lose consciousness?' },
            { key: 'q5', question: 'Do you have a bone or joint problem that could be made worse by a change in your physical activity?' },
            { key: 'q6', question: 'Is your doctor currently prescribing drugs for your blood pressure or heart condition?' },
            { key: 'q7', question: 'Do you know of any other reason why you should not do physical activity?' }
          ].map(({ key, question }) => (
            <div key={key} className="flex items-start space-x-3 p-3 border rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">{question}</p>
              </div>
              <div className="flex space-x-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name={key}
                    checked={parqData.questions?.[key] === true}
                    onChange={() => updateQuestion(key, true)}
                    className="mr-1"
                  />
                  <span className="text-sm">Yes</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name={key}
                    checked={parqData.questions?.[key] === false}
                    onChange={() => updateQuestion(key, false)}
                    className="mr-1"
                  />
                  <span className="text-sm">No</span>
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Assessment Results</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white rounded border">
              <p className="text-sm text-gray-600">Risk Level</p>
              <p className={`font-bold text-lg ${
                riskLevel === 'LOW' ? 'text-green-600' : 
                riskLevel === 'MODERATE' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {riskLevel}
              </p>
            </div>
            <div className="text-center p-3 bg-white rounded border">
              <p className="text-sm text-gray-600">Cleared for Exercise</p>
              <p className={`font-bold text-lg ${clearedForExercise ? 'text-green-600' : 'text-red-600'}`}>
                {clearedForExercise ? 'YES' : 'NO'}
              </p>
            </div>
            <div className="text-center p-3 bg-white rounded border">
              <p className="text-sm text-gray-600">Medical Clearance Required</p>
              <p className={`font-bold text-lg ${requiresMedicalClearance ? 'text-red-600' : 'text-green-600'}`}>
                {requiresMedicalClearance ? 'YES' : 'NO'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium">Additional Notes</label>
          <textarea
            value={parqData.notes || ''}
            onChange={(e) => updatePARQ('notes', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Additional notes about the assessment..."
          />
        </div>
      </div>
    );
  };

  const renderFitnessAssessmentForm = () => {
    const fitnessData = currentData.fitness || assessmentDefaults.FITNESS_ASSESSMENT;
    
    const updateFitness = (field: string, value: any) => {
      updateData({ ...fitnessData, [field]: value });
    };

    return (
      <div className="space-y-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900 mb-2">Fitness Assessment</h3>
          <p className="text-green-700 text-sm">Comprehensive fitness evaluation including measurements and performance tests.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800">Basic Measurements</h4>
            
            <div>
              <label className="block text-sm font-medium">Height (cm)</label>
              <input
                type="number"
                value={fitnessData.height || ''}
                onChange={(e) => updateFitness('height', parseFloat(e.target.value) || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="170"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Weight (kg)</label>
              <input
                type="number"
                value={fitnessData.weight || ''}
                onChange={(e) => updateFitness('weight', parseFloat(e.target.value) || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="70"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Body Fat Percentage (%)</label>
              <input
                type="number"
                value={fitnessData.bodyFatPercentage || ''}
                onChange={(e) => updateFitness('bodyFatPercentage', parseFloat(e.target.value) || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="15"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">BMI</label>
              <input
                type="number"
                value={fitnessData.bmi || ''}
                onChange={(e) => updateFitness('bmi', parseFloat(e.target.value) || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="24.2"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800">Cardiovascular</h4>
            
            <div>
              <label className="block text-sm font-medium">Resting Heart Rate (bpm)</label>
              <input
                type="number"
                value={fitnessData.restingHeartRate || ''}
                onChange={(e) => updateFitness('restingHeartRate', parseInt(e.target.value) || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="72"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium">Systolic BP</label>
                <input
                  type="number"
                  value={fitnessData.bloodPressure?.systolic || ''}
                  onChange={(e) => updateFitness('bloodPressure', { 
                    ...fitnessData.bloodPressure, 
                    systolic: parseInt(e.target.value) || null 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="120"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Diastolic BP</label>
                <input
                  type="number"
                  value={fitnessData.bloodPressure?.diastolic || ''}
                  onChange={(e) => updateFitness('bloodPressure', { 
                    ...fitnessData.bloodPressure, 
                    diastolic: parseInt(e.target.value) || null 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="80"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800">Strength Tests</h4>
            
            <div>
              <label className="block text-sm font-medium">Push-ups (max reps)</label>
              <input
                type="number"
                value={fitnessData.pushUps || ''}
                onChange={(e) => updateFitness('pushUps', parseInt(e.target.value) || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Sit-ups (max reps in 1 min)</label>
              <input
                type="number"
                value={fitnessData.sitUps || ''}
                onChange={(e) => updateFitness('sitUps', parseInt(e.target.value) || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Plank Time (seconds)</label>
              <input
                type="number"
                value={fitnessData.plankTime || ''}
                onChange={(e) => updateFitness('plankTime', parseInt(e.target.value) || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="60"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800">Flexibility & Balance</h4>
            
            <div>
              <label className="block text-sm font-medium">Sit and Reach (cm)</label>
              <input
                type="number"
                value={fitnessData.sitAndReach || ''}
                onChange={(e) => updateFitness('sitAndReach', parseFloat(e.target.value) || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="25"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Shoulder Flexibility</label>
              <select
                value={fitnessData.shoulderFlexibility || ''}
                onChange={(e) => updateFitness('shoulderFlexibility', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select rating</option>
                <option value="POOR">Poor</option>
                <option value="FAIR">Fair</option>
                <option value="GOOD">Good</option>
                <option value="EXCELLENT">Excellent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Single Leg Stand (seconds)</label>
              <input
                type="number"
                value={fitnessData.singleLegStand || ''}
                onChange={(e) => updateFitness('singleLegStand', parseInt(e.target.value) || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="30"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium">Assessment Notes</label>
          <textarea
            value={fitnessData.notes || ''}
            onChange={(e) => updateFitness('notes', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Additional notes about the fitness assessment..."
          />
        </div>
      </div>
    );
  };

  const renderAssessmentSpecificForm = () => {
    switch (assessment.type) {
      case 'PARQ':
        return renderPARQForm();
      case 'FITNESS_ASSESSMENT':
        return renderFitnessAssessmentForm();
      case 'BODY_COMPOSITION':
        return (
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-900 mb-2">Body Composition Assessment</h3>
            <p className="text-purple-700 text-sm">Detailed body composition analysis form will be implemented here.</p>
          </div>
        );
      case 'FMS':
        return (
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-orange-900 mb-2">Functional Movement Screen (FMS)</h3>
            <p className="text-orange-700 text-sm">FMS assessment form with 7 movement tests will be implemented here.</p>
          </div>
        );
      default:
        return (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{assessment.type.replace(/_/g, ' ')} Assessment</h3>
            <p className="text-gray-700 text-sm">Assessment-specific form for {assessment.type.toLowerCase().replace(/_/g, ' ')} will be implemented here.</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Assessment Form</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Client</label>
            <select
              value={assessment.clientId}
              onChange={(e) => onChange({ ...assessment, clientId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.codeName} - {client.firstName} {client.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Assessment Type</label>
            <select
              value={assessment.type}
              onChange={(e) => onChange({ ...assessment, type: e.target.value as AssessmentType })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="PARQ">PARQ (Physical Activity Readiness)</option>
              <option value="FITNESS_ASSESSMENT">Fitness Assessment</option>
              <option value="BODY_COMPOSITION">Body Composition</option>
              <option value="FMS">FMS (Functional Movement Screen)</option>
              <option value="FLEXIBILITY">Flexibility</option>
              <option value="STRENGTH">Strength</option>
              <option value="CARDIOVASCULAR">Cardiovascular</option>
              <option value="POSTURAL">Postural</option>
              <option value="BALANCE">Balance</option>
              <option value="MOBILITY">Mobility</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Assessment Date</label>
            <input
              type="date"
              value={assessment.assessmentDate}
              onChange={(e) => onChange({ ...assessment, assessmentDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Assessor</label>
            <input
              type="text"
              value={assessment.assessor}
              onChange={(e) => onChange({ ...assessment, assessor: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Your name"
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={assessment.status}
              onChange={(e) => onChange({ ...assessment, status: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="SCHEDULED">Scheduled</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <label className="block text-sm font-medium text-gray-700">General Notes</label>
          <textarea
            value={assessment.notes}
            onChange={(e) => onChange({ ...assessment, notes: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="General assessment notes..."
          />
        </div>
      </div>

      {assessment.type && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment Details</h3>
          {renderAssessmentSpecificForm()}
        </div>
      )}
    </div>
  );
} 