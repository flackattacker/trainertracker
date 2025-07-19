'use client';

import React from 'react';
import ProgressiveOverload from '../../src/components/ProgressiveOverload';

export default function ProgressiveOverloadPage() {
  // Sample data for demonstration
  const sampleData = {
    clientId: 'sample-client-123',
    programId: 'sample-program-456',
    currentPhase: 'STRENGTH_ENDURANCE' as const,
    experienceLevel: 'INTERMEDIATE'
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Progressive Overload Demo</h1>
        <p className="text-gray-600">
          This demonstrates the automatic progression calculation system based on client performance data and OPT phase guidelines.
        </p>
      </div>

      <ProgressiveOverload
        clientId={sampleData.clientId}
        programId={sampleData.programId}
        currentPhase={sampleData.currentPhase}
        experienceLevel={sampleData.experienceLevel}
      />

      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">How It Works</h2>
        <div className="space-y-3 text-sm text-gray-700">
          <p>
            <strong>Phase-Based Guidelines:</strong> Each OPT phase has specific progression rules for sets, reps, intensity, and RPE targets.
          </p>
          <p>
            <strong>Performance Analysis:</strong> The system analyzes recent session data to determine if the client is ready for progression.
          </p>
          <p>
            <strong>Smart Recommendations:</strong> Based on RPE scores, consistency, and phase guidelines, it recommends weight increases, rep increases, or volume adjustments.
          </p>
          <p>
            <strong>Confidence Scoring:</strong> Each recommendation includes a confidence level (LOW, MEDIUM, HIGH) based on data quality and consistency.
          </p>
        </div>
      </div>
    </div>
  );
} 