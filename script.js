// 调试版 script.js，重点添加渲染日志
const API_URL = "https://telegram-bot.jbk123jbk.workers.dev/admin-api";
const ADMIN_KEY = "MySuperSecureKey123!";

document.addEventListener('DOMContentLoaded', function() {
  console.log('log-init');
  loadRealData();
  setupEventListeners();
});

async function loadRealData() {
  try {
    const users = await fetchData('users', 'get');
    const teachers = await fetchData('teachers', 'get');
    const keywords = await fetchData('keywords', 'get');
    const bannedKeywords = await fetchData('banned_keywords', 'get');
    
    // 强制打印数据，确认内容
    console.log('用户数据:', users);
    console.log('老师数据:', teachers);
    console.log('关键词数据:', keywords);
    console.log('禁言词数据:', bannedKeywords);
    
    renderUsers(users);
    renderTeachers(teachers);
    renderKeywords(keywords);
    renderBannedKeywords(bannedKeywords);
    console.log('所有数据加载完成');
  } catch (error) {
    console.error('加载数据失败:', error);
    showAlert('加载数据失败: ' + error.message, 'error');
  }
}

function setupEventListeners() {
  // 保持原有事件监听逻辑...
}

async function fetchData(table, action, data = null, filter = "") {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Admin-Key": ADMIN_KEY
      },
      body: JSON.stringify({ action, table, filter, data })
    });
    if (!response.ok) throw new Error(`API 错误: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('fetchData 失败:', error);
    showAlert('数据获取失败', 'error');
    throw error;
  }
}

function showAlert(message, type = 'info') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} fixed-top m-4`;
  alertDiv.textContent = message;
  document.body.appendChild(alertDiv);
  setTimeout(() => alertDiv.remove(), 3000);
}

// 带详细日志的渲染函数
function renderUsers(users) {
  console.log('进入 renderUsers，数据长度:', users.length);
  const container = document.getElementById('users-container');
  console.log('找到容器:', container ? '是' : '否');
  
  if (!container) {
    console.error('未找到 users-container');
    showAlert('用户列表容器丢失', 'error');
    return;
  }
  
  container.innerHTML = `
    <h3>用户列表 (${users.length})</h3>
    <table class="table">
      <thead><tr><th>ID</th><th>用户名</th><th>积分</th></tr></thead>
      <tbody>
        ${users.map(user => `
          <tr>
            <td>${user.user_id || '无ID'}</td>
            <td>${user.username || '无用户名'}</td>
            <td>${user.points || 0}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  console.log('用户列表渲染完成');
}

// 其他 renderTeachers / renderKeywords / renderBannedKeywords 函数
// 参考 renderUsers 格式，添加 console.log 日志和错误处理
function renderTeachers(teachers) {
  console.log('进入 renderTeachers，数据长度:', teachers.length);
  const container = document.getElementById('teachers-container');
  console.log('找到老师容器:', container ? '是' : '否');
  // ... 原有渲染逻辑，补充日志
}

// 替换后，刷新页面看控制台日志，定位具体问题
