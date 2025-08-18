// 登录状态管理
let isAuthenticated = false;

// 检查登录状态
function checkAuthStatus() {
    const authToken = localStorage.getItem('botAdminAuth');
    isAuthenticated = !!authToken;
    
    // 根据登录状态显示不同界面
    if (isAuthenticated) {
        document.getElementById('login-section').classList.add('hidden');
        showSection('dashboard');
    } else {
        document.querySelectorAll('section[id$="-section"]').forEach(section => {
            section.classList.add('hidden');
        });
        document.getElementById('login-section').classList.remove('hidden');
    }
    
    return isAuthenticated;
}

// 登录
async function login(adminKey) {
    try {
        // 验证管理员密钥
        if (adminKey !== API.getSettings().adminKey) {
            throw new Error('管理员密钥不正确');
        }
        
        // 保存登录状态
        localStorage.setItem('botAdminAuth', 'true');
        isAuthenticated = true;
        
        // 刷新界面
        checkAuthStatus();
        
        // 显示成功通知
        showNotification('登录成功', 'success');
        
        return true;
    } catch (error) {
        console.error('登录失败:', error);
        showNotification(error.message, 'error');
        return false;
    }
}

// 登出
function logout() {
    // 清除登录状态
    localStorage.removeItem('botAdminAuth');
    isAuthenticated = false;
    
    // 刷新界面
    checkAuthStatus();
    
    // 显示通知
    showNotification('已成功退出登录', 'info');
}

// 初始化登录事件监听
function initAuthEvents() {
    // 登录按钮点击事件
    document.getElementById('login-btn').addEventListener('click', () => {
        const adminKey = document.getElementById('admin-key').value;
        login(adminKey);
    });
    
    // 回车键登录
    document.getElementById('admin-key').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const adminKey = document.getElementById('admin-key').value;
            login(adminKey);
        }
    });
    
    // 登出按钮点击事件
    document.getElementById('logout-btn').addEventListener('click', logout);
}

// 导出认证相关函数
window.Auth = {
    checkAuthStatus,
    login,
    logout,
    initAuthEvents,
    isAuthenticated: () => isAuthenticated
};
