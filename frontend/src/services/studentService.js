import api from './api';

// Authentication
export const login = async (credentials) => {
  try {
    const response = await api.post('/students/login', credentials);
    if (response.data.success) {
      // Store auth data in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', 'student');
      localStorage.setItem('userData', JSON.stringify(response.data.data));
      
      // Set authorization header for subsequent requests
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      return response.data;
    } else {
      throw new Error(response.data.message || 'Login failed');
    }
  } catch (error) {
    // Clean up any partial auth state in case of error
    logout();
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('userData');
  delete api.defaults.headers.common['Authorization'];
};

export const checkAuth = () => {
  try {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    // Verify the token format is reasonable
    if (!token || typeof token !== 'string' || token.trim() === '' || role !== 'student') {
      return false;
    }
    
    // Basic check to see if the token is in JWT format (not a full validation)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('Invalid token format detected');
      logout();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking auth:', error);
    logout();
    return false;
  }
};

// Test authentication before API calls
export const verifyAuth = async () => {
  try {
    if (!checkAuth()) {
      return false;
    }
    
    // Test with a lightweight API call
    await api.get('/students/profile');
    return true;
  } catch (error) {
    console.error('Auth verification failed:', error);
    logout();
    return false;
  }
};

// Profile Management
export const getProfile = async () => {
  try {
    // Ensure the token is set in the headers before making the request
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await api.get('/students/profile');
    
    // Check if the response actually contains student data
    if (!response.data) {
      throw new Error('Empty profile data returned');
    }
    
    return response;
  } catch (error) {
    console.error('Profile fetch error:', error);
    if (error.response?.status === 401) {
      logout();
    }
    throw error;
  }
};

export const updateProfile = async (data) => {
  try {
    // Set proper headers for file uploads if present
    let headers = {};
    let requestConfig = {};
    
    if (data instanceof FormData) {
      // For FormData (file uploads), use multipart/form-data
      headers = { 'Content-Type': 'multipart/form-data' };
      requestConfig = { headers };
    }
    
    const response = await api.put('/students/profile', data, requestConfig);
    
    if (response.data.success) {
      // Update local userData if available
      try {
        const userData = JSON.parse(localStorage.getItem('userData')) || {};
        // Update basic fields that may have changed
        if (response.data.data.name) userData.name = response.data.data.name;
        if (response.data.data.department) userData.department = response.data.data.department;
        if (response.data.data.semester) userData.semester = response.data.data.semester;
        
        localStorage.setItem('userData', JSON.stringify(userData));
      } catch (e) {
        console.warn('Failed to update local userData:', e);
      }
    }
    
    return response;
  } catch (error) {
    if (error.response?.status === 401) {
      logout();
    }
    throw error;
  }
};

export const getExamResults = async () => {
  try {
    console.log('Fetching exam results for student...');
    const response = await api.get('/students/exam-results');
    
    // Process the exam results data for consistency before returning
    if (Array.isArray(response.data)) {
      // Map exam results to ensure all needed fields are present
      const processedResults = response.data.map(result => {
        // Make sure we have an examId object even if it's partially populated
        const examId = result.examId || {};
        
        // Create a properly structured result object
        const processedResult = {
          ...result,
          // Ensure essential fields have fallback values
          examId: {
            _id: examId._id || result._id || 'unknown',
            name: examId.name || examId.title || 'Unnamed Exam',
            type: (examId.type || 'general').toLowerCase(),
            maxScore: examId.maxScore || result.maxScore || 100,
            passingPercentage: examId.passingPercentage || 60
          },
          score: result.score || 0,
          maxScore: result.maxScore || examId.maxScore || 100,
          date: result.date || result.takenDate || result.createdAt || new Date().toISOString(),
          status: determineExamStatus(result)
        };
        
        return processedResult;
      });
      
      console.log(`Processed ${processedResults.length} exam results:`, processedResults);
      return { data: processedResults };
    }
    
    console.warn('Exam results not in expected array format:', response.data);
    return { data: [] };
  } catch (error) {
    console.error('Error fetching exam results:', error);
    if (error.response?.status === 401) {
      logout();
    }
    throw error;
  }
};

// Helper function to determine exam status based on score and passing percentage
function determineExamStatus(result) {
  // If status is already a string value (Passed/Failed), just return it
  if (result.status && typeof result.status === 'string') {
    const status = result.status.toLowerCase();
    if (status === 'passed' || status === 'failed') {
      return result.status;
    }
  }
  
  // Calculate status based on score and passing percentage
  const score = result.score || 0;
  const maxScore = result.maxScore || result.examId?.maxScore || 100;
  const passingPercentage = result.examId?.passingPercentage || 60;
  
  const percentage = (score / maxScore) * 100;
  return percentage >= passingPercentage ? 'Passed' : 'Failed';
}

export const getAvailableExams = async () => {
  try {
    // Set up proper error handling for this API call
    const response = await api.get('/students/available-exams');
    
    // Validate response data
    if (!response.data) {
      console.warn('No exam data returned from API');
      return { data: [] };
    }
    
    // Log successful response and check for proper exam status
    const exams = Array.isArray(response.data) ? response.data : [];
    
    // Calculate how many exams are in each state (using lowercase for consistency)
    const activeExams = exams.filter(exam => 
      exam.status.toLowerCase() === 'active'
    ).length;
    
    const scheduledExams = exams.filter(exam => 
      exam.status.toLowerCase() === 'scheduled'
    ).length;
    
    const expiredExams = exams.filter(exam => 
      exam.status.toLowerCase() === 'expired'
    ).length;
    
    console.log(`Retrieved ${exams.length} total exams: ${activeExams} active, ${scheduledExams} scheduled, ${expiredExams} expired`);
    return { data: exams };
  } catch (error) {
    console.error('Error fetching available exams:', error);
    if (error.response?.status === 401) {
      logout();
    }
    // Return empty array instead of throwing to avoid breaking UI
    return { data: [] };
  }
};

export const getExamById = async (examId) => {
  try {
    // Basic validation
    if (!examId) {
      console.error('getExamById called with empty ID');
      throw new Error('Exam ID is required');
    }
    
    console.log('getExamById service called with ID:', examId);
      // Import our utility to clean IDs
    const processExamId = (id) => {
      if (!id) return '';
      
      let cleanId = id;
      
      // Check if ID is in ObjectId("hex") format and extract the hex
      const objectIdMatch = /ObjectId\(['"]?([0-9a-fA-F]+)['"]?\)/i.exec(id);
      if (objectIdMatch && objectIdMatch[1]) {
        cleanId = objectIdMatch[1];
        console.log(`Extracted hex ID ${cleanId} from ObjectId format`);
      }
      
      // Remove any quotes or whitespace
      cleanId = cleanId.toString().replace(/['"]/g, '').trim();
      
      return cleanId;
    };
    
    // Process the exam ID to handle different formats
    let processedId = processExamId(examId);
    
    // Final validation of processed ID
    if (!processedId) {
      console.error('Failed to process exam ID:', examId);
      throw new Error('Invalid exam ID format');
    }
    
    console.log(`Using processed exam ID for API call: ${processedId}`);
    
    // Log the cleaned ID
    console.log('Final processed exam ID:', processedId);
      // Ensure we have authentication
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    // Set authorization header
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Make the API request with the processed ID
    console.log(`Making API request to: /exams/${processedId}`);
    const response = await api.get(`/exams/${processedId}`);
    console.log('API response status:', response.status);
    
    // Validate the response data
    if (!response.data) {
      throw new Error('Empty response received from server');
    }
    
    // Check for error response format
    if (response.data.success === false) {
      throw new Error(response.data.error || response.data.message || 'Failed to fetch exam data');
    }
    
    // Extract actual exam data from response
    const examData = response.data.data || response.data;
    
    // Validate that we have real exam data
    if (!examData || !examData._id) {
      throw new Error('Invalid exam data returned');
    }
    
    console.log(`Successfully fetched exam: ${examData.title}`);
    return { data: examData };
  } catch (error) {
    console.error(`Error fetching exam ${examId}:`, error);
    
    // Return error in a standardized format
    let errorMessage = 'Failed to load exam details';
    
    if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    if (error.response?.status === 401) {
      logout();
      errorMessage = 'Your session has expired. Please login again.';
    } else if (error.response?.status === 404) {
      errorMessage = 'The requested exam could not be found.';
    } else if (error.response?.status >= 500) {
      errorMessage = 'Server error. Please try again later.';
    }
    
    // Create a standardized error object
    const formattedError = new Error(errorMessage);
    formattedError.response = error.response;
    formattedError.originalError = error;
    
    throw formattedError;
  }
};

export const getExamStatus = (exam) => {
  if (!exam) return 'Unknown';
  
  const now = new Date();
  
  // Prioritize date-based status calculation
  if (exam.startDate && exam.endDate) {
    if (now >= new Date(exam.startDate) && now <= new Date(exam.endDate)) {
      return 'Active';
    } else if (now < new Date(exam.startDate)) {
      return 'Scheduled';
    } else {
      return 'Expired';
    }
  }
  
  // Fall back to status field if no dates available
  return exam.status || 'Unknown';
};

// Helper method to determine if an exam is active based on dates
export const isExamActive = (exam) => {
  if (!exam) return false;
  
  const now = new Date();
  
  // Check based on dates first
  if (exam.startDate && exam.endDate) {
    return now >= new Date(exam.startDate) && now <= new Date(exam.endDate);
  }
  
  // Also check scheduledFor date if available
  if (exam.scheduledFor) {
    const examDate = new Date(exam.scheduledFor);
    // If the scheduled date is today, consider it active
    if (examDate.setHours(0,0,0,0) <= now.setHours(0,0,0,0)) {
      return true;
    }
  }
  
  // Fall back to status field
  return (exam.status && 
          (exam.status.toLowerCase() === 'active' || 
           exam.status.toLowerCase() === 'ongoing' ||
           exam.status.toLowerCase() === 'published'));
};

export const getExamQuestions = async (examId) => {
  try {
    console.log(`Fetching questions for exam ${examId}`);
    
    // Ensure we have a valid token
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Missing authentication token');
      throw new Error('Authentication required. Please login again.');
    }
    
    // Make sure token is set in headers
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    console.log(`Making API request to /exams/${examId}/questions`);
    const response = await api.get(`/exams/${examId}/questions`);
    console.log('Questions API response received:', response.status);
    
    // Extract questions data from response
    let questionsData;
    
    if (!response.data) {
      throw new Error('Empty response received from server');
    }
    
    if (typeof response.data === 'object' && 'success' in response.data) {
      // Response has a success property, extract from data property
      console.log('Response contains success flag:', response.data.success);
      
      if (response.data.success === false) {
        console.error('API returned success=false:', response.data.error || response.data.message);
        throw new Error(response.data.error || response.data.message || 'Failed to fetch exam questions');
      }
      
      if (!response.data.data) {
        throw new Error('Response success=true but no data property found');
      }
      
      questionsData = response.data.data;
      console.log('Extracted questions from data property');
    } else {
      // Direct question array
      console.log('Assuming direct questions array in response');
      questionsData = response.data;
    }
    
    // Validate question data
    if (!questionsData) {
      console.error('No question data returned from API');
      throw new Error('No questions data available for this exam');
    }
    
    if (!Array.isArray(questionsData)) {
      console.error('Questions data is not an array:', typeof questionsData);
      throw new Error('Invalid questions format received from server');
    }
    
    if (questionsData.length === 0) {
      console.warn('Empty questions array returned from API');
      throw new Error('No questions have been added to this exam yet');
    }
    
    console.log(`Successfully fetched ${questionsData.length} questions for exam ${examId}`);
    return { data: questionsData };
  } catch (error) {
    console.error(`Error fetching exam questions for ${examId}:`, error);
    
    if (error.response) {
      console.error('Response error details:', {
        status: error.response.status,
        data: error.response.data
      });
      
      const errorData = error.response.data || {};
      const errorMessage = errorData.error || errorData.message || 'Unknown server error';
      
      if (error.response.status === 401) {
        logout();
        throw new Error('Your session has expired. Please login again.');
      } else if (error.response.status === 403) {
        throw new Error(errorMessage || 'You do not have permission to access this exam');
      } else if (error.response.status === 404) {
        throw new Error('Exam questions could not be found. The exam may not be set up correctly.');
      } else if (error.response.status >= 500) {
        throw new Error(`Server error: ${errorMessage}`);
      } else {
        throw new Error(`Error fetching questions: ${errorMessage}`);
      }
    }
    
    throw error;
  }
};

export const startExam = async (examId) => {
  try {
    console.log(`Starting exam with ID: ${examId}`);
    
    // Ensure we have a valid token
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    // Make sure token is set in headers
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    const response = await api.post(`/exams/${examId}/start`);
    
    // Check for API success flag
    if (response.data && response.data.success === false) {
      throw new Error(response.data.error || 'Failed to start exam');
    }
    
    console.log('Exam started successfully');
    return response;
  } catch (error) {
    console.error('Error starting exam:', error);
    if (error.response?.status === 401) {
      logout();
    }
    throw error;
  }
};

export const submitExam = async (examId, answers) => {
  try {
    console.log('Submitting exam with ID:', examId);
    console.log('Answers to submit:', answers);
    
    if (!examId) {
      throw new Error('Exam ID is required for submission');
    }
    
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      throw new Error('No answers provided for submission');
    }
    
    // Validate each answer has the required properties
    answers.forEach((answer, index) => {
      if (!answer.questionId) {
        throw new Error(`Answer at index ${index} is missing questionId`);
      }
    });
    
    const response = await api.post(`/exams/${examId}/submit`, { responses: answers });
    console.log('Submission response:', response);
    
    // Validate the response
    if (response.data && response.data.success === false) {
      throw new Error(response.data.error || response.data.message || 'Failed to submit exam');
    }
    
    return response;
  } catch (error) {
    console.error('Error submitting exam:', error.response || error);
    
    // Format user-friendly error message
    let errorMessage = 'Failed to submit exam';
    
    if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // Create an error object with more details to help debugging
    const enhancedError = new Error(errorMessage);
    enhancedError.response = error.response;
    enhancedError.originalError = error;
    
    throw enhancedError;
  }
};

export const getApplications = async () => {
  try {
    const response = await api.get('/students/applications');
    
    // Process the applications to ensure they have consistent data structure
    if (Array.isArray(response.data)) {
      const processedApplications = response.data.map(app => ({
        ...app,
        // Ensure these fields exist even if they're null/undefined in the API response
        companyName: app.companyName || 'Unknown Company',
        company: app.companyName || app.company || 'Unknown Company',
        jobRole: app.jobRole || 'Unknown Role',
        role: app.jobRole || app.role || 'Unknown Role',
        status: app.status || 'APPLIED'
      }));
      
      return { data: processedApplications };
    }
    
    return response;
  } catch (error) {
    if (error.response?.status === 401) {
      logout();
    }
    throw error;
  }
};

export const applyToJob = async (jobId) => {
  try {
    return await api.post(`/students/apply-job/${jobId}`);
  } catch (error) {
    if (error.response?.status === 401) {
      logout();
    }
    throw error;
  }
};

export const getResume = async () => {
  try {
    // Explicitly specify responseType as 'blob' to handle binary files correctly
    return await api.get('/students/resume', { 
      responseType: 'blob'
    });
  } catch (error) {
    if (error.response?.status === 401) {
      logout();
    }
    throw error;
  }
};

export const uploadResume = async (formData) => {
  try {
    return await api.put('/students/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  } catch (error) {
    if (error.response?.status === 401) {
      logout();
    }
    throw error;
  }
};

const studentService = {
  login,
  logout,
  checkAuth,
  verifyAuth,
  getProfile: async () => {
    return await api.get('/students/profile');
  },  updateProfile: async (profileData) => {
    return await api.put('/students/profile', profileData);
  },
  // Rename to prevent duplicate with exported standalone function
  uploadResumeFile: async (formData) => {
    return await api.post('/students/upload-resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  downloadResume: async () => {
    return await api.get('/students/resume', { responseType: 'blob' });
  },  getAvailableExams: async () => {
    try {
      console.log('Requesting available exams from API');
      const response = await api.get('/students/available-exams');
      console.log('Available exams response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching available exams:', error);
      throw error;
    }
  },
  // Use the exported standalone function
  getExamById,
  getExamQuestions: async (examId) => {
    return await api.get(`/exams/${examId}/questions`);
  },
  startExam: async (examId) => {
    return await api.post(`/exams/${examId}/start`);
  },
  submitExam: async (examId, answers) => {
    try {
      console.log('Submitting exam with ID:', examId);
      console.log('Answers to submit:', answers);
      
      const response = await api.post(`/exams/${examId}/submit`, { answers });
      console.log('Submission response:', response);
      return response;
    } catch (error) {
      console.error('Error submitting exam:', error.response || error);
      throw error;
    }
  },  getExamResults,
  applyForJob: async (jobId) => {
    return await api.post(`/jobs/${jobId}/apply`);
  },
  getApplications,
  getResume,
  // Already exported as standalone function, use the reference here
  uploadResume,  isExamActive: (exam) => {
    if (!exam) return false;
    
    const now = new Date();
    const startDate = exam.startDate ? new Date(exam.startDate) : null;
    const endDate = exam.endDate ? new Date(exam.endDate) : null;
    
    // Log date comparison for debugging
    console.log('Current time:', now);
    console.log('Exam start date:', startDate);
    console.log('Exam end date:', endDate);
    
    // An exam is active if current time is between start and end dates
    if (startDate && endDate) {
      const isActive = now >= startDate && now <= endDate;
      console.log('Is exam active based on dates?', isActive);
      return isActive;
    }
    
    // If no dates are provided, fallback to status check
    if (exam.status) {
      const isActiveByStatus = exam.status.toLowerCase() === 'active';
      console.log('Is exam active based on status?', isActiveByStatus);
      return isActiveByStatus;
    }
    
    return false;
  },  getExamStatus: (exam) => {
    if (!exam) return 'Unknown';
    
    const now = new Date();
    const startDate = exam.startDate ? new Date(exam.startDate) : null;
    const endDate = exam.endDate ? new Date(exam.endDate) : null;
    
    if (startDate && endDate) {
      if (now < startDate) {
        return 'Scheduled';
      } else if (now > endDate) {
        return 'Expired';
      } else {
        return 'Active';
      }
    }
    
    // Fallback to the stored status if dates aren't available
    return exam.status || 'Unknown';
  }
};

export default studentService;