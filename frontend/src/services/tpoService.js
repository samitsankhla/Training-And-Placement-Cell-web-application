import api from './api';

const tpoService = {
  // Auth
  login: (credentials) => api.post('/tpo/login', credentials),
  resetPassword: (email) => api.post('/tpo/reset-password', { email }),
  updatePassword: (data) => api.put('/tpo/update-password', data),
  setAuthToken: (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  },
  checkAuth: () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    return token && role === 'tpo';
  },

  // Profile
  getProfile: () => api.get('/tpo/profile'),
  updateProfile: (data) => api.put('/tpo/profile', data),

  // Dashboard
  getDashboardStats: () => api.get('/tpo/stats'),  
  
  // Job Drives
  getAllJobDrives: () => api.get('/tpo/jobs'),
  getJobDriveById: (id) => api.get(`/tpo/jobs/${id}`),
  createJobDrive: (data) => api.post('/tpo/jobs', data),
  getJobApplicants: (jobId) => api.get(`/jobs/${jobId}`).then(response => {
    const job = response.data;
    return job.applications.map(app => ({
      ...app.student,
      applicationStatus: app.status,
      appliedDate: app.appliedDate
    }));
  }),
  
  // Exams
  getAllExams: () => api.get('/exams'),
  getExamById: (id) => api.get(`/exams/${id}`),
  
  updateJobDrive: (id, data) => api.put(`/tpo/jobs/${id}`, data),
  deleteJobDrive: (id) => api.delete(`/tpo/jobs/${id}`),
  exportJobDrive: (id) => api.get(`/tpo/jobs/${id}/export`, { responseType: 'blob' }),
  searchJobDrives: (query) => api.get(`/tpo/jobs/search?q=${query}`),
  updateApplicationStatus: (jobId, studentId, status) =>
    api.put(`/tpo/jobs/${jobId}/applications/${studentId}`, { status }),

  // Students
  getStudents: () => api.get('/tpo/students'),
  getFilteredStudents: (filters) => api.post('/tpo/students/filter', filters),
  getStudentById: (id) => api.get(`/tpo/students/${id}`),
  searchStudents: (query) => api.get(`/tpo/students/search?q=${query}`),
  exportStudents: () => api.get('/tpo/students/export', { responseType: 'blob' }),
  viewStudentResume: (studentId) => api.get(`/tpo/students/${studentId}/resume`, { responseType: 'blob' }),

  // Mock Tests
  getAllMockTests: () => api.get('/tpo/exams'),
  getMockTestById: (id) => api.get(`/tpo/exams/${id}`),
  createMockTest: (data) => api.post('/tpo/exams', data),
  updateMockTest: (id, data) => api.put(`/tpo/exams/${id}`, data),
  deleteMockTest: (id) => api.delete(`/tpo/exams/${id}`),
  getMockTestResults: (examId) => api.get(`/tpo/exams/${examId}/results`),
  exportMockTestResults: (examId) => api.get(`/tpo/exams/${examId}/results/export`, { responseType: 'blob' }),

  // Placed Students
  getPlacedStudents: () => api.get('/tpo/placed-students'),
  markStudentPlaced: (studentId, placementData) =>
    api.post(`/tpo/placed-students/${studentId}`, placementData),
  updatePlacementDetails: (studentId, data) =>
    api.put(`/tpo/placed-students/${studentId}`, data),
  exportPlacementReport: () =>
    api.get('/tpo/placed-students/export', { responseType: 'blob' }),
    
  // Fetch exams - returns response.data directly
  getExams: async () => {
    const response = await api.get('/exams');
    return response.data;
  },
  getExam: async (id) => {
    const response = await api.get(`/exams/${id}`);
    return response.data;
  },
  
  createExam: async (examData) => {
    console.log('Creating exam through tpoService with', 
      examData.sections?.[0]?.questions?.length, 'questions');
    
    try {
      // Check if examData contains file documents
      if (examData.documents && examData.documents.length > 0) {
        // Use FormData for files
        const formData = new FormData();
        Object.keys(examData).forEach(key => {
          if (key === 'documents') {
            examData[key].forEach(file => formData.append('documents', file));
          } else if (key === 'eligibility' || key === 'sections') {
            formData.append(key, JSON.stringify(examData[key]));
          } else {
            formData.append(key, examData[key]);
          }
        });
        
        console.log('Making FormData API request to /exams');
        const response = await api.post('/exams', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        console.log('FormData API response received:', response);
        return response.data;
      } else {
        // Use JSON for regular data
        console.log('Making JSON API request to /exams');
        const response = await api.post('/exams', examData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log('JSON API response received:', response);
        return response.data || response;
      }
    } catch (error) {
      console.error('Error in createExam API call:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Status:', error.response.status);
        throw error;  // Re-throw the error for the component to handle
      } else if (error.request) {
        console.error('No response received:', error.request);
        throw new Error('No response received from the server. Check your network connection.');
      } else {
        console.error('Error setting up request:', error.message);
        throw error;
      }
    }
  },

  updateExam: async (id, examData) => {
    const formData = new FormData();
    Object.keys(examData).forEach(key => {
      if (key === 'documents') {
        examData[key].forEach(file => formData.append('documents', file));
      } else if (key === 'eligibility' || key === 'sections') {
        formData.append(key, JSON.stringify(examData[key]));
      } else {
        formData.append(key, examData[key]);
      }
    });
    
    const response = await api.put(`/exams/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  
  deleteExam: async (id) => {
    const response = await api.delete(`/exams/${id}`);
    return response.data;
  },

  exportExamResults: async (id) => {
    const response = await api.get(`/exams/${id}/results/export`, {
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `exam-results-${id}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // Announcements
  getAllAnnouncements: () => api.get('/tpo/announcements'),
  getAnnouncementById: (id) => api.get(`/tpo/announcements/${id}`),
  createAnnouncement: (data) => api.post('/tpo/announcements', data),
  updateAnnouncement: (id, data) => api.put(`/tpo/announcements/${id}`, data),
  deleteAnnouncement: (id) => api.delete(`/tpo/announcements/${id}`),
  searchAnnouncements: (query) => api.get(`/tpo/announcements/search?q=${query}`)
};

export default tpoService;
