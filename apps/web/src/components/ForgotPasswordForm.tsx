import React, { useState } from 'react';
import { Button } from '@repo/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';

interface ForgotPasswordFormProps {
  userType: 'CPT' | 'CLIENT';
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  userType,
  onSuccess,
  onCancel
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [submitted, setSubmitted] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setMessage('Please enter your email address');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          userType,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Password reset email sent!');
        setMessageType('success');
        setSubmitted(true);
        
        if (onSuccess) {
          setTimeout(onSuccess, 3000);
        }
      } else {
        setMessage(data.error || 'Failed to send reset email');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setEmail('');
    setMessage('');
    setSubmitted(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <p className="text-sm text-gray-600">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </CardHeader>
      <CardContent>
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {message && (
              <div className={`p-3 rounded-md text-sm ${
                messageType === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email address"
                required
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                disabled={loading || !email}
                className="flex-1"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className={`p-3 rounded-md text-sm ${
              messageType === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
            
            <div className="text-sm text-gray-600 space-y-2">
              <p>Check your email for a password reset link.</p>
              <p>If you don't see the email, check your spam folder.</p>
              <p>The reset link will expire in 1 hour.</p>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleReset}
                variant="outline"
                className="flex-1"
              >
                Try Again
              </Button>
              {onCancel && (
                <Button
                  onClick={onCancel}
                  variant="outline"
                >
                  Back to Login
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ForgotPasswordForm; 