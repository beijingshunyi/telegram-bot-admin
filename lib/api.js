import axios from 'axios';

// 配置基础API
const API_URL = 'https://telegram-bot.jbk123jbk.workers.dev';
const ADMIN_KEY = '9712202273aA.';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Admin-Key': ADMIN_KEY
  }
});

// 用户管理API
export const userAPI = {
  getAll: () => api.get('/api/users'),
  update: (user) => api.post('/admin-api', {
    action: 'update',
    table: 'users',
    data: user
  }),
  delete: (userId) => api.post('/admin-api', {
    action: 'delete',
    table: 'users',
    data: { user_id: userId }
  }),
  adjustPoints: (userId, pointsChange) => api.post('/admin-api', {
    action: 'adjust_points',
    table: 'users',
    data: { user_id: userId, points_change: pointsChange }
  })
};

// 老师管理API
export const teacherAPI = {
  getAll: () => api.get('/api/teachers'),
  get: (filter) => api.post('/admin-api', {
    action: 'get',
    table: 'teachers',
    filter
  }),
  update: (teacher) => api.post('/admin-api', {
    action: 'update',
    table: 'teachers',
    data: teacher
  }),
  create: (teacher) => api.post('/admin-api', {
    action: 'insert',
    table: 'teachers',
    data: teacher
  }),
  delete: (id) => api.post('/admin-api', {
    action: 'delete',
    table: 'teachers',
    data: { id }
  }),
  sendRandom: () => api.get('/send-random-teacher')
};

// 关键词管理API
export const keywordAPI = {
  getAll: () => api.get('/api/keywords'),
  update: (keyword) => api.post('/admin-api', {
    action: 'update',
    table: 'keywords',
    data: keyword
  }),
  create: (keyword) => api.post('/admin-api', {
    action: 'insert',
    table: 'keywords',
    data: keyword
  }),
  delete: (id) => api.post('/admin-api', {
    action: 'delete',
    table: 'keywords',
    data: { id }
  })
};

// 禁言词管理API
export const bannedKeywordAPI = {
  getAll: () => api.get('/api/banned'),
  update: (keyword) => api.post('/admin-api', {
    action: 'update',
    table: 'banned_keywords',
    data: keyword
  }),
  create: (keyword) => api.post('/admin-api', {
    action: 'insert',
    table: 'banned_keywords',
    data: keyword
  }),
  delete: (id) => api.post('/admin-api', {
    action: 'delete',
    table: 'banned_keywords',
    data: { id }
  })
};

// 数据库测试API
export const systemAPI = {
  testDB: () => api.get('/test-db')
};

export default api;
