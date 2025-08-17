// 配置信息 - 与 Cloudflare Worker 保持一致
const API_URL = "https://telegram-bot.jbk123jbk.workers.dev/admin-api";
const ADMIN_KEY = "MySuperSecureKey123!"; // 务必与 Worker 里的密钥一致

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function () {
  console.log('log-init');
  loadRealData(); // 加载真实数据
  setupEventListeners(); // 绑定按钮事件
});

// 加载所有数据（用户、老师、关键词、禁言词）
async function loadRealData() {
  try {
    const users = await fetchData('users', 'get');
    const teachers = await fetchData('teachers', 'get');
    const keywords = await fetchData('keywords', 'get');
    const bannedKeywords = await fetchData('banned_keywords', 'get');

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

// 绑定按钮点击事件
function setupEventListeners() {
  document.getElementById('add-user-btn')?.addEventListener('click', openUserModal);
  document.getElementById('add-teacher-btn')?.addEventListener('click', openTeacherModal);
  document.getElementById('add-keyword-btn')?.addEventListener('click', openKeywordModal);
  document.getElementById('add-banned-btn')?.addEventListener('click', openBannedKeywordModal);
}

// 通用数据请求函数
async function fetchData(table, action, data = null) {
  try {
    const requestData = { action, table };
    if (data) requestData.data = data;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Admin-Key": ADMIN_KEY
      },
      body: JSON.stringify(requestData),
      timeout: 10000
    });

    if (!response.ok) {
      const errorMsg = await response.json().catch(() => ({ message: '未知错误' }));
      throw new Error(`API 请求失败：${errorMsg.message}（状态码：${response.status}）`);
    }

    return await response.json();
  } catch (error) {
    console.error('数据请求出错:', error);
    showAlert('获取数据失败: ' + error.message, 'error');
    throw error;
  }
}

// 提示弹窗函数
function showAlert(message, type = 'info') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
  alertDiv.role = "alert";
  alertDiv.innerHTML = `
    <strong>${type === 'error' ? '错误' : '提示'}</strong>：${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  document.body.appendChild(alertDiv);

  setTimeout(() => {
    const bsAlert = bootstrap.Alert.getOrCreateInstance(alertDiv);
    bsAlert.close();
  }, 3000);
}

// 渲染用户数据
function renderUsers(users) {
  const container = document.getElementById('users-container');
  if (!container) return;

  if (users.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="6" class="empty-tip">暂无用户数据，可通过机器人交互生成</td>
      </tr>
    `;
    return;
  }

  container.innerHTML = users.map(user => `
    <tr>
      <td>${user.user_id}</td>
      <td>${user.username || '-'}</td>
      <td>${user.first_name || ''} ${user.last_name || ''}</td>
      <td>${user.points || 0}</td>
      <td>${user.last_sign_date || '-'}</td>
      <td>
        <button class="btn btn-warning btn-sm" onclick="editUser(${JSON.stringify(user)})">编辑</button>
      </td>
    </tr>
  `).join('');
}

// 渲染老师数据（新增表格渲染、支持编辑）
function renderTeachers(teachers) {
  const container = document.getElementById('teachers-container');
  if (!container) return;

  if (teachers.length === 0) {
    container.innerHTML = `
      <div class="empty-tip">
        暂无老师数据，可通过机器人上传老师信息
      </div>
    `;
    return;
  }

  // 渲染老师表格
  container.innerHTML = `
    <table class="table table-striped table-hover">
      <thead>
        <tr>
          <th>ID</th>
          <th>花名</th>
          <th>年龄</th>
          <th>地区</th>
          <th>服务类型</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        ${teachers.map(teacher => `
          <tr>
            <td>${teacher.id}</td>
            <td>${teacher.nickname}</td>
            <td>${teacher.age}</td>
            <td>${teacher.region}</td>
            <td>${teacher.service_type}</td>
            <td>
              <span class="badge bg-${teacher.status === 'approved' ? 'success' : 'warning'}">
                ${teacher.status}
              </span>
            </td>
            <td>
              <button class="btn btn-warning btn-sm" onclick="editTeacher(${JSON.stringify(teacher)})">编辑</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// 渲染关键词数据
function renderKeywords(keywords) {
  const container = document.getElementById('keywords-container');
  if (!container) return;

  if (keywords.length === 0) {
    container.innerHTML = `
      <div class="empty-tip">
        暂无关键词数据，点击“添加关键词”创建
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <table class="table table-striped table-hover">
      <thead>
        <tr>
          <th>关键词</th>
          <th>回复内容</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        ${keywords.map(keyword => `
          <tr>
            <td>${keyword.keyword}</td>
            <td>${keyword.response}</td>
            <td>
              <span class="badge bg-${keyword.is_active ? 'success' : 'secondary'}">
                ${keyword.is_active ? '启用' : '禁用'}
              </span>
            </td>
            <td>
              <button class="btn btn-warning btn-sm" onclick="editKeyword(${JSON.stringify(keyword)})">编辑</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    `;
}

// 渲染禁言词数据
function renderBannedKeywords(keywords) {
  const container = document.getElementById('banned-keywords-container');
  if (!container) return;

  if (keywords.length === 0) {
    container.innerHTML = `
      <div class="empty-tip">
        暂无禁言词数据，点击“添加禁言词”创建
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <table class="table table-striped table-hover">
      <thead>
        <tr>
          <th>禁言词</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        ${keywords.map(keyword => `
          <tr>
            <td>${keyword.keyword}</td>
            <td>
              <button class="btn btn-danger btn-sm" onclick="deleteBannedKeyword(${keyword.id})">删除</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    `;
}

// 弹窗逻辑（示例，可扩展为真实表单）
function openUserModal() {
  showAlert('用户添加功能已开放！可在此写弹窗表单逻辑', 'info');
}

function openTeacherModal() {
  showAlert('老师添加功能已开放！可在此写弹窗表单逻辑', 'info');
}

function openKeywordModal() {
  showAlert('关键词添加功能已开放！可在此写弹窗表单逻辑', 'info');
}

function openBannedKeywordModal() {
  showAlert('禁言词添加功能已开放！可在此写弹窗表单逻辑', 'info');
}

// 编辑函数（示例，可扩展为真实编辑逻辑）
function editUser(user) {
  console.log('编辑用户:', user);
  showAlert(`正在编辑用户：${user.username || user.user_id}`, 'info');
  // 若需要真实弹窗，参考 Bootstrap 模态框：
  // https://getbootstrap.com/docs/5.3/components/modal/
}

function editTeacher(teacher) {
  console.log('编辑老师:', teacher);
  showAlert(`正在编辑老师：${teacher.nickname}`, 'info');
}

function editKeyword(keyword) {
  console.log('编辑关键词:', keyword);
  showAlert(`正在编辑关键词：${keyword.keyword}`, 'info');
}

function deleteBannedKeyword(id) {
  if (confirm('确定删除该禁言词吗？')) {
    fetchData('banned_keywords', 'delete', { id }).then(() => {
      showAlert('禁言词删除成功',
