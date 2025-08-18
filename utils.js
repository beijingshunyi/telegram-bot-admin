// 常量定义
const SUPABASE_URL = "https://tekuxjnnwtqmygibvwux.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRla3V4am5ud3RxbXlnaWJ2d3V4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNDUzNjAsImV4cCI6MjA3MDkyMTM2MH0.RGmuF44husXoJP8y4U1Gx7HqQJ6MsYZVl6_vHtG-KJY";
const WORKER_URL = "https://telegram-bot.jbk123jbk.workers.dev";
const ADMIN_API_KEY = "9712202273aA.";

// 显示通知
function showNotification(message, isError = false) {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    
    notificationText.textContent = message;
    notification.className = isError ? 
        'fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-md shadow-lg transform translate-y-0 opacity-100 transition-all duration-300 flex items-center' :
        'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-md shadow-lg transform translate-y-0 opacity-100 transition-all duration-300 flex items-center';
    
    setTimeout(() => {
        notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-md shadow-lg transform translate-y-20 opacity-0 transition-all duration-300 flex items-center';
    }, 3000);
}

// 检查是否已登录
function isLoggedIn() {
    return localStorage.getItem('adminLoggedIn') === 'true';
}

// 设置登录状态
function setLoggedIn(status) {
    localStorage.setItem('adminLoggedIn', status ? 'true' : 'false');
}

// 获取请求头
function getHeaders() {
    return {
        'Content-Type': 'application/json',
        'Admin-Key': ADMIN_API_KEY
    };
}

// 通用API请求函数
async function apiRequest(endpoint, method = 'GET', data = null) {
    try {
        const url = `${WORKER_URL}${endpoint}`;
        const options = {
            method,
            headers: getHeaders()
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(url, options);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `请求失败: ${response.statusText}`);
        }
        
        return response.json().catch(() => ({}));
    } catch (error) {
        console.error('API请求错误:', error);
        showNotification(`操作失败: ${error.message}`, true);
        throw error;
    }
}

// 管理员API请求
async function adminApiRequest(action, table, data = null, filter = null) {
    return apiRequest('/admin-api', 'POST', {
        action,
        table,
        data,
        filter
    });
}

// 获取所有用户
async function getAllUsers() {
    return apiRequest('/api/users');
}

// 获取所有老师
async function getAllTeachers() {
    return apiRequest('/api/teachers');
}

// 获取所有关键词
async function getAllKeywords() {
    return apiRequest('/api/keywords');
}

// 获取所有禁言词
async function getAllBannedKeywords() {
    return apiRequest('/api/banned');
}

// 格式化日期
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

// 测试数据库连接
async function testDatabaseConnection() {
    return apiRequest('/test-db');
}

// 发送随机老师推荐
async function sendRandomTeacher() {
    return apiRequest('/send-random-teacher');
}

// 切换屏幕显示
function showScreen(screenId) {
    // 隐藏所有屏幕
    document.querySelectorAll('main > div[id$="-screen"]').forEach(screen => {
        screen.classList.add('hidden');
    });
    
    // 显示目标屏幕
    document.getElementById(`${screenId}-screen`).classList.remove('hidden');
    
    // 更新导航链接状态
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${screenId}`) {
            link.classList.add('active');
        }
    });
    
    // 在移动设备上关闭侧边栏
    if (window.innerWidth < 768) {
        document.getElementById('sidebar').classList.remove('open');
        document.querySelector('.overlay').classList.remove('active');
    }
}
