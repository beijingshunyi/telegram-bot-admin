// 全局数据存储
const DataStore = {
    users: [],
    teachers: [],
    keywords: [],
    bannedUsers: [],
    
    setUsers: (users) => {
        DataStore.users = users;
        document.getElementById('total-users').textContent = users.length;
    },
    
    setTeachers: (teachers) => {
        DataStore.teachers = teachers;
        document.getElementById('total-teachers').textContent = teachers.length;
    },
    
    setKeywords: (keywords) => {
        DataStore.keywords = keywords;
        document.getElementById('total-keywords').textContent = keywords.length;
    },
    
    setBannedUsers: (banned) => {
        DataStore.bannedUsers = banned;
        document.getElementById('total-banned').textContent = banned.length;
    },
    
    getUsers: () => DataStore.users,
    getTeachers: () => DataStore.teachers,
    getKeywords: () => DataStore.keywords,
    getBannedUsers: () => DataStore.bannedUsers
};

// 当前选中的Worker功能
let currentWorkerFunction = null;

// 页面导航
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // 移除所有活跃状态
        document.querySelectorAll('.nav-btn').forEach(b => {
            b.classList.remove('active', 'bg-blue-500', 'text-white');
            b.classList.add('bg-gray-200', 'text-gray-700');
        });
        
        // 设置当前按钮为活跃
        btn.classList.add('active', 'bg-blue-500', 'text-white');
        btn.classList.remove('bg-gray-200', 'text-gray-700');
        
        // 隐藏所有内容区域
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.add('hidden');
        });
        
        // 显示目标内容区域
        const target = btn.getAttribute('data-target');
        document.getElementById(target).classList.remove('hidden');
    });
});

// 显示通知
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    
    // 设置样式
    notification.classList.remove('bg-blue-500', 'bg-green-500', 'bg-red-500', 'text-white', 'p-4', 'translate-x-full');
    notification.classList.add('p-4', 'text-white', 'shadow-lg', 'rounded-lg');
    
    switch(type) {
        case 'success':
            notification.classList.add('bg-green-500');
            break;
        case 'error':
            notification.classList.add('bg-red-500');
            break;
        default:
            notification.classList.add('bg-blue-500');
    }
    
    // 显示通知
    notification.classList.remove('translate-x-full');
    notification.classList.add('translate-x-0');
    
    // 3秒后隐藏
    setTimeout(() => {
        notification.classList.remove('translate-x-0');
        notification.classList.add('translate-x-full');
    }, 3000);
}

// 更新当前时间
function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const dateString = now.toLocaleDateString();
    document.getElementById('current-time').textContent = `${dateString} ${timeString}`;
}

// 初始化时间显示并每秒更新
updateCurrentTime();
setInterval(updateCurrentTime, 1000);

// 关键词编辑模态框控制
document.getElementById('close-modal').addEventListener('click', () => {
    document.getElementById('edit-keyword-modal').classList.add('hidden');
});

document.getElementById('cancel-edit').addEventListener('click', () => {
    document.getElementById('edit-keyword-modal').classList.add('hidden');
});

// Worker功能参数模态框控制
document.getElementById('close-params-modal').addEventListener('click', () => {
    document.getElementById('worker-params-modal').classList.add('hidden');
});

document.getElementById('cancel-params').addEventListener('click', () => {
    document.getElementById('worker-params-modal').classList.add('hidden');
});

// 打开Worker功能参数模态框
document.querySelectorAll('.worker-function-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const functionName = btn.getAttribute('data-function');
        currentWorkerFunction = functionName;
        
        // 设置标题
        document.getElementById('params-modal-title').textContent = `执行: ${getFunctionDisplayName(functionName)}`;
        
        // 根据不同功能生成不同的参数表单
        const paramsContent = document.getElementById('params-content');
        paramsContent.innerHTML = generateFunctionParamsForm(functionName);
        
        // 显示模态框
        document.getElementById('worker-params-modal').classList.remove('hidden');
    });
});

// 确认执行Worker功能
document.getElementById('confirm-function').addEventListener('click', async () => {
    if (!currentWorkerFunction) return;
    
    // 收集参数
    const params = collectFunctionParams(currentWorkerFunction);
    
    // 显示加载状态
    document.getElementById('function-result').classList.remove('hidden');
    document.getElementById('result-content').textContent = '正在执行...';
    
    // 执行功能
    const result = await API.executeWorkerFunction(currentWorkerFunction, params);
    
    // 显示结果
    document.getElementById('result-content').textContent = JSON.stringify(result, null, 2);
    
    // 隐藏参数模态框
    document.getElementById('worker-params-modal').classList.add('hidden');
    
    // 如果成功，刷新数据
    if (result.success) {
        showNotification(`功能 ${getFunctionDisplayName(currentWorkerFunction)} 执行成功`, 'success');
        loadAllData();
    } else {
        showNotification(`功能执行失败: ${result.error || '未知错误'}`, 'error');
    }
});

// 获取功能显示名称
function getFunctionDisplayName(functionName) {
    const names = {
        'broadcastMessage': '发送广播消息',
        'exportUserData': '导出用户数据',
        'cleanupOldData': '清理旧数据',
        'syncDatabase': '同步数据库'
    };
    return names[functionName] || functionName;
}

// 生成功能参数表单
function generateFunctionParamsForm(functionName) {
    switch(functionName) {
        case 'broadcastMessage':
            return `
                <div class="mb-4">
                    <label for="message-content" class="block text-sm font-medium text-gray-700 mb-1">消息内容</label>
                    <textarea id="message-content" rows="3" 
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                        placeholder="输入要广播的消息内容" required></textarea>
                </div>
            `;
        case 'cleanupOldData':
            return `
                <div class="mb-4">
                    <label for="days-to-keep" class="block text-sm font-medium text-gray-700 mb-1">保留天数</label>
                    <input type="number" id="days-to-keep" value="30" min="1" max="365"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition">
                    <p class="text-xs text-gray-500 mt-1">将删除超过指定天数的历史数据</p>
                </div>
                <div class="flex items-center">
                    <input type="checkbox" id="confirm-cleanup" required
                        class="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded">
                    <label for="confirm-cleanup" class="ml-2 block text-sm text-gray-700">
                        确认删除旧数据
                    </label>
                </div>
            `;
        default:
            return `<p class="text-gray-600">此功能不需要参数，点击"执行功能"即可运行。</p>`;
    }
}

// 收集功能参数
function collectFunctionParams(functionName) {
    const params = {};
    
    switch(functionName) {
        case 'broadcastMessage':
            params.message = document.getElementById('message-content').value.trim();
            break;
        case 'cleanupOldData':
            params.daysToKeep = parseInt(document.getElementById('days-to-keep').value);
            break;
    }
    
    return params;
}

// 切换密码可见性
document.getElementById('toggle-key').addEventListener('click', () => {
    const input = document.getElementById('admin-key');
    const icon = document.querySelector('#toggle-key i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
});

// 刷新用户列表按钮
document.getElementById('refresh-users').addEventListener('click', () => {
    loadUsers();
    showNotification('正在刷新用户列表...', 'info');
});

// 搜索用户
document.getElementById('search-users').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    const filteredUsers = DataStore.getUsers().filter(user => {
        return user.id.toString().includes(searchTerm) || 
               (user.name && user.name.toLowerCase().includes(searchTerm));
    });
    renderUsersList(filteredUsers);
});

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', () => {
    // 添加淡入动画类
    document.body.classList.add('fade-in');
});
