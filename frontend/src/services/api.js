import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthorized access
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect if we're on login endpoint
      if (!error.config.url.includes('/auth/login') && !error.config.url.includes('/auth/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
};

// Admin APIs
export const adminApi = {
  // Exams
  getAllExams: () => api.get('/admin/exams'),
  getExamById: (id) => api.get(`/admin/exams/${id}`),
  createExam: (examData) => api.post('/admin/exams', examData),
  updateExam: (id, examData) => api.put(`/admin/exams/${id}`, examData),
  deleteExam: (id) => api.delete(`/admin/exams/${id}`),
  togglePublish: (id) => api.patch(`/admin/exams/${id}/publish`),

  // Questions
  getQuestions: (examId) => api.get(`/admin/exams/${examId}/questions`),
  addQuestion: (examId, questionData) => api.post(`/admin/exams/${examId}/questions`, questionData),
  updateQuestion: (id, questionData) => api.put(`/admin/questions/${id}`, questionData),
  deleteQuestion: (id) => api.delete(`/admin/questions/${id}`),

  // Analytics & Audits
  getOverview: () => api.get('/admin/analytics/overview'),
  getExamAnalytics: (examId) => api.get(`/admin/analytics/exams/${examId}`),
  getExamResults: (examId) => api.get(`/admin/analytics/exams/${examId}/results`),
  exportCsvUrl: (examId) => `/api/admin/analytics/exams/${examId}/export-csv`,
  getAuditLogs: () => api.get('/admin/analytics/audit-logs'),
  getStudents: () => api.get('/admin/analytics/students'),
};

// Student APIs
export const studentApi = {
  getAvailableExams: () => api.get('/student/exams'),
  getExamDetails: (id) => api.get(`/student/exams/${id}`),
  getDashboard: () => api.get('/student/dashboard'),

  // Attempts
  startExam: (examId) => api.post(`/student/attempts/exams/${examId}/start`),
  getActiveAttempt: (attemptId) => api.get(`/student/attempts/${attemptId}`),
  saveAnswer: (attemptId, data) => api.put(`/student/attempts/${attemptId}/save-answer`, data),
  submitExam: (attemptId) => api.post(`/student/attempts/${attemptId}/submit`),

  // Results
  getMyResults: () => api.get('/student/attempts/results'),
  getResultById: (attemptId) => api.get(`/student/attempts/results/${attemptId}`),
};

export default api;
