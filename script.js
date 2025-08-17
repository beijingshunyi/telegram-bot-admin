// 配置信息 - 确保与Worker中的密钥一致
const API_URL = "https://telegram-bot.jbk123jbk.workers.dev/admin-api";
const ADMIN_KEY = "MySuperSecureKey123!"; // 必须与Worker中的密钥完全一致

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('log-init');
    loadRealData();
    setupEventListeners(); // 现在定义了这个函数
});

// 加载数据
async function loadRealData() {
    try {
        // 加载所有数据
        const users = await fetchData('users', 'get');
        const teachers = await fetchData('teachers', 'get');
        const keywords = await fetchData('keywords', 'get');
        const bannedKeywords = await fetchData('banned_keywords', 'get');
        
        // 渲染数据到页面
        renderUsers(users);
        renderTeachers(teachers);
        renderKeywords(keywords);
        renderBannedKeywords(bannedKeywords);
        
        console.log('所有数据加载完成');
    } catch (error) {
        console.error('加载数据失败:', error);
        showAlert('加载数据失败: ' + error.message, 'error'); // 现在定义了showAlert
    }
}

// 设置事件监听器 - 修复了未定义的问题
function setupEventListeners() {
    // 用户管理相关事件
    document.getElementById('add-user-btn')?.addEventListener('click', () => openUserModal());
    document.getElementById('save-user-btn')?.addEventListener('click', () => saveUser());
    
    // 老师管理相关事件
    document.getElementById('add-teacher-btn')?.addEventListener('click', () => openTeacherModal());
    document.getElementById('save-teacher-btn')?.addEventListener('click', () => saveTeacher());
    
    // 关键词管理相关事件
    document.getElementById('add-keyword-btn')?.addEventListener('click', () => openKeywordModal());
    document.getElementById('save-keyword-btn')?.addEventListener('click', () => saveKeyword());
    
    // 禁言词管理相关事件
    document.getElementById('add-banned-btn')?.addEventListener('click', () => openBannedKeywordModal());
    document.getElementById('save-banned-btn')?.addEventListener('click', () => saveBannedKeyword());
}

// 通用数据获取函数
async function fetchData(table, action, data = null, filter = "") {
    try {
        const requestData = {
            action: action,
            table: table,
            filter: filter
        };
        
        if (data) {
            requestData.data = data;
        }
        
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Admin-Key": ADMIN_KEY // 使用正确的密钥
            },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            // 提供更详细的错误信息
            const errorData = await response.json();
            throw new Error(`API请求失败: ${errorData.message || response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('获取数据错误:', error);
        showAlert('获取数据失败: ' + error.message, 'error');
        throw error;
    }
}

// 显示提示信息 - 修复了未定义的问题
function showAlert(message, type = 'info') {
    // 创建提示元素
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} fixed top-20 right-4 p-4 z-50`;
    alertDiv.textContent = message;
    
    // 添加样式
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.padding = '15px';
    alertDiv.style.borderRadius = '4px';
    alertDiv.style.color = 'white';
    alertDiv.style.backgroundColor = type === 'error' ? '#dc3545' : '#0d6efd';
    alertDiv.style.zIndex = '1000';
    
    // 添加到页面
    document.body.appendChild(alertDiv);
    
    // 3秒后自动移除
    setTimeout(() => {
        alertDiv.style.opacity = '0';
        alertDiv.style.transition = 'opacity 0.5s';
        setTimeout(() => alertDiv.remove(), 500);
    }, 3000);
}

// 渲染用户数据
function renderUsers(users) {
    const container = document.getElementById('users-container');
    if (!container) return;
    
    container.innerHTML = `
        <h3>用户列表 (${users.length})</h3>
        <table class="table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>用户名</th>
                    <th>姓名</th>
                    <th>积分</th>
                    <th>最后签到</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
                ${users.map(user => `
                    <tr>
                        <td>${user.user_id}</td>
                        <td>${user.username || '-'}</td>
                        <td>${user.first_name || ''} ${user.last_name || ''}</td>
                        <td>${user.points || 0}</td>
                        <td>${user.last_sign_date || '-'}</td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="editUser(${JSON.stringify(user)})">编辑</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// 渲染老师数据
function renderTeachers(teachers) {
    const container = document.getElementById('teachers-container');
    if (!container) return;
    
    container.innerHTML = `
        <h3>老师列表 (${teachers.length})</h3>
        <table class="table">
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
                            <span class="badge ${teacher.status === 'approved' ? 'bg-success' : 'bg-warning'}">
                                ${teacher.status}
                            </span>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="editTeacher(${JSON.stringify(teacher)})">编辑</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// 渲染关键词
function renderKeywords(keywords) {
    const container = document.getElementById('keywords-container');
    if (!container) return;
    
    container.innerHTML = `
        <h3>关键词回复 (${keywords.length})</h3>
        <table class="table">
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
                            <span class="badge ${keyword.is_active ? 'bg-success' : 'bg-secondary'}">
                                ${keyword.is_active ? '启用' : '禁用'}
                            </span>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="editKeyword(${JSON.stringify(keyword)})">编辑</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// 渲染禁言词
function renderBannedKeywords(keywords) {
    const container = document.getElementById('banned-keywords-container');
    if (!container) return;
    
    container.innerHTML = `
        <h3>禁言词列表 (${keywords.length})</h3>
        <table class="table">
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
                            <button class="btn btn-sm btn-danger" onclick="deleteBannedKeyword(${keyword.id})">删除</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// 模态框操作函数（示例）
function openUserModal() {
    // 实现打开用户模态框的逻辑
    showAlert('打开用户添加模态框', 'info');
}

function saveUser() {
    // 实现保存用户的逻辑
    showAlert('用户保存成功', 'info');
    // 保存后重新加载数据
    loadRealData();
}

// 其他模态框操作函数（根据需要实现）
function openTeacherModal() { showAlert('打开老师添加模态框', 'info'); }
function saveTeacher() { 
    showAlert('老师信息保存成功', 'info');
    loadRealData();
}
function openKeywordModal() { showAlert('打开关键词添加模态框', 'info'); }
function saveKeyword() { 
    showAlert('关键词保存成功', 'info');
    loadRealData();
}
function openBannedKeywordModal() { showAlert('打开禁言词添加模态框', 'info'); }
function saveBannedKeyword() { 
    showAlert('禁言词保存成功', 'info');
    loadRealData();
}

// 编辑和删除函数（示例）
function editUser(user) {
    console.log('编辑用户:', user);
    showAlert(`编辑用户: ${user.username}`, 'info');
}

function editTeacher(teacher) {
    console.log('编辑老师:', teacher);
    showAlert(`编辑老师: ${teacher.nickname}`, 'info');
}

function editKeyword(keyword) {
    console.log('编辑关键词:', keyword);
    showAlert(`编辑关键词: ${keyword.keyword}`, 'info');
}

function deleteBannedKeyword(id) {
    if (confirm('确定要删除这个禁言词吗？')) {
        fetchData('banned_keywords', 'delete', { id: id })
            .then(() => {
                showAlert('禁言词已删除', 'info');
                loadRealData();
            });
    }
}

// 全局暴露一些函数，以便在HTML中直接调用
window.editUser = editUser;
window.editTeacher = editTeacher;
window.editKeyword = editKeyword;
window.deleteBannedKeyword = deleteBannedKeyword;
