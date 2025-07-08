"use client";

import { useState, useEffect } from 'react';
import { Button } from '@repo/ui/button';
import styles from '../../app/page.module.css';
import { 
  PARQData, 
  FitnessAssessmentData, 
  BodyCompositionData,
  FlexibilityAssessmentData,
  StrengthAssessmentData,
  CardiovascularAssessmentData,
  AssessmentData,
  defaultPARQData,
  defaultFitnessAssessmentData,
  defaultBodyCompositionData,
  defaultFlexibilityAssessmentData,
  defaultStrengthAssessmentData,
  defaultCardiovascularAssessmentData,
  assessmentDefaults
} from '../lib/assessmentData';

interface AssessmentFormProps {
  assessment: {
    clientId: string;
    type: 'PARQ' | 'FITNESS_ASSESSMENT' | 'BODY_COMPOSITION' | 'FLEXIBILITY' | 'STRENGTH' | 'CARDIOVASCULAR' | 'OTHER';
    assessmentDate: string;
    assessor: string;
    notes: string;
    status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    data: AssessmentData;
  };
  onChange: (assessment: any) => void;
  clients: Array<{ id: string; codeName: string; firstName: string; lastName: string }>;
}

export function AssessmentForm({ assessment, onChange, clients }: AssessmentFormProps) {
  const [currentData, setCurrentData] = useState<AssessmentData>(assessment.data);

  useEffect(() => {
    // Update data when assessment type changes
    const defaultData = assessmentDefaults[assessment.type] || {};
    setCurrentData(defaultData);
    onChange({ ...assessment, data: defaultData });
  }, [assessment.type]);

  const updateData = (newData: Partial<AssessmentData>) => {
    const updatedData = { ...currentData, ...newData };
    setCurrentData(updatedData);
    onChange({ ...assessment, data: updatedData });
  };

  const renderPARQForm = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Physical Activity Readiness Questionnaire (PAR-Q+)</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">1. Has your doctor ever said that you have a heart condition?</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="q1"
                  checked={currentData.PARQ?.questions.q1 === true}
                  onChange={(e) => updateData({
                    PARQ: {
                      ...currentData.PARQ,
                      questions: { ...currentData.PARQ?.questions, q1: e.target.checked }
                    }
                  })}
                  className="mr-2"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="q1"
                  checked={currentData.PARQ?.questions.q1 === false}
                  onChange={(e) => updateData({
                    PARQ: {
                      ...currentData.PARQ,
                      questions: { ...currentData.PARQ?.questions, q1: !e.target.checked }
                    }
                  })}
                  className="mr-2"
                />
                No
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">2. Do you feel pain in your chest when you do physical activity?</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="q2"
                  checked={currentData.PARQ?.questions.q2 === true}
                  onChange={(e) => updateData({
                    PARQ: {
                      ...currentData.PARQ,
                      questions: { ...currentData.PARQ?.questions, q2: e.target.checked }
                    }
                  })}
                  className="mr-2"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="q2"
                  checked={currentData.PARQ?.questions.q2 === false}
                  onChange={(e) => updateData({
                    PARQ: {
                      ...currentData.PARQ,
                      questions: { ...currentData.PARQ?.questions, q2: !e.target.checked }
                    }
                  })}
                  className="mr-2"
                />
                No
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">3. Do you lose your balance because of dizziness?</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="q4"
                  checked={currentData.PARQ?.questions.q4 === true}
                  onChange={(e) => updateData({
                    PARQ: {
                      ...currentData.PARQ,
                      questions: { ...currentData.PARQ?.questions, q4: e.target.checked }
                    }
                  })}
                  className="mr-2"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="q4"
                  checked={currentData.PARQ?.questions.q4 === false}
                  onChange={(e) => updateData({
                    PARQ: {
                      ...currentData.PARQ,
                      questions: { ...currentData.PARQ?.questions, q4: !e.target.checked }
                    }
                  })}
                  className="mr-2"
                />
                No
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">4. Do you have a bone or joint problem?</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="q5"
                  checked={currentData.PARQ?.questions.q5 === true}
                  onChange={(e) => updateData({
                    PARQ: {
                      ...currentData.PARQ,
                      questions: { ...currentData.PARQ?.questions, q5: e.target.checked }
                    }
                  })}
                  className="mr-2"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="q5"
                  checked={currentData.PARQ?.questions.q5 === false}
                  onChange={(e) => updateData({
                    PARQ: {
                      ...currentData.PARQ,
                      questions: { ...currentData.PARQ?.questions, q5: !e.target.checked }
                    }
                  })}
                  className="mr-2"
                />
                No
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">5. Are you currently taking blood pressure medication?</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="q6"
                  checked={currentData.PARQ?.questions.q6 === true}
                  onChange={(e) => updateData({
                    PARQ: {
                      ...currentData.PARQ,
                      questions: { ...currentData.PARQ?.questions, q6: e.target.checked }
                    }
                  })}
                  className="mr-2"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="q6"
                  checked={currentData.PARQ?.questions.q6 === false}
                  onChange={(e) => updateData({
                    PARQ: {
                      ...currentData.PARQ,
                      questions: { ...currentData.PARQ?.questions, q6: !e.target.checked }
                    }
                  })}
                  className="mr-2"
                />
                No
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">6. Is there any other reason you should not do physical activity?</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="q7"
                  checked={currentData.PARQ?.questions.q7 === true}
                  onChange={(e) => updateData({
                    PARQ: {
                      ...currentData.PARQ,
                      questions: { ...currentData.PARQ?.questions, q7: e.target.checked }
                    }
                  })}
                  className="mr-2"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="q7"
                  checked={currentData.PARQ?.questions.q7 === false}
                  onChange={(e) => updateData({
                    PARQ: {
                      ...currentData.PARQ,
                      questions: { ...currentData.PARQ?.questions, q7: !e.target.checked }
                    }
                  })}
                  className="mr-2"
                />
                No
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Risk Level</label>
          <select
            value={currentData.PARQ?.riskLevel || 'LOW'}
            onChange={(e) => updateData({
              PARQ: {
                ...currentData.PARQ,
                riskLevel: e.target.value as 'LOW' | 'MODERATE' | 'HIGH'
              }
            })}
            className="w-full p-2 border rounded"
          >
            <option value="LOW">Low</option>
            <option value="MODERATE">Moderate</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Cleared for Exercise</label>
          <select
            value={currentData.PARQ?.clearedForExercise ? 'true' : 'false'}
            onChange={(e) => updateData({
              PARQ: {
                ...currentData.PARQ,
                clearedForExercise: e.target.value === 'true'
              }
            })}
            className="w-full p-2 border rounded"
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Requires Medical Clearance</label>
          <select
            value={currentData.PARQ?.requiresMedicalClearance ? 'true' : 'false'}
            onChange={(e) => updateData({
              PARQ: {
                ...currentData.PARQ,
                requiresMedicalClearance: e.target.value === 'true'
              }
            })}
            className="w-full p-2 border rounded"
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Notes</label>
        <textarea
          value={currentData.PARQ?.notes || ''}
          onChange={(e) => updateData({
            PARQ: {
              ...currentData.PARQ,
              notes: e.target.value
            }
          })}
          className="w-full p-2 border rounded"
          rows={3}
          placeholder="Additional notes..."
        />
      </div>
    </div>
  );

  const renderFitnessAssessmentForm = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Fitness Assessment</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Height (cm)</label>
          <input
            type="number"
            value={currentData.fitness?.height || ''}
            onChange={(e) => updateData({
              fitness: {
                ...currentData.fitness,
                height: parseFloat(e.target.value) || 0
              }
            })}
            className="w-full p-2 border rounded"
            placeholder="170"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Weight (kg)</label>
          <input
            type="number"
            value={currentData.fitness?.weight || ''}
            onChange={(e) => updateData({
              fitness: {
                ...currentData.fitness,
                weight: parseFloat(e.target.value) || 0
              }
            })}
            className="w-full p-2 border rounded"
            placeholder="70"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">BMI</label>
          <input
            type="number"
            value={currentData.fitness?.bmi || ''}
            onChange={(e) => updateData({
              fitness: {
                ...currentData.fitness,
                bmi: parseFloat(e.target.value) || 0
              }
            })}
            className="w-full p-2 border rounded"
            placeholder="24.2"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Resting Heart Rate (bpm)</label>
          <input
            type="number"
            value={currentData.fitness?.restingHeartRate || ''}
            onChange={(e) => updateData({
              fitness: {
                ...currentData.fitness,
                restingHeartRate: parseFloat(e.target.value) || 0
              }
            })}
            className="w-full p-2 border rounded"
            placeholder="72"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Body Fat %</label>
          <input
            type="number"
            value={currentData.fitness?.bodyFatPercentage || ''}
            onChange={(e) => updateData({
              fitness: {
                ...currentData.fitness,
                bodyFatPercentage: parseFloat(e.target.value) || 0
              }
            })}
            className="w-full p-2 border rounded"
            placeholder="15.5"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Blood Pressure - Systolic</label>
          <input
            type="number"
            value={currentData.fitness?.bloodPressure?.systolic || ''}
            onChange={(e) => updateData({
              fitness: {
                ...currentData.fitness,
                bloodPressure: {
                  ...currentData.fitness?.bloodPressure,
                  systolic: parseFloat(e.target.value) || 0
                }
              }
            })}
            className="w-full p-2 border rounded"
            placeholder="120"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Blood Pressure - Diastolic</label>
          <input
            type="number"
            value={currentData.fitness?.bloodPressure?.diastolic || ''}
            onChange={(e) => updateData({
              fitness: {
                ...currentData.fitness,
                bloodPressure: {
                  ...currentData.fitness?.bloodPressure,
                  diastolic: parseFloat(e.target.value) || 0
                }
              }
            })}
            className="w-full p-2 border rounded"
            placeholder="80"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Push-ups (max reps)</label>
          <input
            type="number"
            value={currentData.fitness?.pushUps || ''}
            onChange={(e) => updateData({
              fitness: {
                ...currentData.fitness,
                pushUps: parseFloat(e.target.value) || 0
              }
            })}
            className="w-full p-2 border rounded"
            placeholder="25"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Sit-ups (max reps in 1 min)</label>
          <input
            type="number"
            value={currentData.fitness?.sitUps || ''}
            onChange={(e) => updateData({
              fitness: {
                ...currentData.fitness,
                sitUps: parseFloat(e.target.value) || 0
              }
            })}
            className="w-full p-2 border rounded"
            placeholder="35"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Plank Time (seconds)</label>
          <input
            type="number"
            value={currentData.fitness?.plankTime || ''}
            onChange={(e) => updateData({
              fitness: {
                ...currentData.fitness,
                plankTime: parseFloat(e.target.value) || 0
              }
            })}
            className="w-full p-2 border rounded"
            placeholder="60"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Sit and Reach (cm)</label>
          <input
            type="number"
            value={currentData.fitness?.sitAndReach || ''}
            onChange={(e) => updateData({
              fitness: {
                ...currentData.fitness,
                sitAndReach: parseFloat(e.target.value) || 0
              }
            })}
            className="w-full p-2 border rounded"
            placeholder="25"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Shoulder Flexibility</label>
          <select
            value={currentData.fitness?.shoulderFlexibility || 'FAIR'}
            onChange={(e) => updateData({
              fitness: {
                ...currentData.fitness,
                shoulderFlexibility: e.target.value as 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT'
              }
            })}
            className="w-full p-2 border rounded"
          >
            <option value="POOR">Poor</option>
            <option value="FAIR">Fair</option>
            <option value="GOOD">Good</option>
            <option value="EXCELLENT">Excellent</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Balance Test</label>
          <select
            value={currentData.fitness?.balanceTest || 'FAIR'}
            onChange={(e) => updateData({
              fitness: {
                ...currentData.fitness,
                balanceTest: e.target.value as 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT'
              }
            })}
            className="w-full p-2 border rounded"
          >
            <option value="POOR">Poor</option>
            <option value="FAIR">Fair</option>
            <option value="GOOD">Good</option>
            <option value="EXCELLENT">Excellent</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Notes</label>
        <textarea
          value={currentData.fitness?.notes || ''}
          onChange={(e) => updateData({
            fitness: {
              ...currentData.fitness,
              notes: e.target.value
            }
          })}
          className="w-full p-2 border rounded"
          rows={3}
          placeholder="Assessment notes..."
        />
      </div>
    </div>
  );

  const renderBodyCompositionForm = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Body Composition Assessment</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Body Fat %</label>
          <input
            type="number"
            value={currentData.bodyComposition?.bodyFatPercentage || ''}
            onChange={(e) => updateData({
              bodyComposition: {
                ...currentData.bodyComposition,
                bodyFatPercentage: parseFloat(e.target.value) || 0
              }
            })}
            className="w-full p-2 border rounded"
            placeholder="15.5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Lean Body Mass (kg)</label>
          <input
            type="number"
            value={currentData.bodyComposition?.leanBodyMass || ''}
            onChange={(e) => updateData({
              bodyComposition: {
                ...currentData.bodyComposition,
                leanBodyMass: parseFloat(e.target.value) || 0
              }
            })}
            className="w-full p-2 border rounded"
            placeholder="59.2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Fat Mass (kg)</label>
          <input
            type="number"
            value={currentData.bodyComposition?.fatMass || ''}
            onChange={(e) => updateData({
              bodyComposition: {
                ...currentData.bodyComposition,
                fatMass: parseFloat(e.target.value) || 0
              }
            })}
            className="w-full p-2 border rounded"
            placeholder="10.8"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Neck (cm)</label>
          <input
            type="number"
            value={currentData.bodyComposition?.neck || ''}
            onChange={(e) => updateData({
              bodyComposition: {
                ...currentData.bodyComposition,
                neck: parseFloat(e.target.value) || 0
              }
            })}
            className="w-full p-2 border rounded"
            placeholder="38"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Chest (cm)</label>
          <input
            type="number"
            value={currentData.bodyComposition?.chestCircumference || ''}
            onChange={(e) => updateData({
              bodyComposition: {
                ...currentData.bodyComposition,
                chestCircumference: parseFloat(e.target.value) || 0
              }
            })}
            className="w-full p-2 border rounded"
            placeholder="95"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Waist (cm)</label>
          <input
            type="number"
            value={currentData.bodyComposition?.waist || ''}
            onChange={(e) => updateData({
              bodyComposition: {
                ...currentData.bodyComposition,
                waist: parseFloat(e.target.value) || 0
              }
            })}
            className="w-full p-2 border rounded"
            placeholder="80"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Hips (cm)</label>
          <input
            type="number"
            value={currentData.bodyComposition?.hips || ''}
            onChange={(e) => updateData({
              bodyComposition: {
                ...currentData.bodyComposition,
                hips: parseFloat(e.target.value) || 0
              }
            })}
            className="w-full p-2 border rounded"
            placeholder="95"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Notes</label>
        <textarea
          value={currentData.bodyComposition?.notes || ''}
          onChange={(e) => updateData({
            bodyComposition: {
              ...currentData.bodyComposition,
              notes: e.target.value
            }
          })}
          className="w-full p-2 border rounded"
          rows={3}
          placeholder="Body composition notes..."
        />
      </div>
    </div>
  );

  const renderForm = () => {
    switch (assessment.type) {
      case 'PARQ':
        return renderPARQForm();
      case 'FITNESS_ASSESSMENT':
        return renderFitnessAssessmentForm();
      case 'BODY_COMPOSITION':
        return renderBodyCompositionForm();
      default:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Custom Assessment</h3>
            <div>
              <label className="block text-sm font-medium mb-2">Assessment Data (JSON)</label>
              <textarea
                value={JSON.stringify(currentData, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    updateData(parsed);
                  } catch (error) {
                    // Invalid JSON, ignore
                  }
                }}
                className="w-full p-2 border rounded font-mono text-sm"
                rows={10}
                placeholder="Enter assessment data as JSON..."
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className={styles.createForm}>
      <div className={styles.formGroup}>
        <label>Client</label>
        <select
          value={assessment.clientId}
          onChange={(e) => onChange({ ...assessment, clientId: e.target.value })}
          className={styles.select}
        >
          <option value="">Select a client</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>
              {client.codeName} - {client.firstName} {client.lastName}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label>Assessment Type</label>
        <select
          value={assessment.type}
          onChange={(e) => onChange({ ...assessment, type: e.target.value as any })}
          className={styles.select}
        >
          <option value="PARQ">PARQ (Physical Activity Readiness)</option>
          <option value="FITNESS_ASSESSMENT">Fitness Assessment</option>
          <option value="BODY_COMPOSITION">Body Composition</option>
          <option value="FLEXIBILITY">Flexibility</option>
          <option value="STRENGTH">Strength</option>
          <option value="CARDIOVASCULAR">Cardiovascular</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label>Assessment Date</label>
        <input
          type="date"
          value={assessment.assessmentDate}
          onChange={(e) => onChange({ ...assessment, assessmentDate: e.target.value })}
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Assessor</label>
        <input
          type="text"
          value={assessment.assessor}
          onChange={(e) => onChange({ ...assessment, assessor: e.target.value })}
          className={styles.input}
          placeholder="Your name"
        />
      </div>

      <div className={styles.formGroup}>
        <label>Status</label>
        <select
          value={assessment.status}
          onChange={(e) => onChange({ ...assessment, status: e.target.value as any })}
          className={styles.select}
        >
          <option value="SCHEDULED">Scheduled</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className={`${styles.formGroup} ${styles.fullWidth}`}>
        <label>General Notes</label>
        <textarea
          value={assessment.notes}
          onChange={(e) => onChange({ ...assessment, notes: e.target.value })}
          className={styles.textarea}
          rows={3}
          placeholder="General assessment notes..."
        />
      </div>

      <div className={`${styles.formGroup} ${styles.fullWidth}`}>
        <label>Assessment Data</label>
        <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f7fafc' }}>
          {renderForm()}
        </div>
      </div>
    </div>
  );
} 