// 管理员密钥（这里可以自定义，建议修改为复杂密码）
const ADMIN_KEY = "9712202273aA."; // 你可以修改这个密钥

// 检查是否已登录
function checkLogin() {
    const isLoggedIn = localStorage.getItem('telegram_bot_admin_logged_in') === 'true';
    if (isLoggedIn) {
        document.getElementById('login-page').classList.add('hidden');
        document.getElementById('admin-panel').classList.remove('hidden');
    } else {
        document.getElementById('login-page').classList.remove('hidden');
        document.getElementById('admin-panel').classList.add('hidden');
    }
}

// 登录功能
document.getElementById('login-btn').addEventListener('click', () => {
    const inputKey = document.getElementById('admin-key').value;
    const errorElement = document.getElementById('login-error');
    
    if (inputKey === ADMIN_KEY) {
        localStorage.setItem('telegram_bot_admin_logged_in', 'true');
        checkLogin();
        errorElement.classList.add('hidden');
        // 登录后加载数据
        loadAllData();
    } else {
        errorElement.classList.remove('hidden');
        setTimeout(() => {
            errorElement.classList.add('hidden');
        }, 3000);
    }
});

// 退出登录
document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('telegram_bot_admin_logged_in');
    checkLogin();
});

// 初始化检查登录状态
checkLogin();
