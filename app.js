// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    // 初始化事件监听
    initEventListeners();
    
    // 检查登录状态
    if (isLoggedIn()) {
        showScreen('dashboard');
        loadDashboardData();
    } else {
        showScreen('login');
    }
});

// 初始化事件监听
function initEventListeners() {
    // 导航链接点击
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const screenId = link.getAttribute('href').substring(1);
            showScreen(screenId);
            
            // 根据屏幕ID加载相应数据
            if (screenId === 'users') loadUsers();
            if (screenId === 'teachers') loadTeachers();
            if (screenId === 'keywords') loadKeywords();
            if (screenId === 'banned') loadBannedKeywords();
        });
    });
    
    // 移动端菜单切换
    document.getElementById('menu-toggle').addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.createElement('div');
        overlay.className = 'overlay active';
        document.body.appendChild(overlay);
        
        sidebar.classList.add('open');
        
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.remove();
        });
    });
    
    // 登录按钮
    document.getElementById('login-btn').addEventListener('click', handleLogin);
    
    // 退出按钮
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // 用户管理相关按钮
    document.getElementById('user-search').addEventListener('input', filterUsers);
    document.getElementById('cancel-user-edit').addEventListener('click', () => {
        document.getElementById('user-modal').classList.add('hidden');
    });
    document.getElementById('save-user-edit').addEventListener('click', saveUserEdit);
    
    // 老师管理相关按钮
    document.getElementById('add-teacher-btn').addEventListener('click', () => {
        openTeacherModal();
    });
    document.getElementById('cancel-teacher-edit').addEventListener('click', () => {
        document.getElementById('teacher-modal').classList.add('hidden');
    });
    document.getElementById('save-teacher-edit').addEventListener('click', saveTeacherEdit);
    
    // 关键词管理相关按钮
    document.getElementById('add-keyword-btn').addEventListener('click', () => {
        openKeywordModal();
    });
    document.getElementById('cancel-keyword-edit').addEventListener('click', () => {
        document.getElementById('keyword-modal').classList.add('hidden');
    });
    document.getElementById('save-keyword-edit').addEventListener('click', saveKeywordEdit);
    
    // 禁言词管理相关按钮
    document.getElementById('add-banned-btn').addEventListener('click', () => {
        openBannedModal();
    });
    document.getElementById('cancel-banned-edit').addEventListener('click', () => {
        document.getElementById('banned-modal').classList.add('hidden');
    });
    document.getElementById('save-banned-edit').addEventListener('click', saveBannedEdit);
    
    // 系统设置相关按钮
    document.getElementById('test-connection-btn').addEventListener('click', runConnectionTest);
    document.getElementById('send-random-teacher-btn').addEventListener('click', handleSendRandomTeacher);
    
    // 测试页面按钮
    document.getElementById('run-test-btn').addEventListener('click', runFullTest);
}

// 处理登录
async function handleLogin() {
    const adminKey = document.getElementById('admin-key').value;
    const loginError = document.getElementById('login-error');
    
    // 简单验证
    if (!adminKey) {
        loginError.textContent = '请输入管理员密钥';
        loginError.classList.remove('hidden');
        return;
    }
    
    // 验证密钥
    if (adminKey !== ADMIN_API_KEY) {
        loginError.textContent = '管理员密钥不正确';
        loginError.classList.remove('hidden');
        return;
    }
    
    // 登录成功
    setLoggedIn(true);
    showScreen('dashboard');
    loadDashboardData();
    showNotification('登录成功');
}

// 处理退出
function handleLogout() {
    setLoggedIn(false);
    showScreen('login');
    document.getElementById('admin-key').value = '';
    showNotification('已退出登录');
}

// 加载仪表盘数据
async function loadDashboardData() {
    try {
        // 并行加载数据
        const [users, teachers, keywords] = await Promise.all([
            getAllUsers(),
            getAllTeachers(),
            getAllKeywords()
        ]);
        
        // 更新统计数据
        document.getElementById('total-users').textContent = users.length;
        document.getElementById('total-teachers').textContent = teachers.length;
        document.getElementById('total-keywords').textContent = keywords.length;
        
        // 计算今日签到人数
        const today = new Date().toISOString().split('T')[0];
        const todaySigns = users.filter(user => user.last_sign_date === today).length;
        document.getElementById('today-signs').textContent = todaySigns;
        
        // 加载排名前10的用户
        const sortedUsers = [...users].sort((a, b) => (b.points || 0) - (a.points || 0));
        const topUsers = sortedUsers.slice(0, 10);
        renderTopUsers(topUsers);
        
        // 加载最近添加的老师
        const sortedTeachers = [...teachers].sort((a, b) => 
            new Date(b.created_at || 0) - new Date(a.created_at || 0)
        );
        const recentTeachers = sortedTeachers.slice(0, 5);
        renderRecentTeachers(recentTeachers);
        
    } catch (error) {
        console.error('加载仪表盘数据失败:', error);
        showNotification('加载数据失败', true);
    }
}

// 渲染排名前10的用户
function renderTopUsers(users) {
    const container = document.getElementById('top-users');
    container.innerHTML = '';
    
    users.forEach((user, index) => {
        const displayName = user.display_name || 
                          `${user.first_name || ''} ${user.last_name || ''}`.trim() || 
                          user.username || '未知用户';
        
        const userElement = document.createElement('div');
        userElement.className = 'flex items-center justify-between p-2 border-b border-gray-100';
        userElement.innerHTML = `
            <div class="flex items-center">
                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span class="text-blue-600 font-bold">${index + 1}</span>
                </div>
                <span>${displayName}</span>
            </div>
            <span class="font-bold">${user.points || 0} 积分</span>
        `;
        
        container.appendChild(userElement);
    });
}

// 渲染最近添加的老师
function renderRecentTeachers(teachers) {
    const container = document.getElementById('recent-teachers');
    container.innerHTML = '';
    
    teachers.forEach(teacher => {
        const teacherElement = document.createElement('div');
        teacherElement.className = 'p-3 border-b border-gray-100';
        teacherElement.innerHTML = `
            <div class="font-medium">${teacher.nickname}</div>
            <div class="text-sm text-gray-500">${teacher.region} · ${teacher.age}岁</div>
            <div class="text-xs text-gray-400 mt-1">
                状态: <span class="px-2 py-0.5 rounded-full text-xs ${
                    teacher.status === 'approved' ? 'bg-green-100 text-green-800' :
                    teacher.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                }">${
                    teacher.status === 'approved' ? '已通过' :
                    teacher.status === 'pending' ? '待审核' :
                    '已拒绝'
                }</span>
            </div>
        `;
        
        container.appendChild(teacherElement);
    });
}

// 加载用户列表
async function loadUsers() {
    try {
        const users = await getAllUsers();
        renderUsersTable(users);
    } catch (error) {
        console.error('加载用户失败:', error);
    }
}

// 渲染用户表格
function renderUsersTable(users) {
    const tableBody = document.getElementById('users-table-body');
    tableBody.innerHTML = '';
    
    if (users.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                    没有找到用户数据
                </td>
            </tr>
        `;
        return;
    }
    
    users.forEach(user => {
        const displayName = user.display_name || 
                          `${user.first_name || ''} ${user.last_name || ''}`.trim() || 
                          user.username || '未知用户';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${user.user_id}</td>
            <td class="px-6 py-4 whitespace-nowrap">${user.username || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap">${displayName}</td>
            <td class="px-6 py-4 whitespace-nowrap">${user.points || 0}</td>
            <td class="px-6 py-4 whitespace-nowrap">${formatDate(user.last_sign_date)}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <button class="text-blue-500 hover:text-blue-700 mr-3 edit-user" data-id="${user.user_id}">
                    <i class="fa fa-pencil"></i>
                </button>
                <button class="text-red-500 hover:text-red-700 delete-user" data-id="${user.user_id}">
                    <i class="fa fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // 添加编辑和删除事件监听
    document.querySelectorAll('.edit-user').forEach(button => {
        button.addEventListener('click', () => editUser(button.getAttribute('data-id')));
    });
    
    document.querySelectorAll('.delete-user').forEach(button => {
        button.addEventListener('click', () => deleteUser(button.getAttribute('data-id')));
    });
}

// 过滤用户
function filterUsers() {
    const searchTerm = document.getElementById('user-search').value.toLowerCase();
    const rows = document.querySelectorAll('#users-table-body tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// 编辑用户
async function editUser(userId) {
    try {
        const users = await getAllUsers();
        const user = users.find(u => u.user_id === userId);
        
        if (!user) {
            showNotification('未找到用户', true);
            return;
        }
        
        document.getElementById('edit-user-id').value = user.user_id;
        document.getElementById('edit-username').value = user.username || '';
        document.getElementById('edit-display-name').value = user.display_name || '';
        document.getElementById('edit-points').value = user.points || 0;
        
        document.getElementById('user-modal').classList.remove('hidden');
    } catch (error) {
        console.error('编辑用户失败:', error);
        showNotification('加载用户数据失败', true);
    }
}

// 保存用户编辑
async function saveUserEdit() {
    try {
        const userId = document.getElementById('edit-user-id').value;
        const displayName = document.getElementById('edit-display-name').value;
        const points = parseInt(document.getElementById('edit-points').value) || 0;
        
        // 调用API更新用户
        await adminApiRequest('update', 'users', {
            user_id: userId,
            display_name: displayName,
            points: points
        }, `user_id=eq.${userId}`);
        
        document.getElementById('user-modal').classList.add('hidden');
        loadUsers();
        showNotification('用户已更新');
    } catch (error) {
        console.error('保存用户失败:', error);
    }
}

// 删除用户
async function deleteUser(userId) {
    if (!confirm('确定要删除这个用户吗？')) {
        return;
    }
    
    try {
        await adminApiRequest('delete', 'users', { user_id: userId });
        loadUsers();
        showNotification('用户已删除');
    } catch (error) {
        console.error('删除用户失败:', error);
        showNotification('删除用户失败', true);
    }
}

// 加载老师列表
async function loadTeachers() {
    try {
        const teachers = await getAllTeachers();
        renderTeachersTable(teachers);
    } catch (error) {
        console.error('加载老师失败:', error);
    }
}

// 渲染老师表格
function renderTeachersTable(teachers) {
    const tableBody = document.getElementById('teachers-table-body');
    tableBody.innerHTML = '';
    
    if (teachers.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                    没有找到老师数据
                </td>
            </tr>
        `;
        return;
    }
    
    teachers.forEach(teacher => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${teacher.id}</td>
            <td class="px-6 py-4 whitespace-nowrap">${teacher.nickname}</td>
            <td class="px-6 py-4 whitespace-nowrap">${teacher.age}</td>
            <td class="px-6 py-4 whitespace-nowrap">${teacher.region}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 rounded-full text-xs ${
                    teacher.status === 'approved' ? 'bg-green-100 text-green-800' :
                    teacher.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                }">${
                    teacher.status === 'approved' ? '已通过' :
                    teacher.status === 'pending' ? '待审核' :
                    '已拒绝'
                }</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <button class="text-blue-500 hover:text-blue-700 mr-3 edit-teacher" data-id="${teacher.id}">
                    <i class="fa fa-pencil"></i>
                </button>
                <button class="text-red-500 hover:text-red-700 delete-teacher" data-id="${teacher.id}">
                    <i class="fa fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // 添加编辑和删除事件监听
    document.querySelectorAll('.edit-teacher').forEach(button => {
        button.addEventListener('click', () => editTeacher(button.getAttribute('data-id')));
    });
    
    document.querySelectorAll('.delete-teacher').forEach(button => {
        button.addEventListener('click', () => deleteTeacher(button.getAttribute('data-id')));
    });
}

// 打开老师编辑模态框
function openTeacherModal(teacher = null) {
    // 重置表单
    document.getElementById('edit-teacher-id').value = '';
    document.getElementById('teacher-nickname').value = '';
    document.getElementById('teacher-age').value = '';
    document.getElementById('teacher-region').value = '';
    document.getElementById('teacher-telegram').value = '';
    document.getElementById('teacher-channel').value = '';
    document.getElementById('teacher-service').value = '';
    document.getElementById('teacher-cost').value = '';
    document.getElementById('teacher-intro').value = '';
    document.getElementById('teacher-photo-1').value = '';
    document.getElementById('teacher-photo-2').value = '';
    document.getElementById('teacher-photo-3').value = '';
    document.getElementById('teacher-video').value = '';
    document.getElementById('teacher-status').value = 'pending';
    
    // 如果是编辑模式，填充数据
    if (teacher) {
        document.getElementById('edit-teacher-id').value = teacher.id;
        document.getElementById('teacher-nickname').value = teacher.nickname || '';
        document.getElementById('teacher-age').value = teacher.age || '';
        document.getElementById('teacher-region').value = teacher.region || '';
        document.getElementById('teacher-telegram').value = teacher.telegram_account || '';
        document.getElementById('teacher-channel').value = teacher.channel || '';
        document.getElementById('teacher-service').value = teacher.service_type || '';
        document.getElementById('teacher-cost').value = teacher.repair_cost || '';
        document.getElementById('teacher-intro').value = teacher.intro || '';
        document.getElementById('teacher-photo-1').value = teacher.photo_url_1 || '';
        document.getElementById('teacher-photo-2').value = teacher.photo_url_2 || '';
        document.getElementById('teacher-photo-3').value = teacher.photo_url_3 || '';
        document.getElementById('teacher-video').value = teacher.video_url || '';
        document.getElementById('teacher-status').value = teacher.status || 'pending';
    }
    
    document.getElementById('teacher-modal').classList.remove('hidden');
}

// 编辑老师
async function editTeacher(teacherId) {
    try {
        const teachers = await getAllTeachers();
        const teacher = teachers.find(t => t.id.toString() === teacherId.toString());
        
        if (!teacher) {
            showNotification('未找到老师', true);
            return;
        }
        
        openTeacherModal(teacher);
    } catch (error) {
        console.error('编辑老师失败:', error);
        showNotification('加载老师数据失败', true);
    }
}

// 保存老师编辑
async function saveTeacherEdit() {
    try {
        const teacherId = document.getElementById('edit-teacher-id').value;
        const isNew = !teacherId;
        
        const teacherData = {
            nickname: document.getElementById('teacher-nickname').value,
            age: parseInt(document.getElementById('teacher-age').value) || 0,
            region: document.getElementById('teacher-region').value,
            telegram_account: document.getElementById('teacher-telegram').value,
            channel: document.getElementById('teacher-channel').value,
            service_type: document.getElementById('teacher-service').value,
            repair_cost: document.getElementById('teacher-cost').value,
            intro: document.getElementById('teacher-intro').value,
            photo_url_1: document.getElementById('teacher-photo-1').value || null,
            photo_url_2: document.getElementById('teacher-photo-2').value || null,
            photo_url_3: document.getElementById('teacher-photo-3').value || null,
            video_url: document.getElementById('teacher-video').value || null,
            status: document.getElementById('teacher-status').value
        };
        
        // 如果是新老师，添加创建时间
        if (isNew) {
            teacherData.created_at = new Date().toISOString();
        } else {
            teacherData.id = teacherId;
        }
        
        // 调用API保存老师
        if (isNew) {
            await adminApiRequest('insert', 'teachers', teacherData);
        } else {
            await adminApiRequest('update', 'teachers', teacherData, `id=eq.${teacherId}`);
        }
        
        document.getElementById('teacher-modal').classList.add('hidden');
        loadTeachers();
        showNotification(isNew ? '老师已添加' : '老师已更新');
    } catch (error) {
        console.error('保存老师失败:', error);
        showNotification('保存老师失败', true);
    }
}

// 删除老师
async function deleteTeacher(teacherId) {
    if (!confirm('确定要删除这个老师吗？')) {
        return;
    }
    
    try {
        await adminApiRequest('delete', 'teachers', { id: teacherId });
        loadTeachers();
        showNotification('老师已删除');
    } catch (error) {
        console.error('删除老师失败:', error);
        showNotification('删除老师失败', true);
    }
}

// 加载关键词列表
async function loadKeywords() {
    try {
        const keywords = await getAllKeywords();
        renderKeywordsTable(keywords);
    } catch (error) {
        console.error('加载关键词失败:', error);
    }
}

// 渲染关键词表格
function renderKeywordsTable(keywords) {
    const tableBody = document.getElementById('keywords-table-body');
    tableBody.innerHTML = '';
    
    if (keywords.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="px-6 py-4 text-center text-gray-500">
                    没有找到关键词数据
                </td>
            </tr>
        `;
        return;
    }
    
    keywords.forEach(keyword => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${keyword.keyword}</td>
            <td class="px-6 py-4">${keyword.response.substring(0, 50)}${keyword.response.length > 50 ? '...' : ''}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 rounded-full text-xs ${
                    keyword.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }">${keyword.is_active ? '启用' : '禁用'}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <button class="text-blue-500 hover:text-blue-700 mr-3 edit-keyword" data-id="${keyword.id}">
                    <i class="fa fa-pencil"></i>
                </button>
                <button class="text-red-500 hover:text-red-700 delete-keyword" data-id="${keyword.id}">
                    <i class="fa fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // 添加编辑和删除事件监听
    document.querySelectorAll('.edit-keyword').forEach(button => {
        button.addEventListener('click', () => editKeyword(button.getAttribute('data-id')));
    });
    
    document.querySelectorAll('.delete-keyword').forEach(button => {
        button.addEventListener('click', () => deleteKeyword(button.getAttribute('data-id')));
    });
}

// 打开关键词编辑模态框
function openKeywordModal(keyword = null) {
    // 重置表单
    document.getElementById('edit-keyword-id').value = '';
    document.getElementById('keyword-text').value = '';
    document.getElementById('keyword-response').value = '';
    document.getElementById('keyword-active').checked = true;
    
    // 设置标题
    document.getElementById('keyword-modal-title').textContent = keyword ? '编辑关键词' : '添加关键词';
    
    // 如果是编辑模式，填充数据
    if (keyword) {
        document.getElementById('edit-keyword-id').value = keyword.id;
        document.getElementById('keyword-text').value = keyword.keyword || '';
        document.getElementById('keyword-response').value = keyword.response || '';
        document.getElementById('keyword-active').checked = keyword.is_active !== false;
    }
    
    document.getElementById('keyword-modal').classList.remove('hidden');
}

// 编辑关键词
async function editKeyword(keywordId) {
    try {
        const keywords = await getAllKeywords();
        const keyword = keywords.find(k => k.id.toString() === keywordId.toString());
        
        if (!keyword) {
            showNotification('未找到关键词', true);
            return;
        }
        
        openKeywordModal(keyword);
    } catch (error) {
        console.error('编辑关键词失败:', error);
        showNotification('加载关键词数据失败', true);
    }
}

// 保存关键词编辑
async function saveKeywordEdit() {
    try {
        const keywordId = document.getElementById('edit-keyword-id').value;
        const isNew = !keywordId;
        
        const keywordData = {
            keyword: document.getElementById('keyword-text').value,
            response: document.getElementById('keyword-response').value,
            is_active: document.getElementById('keyword-active').checked
        };
        
        if (!isNew) {
            keywordData.id = keywordId;
        }
        
        // 调用API保存关键词
        if (isNew) {
            await adminApiRequest('insert', 'keywords', keywordData);
        } else {
            await adminApiRequest('update', 'keywords', keywordData, `id=eq.${keywordId}`);
        }
        
        document.getElementById('keyword-modal').classList.add('hidden');
        loadKeywords();
        showNotification(isNew ? '关键词已添加' : '关键词已更新');
    } catch (error) {
        console.error('保存关键词失败:', error);
        showNotification('保存关键词失败', true);
    }
}

// 删除关键词
async function deleteKeyword(keywordId) {
    if (!confirm('确定要删除这个关键词吗？')) {
        return;
    }
    
    try {
        await adminApiRequest('delete', 'keywords', { id: keywordId });
        loadKeywords();
        showNotification('关键词已删除');
    } catch (error) {
        console.error('删除关键词失败:', error);
        showNotification('删除关键词失败', true);
    }
}

// 加载禁言词列表
async function loadBannedKeywords() {
    try {
        const bannedKeywords = await getAllBannedKeywords();
        renderBannedKeywordsTable(bannedKeywords);
    } catch (error) {
        console.error('加载禁言词失败:', error);
    }
}

// 渲染禁言词表格
function renderBannedKeywordsTable(bannedKeywords) {
    const tableBody = document.getElementById('banned-table-body');
    tableBody.innerHTML = '';
    
    if (bannedKeywords.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="2" class="px-6 py-4 text-center text-gray-500">
                    没有找到禁言词数据
                </td>
            </tr>
        `;
        return;
    }
    
    bannedKeywords.forEach(banned => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${banned.keyword}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <button class="text-blue-500 hover:text-blue-700 mr-3 edit-banned" data-id="${banned.id}">
                    <i class="fa fa-pencil"></i>
                </button>
                <button class="text-red-500 hover:text-red-700 delete-banned" data-id="${banned.id}">
                    <i class="fa fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // 添加编辑和删除事件监听
    document.querySelectorAll('.edit-banned').forEach(button => {
        button.addEventListener
