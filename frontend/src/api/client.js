import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// Exams endpoints
export const examsAPI = {
  getAll: () => api.get('/exams'),
  getById: (id) => api.get(`/exams/${id}`),
  create: (data) => api.post('/exams', data),
  update: (id, data) => api.put(`/exams/${id}`, data),
  delete: (id) => api.delete(`/exams/${id}`),
};

// Classrooms endpoints
export const classroomsAPI = {
  getAll: () => api.get('/classrooms'),
  getByFloor: (floorId) => api.get(`/classrooms/floor/${floorId}`),
  create: (data) => api.post('/classrooms', data),
  update: (id, data) => api.put(`/classrooms/${id}`, data),
  delete: (id) => api.delete(`/classrooms/${id}`),
};

// Students endpoints
export const studentsAPI = {
  getAll: () => api.get('/students'),
  getByUSN: (usn) => api.get(`/students/${usn}`),
  create: (data) => api.post('/students', data),
  uploadCSV: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/students/upload/csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
};

// Seating endpoints
export const seatingAPI = {
  allocate: (data) => api.post('/seating/allocate', data),
  getByExam: (examId) => api.get(`/seating/exam/${examId}`),
  getByStudentAndExam: (studentId, examId) =>
    api.get(`/seating/student/${studentId}/exam/${examId}`),
  assignInvigilator: (data) => api.post('/seating/assign-invigilator', data),
};

// Reports endpoints
export const reportsAPI = {
  getExamReport: (examId, sortBy = 'classroom') =>
    api.get(`/reports/exam/${examId}?sortBy=${sortBy}`),
  getStatistics: (examId) => api.get(`/reports/statistics/exam/${examId}`),
  getClassroomReport: (classroomId, examId) =>
    api.get(`/reports/classroom/${classroomId}/exam/${examId}`),
};

export default api;
