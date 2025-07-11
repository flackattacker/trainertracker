// Utility to clear authentication data
export const clearAuth = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('trainer-tracker-token');
    localStorage.removeItem('trainer-tracker-user');
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