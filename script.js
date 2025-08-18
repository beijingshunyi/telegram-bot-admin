// 配置信息 - 与 Cloudflare Worker 保持一致
const API_URL = "https://telegram-bot.jbk123jbk.workers.dev/admin-api";
const ADMIN_KEY = "MySuperSecureKey123!"; // 务必与 Worker 里的密钥一致

// 当前编辑的项ID（用于区分新增和编辑操作）
let currentEditId = null;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function () {
  console.log('管理后台初始化');
  loadRealData(); // 加载真实数据
  setupEventListeners(); // 绑定按钮事件
  setupModalListeners(); // 绑定模态框事件
});

// 加载所有数据（用户、老师、关键词、禁言词）
async function loadRealData() {
  try {
    // 显示加载状态
    showLoading(true);
    
    const [users, teachers, keywords, bannedKeywords] = await Promise.all([
      fetchData('users', 'get'),
      fetchData('teachers', 'get'),
      fetchData('keywords', 'get'),
      fetchData('banned_keywords', 'get')
    ]);

    renderUsers(users);
    renderTeachers(teachers);
    renderKeywords(keywords);
    renderBannedKeywords(bannedKeywords);

    console.log('所有数据加载完成');
  } catch (error) {
    console.error('加载数据失败:', error);
    showAlert('加载数据失败: ' + error.message, 'error');
  } finally {
    // 隐藏加载状态
    showLoading(false);
  }
}

// 绑定页面按钮事件
function setupEventListeners() {
  // 添加按钮事件
  document.getElementById('add-user-btn')?.addEventListener('click', () => openUserModal());
  document.getElementById('add-teacher-btn')?.addEventListener('click', () => openTeacherModal());
  document.getElementById('add-keyword-btn')?.addEventListener('click', () => openKeywordModal());
  document.getElementById('add-banned-btn')?.addEventListener('click', () => openBannedKeywordModal());
  
  // 刷新按钮事件
  document.getElementById('refresh-data')?.addEventListener('click', loadRealData);
}

// 绑定模态框相关事件
function setupModalListeners() {
  // 表单提交事件
  document.getElementById('user-form')?.addEventListener('submit', handleUserSubmit);
  document.getElementById('teacher-form')?.addEventListener('submit', handleTeacherSubmit);
  document.getElementById('keyword-form')?.addEventListener('submit', handleKeywordSubmit);
  document.getElementById('banned-form')?.addEventListener('submit', handleBannedKeywordSubmit);
  
  // 模态框关闭事件（重置表单）
  const modals = ['user-modal', 'teacher-modal', 'keyword-modal', 'banned-modal'];
  modals.forEach(modalId => {
    const modal = document.getElementById(modalId);
    modal?.addEventListener('hidden.bs.modal', function() {
      const form = this.querySelector('form');
      form?.reset();
      currentEditId = null; // 重置编辑ID
    });
  });
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
    showAlert('操作失败: ' + error.message, 'error');
    throw error;
  }
}

// 提示弹窗函数
function showAlert(message, type = 'info') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show fixed-top m-3 col-md-4 offset-md-4 z-50`;
  alertDiv.role = "alert";
  alertDiv.innerHTML = `
    <strong>${type === 'error' ? '错误' : '提示'}</strong>：${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  document.body.appendChild(alertDiv);

  // 3秒后自动关闭
  setTimeout(() => {
    const bsAlert = bootstrap.Alert.getOrCreateInstance(alertDiv);
    bsAlert.close();
  }, 3000);
}

// 显示/隐藏加载状态
function showLoading(show) {
  const loader = document.getElementById('data-loader');
  if (loader) {
    loader.style.display = show ? 'flex' : 'none';
  }
}

// 渲染用户数据
function renderUsers(users) {
  const container = document.getElementById('users-container');
  if (!container) return;

  if (users.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-3 text-muted">暂无用户数据，可通过机器人交互生成</td>
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
        <div class="btn-group btn-group-sm">
          <button class="btn btn-warning" onclick="editUser(${JSON.stringify(user)})">编辑</button>
          <button class="btn btn-danger" onclick="deleteUser(${user.user_id})">删除</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// 渲染老师数据
function renderTeachers(teachers) {
  const container = document.getElementById('teachers-container');
  if (!container) return;

  if (teachers.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-3 text-muted">暂无老师数据，可通过下方按钮添加</td>
      </tr>
    `;
    return;
  }

  container.innerHTML = teachers.map(teacher => `
    <tr>
      <td>${teacher.id}</td>
      <td>${teacher.nickname}</td>
      <td>${teacher.age}</td>
      <td>${teacher.region}</td>
      <td>${teacher.service_type}</td>
      <td>
        <span class="badge bg-${teacher.status === 'approved' ? 'success' : 'warning'}">
          ${teacher.status === 'approved' ? '已认证' : '待审核'}
        </span>
      </td>
      <td>
        <div class="btn-group btn-group-sm">
          <button class="btn btn-warning" onclick="editTeacher(${JSON.stringify(teacher)})">编辑</button>
          <button class="btn btn-danger" onclick="deleteTeacher(${teacher.id})">删除</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// 渲染关键词数据
function renderKeywords(keywords) {
  const container = document.getElementById('keywords-container');
  if (!container) return;

  if (keywords.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="4" class="text-center py-3 text-muted">暂无关键词数据，点击“添加关键词”创建</td>
      </tr>
    `;
    return;
  }

  container.innerHTML = keywords.map(keyword => `
    <tr>
      <td>${keyword.keyword}</td>
      <td>${keyword.response}</td>
      <td>
        <span class="badge bg-${keyword.is_active ? 'success' : 'secondary'}">
          ${keyword.is_active ? '启用' : '禁用'}
        </span>
      </td>
      <td>
        <div class="btn-group btn-group-sm">
          <button class="btn btn-warning" onclick="editKeyword(${JSON.stringify(keyword)})">编辑</button>
          <button class="btn btn-danger" onclick="deleteKeyword(${keyword.id})">删除</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// 渲染禁言词数据
function renderBannedKeywords(keywords) {
  const container = document.getElementById('banned-keywords-container');
  if (!container) return;

  if (keywords.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="2" class="text-center py-3 text-muted">暂无禁言词数据，点击“添加禁言词”创建</td>
      </tr>
    `;
    return;
  }

  container.innerHTML = keywords.map(keyword => `
    <tr>
      <td>${keyword.keyword}</td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="deleteBannedKeyword(${keyword.id})">删除</button>
      </td>
    </tr>
  `).join('');
}

// 用户模态框操作
function openUserModal() {
  currentEditId = null;
  document.getElementById('user-modal-title').textContent = '添加用户';
  const userModal = new bootstrap.Modal(document.getElementById('user-modal'));
  userModal.show();
}

function editUser(user) {
  currentEditId = user.user_id;
  document.getElementById('user-modal-title').textContent = '编辑用户';
  
  // 填充表单数据
  document.getElementById('user_id').value = user.user_id;
  document.getElementById('username').value = user.username || '';
  document.getElementById('first_name').value = user.first_name || '';
  document.getElementById('last_name').value = user.last_name || '';
  document.getElementById('points').value = user.points || 0;
  
  const userModal = new bootstrap.Modal(document.getElementById('user-modal'));
  userModal.show();
}

async function handleUserSubmit(e) {
  e.preventDefault();
  const formData = {
    user_id: parseInt(document.getElementById('user_id').value),
    username: document.getElementById('username').value,
    first_name: document.getElementById('first_name').value,
    last_name: document.getElementById('last_name').value,
    points: parseInt(document.getElementById('points').value)
  };

  try {
    if (currentEditId) {
      await fetchData('users', 'update', formData);
      showAlert('用户更新成功', 'success');
    } else {
      await fetchData('users', 'add', formData);
      showAlert('用户添加成功', 'success');
    }
    
    // 关闭模态框并刷新数据
    const modal = bootstrap.Modal.getInstance(document.getElementById('user-modal'));
    modal.hide();
    loadRealData();
  } catch (error) {
    console.error('用户操作失败:', error);
  }
}

async function deleteUser(userId) {
  if (confirm('确定要删除这个用户吗？此操作不可恢复！')) {
    try {
      await fetchData('users', 'delete', { user_id: userId });
      showAlert('用户删除成功', 'success');
      loadRealData();
    } catch (error) {
      console.error('删除用户失败:', error);
    }
  }
}

// 老师模态框操作
function openTeacherModal() {
  currentEditId = null;
  document.getElementById('teacher-modal-title').textContent = '添加老师';
  const teacherModal = new bootstrap.Modal(document.getElementById('teacher-modal'));
  teacherModal.show();
}

function editTeacher(teacher) {
  currentEditId = teacher.id;
  document.getElementById('teacher-modal-title').textContent = '编辑老师';
  
  // 填充表单数据
  document.getElementById('teacher_id').value = teacher.id;
  document.getElementById('nickname').value = teacher.nickname;
  document.getElementById('age').value = teacher.age;
  document.getElementById('region').value = teacher.region;
  document.getElementById('service_type').value = teacher.service_type;
  document.getElementById('status').value = teacher.status;
  
  const teacherModal = new bootstrap.Modal(document.getElementById('teacher-modal'));
  teacherModal.show();
}

async function handleTeacherSubmit(e) {
  e.preventDefault();
  const formData = {
    id: parseInt(document.getElementById('teacher_id').value),
    nickname: document.getElementById('nickname').value,
    age: parseInt(document.getElementById('age').value),
    region: document.getElementById('region').value,
    service_type: document.getElementById('service_type').value,
    status: document.getElementById('status').value
  };

  try {
    if (currentEditId) {
      await fetchData('teachers', 'update', formData);
      showAlert('老师信息更新成功', 'success');
    } else {
      await fetchData('teachers', 'add', formData);
      showAlert('老师添加成功', 'success');
    }
    
    // 关闭模态框并刷新数据
    const modal = bootstrap.Modal.getInstance(document.getElementById('teacher-modal'));
    modal.hide();
    loadRealData();
  } catch (error) {
    console.error('老师操作失败:', error);
  }
}

async function deleteTeacher(teacherId) {
  if (confirm('确定要删除这位老师吗？此操作不可恢复！')) {
    try {
      await fetchData('teachers', 'delete', { id: teacherId });
      showAlert('老师删除成功', 'success');
      loadRealData();
    } catch (error) {
      console.error('删除老师失败:', error);
    }
  }
}

// 关键词模态框操作
function openKeywordModal() {
  currentEditId = null;
  document.getElementById('keyword-modal-title').textContent = '添加关键词';
  const keywordModal = new bootstrap.Modal(document.getElementById('keyword-modal'));
  keywordModal.show();
}

function editKeyword(keyword) {
  currentEditId = keyword.id;
  document.getElementById('keyword-modal-title').textContent = '编辑关键词';
  
  // 填充表单数据
  document.getElementById('keyword_id').value = keyword.id;
  document.getElementById('keyword_text').value = keyword.keyword;
  document.getElementById('response_text').value = keyword.response;
  document.getElementById('is_active').checked = keyword.is_active;
  
  const keywordModal = new bootstrap.Modal(document.getElementById('keyword-modal'));
  keywordModal.show();
}

async function handleKeywordSubmit(e) {
  e.preventDefault();
  const formData = {
    id: currentEditId ? parseInt(document.getElementById('keyword_id').value) : null,
    keyword: document.getElementById('keyword_text').value,
    response: document.getElementById('response_text').value,
    is_active: document.getElementById('is_active').checked
  };

  try {
    if (currentEditId) {
      await fetchData('keywords', 'update', formData);
      showAlert('关键词更新成功', 'success');
    } else {
      await fetchData('keywords', 'add', formData);
      showAlert('关键词添加成功', 'success');
    }
    
    // 关闭模态框并刷新数据
    const modal = bootstrap.Modal.getInstance(document.getElementById('keyword-modal'));
    modal.hide();
    loadRealData();
  } catch (error) {
    console.error('关键词操作失败:', error);
  }
}

async function deleteKeyword(keywordId) {
  if (confirm('确定要删除这个关键词吗？')) {
    try {
      await fetchData('keywords', 'delete', { id: keywordId });
      showAlert('关键词删除成功', 'success');
      loadRealData();
    } catch (error) {
      console.error('删除关键词失败:', error);
    }
  }
}

// 禁言词模态框操作
function openBannedKeywordModal() {
  currentEditId = null;
  document.getElementById('banned-modal-title').textContent = '添加禁言词';
  const bannedModal = new bootstrap.Modal(document.getElementById('banned-modal'));
  bannedModal.show();
}

async function handleBannedKeywordSubmit(e) {
  e.preventDefault();
  const formData = {
    keyword: document.getElementById('banned_text').value
  };

  try {
    await fetchData('banned_keywords', 'add', formData);
    showAlert('禁言词添加成功', 'success');
    
    // 关闭模态框并刷新数据
    const modal = bootstrap.Modal.getInstance(document.getElementById('banned-modal'));
    modal.hide();
    loadRealData();
  } catch (error) {
    console.error('禁言词操作失败:', error);
  }
}

async function deleteBannedKeyword(id) {
  if (confirm('确定删除该禁言词吗？')) {
    try {
      await fetchData('banned_keywords', 'delete', { id });
      showAlert('禁言词删除成功', 'success');
      loadRealData();
    } catch (error) {
      console.error('删除禁言词失败:', error);
    }
  }
}

// 暴露函数到全局，使HTML中onclick可以调用
window.editUser = editUser;
window.editTeacher = editTeacher;
window.editKeyword = editKeyword;
window.deleteUser = deleteUser;
window.deleteTeacher = deleteTeacher;
window.deleteKeyword = deleteKeyword;
window.deleteBannedKeyword = deleteBannedKeyword;
