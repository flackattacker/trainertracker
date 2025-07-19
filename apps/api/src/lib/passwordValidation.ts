// Password validation and strength requirements
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  score: number; // 0-100
}

export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventCommonPasswords: boolean;
  preventPersonalInfo: boolean;
}

// Default password requirements
export const DEFAULT_PASSWORD_REQUIREMENTS: PasswordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventCommonPasswords: true,
  preventPersonalInfo: true,
};

// Common passwords to prevent
const COMMON_PASSWORDS = [
  'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
  'admin', 'letmein', 'welcome', 'monkey', 'dragon', 'master', 'hello',
  'freedom', 'whatever', 'qwerty123', 'trustno1', 'jordan', 'harley',
  'ranger', 'iwantu', 'jennifer', 'hunter', 'buster', 'soccer', 'baseball',
  'tiger', 'charlie', 'andrew', 'michelle', 'love', 'jessica', 'asshole',
  '2000', 'chelsea', 'black', 'diamond', 'nascar', 'jackson', 'cameron',
  '654321', 'computer', 'amanda', 'wizard', 'xxxxxxxx', 'money', 'phoenix',
  'mickey', 'bailey', 'knight', 'iceman', 'tigers', 'purple', 'andrea',
  'horny', 'dakota', 'aaaaaa', 'player', 'sunshine', 'morgan', 'starwars',
  'boomer', 'cowboys', 'edward', 'charles', 'girls', 'coffee', 'bulldog',
  'ncc1701', 'rabbit', 'peanut', 'johnson', 'chester', 'london', 'midnight',
  'blue', 'fishing', '000000', 'hannah', 'slayer', '111111', 'rachel',
  'test', 'bitch', 'orange', 'michelle', 'charlie', 'andrew', 'matthew',
  'access', 'yankees', '987654321', 'dallas', 'austin', 'thunder', 'taylor',
  'matrix', 'mobilemail', 'mom', 'monitor', 'montreal', 'moon', 'moscow',
  'mother', 'movie', 'mozilla', 'music', 'mustang', 'password', 'pa$$w0rd',
  'p@ssw0rd', 'p@$$w0rd', 'p@ssword', 'p@$$word', 'p@ssw0rd123', 'p@$$w0rd123'
];

// Password strength scoring
const calculatePasswordStrength = (password: string): { strength: 'weak' | 'medium' | 'strong' | 'very-strong'; score: number } => {
  let score = 0;
  
  // Length bonus
  if (password.length >= 8) score += 10;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;
  
  // Character variety bonus
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  if (/[^A-Za-z0-9]/.test(password)) score += 15;
  
  // Complexity bonus
  if (/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(password)) score += 10;
  if (/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/.test(password)) score += 15;
  
  // Deductions for patterns
  if (/(.)\1{2,}/.test(password)) score -= 10; // Repeated characters
  if (/123|234|345|456|567|678|789|890/.test(password)) score -= 10; // Sequential numbers
  if (/qwe|wer|ert|rty|tyu|yui|uio|iop/.test(password)) score -= 10; // Sequential letters
  
  // Cap score at 100
  score = Math.max(0, Math.min(100, score));
  
  // Determine strength level
  let strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  if (score < 30) strength = 'weak';
  else if (score < 50) strength = 'medium';
  else if (score < 80) strength = 'strong';
  else strength = 'very-strong';
  
  return { strength, score };
};

// Validate password against requirements
export const validatePassword = (
  password: string,
  requirements: PasswordRequirements = DEFAULT_PASSWORD_REQUIREMENTS,
  personalInfo?: { email?: string; firstName?: string; lastName?: string }
): PasswordValidationResult => {
  const errors: string[] = [];
  
  // Check minimum length
  if (password.length < requirements.minLength) {
    errors.push(`Password must be at least ${requirements.minLength} characters long`);
  }
  
  // Check character requirements
  if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (requirements.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (requirements.requireNumbers && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (requirements.requireSpecialChars && !/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // Check for common passwords
  if (requirements.preventCommonPasswords) {
    const lowerPassword = password.toLowerCase();
    if (COMMON_PASSWORDS.includes(lowerPassword)) {
      errors.push('Password is too common. Please choose a more unique password');
    }
  }
  
  // Check for personal information
  if (requirements.preventPersonalInfo && personalInfo) {
    const lowerPassword = password.toLowerCase();
    const { email, firstName, lastName } = personalInfo;
    
    if (email) {
      const emailParts = email.toLowerCase().split('@')[0];
      if (lowerPassword.includes(emailParts) && emailParts.length > 3) {
        errors.push('Password should not contain your email address');
      }
    }
    
    if (firstName && lowerPassword.includes(firstName.toLowerCase())) {
      errors.push('Password should not contain your first name');
    }
    
    if (lastName && lowerPassword.includes(lastName.toLowerCase())) {
      errors.push('Password should not contain your last name');
    }
  }
  
  // Calculate strength
  const { strength, score } = calculatePasswordStrength(password);
  
  return {
    isValid: errors.length === 0,
    errors,
    strength,
    score
  };
};

// Generate secure random password
export const generateSecurePassword = (length: number = 16): string => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let password = '';
  
  // Ensure at least one character from each required category
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Uppercase
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Lowercase
  password += '0123456789'[Math.floor(Math.random() * 10)]; // Number
  password += '!@#$%^&*()_+-=[]{}|;:,.<>?'[Math.floor(Math.random() * 32)]; // Special char
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

// Generate password reset token
export const generateResetToken = (): string => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += charset[Math.floor(Math.random() * charset.length)];
  }
  return token;
};

// Validate password reset token format
export const validateResetToken = (token: string): boolean => {
  return /^[A-Z0-9]{32}$/.test(token);
}; 