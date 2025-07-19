"use client";

import { AssessmentIntegration } from '../../src/components/AssessmentIntegration';

export default function AssessmentIntegrationPage() {
  const handleTemplateSelect = (template: any) => {
    console.log('Selected template:', template);
    alert(`Selected template: ${template.name}`);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Assessment Integration Demo</h1>
        <p className="text-gray-600">
          This page demonstrates the Assessment Integration feature that analyzes client assessment data 
          and provides personalized template recommendations based on health screening, fitness assessments, 
          strength tests, and other evaluation criteria.
        </p>
      </div>

      <AssessmentIntegration
        clientId="107c350e-0153-4a4a-83df-2a6d6ffeb842" // Demo client ID
        onTemplateSelect={handleTemplateSelect}
      />
    </div>
  );
} 