import React from 'react';

interface PasswordStrengthIndicatorProps {
  password: string;
  strength?: 'weak' | 'medium' | 'strong' | 'very-strong';
  score?: number;
  errors?: string[];
  showRequirements?: boolean;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  strength,
  score,
  errors = [],
  showRequirements = true
}) => {
  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'weak': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'strong': return 'text-blue-500';
      case 'very-strong': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getStrengthText = (strength: string) => {
    switch (strength) {
      case 'weak': return 'Weak';
      case 'medium': return 'Medium';
      case 'strong': return 'Strong';
      case 'very-strong': return 'Very Strong';
      default: return 'Unknown';
    }
  };

  const getProgressColor = (strength: string) => {
    switch (strength) {
      case 'weak': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'strong': return 'bg-blue-500';
      case 'very-strong': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const getProgressWidth = (score: number) => {
    return Math.min(100, Math.max(0, score));
  };

  const requirements = [
    { 
      label: 'At least 8 characters', 
      met: password.length >= 8,
      regex: /.{8,}/
    },
    { 
      label: 'One uppercase letter', 
      met: /[A-Z]/.test(password),
      regex: /[A-Z]/
    },
    { 
      label: 'One lowercase letter', 
      met: /[a-z]/.test(password),
      regex: /[a-z]/
    },
    { 
      label: 'One number', 
      met: /[0-9]/.test(password),
      regex: /[0-9]/
    },
    { 
      label: 'One special character', 
      met: /[^A-Za-z0-9]/.test(password),
      regex: /[^A-Za-z0-9]/
    }
  ];

  if (!password) {
    return null;
  }

  return (
    <div className="mt-2 space-y-3">
      {/* Strength Bar */}
      {strength && score !== undefined && (
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Password Strength:</span>
            <span className={`font-medium ${getStrengthColor(strength)}`}>
              {getStrengthText(strength)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(strength)}`}
              style={{ width: `${getProgressWidth(score)}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 text-right">
            Score: {score}/100
          </div>
        </div>
      )}

      {/* Requirements */}
      {showRequirements && (
        <div className="space-y-1">
          <div className="text-sm font-medium text-gray-700">Requirements:</div>
          <div className="space-y-1">
            {requirements.map((req, index) => (
              <div key={index} className="flex items-center text-sm">
                <span className={`mr-2 ${req.met ? 'text-green-500' : 'text-red-500'}`}>
                  {req.met ? '✓' : '✗'}
                </span>
                <span className={req.met ? 'text-gray-600' : 'text-gray-400'}>
                  {req.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="space-y-1">
          <div className="text-sm font-medium text-red-600">Issues:</div>
          <div className="space-y-1">
            {errors.map((error, index) => (
              <div key={index} className="flex items-start text-sm">
                <span className="text-red-500 mr-2 mt-0.5">•</span>
                <span className="text-red-600">{error}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator; 