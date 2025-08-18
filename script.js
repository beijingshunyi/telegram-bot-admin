// 当前编辑的项ID（用于区分新增和编辑操作）
let currentEditId = null;
let currentPointsUserId = null;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function () {
  console.log('管理后台初始化');
  // 检查配置是否加载
  if (typeof config === 'undefined') {
    showAlert('配置文件加载失败，请检查config.js', 'error');
    return;
  }
  
  loadRealData(); // 加载真实数据
  setupEventListeners(); // 绑定按钮事件
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
  document.getElementById('add-user-btn')?.addEventListener('click', openUserModal);
  document.getElementById('add-teacher-btn')?.addEventListener('click', openTeacherModal);
  document.getElementById('add-keyword-btn')?.addEventListener('click', openKeywordModal);
  document.getElementById('add-banned-btn')?.addEventListener('click', openBannedKeywordModal);
  
  // 刷新按钮事件
  document.getElementById('refresh-data')?.addEventListener('click', loadRealData);
  
  // 表单提交事件
  document.getElementById('points-form')?.addEventListener('submit', handlePointsAdjustment);
  document.getElementById('user-form')?.addEventListener('submit', handleUserSubmit);
  document.getElementById('teacher-form')?.addEventListener('submit', handleTeacherSubmit);
  document.getElementById('keyword-form')?.addEventListener('submit', handleKeywordSubmit);
  document.getElementById('banned-form')?.addEventListener('submit', handleBannedKeywordSubmit);
  
  // 模态框关闭事件（重置表单）
  const modals = ['user-modal', 'teacher-modal', 'keyword-modal', 'banned-modal', 'points-modal'];
  modals.forEach(modalId => {
    const modal = document.getElementById(modalId);
    modal?.addEventListener('hidden.bs.modal', function() {
      const form = this.querySelector('form');
      if (form) form.reset();
      currentEditId = null; // 重置编辑ID
      currentPointsUserId = null; // 重置积分调整用户ID
    });
  });
}

// 通用数据请求函数
async function fetchData(table, action, data = null) {
  try {
    const requestData = { action, table };
    if (data) requestData.data = data;

    const response = await fetch(config.API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Admin-Key": config.ADMIN_KEY
      },
      body: JSON.stringify(requestData),
      timeout: 10000
    });

    if (!response.ok) {
      const errorMsg = await response.json().catch(() => ({ message: '未知错误' }));
      throw new Error(`API 请求失败：${errorMsg.message || '服务器错误'}（状态码：${response.status}）`);
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
        <td colspan="7" class="text-center py-3 text-muted">暂无用户数据，可通过机器人交互生成</td>
      </tr>
    `;
    return;
  }

  container.innerHTML = users.map(user => `
    <tr>
      <td>${user.user_id}</td>
      <td>${user.username || '-'}</td>
      <td>${user.display_name || '-'}</td>
      <td>${user.first_name || ''} ${user.last_name || ''}</td>
      <td>${user.points || 0}</td>
      <td>${user.last_sign_date || '-'}</td>
      <td>
        <div class="btn-group btn-group-sm">
          <button class="btn btn-warning" onclick="editUser(${JSON.stringify(user)})">编辑</button>
          <button class="btn btn-success" onclick="openPointsModal(${JSON.stringify(user)})">调整积分</button>
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
        <td colspan="8" class="text-center py-3 text-muted">暂无老师数据，可通过下方按钮添加</td>
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
      <td>${teacher.price}</td>
      <td>
        <span class="badge bg-${teacher.status === 'approved' ? 'success' : teacher.status === 'pending' ? 'warning' : 'danger'}">
          ${teacher.status === 'approved' ? '已认证' : teacher.status === 'pending' ? '待审核' : '已拒绝'}
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
  document.getElementById('display_name').value = user.display_name || '';
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
    display_name: document.getElementById('display_name').value,
    first_name: document.getElementById('first_name').value,
    last_name: document.getElementById('last_name').value,
    points: parseInt(document.getElementById('points').value) || 0
  };

  try {
    if (currentEditId) {
      await fetchData('users', 'update', formData);
      showAlert('用户更新成功', 'success');
    } else {
      await fetchData('users', 'insert', formData);
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

// 积分调整模态框
function openPointsModal(user) {
  currentPointsUserId = user.user_id;
  
  // 填充表单数据
  document.getElementById('points_user_id').value = user.user_id;
  document.getElementById('points_username').value = user.display_name || user.username || `${user.first_name} ${user.last_name}`;
  document.getElementById('current_points').value = user.points || 0;
  document.getElementById('points_change').value = '';
  
  const pointsModal = new bootstrap.Modal(document.getElementById('points-modal'));
  pointsModal.show();
}

async function handlePointsAdjustment(e) {
  e.preventDefault();
  
  if (!currentPointsUserId) return;
  
  const pointsChange = parseInt(document.getElementById('points_change').value) || 0;
  
  if (pointsChange === 0) {
    showAlert('请输入积分变动值', 'warning');
    return;
  }
  
  try {
    const result = await fetchData('users', 'adjust_points', {
      user_id: currentPointsUserId,
      points_change: pointsChange
    });
    
    showAlert(`积分调整成功！新积分: ${result.new_points}`, 'success');
    
    // 关闭模态框并刷新数据
    const modal = bootstrap.Modal.getInstance(document.getElementById('points-modal'));
    modal.hide();
    loadRealData();
  } catch (error) {
    console.error('积分调整失败:', error);
  }
}

// 老师模态框操作
function openTeacherModal() {
  currentEditId = null;
  document.getElementById('teacher-modal-title').textContent = '添加老师';
  // 清空ID输入框，新增时不需要ID
  document.getElementById('teacher_id').value = '';
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
  document.getElementById('telegram_account').value = teacher.telegram_account || '';
  document.getElementById('channel').value = teacher.channel || '';
  document.getElementById('service_type').value = teacher.service_type;
  document.getElementById('price').value = teacher.price;
  document.getElementById('intro').value = teacher.intro || '';
  document.getElementById('status').value = teacher.status;
  
  const teacherModal = new bootstrap.Modal(document.getElementById('teacher-modal'));
  teacherModal.show();
}

async function handleTeacherSubmit(e) {
  e.preventDefault();
  const formData = {
    id: currentEditId ? parseInt(document.getElementById('teacher_id').value) : null,
    nickname: document.getElementById('nickname').value,
    age: parseInt(document.getElementById('age').value),
    region: document.getElementById('region').value,
    telegram_account: document.getElementById('telegram_account').value,
    channel: document.getElementById('channel').value,
    service_type: document.getElementById('service_type').value,
    price: document.getElementById('price').value,
    intro: document.getElementById('intro').value,
    status: document.getElementById('status').value
  };

  try {
    if (currentEditId) {
      await fetchData('teachers', 'update', formData);
      showAlert('老师信息更新成功', 'success');
    } else {
      await fetchData('teachers', 'insert', formData);
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
  document.getElementById('keyword_id').value = '';
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
      await fetchData('keywords', 'insert', formData);
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
    await fetchData('banned_keywords', 'insert', formData);
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
window.openPointsModal = openPointsModal;
