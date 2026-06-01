// This file contains a function to test the exam creation API directly
// Import this in your browser console or call from a component for testing

import api from '../services/api';

export async function testCreateExam() {
  try {
    // Get the token for authentication
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found');
      return { success: false, error: 'No authentication token found' };
    }
    
    // Get user info
    const userString = localStorage.getItem('user');
    if (!userString) {
      console.error('No user data found');
      return { success: false, error: 'No user data found' };
    }
    
    const userData = JSON.parse(userString);
    const userId = userData.id || userData._id;
    
    if (!userId) {
      console.error('No user ID found in user data');
      return { success: false, error: 'No user ID found in user data' };
    }
    
    console.log('Creating test exam with user ID:', userId);
    
    // Create a simple test exam
    const testExamData = {
      title: 'Test Exam ' + new Date().toISOString(),
      description: 'Test exam created via API test',
      type: 'Aptitude',
      duration: 60,
      totalMarks: 10,
      passingMarks: 6,
      passingPercentage: 60,
      scheduledFor: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      registrationDeadline: new Date().toISOString(),
      startDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      endDate: new Date(Date.now() + 172800000).toISOString(),   // Day after tomorrow
      timePerQuestion: 60,
      showResults: true,
      allowReattempt: false,
      randomizeQuestions: true,
      eligibility: {
        departments: ['Computer Science'],
        branches: [],
        semesters: ['1', '2'],
        minCGPA: null,
        minPercentage: null,
        maxBacklogs: null
      },
      instructions: 'This is a test exam',
      status: 'Draft',
      userId: userId,
      createdBy: userId,
      sections: [
        {
          name: 'Test Section',
          description: 'Test section description',
          questions: [
            {
              type: 'MCQ',
              question: 'What is 1+1?',
              options: ['1', '2', '3', '4'],
              correctAnswer: '2',
              marks: 1,
              negativeMarks: 0,
              difficulty: 'Easy'
            },
            {
              type: 'MCQ',
              question: 'What is the capital of France?',
              options: ['London', 'Paris', 'Berlin', 'Madrid'],
              correctAnswer: 'Paris',
              marks: 1,
              negativeMarks: 0,
              difficulty: 'Medium'
            }
          ]
        }
      ],
      // Include questions directly as well for backward compatibility
      questions: [
        {
          type: 'MCQ',
          question: 'What is 1+1?',
          options: ['1', '2', '3', '4'],
          correctAnswer: '2',
          marks: 1,
          negativeMarks: 0,
          difficulty: 'Easy'
        },
        {
          type: 'MCQ',
          question: 'What is the capital of France?',
          options: ['London', 'Paris', 'Berlin', 'Madrid'],
          correctAnswer: 'Paris',
          marks: 1,
          negativeMarks: 0,
          difficulty: 'Medium'
        }
      ]
    };
    
    console.log('Sending test exam data:', testExamData);
    
    // Make the API call
    const response = await api.post('/api/exams', testExamData);
    console.log('API response:', response.data);
    
    return { 
      success: true, 
      message: 'Test exam created successfully', 
      data: response.data 
    };
  } catch (error) {
    console.error('Error in test exam creation:', error);
    
    let errorMessage = 'Failed to create test exam';
    
    if (error.response) {
      console.log('Error response data:', error.response.data);
      console.log('Error status:', error.response.status);
      console.log('Error headers:', error.response.headers);
      
      if (error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      }
    }
    
    return { 
      success: false, 
      error: errorMessage,
      details: error.response ? error.response.data : error.message
    };
  }
}

// Add a function to check if there are any exams in the database
export async function checkExams() {
  try {
    const response = await api.get('/api/exams');
    console.log('Existing exams:', response.data);
    return {
      success: true,
      count: response.data.length,
      exams: response.data
    };
  } catch (error) {
    console.error('Error fetching exams:', error);
    return {
      success: false,
      error: error.response ? error.response.data : error.message
    };
  }
}

// Add this to global window object for easy console testing
if (typeof window !== 'undefined') {
  window.testExamAPIs = {
    testCreateExam,
    checkExams
  };
}
