// 管理员认证逻辑
const ADMIN_KEY = "9712202273"; // 统一设置的管理员密钥

// 检查是否已登录
function checkAuth() {
    const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
    const authSection = document.getElementById('auth-section');
    const adminSection = document.getElementById('admin-section');
    
    if (isAuthenticated) {
        // 已登录，显示管理界面
        authSection.classList.add('hidden');
        adminSection.classList.remove('hidden');
        // 加载数据
        loadAllData();
    } else {
        // 未登录，显示登录界面
        authSection.classList.remove('hidden');
        adminSection.classList.add('hidden');
    }
}

// 登录处理
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const keyInput = document.getElementById('admin-key');
    const key = keyInput.value.trim();
    
    // 本地验证 + 远程验证
    const localValid = key === ADMIN_KEY;
    const remoteValid = await API.verifyAdminKey(key);
    
    if (localValid && remoteValid.success) {
        localStorage.setItem('adminAuthenticated', 'true');
        checkAuth();
        showNotification('登录成功', 'success');
        keyInput.value = '';
    } else {
        showNotification('密钥不正确，请重新输入', 'error');
        keyInput.focus();
    }
});

// 登出处理
document.getElementById('logout-btn').addEventListener('click', () => {
    if (confirm('确定要退出登录吗？')) {
        localStorage.removeItem('adminAuthenticated');
        checkAuth();
        showNotification('已退出登录', 'info');
    }
});

// 页面加载时检查认证状态
window.addEventListener('DOMContentLoaded', checkAuth);
