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
    // 依次请求四类数据
    const users = await fetchData('users', 'get');
    const teachers = await fetchData('teachers', 'get');
    const keywords = await fetchData('keywords', 'get');
    const bannedKeywords = await fetchData('banned_keywords', 'get');

    // 渲染到页面
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
  // 用户管理
  document.getElementById('add-user-btn')?.addEventListener('click', openUserModal);
  // 老师管理
  document.getElementById('add-teacher-btn')?.addEventListener('click', openTeacherModal);
  // 关键词管理
  document.getElementById('add-keyword-btn')?.addEventListener('click', openKeywordModal);
  // 禁言词管理
  document.getElementById('add-banned-btn')?.addEventListener('click', openBannedKeywordModal);
}

// 通用数据请求函数（与 Cloudflare Worker 交互）
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
      timeout: 10000 // 设置超时，避免长时间等待
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

// 提示弹窗函数（替代 alert，更美观）
function showAlert(message, type = 'info') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
  alertDiv.role = "alert";
  alertDiv.innerHTML = `
    <strong>${type === 'error' ? '错误' : '提示'}</strong>：${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  document.body.appendChild(alertDiv);

  // 3秒后自动关闭（也可点击右上角关闭）
  setTimeout(() => {
    const bsAlert = bootstrap.Alert.getOrCreateInstance(alertDiv);
    bsAlert.close();
  }, 3000);
}

// 渲染用户数据到页面
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

// 渲染老师数据到页面
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

// 渲染关键词数据到页面
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
    </table>
  `;
}

// 渲染禁言词数据到页面
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
    </table>
  `;
}

// 以下为“添加/编辑”弹窗逻辑（示例，可根据实际需求完善）
function openUserModal() {
  showAlert('用户添加功能已开放！后续可在此写弹窗表单逻辑', 'info');
  // 若需要真实弹窗，可参考 Bootstrap 模态框写法：
  // https://getbootstrap.com/docs/5.3/components/modal/
}

function openTeacherModal() {
  showAlert('老师添加功能已开放！后续可在此写弹窗表单逻辑', 'info');
}

function openKeywordModal() {
  showAlert('关键词添加功能已开放！后续可在此写弹窗表单逻辑', 'info');
}

function openBannedKeywordModal() {
  showAlert('禁言词添加功能已开放！后续可在此写弹窗表单逻辑', 'info');
}

// 编辑/删除函数（示例，可扩展真实逻辑）
function editUser(user) {
  console.log('编辑用户:', user);
  showAlert(`正在编辑用户：${user.username || user.user_id}`, 'info');
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
    // 调用 fetchData 执行删除逻辑（示例）
    fetchData('banned_keywords', 'delete', { id }).then(() => {
      showAlert('禁言词删除成功', 'success');
      loadRealData(); // 重新加载数据
    });
  }
}

// 全局暴露函数，让 HTML 里的 onclick 能调用
window.editUser = editUser;
window.editTeacher = editTeacher;
window.editKeyword = editKeyword;
window.deleteBannedKeyword = deleteBannedKeyword;
