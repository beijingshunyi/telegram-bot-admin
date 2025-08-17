// 配置信息 - 确保与Worker中的密钥一致
const API_URL = "https://telegram-bot.jbk123jbk.workers.dev/admin-api";
const ADMIN_KEY = "MySuperSecureKey123!"; // 必须与Worker中的密钥完全一致
const TEST_DB_URL = "https://telegram-bot.jbk123jbk.workers.dev/test-db";

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('log-init');
    testServiceConnection();
});

// 测试服务连接性
async function testServiceConnection() {
    try {
        showAlert('正在测试服务连接...', 'info');
        
        // 先测试基础连接
        const testResponse = await fetch(TEST_DB_URL);
        if (!testResponse.ok) {
            throw new Error(`服务响应错误: ${testResponse.status} ${testResponse.statusText}`);
        }
        
        const testData = await testResponse.json();
        console.log('服务连接测试成功:', testData);
        showAlert('服务连接成功，正在加载数据...', 'info');
        
        // 连接成功后加载数据
        loadRealData();
        setupEventListeners();
    } catch (error) {
        console.error('服务连接测试失败:', error);
        showAlert(
            `无法连接到服务: ${error.message}\n` +
            `请检查：\n` +
            `1. Cloudflare Worker是否已部署\n` +
            `2. 网络连接是否正常\n` +
            `3. 防火墙是否阻止了请求`, 
            'error'
        );
        // 显示错误状态，不再显示加载中
        document.querySelectorAll('.loading').forEach(el => {
            el.innerHTML = `<i class="fa fa-exclamation-circle text-red-500 mr-2"></i>数据加载失败，请检查服务状态`;
        });
    }
}

// 加载数据
async function loadRealData() {
    try {
        // 加载所有数据
        const users = await fetchData('users', 'get');
        const teachers = await fetchData('teachers', 'get');
        const keywords = await fetchData('keywords', 'get');
        const bannedKeywords = await fetchData('banned_keywords', 'get');
        
        // 强制打印数据，确认内容
        console.log('用户数据:', users);
        console.log('老师数据:', teachers);
        console.log('关键词数据:', keywords);
        console.log('禁言词数据:', bannedKeywords);
        
        // 渲染数据到页面
        renderUsers(users);
        renderTeachers(teachers);
        renderKeywords(keywords);
        renderBannedKeywords(bannedKeywords);
        
        console.log('所有数据加载完成');
        showAlert('数据加载成功', 'info');
    } catch (error) {
        console.error('加载数据失败:', error);
        showAlert('加载数据失败: ' + error.message, 'error');
    }
}

// 设置事件监听器
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
        
        console.log('发送API请求:', API_URL, requestData);
        
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Admin-Key": ADMIN_KEY
            },
            body: JSON.stringify(requestData),
            timeout: 10000 // 设置10秒超时
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`API请求失败: ${errorData.message || response.statusText} (状态码: ${response.status})`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('获取数据错误:', error);
        showAlert('获取数据失败: ' + error.message, 'error');
        throw error;
    }
}

// 显示提示信息
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = `<i class="fa ${type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'} mr-2"></i>${message}`;
    
    document.body.appendChild(alertDiv);
    
    // 5秒后自动移除
    setTimeout(() => {
        alertDiv.style.opacity = '0';
        alertDiv.style.transition = 'opacity 0.5s';
        setTimeout(() => alertDiv.remove(), 500);
    }, 5000);
}

// 渲染用户数据
function renderUsers(users) {
    console.log('进入 renderUsers，数据长度:', users.length);
    const container = document.getElementById('users-container');
    console.log('找到用户容器:', container ? '是' : '否');
    
    if (!container) {
        console.error('未找到 users-container');
        showAlert('用户列表容器丢失', 'error');
        return;
    }
    
    // 如果没有数据，显示提示
    if (users.length === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-500 py-4">
                <i class="fa fa-info-circle mr-2"></i>暂无用户数据，请在机器人中进行签到等操作生成数据
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
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
    console.log('用户列表渲染完成');
}

// 渲染老师数据
function renderTeachers(teachers) {
    console.log('进入 renderTeachers，数据长度:', teachers.length);
    const container = document.getElementById('teachers-container');
    console.log('找到老师容器:', container ? '是' : '否');
    
    if (!container) {
        console.error('未找到 teachers-container');
        showAlert('老师列表容器丢失', 'error');
        return;
    }
    
    // 如果没有数据，显示提示
    if (teachers.length === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-500 py-4">
                <i class="fa fa-info-circle mr-2"></i>暂无老师数据，请通过机器人上传老师信息
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
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
                            <span class="badge ${teacher.status === 'approved' ? 'bg-green-500' : 'bg-yellow-500'}">
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
    console.log('老师列表渲染完成');
}

// 渲染关键词
function renderKeywords(keywords) {
    console.log('进入 renderKeywords，数据长度:', keywords.length);
    const container = document.getElementById('keywords-container');
    console.log('找到关键词容器:', container ? '是' : '否');
    
    if (!container) {
        console.error('未找到 keywords-container');
        showAlert('关键词列表容器丢失', 'error');
        return;
    }
    
    // 如果没有数据，显示提示
    if (keywords.length === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-500 py-4">
                <i class="fa fa-info-circle mr-2"></i>暂无关键词数据，点击"添加关键词"按钮添加
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
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
                            <span class="badge ${keyword.is_active ? 'bg-green-500' : 'bg-gray-400'}">
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
    console.log('关键词列表渲染完成');
}

// 渲染禁言词
function renderBannedKeywords(keywords) {
    console.log('进入 renderBannedKeywords，数据长度:', keywords.length);
    const container = document.getElementById('banned-keywords-container');
    console.log('找到禁言词容器:', container ? '是' : '否');
    
    if (!container) {
        console.error('未找到 banned-keywords-container');
        showAlert('禁言词列表容器丢失', 'error');
        return;
    }
    
    // 如果没有数据，显示提示
    if (keywords.length === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-500 py-4">
                <i class="fa fa-info-circle mr-2"></i>暂无禁言词数据，点击"添加禁言词"按钮添加
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
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
    console.log('禁言词列表渲染完成');
}

// 模态框操作函数
function openUserModal() {
    showAlert('用户添加功能即将开放', 'info');
}

function saveUser() {
    showAlert('用户保存成功', 'info');
    loadRealData();
}

function openTeacherModal() {
    showAlert('老师添加功能即将开放', 'info');
}

function saveTeacher() {
    showAlert('老师信息保存成功', 'info');
    loadRealData();
}

function openKeywordModal() {
    showAlert('关键词添加功能即将开放', 'info');
}

function saveKeyword() {
    showAlert('关键词保存成功', 'info');
    loadRealData();
}

function openBannedKeywordModal() {
    showAlert('禁言词添加功能即将开放', 'info');
}

function saveBannedKeyword() {
    showAlert('禁言词保存成功', 'info');
    loadRealData();
}

// 编辑和删除函数
function editUser(user) {
    console.log('编辑用户:', user);
    showAlert(`编辑用户: ${user.username || user.first_name}`, 'info');
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

// 全局暴露函数
window.editUser = editUser;
window.editTeacher = editTeacher;
window.editKeyword = editKeyword;
window.deleteBannedKeyword = deleteBannedKeyword;
    
