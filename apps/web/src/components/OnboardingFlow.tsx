"use client";

import { useState } from "react";
import { Button } from "@repo/ui/button";
import styles from "../../app/page.module.css";

interface User {
  id: string;
  email: string;
}

interface OnboardingData {
  // Personal Information
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'undisclosed';
  bio: string;
  
  // Business Information
  businessName: string;
  businessType: string;
  website: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  timezone: string;
  
  // Business Preferences
  defaultSessionDuration: number;
  businessHours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  
  // Certifications
  certifications: Array<{
    name: string;
    issuingOrganization: string;
    issueDate: string;
    expiryDate: string;
    certificationNumber: string;
  }>;
  
  // Preferences
  reminderPreferences: {
    emailReminders: boolean;
    smsReminders: boolean;
    sessionReminders: boolean;
    progressReminders: boolean;
  };
  
  privacySettings: {
    shareData: boolean;
    marketingEmails: boolean;
    analyticsConsent: boolean;
  };
  
  aiFeatures: {
    enableAIPrograms: boolean;
    enableAIAssessments: boolean;
    enableAIProgress: boolean;
  };
}

interface OnboardingFlowProps {
  onComplete: () => void;
  user: User;
}

const defaultOnboardingData: OnboardingData = {
  firstName: "",
  lastName: "",
  phone: "",
  dateOfBirth: "",
  gender: 'undisclosed',
  bio: "",
  businessName: "",
  businessType: "",
  website: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  country: "United States",
  timezone: "America/New_York",
  defaultSessionDuration: 60,
  businessHours: {
    monday: { open: "09:00", close: "17:00", closed: false },
    tuesday: { open: "09:00", close: "17:00", closed: false },
    wednesday: { open: "09:00", close: "17:00", closed: false },
    thursday: { open: "09:00", close: "17:00", closed: false },
    friday: { open: "09:00", close: "17:00", closed: false },
    saturday: { open: "09:00", close: "17:00", closed: false },
    sunday: { open: "09:00", close: "17:00", closed: true },
  },
  certifications: [],
  reminderPreferences: {
    emailReminders: true,
    smsReminders: false,
    sessionReminders: true,
    progressReminders: true,
  },
  privacySettings: {
    shareData: false,
    marketingEmails: false,
    analyticsConsent: true,
  },
  aiFeatures: {
    enableAIPrograms: true,
    enableAIAssessments: true,
    enableAIProgress: true,
  },
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function OnboardingFlow({ onComplete, user }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(defaultOnboardingData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalSteps = 5;

  const updateData = (field: keyof OnboardingData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const updateNestedData = (parent: keyof OnboardingData, field: string, value: any) => {
    setData(prev => ({
      ...prev,
      [parent]: { ...(prev[parent] as any), [field]: value }
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem('trainer-tracker-token');
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`${API_BASE}/api/auth/onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to complete onboarding');
      }

      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addCertification = () => {
    setData(prev => ({
      ...prev,
      certifications: [...prev.certifications, {
        name: "",
        issuingOrganization: "",
        issueDate: "",
        expiryDate: "",
        certificationNumber: "",
      }]
    }));
  };

  const removeCertification = (index: number) => {
    setData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const updateCertification = (index: number, field: string, value: string) => {
    setData(prev => ({
      ...prev,
      certifications: prev.certifications.map((cert, i) => 
        i === index ? { ...cert, [field]: value } : cert
      )
    }));
  };

  const renderStepIndicator = () => (
    <div className={styles.onboardingProgress}>
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={`${styles.stepIndicator} ${
            i + 1 === currentStep ? styles.active : i + 1 < currentStep ? styles.completed : ''
          }`}
        >
          {i + 1 < currentStep ? '✓' : i + 1}
        </div>
      ))}
    </div>
  );

  const renderPersonalInfo = () => (
    <div className={styles.onboardingStep}>
      <h2>Personal Information</h2>
      <p>Tell us about yourself to personalize your experience.</p>
      
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label>First Name *</label>
          <input
            type="text"
            value={data.firstName}
            onChange={(e) => updateData('firstName', e.target.value)}
            placeholder="Enter your first name"
            required
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>Last Name *</label>
          <input
            type="text"
            value={data.lastName}
            onChange={(e) => updateData('lastName', e.target.value)}
            placeholder="Enter your last name"
            required
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>Phone Number</label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => updateData('phone', e.target.value)}
            placeholder="(555) 123-4567"
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>Date of Birth</label>
          <input
            type="date"
            value={data.dateOfBirth}
            onChange={(e) => updateData('dateOfBirth', e.target.value)}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>Gender</label>
          <select
            value={data.gender}
            onChange={(e) => updateData('gender', e.target.value)}
          >
            <option value="undisclosed">Prefer not to say</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div className={styles.formGroup}>
          <label>Bio</label>
          <textarea
            value={data.bio}
            onChange={(e) => updateData('bio', e.target.value)}
            placeholder="Tell us about your background, experience, and what makes you unique as a trainer..."
            rows={4}
          />
        </div>
      </div>
    </div>
  );

  const renderBusinessInfo = () => (
    <div className={styles.onboardingStep}>
      <h2>Business Information</h2>
      <p>Help us understand your business setup and preferences.</p>
      
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label>Business Name</label>
          <input
            type="text"
            value={data.businessName}
            onChange={(e) => updateData('businessName', e.target.value)}
            placeholder="Your business name"
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>Business Type</label>
          <select
            value={data.businessType}
            onChange={(e) => updateData('businessType', e.target.value)}
          >
            <option value="">Select business type</option>
            <option value="personal_trainer">Personal Trainer</option>
            <option value="fitness_studio">Fitness Studio</option>
            <option value="gym">Gym</option>
            <option value="wellness_center">Wellness Center</option>
            <option value="corporate_fitness">Corporate Fitness</option>
            <option value="online_coaching">Online Coaching</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div className={styles.formGroup}>
          <label>Website</label>
          <input
            type="url"
            value={data.website}
            onChange={(e) => updateData('website', e.target.value)}
            placeholder="https://yourwebsite.com"
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>Address</label>
          <input
            type="text"
            value={data.address}
            onChange={(e) => updateData('address', e.target.value)}
            placeholder="Street address"
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>City</label>
          <input
            type="text"
            value={data.city}
            onChange={(e) => updateData('city', e.target.value)}
            placeholder="City"
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>State/Province</label>
          <input
            type="text"
            value={data.state}
            onChange={(e) => updateData('state', e.target.value)}
            placeholder="State or province"
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>ZIP/Postal Code</label>
          <input
            type="text"
            value={data.zipCode}
            onChange={(e) => updateData('zipCode', e.target.value)}
            placeholder="ZIP or postal code"
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>Country</label>
          <input
            type="text"
            value={data.country}
            onChange={(e) => updateData('country', e.target.value)}
            placeholder="Country"
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>Timezone</label>
          <select
            value={data.timezone}
            onChange={(e) => updateData('timezone', e.target.value)}
          >
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="America/Anchorage">Alaska Time</option>
            <option value="Pacific/Honolulu">Hawaii Time</option>
          </select>
        </div>
        
        <div className={styles.formGroup}>
          <label>Default Session Duration (minutes)</label>
          <select
            value={data.defaultSessionDuration}
            onChange={(e) => updateData('defaultSessionDuration', parseInt(e.target.value))}
          >
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>60 minutes</option>
            <option value={90}>90 minutes</option>
            <option value={120}>120 minutes</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderBusinessHours = () => (
    <div className={styles.onboardingStep}>
      <h2>Business Hours</h2>
      <p>Set your typical business hours for scheduling purposes.</p>
      
      <div className={styles.businessHoursGrid}>
        {Object.entries(data.businessHours).map(([day, hours]) => (
          <div key={day} className={styles.businessDay}>
            <div className={styles.dayHeader}>
              <label>
                <input
                  type="checkbox"
                  checked={!hours.closed}
                  onChange={(e) => updateNestedData('businessHours', day, { ...hours, closed: !e.target.checked })}
                />
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </label>
            </div>
            
            {!hours.closed && (
              <div className={styles.hoursInputs}>
                <input
                  type="time"
                  value={hours.open}
                  onChange={(e) => updateNestedData('businessHours', day, { ...hours, open: e.target.value })}
                />
                <span>to</span>
                <input
                  type="time"
                  value={hours.close}
                  onChange={(e) => updateNestedData('businessHours', day, { ...hours, close: e.target.value })}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderCertifications = () => (
    <div className={styles.onboardingStep}>
      <h2>Certifications</h2>
      <p>Add your professional certifications and credentials.</p>
      
      <div className={styles.certificationsList}>
        {data.certifications.map((cert, index) => (
          <div key={index} className={styles.certificationCard}>
            <div className={styles.certificationHeader}>
              <h4>Certification {index + 1}</h4>
              <button
                type="button"
                onClick={() => removeCertification(index)}
                className={styles.removeButton}
              >
                Remove
              </button>
            </div>
            
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Certification Name *</label>
                <input
                  type="text"
                  value={cert.name}
                  onChange={(e) => updateCertification(index, 'name', e.target.value)}
                  placeholder="e.g., NASM Certified Personal Trainer"
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Issuing Organization *</label>
                <input
                  type="text"
                  value={cert.issuingOrganization}
                  onChange={(e) => updateCertification(index, 'issuingOrganization', e.target.value)}
                  placeholder="e.g., National Academy of Sports Medicine"
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Issue Date</label>
                <input
                  type="date"
                  value={cert.issueDate}
                  onChange={(e) => updateCertification(index, 'issueDate', e.target.value)}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Expiry Date</label>
                <input
                  type="date"
                  value={cert.expiryDate}
                  onChange={(e) => updateCertification(index, 'expiryDate', e.target.value)}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Certification Number</label>
                <input
                  type="text"
                  value={cert.certificationNumber}
                  onChange={(e) => updateCertification(index, 'certificationNumber', e.target.value)}
                  placeholder="Certification number or ID"
                />
              </div>
            </div>
          </div>
        ))}
        
        <Button
          onClick={addCertification}
          className={styles.addButton}
          appName="trainer-tracker"
        >
          + Add Certification
        </Button>
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className={styles.onboardingStep}>
      <h2>Preferences & Settings</h2>
      <p>Customize your experience and notification preferences.</p>
      
      <div className={styles.preferencesSection}>
        <h3>Reminder Preferences</h3>
        <div className={styles.checkboxGroup}>
          <label>
            <input
              type="checkbox"
              checked={data.reminderPreferences.emailReminders}
              onChange={(e) => updateNestedData('reminderPreferences', 'emailReminders', e.target.checked)}
            />
            Email reminders
          </label>
          <label>
            <input
              type="checkbox"
              checked={data.reminderPreferences.smsReminders}
              onChange={(e) => updateNestedData('reminderPreferences', 'smsReminders', e.target.checked)}
            />
            SMS reminders
          </label>
          <label>
            <input
              type="checkbox"
              checked={data.reminderPreferences.sessionReminders}
              onChange={(e) => updateNestedData('reminderPreferences', 'sessionReminders', e.target.checked)}
            />
            Session reminders
          </label>
          <label>
            <input
              type="checkbox"
              checked={data.reminderPreferences.progressReminders}
              onChange={(e) => updateNestedData('reminderPreferences', 'progressReminders', e.target.checked)}
            />
            Progress tracking reminders
          </label>
        </div>
      </div>
      
      <div className={styles.preferencesSection}>
        <h3>Privacy Settings</h3>
        <div className={styles.checkboxGroup}>
          <label>
            <input
              type="checkbox"
              checked={data.privacySettings.shareData}
              onChange={(e) => updateNestedData('privacySettings', 'shareData', e.target.checked)}
            />
            Allow data sharing for research (anonymous)
          </label>
          <label>
            <input
              type="checkbox"
              checked={data.privacySettings.marketingEmails}
              onChange={(e) => updateNestedData('privacySettings', 'marketingEmails', e.target.checked)}
            />
            Receive marketing emails
          </label>
          <label>
            <input
              type="checkbox"
              checked={data.privacySettings.analyticsConsent}
              onChange={(e) => updateNestedData('privacySettings', 'analyticsConsent', e.target.checked)}
            />
            Allow analytics and usage tracking
          </label>
        </div>
      </div>
      
      <div className={styles.preferencesSection}>
        <h3>AI Features</h3>
        <div className={styles.checkboxGroup}>
          <label>
            <input
              type="checkbox"
              checked={data.aiFeatures.enableAIPrograms}
              onChange={(e) => updateNestedData('aiFeatures', 'enableAIPrograms', e.target.checked)}
            />
            Enable AI-powered program generation
          </label>
          <label>
            <input
              type="checkbox"
              checked={data.aiFeatures.enableAIAssessments}
              onChange={(e) => updateNestedData('aiFeatures', 'enableAIAssessments', e.target.checked)}
            />
            Enable AI-powered assessment analysis
          </label>
          <label>
            <input
              type="checkbox"
              checked={data.aiFeatures.enableAIProgress}
              onChange={(e) => updateNestedData('aiFeatures', 'enableAIProgress', e.target.checked)}
            />
            Enable AI-powered progress insights
          </label>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderPersonalInfo();
      case 2:
        return renderBusinessInfo();
      case 3:
        return renderBusinessHours();
      case 4:
        return renderCertifications();
      case 5:
        return renderPreferences();
      default:
        return null;
    }
  };

  // Add logout handler
  const handleLogout = () => {
    localStorage.removeItem('trainer-tracker-token');
    localStorage.removeItem('trainer-tracker-user');
    window.location.reload();
  };

  return (
    <div className={styles.onboardingContainer}>
      <div className={styles.onboardingContent}>
        <div className={styles.onboardingHeader}>
          <h1>Welcome to Trainer Tracker!</h1>
          <p>Let's set up your profile to get you started.</p>
          <button
            onClick={handleLogout}
            className={styles.onboardingLogoutButton}
            aria-label="Logout"
          >
            Logout
          </button>
        </div>
        
        {renderStepIndicator()}
        
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}
        
        {renderCurrentStep()}
        
        <div className={styles.onboardingActions}>
          {currentStep > 1 && (
            <Button
              onClick={prevStep}
              appName="trainer-tracker"
              className={styles.onboardingSecondaryButton}
            >
              Previous
            </Button>
          )}
          
          {currentStep < totalSteps ? (
            <Button
              onClick={nextStep}
              disabled={!data.firstName || !data.lastName}
              appName="trainer-tracker"
              className={styles.onboardingPrimaryButton}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              appName="trainer-tracker"
              className={styles.onboardingPrimaryButton}
            >
              {loading ? 'Completing Setup...' : 'Complete Setup'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 