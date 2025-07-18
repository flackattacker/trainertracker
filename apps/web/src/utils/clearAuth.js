// Utility to clear authentication data
export const clearAuth = () => {
  if (typeof window !== 'undefined') {
    // Clear trainer portal tokens
    localStorage.removeItem('trainer-tracker-token');
    localStorage.removeItem('trainer-tracker-user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear client portal tokens
    localStorage.removeItem('client-portal-token');
    localStorage.removeItem('client-portal-user');
    
    console.log('Authentication data cleared');
  }
};

// Force logout and redirect to login
export const forceLogout = () => {
  clearAuth();
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
}; 