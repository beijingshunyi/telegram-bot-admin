// 初始化函数
document.addEventListener('DOMContentLoaded', () => {
  // 加载配置文件
  const script = document.createElement('script');
  script.src = 'config.js';
  document.head.appendChild(script);
  
  // 初始化页面
  script.onload = () => {
    loadRealData();
    setupEventListeners();
  };
});

// 加载真实数据
async function loadRealData() {
  try {
    // 加载用户数据
    const users = await fetchData('users', 'order=created_at.desc&limit=5');
    renderUserStats(users);
    
    // 加载老师数据
    const teachers = await fetchData('teachers', 'status=eq.pending');
    renderTeacherStats(teachers);
    
    // 加载关键词数据
    const keywords = await fetchData('keywords');
    renderKeywordStats(keywords);
    
    // 加载活动数据
    const activities = await fetchData('activities', 'order=timestamp.desc&limit=10');
    renderActivities(activities);
    
    // 加载图表数据
    loadCharts();
    
  } catch (error) {
    console.error('加载数据失败:', error);
    showAlert('danger', '数据加载失败，请检查网络连接');
  }
}

// 从后端获取数据
async function fetchData(table, filter = '') {
  const response = await fetch(config.API_ENDPOINTS.GET_DATA, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Admin-Key': config.ADMIN_API_KEY
    },
    body: JSON.stringify({
      action: 'get',
      table: table,
      filter: filter
    })
  });
  
  if (!response.ok) {
    throw new Error(`请求失败: ${response.status}`);
  }
  
  return await response.json();
}

// 渲染用户统计
function renderUserStats(users) {
  const totalUsers = users.length;
  const todaySignups = users.filter(user => {
    const signupDate = new Date(user.created_at);
    const today = new Date();
    return signupDate.toDateString() === today.toDateString();
  }).length;
  
  document.getElementById('total-users').textContent = totalUsers;
  document.getElementById('new-users').textContent = todaySignups;
}

// 渲染老师统计
function renderTeacherStats(teachers) {
  const pendingTeachers = teachers.length;
  
  document.getElementById('total-teachers').textContent = teachers.length;
  document.getElementById('pending-teachers').textContent = pendingTeachers;
}

// 渲染关键词统计
function renderKeywordStats(keywords) {
  const activeKeywords = keywords.filter(k => k.is_active).length;
  
  document.getElementById('total-keywords').textContent = keywords.length;
  document.getElementById('active-keywords').textContent = activeKeywords;
}

// 渲染活动记录
function renderActivities(activities) {
  const tbody = document.getElementById('recent-activities');
  tbody.innerHTML = '';
  
  activities.forEach(activity => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${formatDate(activity.timestamp)}</td>
      <td>${activity.user_id}</td>
      <td>${activity.action}</td>
      <td>${activity.details}</td>
    `;
    tbody.appendChild(row);
  });
}

// 格式化日期
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN');
}

// 加载图表
function loadCharts() {
  // 用户增长图表
  const userGrowthCtx = document.getElementById('user-growth-chart').getContext('2d');
  new Chart(userGrowthCtx, {
    type: 'line',
    data: {
      labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月'],
      datasets: [{
        label: '用户数量',
        data: [120, 190, 340, 520, 780, 920, 1150],
        borderColor: '#3498db',
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        tension: 0.3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        }
      }
    }
  });
  
  // 积分分布图表
  const pointsCtx = document.getElementById('points-distribution-chart').getContext('2d');
  new Chart(pointsCtx, {
    type: 'doughnut',
    data: {
      labels: ['0-100分', '101-300分', '301-500分', '501-1000分', '1000+分'],
      datasets: [{
        label: '用户数量',
        data: [320, 190, 120, 80, 40],
        backgroundColor: [
          '#3498db',
          '#2ecc71',
          '#f1c40f',
          '#e67e22',
          '#e74c3c'
        ],
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'right',
        }
      }
    }
  });
}

// 设置事件监听器
function setupEventListeners() {
  // 用户管理页面操作
  if (document.getElementById('update-points-btn')) {
    document.getElementById('update-points-btn').addEventListener('click', updateUserPoints);
  }
  
  // 老师管理页面操作
  if (document.getElementById('approve-teacher-btn')) {
    document.getElementById('approve-teacher-btn').addEventListener('click', approveTeacher);
  }
  
  // 关键词管理页面操作
  if (document.getElementById('add-keyword-btn')) {
    document.getElementById('add-keyword-btn').addEventListener('click', addKeyword);
  }
  
  // 系统设置页面操作
  if (document.getElementById('save-settings-btn')) {
    document.getElementById('save-settings-btn').addEventListener('click', saveSettings);
  }
}

// 更新用户积分
async function updateUserPoints() {
  const userId = document.getElementById('user-id').value;
  const points = document.getElementById('points-change').value;
  
  if (!userId || !points) {
    showAlert('warning', '请填写用户ID和积分变化值');
    return;
  }
  
  try {
    const response = await fetch(config.API_ENDPOINTS.UPDATE_USER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Admin-Key': config.ADMIN_API_KEY
      },
      body: JSON.stringify({
        action: 'update',
        table: 'users',
        data: {
          user_id: parseInt(userId),
          points: parseInt(points)
        }
      })
    });
    
    if (response.ok) {
      showAlert('success', '用户积分更新成功');
      loadRealData(); // 刷新数据
    } else {
      showAlert('danger', '积分更新失败');
    }
  } catch (error) {
    console.error('更新积分失败:', error);
    showAlert('danger', '网络错误，请稍后重试');
  }
}

// 显示通知
function showAlert(type, message) {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
  alertDiv.role = 'alert';
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  
  const container = document.querySelector('.main-content');
  container.prepend(alertDiv);
  
  // 5秒后自动消失
  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}

// 其他功能函数（根据页面需要添加）
// ...

// 注意：实际页面中的其他功能实现需要根据具体HTML结构编写