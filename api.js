const API_URL = process.env.NEXT_PUBLIC_API_URL;
const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY;

// 通用请求函数
const request = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    'Admin-Key': ADMIN_KEY,
    ...options.headers,
  };
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || '请求失败');
  }
  
  return data;
};

// 用户相关API
export const userApi = {
  getAll: () => request('/api/users', { method: 'GET' }),
  update: (user) => request('/admin-api', {
    method: 'POST',
    body: JSON.stringify({
      action: 'update',
      table: 'users',
      data: user
    })
  }),
  adjustPoints: (userId, pointsChange) => request('/admin-api', {
    method: 'POST',
    body: JSON.stringify({
      action: 'adjust_points',
      table: 'users',
      data: { user_id: userId, points_change: pointsChange }
    })
  }),
  delete: (userId) => request('/admin-api', {
    method: 'POST',
    body: JSON.stringify({
      action: 'delete',
      table: 'users',
      data: { user_id: userId }
    })
  })
};

// 老师相关API
export const teacherApi = {
  getAll: () => request('/api/teachers', { method: 'GET' }),
  create: (teacher) => request('/admin-api', {
    method: 'POST',
    body: JSON.stringify({
      action: 'insert',
      table: 'teachers',
      data: teacher
    })
  }),
  update: (teacher) => request('/admin-api', {
    method: 'POST',
    body: JSON.stringify({
      action: 'update',
      table: 'teachers',
      data: teacher
    })
  }),
  delete: (id) => request('/admin-api', {
    method: 'POST',
    body: JSON.stringify({
      action: 'delete',
      table: 'teachers',
      data: { id }
    })
  })
};

// 关键词相关API
export const keywordApi = {
  getAll: () => request('/api/keywords', { method: 'GET' }),
  create: (keyword) => request('/admin-api', {
    method: 'POST',
    body: JSON.stringify({
      action: 'insert',
      table: 'keywords',
      data: keyword
    })
  }),
  update: (keyword) => request('/admin-api', {
    method: 'POST',
    body: JSON.stringify({
      action: 'update',
      table: 'keywords',
      data: keyword
    })
  }),
  delete: (id) => request('/admin-api', {
    method: 'POST',
    body: JSON.stringify({
      action: 'delete',
      table: 'keywords',
      data: { id }
    })
  })
};

// 禁言词相关API
export const bannedApi = {
  getAll: () => request('/api/banned', { method: 'GET' }),
  create: (keyword) => request('/admin-api', {
    method: 'POST',
    body: JSON.stringify({
      action: 'insert',
      table: 'banned_keywords',
      data: keyword
    })
  }),
  delete: (id) => request('/admin-api', {
    method: 'POST',
    body: JSON.stringify({
      action: 'delete',
      table: 'banned_keywords',
      data: { id }
    })
  })
};

// 发送随机老师
export const sendRandomTeacher = () => request('/send-random-teacher', { method: 'GET' });
