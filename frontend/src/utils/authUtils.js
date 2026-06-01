// Simple utility to check authentication status
export const checkAuthStatus = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  
  const isAuthenticated = !!token;
  const isTPO = role === 'tpo';
  const isStudent = role === 'student';
  const isAdmin = role === 'admin';
  
  return {
    isAuthenticated,
    isTPO,
    isStudent,
    isAdmin,
    token,
    role
  };
};
