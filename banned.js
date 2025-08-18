// 封禁用户管理
document.addEventListener('DOMContentLoaded', function() {
    // 初始化Supabase客户端
    const supabaseUrl = 'https://your-project-id.supabase.co';
    const supabaseKey = 'your-anon-key';
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    
    // 加载封禁用户列表
    loadBannedUsers();
    
    // 搜索功能
    document.getElementById('bannedUserSearch').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        filterBannedUsers(searchTerm);
    });
    
    // 解封用户
    document.getElementById('bannedUsersTable').addEventListener('click', function(e) {
        if (e.target.hasAttribute('data-unban-id')) {
            const userId = e.target.getAttribute('data-unban-id');
            unbanUser(userId);
        }
    });
});

// 加载封禁用户列表
async function loadBannedUsers() {
    showLoader('bannedUsersLoader');
    
    try {
        // 尝试从API获取封禁用户
        const response = await fetch('/api/banned-users');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const bannedUsers = await response.json();
        displayBannedUsers(bannedUsers);
    } catch (error) {
        console.error('加载封禁用户列表错误:', error);
        showError('bannedUsersError', '无法加载封禁用户列表，请稍后重试');
    } finally {
        hideLoader('bannedUsersLoader');
    }
}

// 显示封禁用户列表
function displayBannedUsers(users) {
    const tableBody = document.getElementById('bannedUsersTableBody');
    tableBody.innerHTML = '';
    
    if (users.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="px-6 py-4 text-center text-gray-500">
                    没有封禁的用户
                </td>
            </tr>
        `;
        return;
    }
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-200 hover:bg-gray-50 transition-colors';
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <img src="${user.avatar || 'https://picsum.photos/200'}" alt="${user.username}" class="w-8 h-8 rounded-full mr-3">
                    <span>${user.username}</span>
                </div>
            </td>
            <td class="px-6 py-4">${user.user_id}</td>
            <td class="px-6 py-4">${user.banned_at ? new Date(user.banned_at).toLocaleString() : 'N/A'}</td>
            <td class="px-6 py-4">
                <button data-unban-id="${user.user_id}" class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors">
                    解封
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// 过滤封禁用户
function filterBannedUsers(searchTerm) {
    const rows = document.querySelectorAll('#bannedUsersTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// 解封用户
async function unbanUser(userId) {
    if (!confirm('确定要解封这个用户吗？')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/unban-user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_id: userId })
        });
        
        if (!response.ok) {
            throw new Error('解封用户失败');
        }
        
        // 重新加载封禁用户列表
        loadBannedUsers();
        showToast('用户已成功解封');
    } catch (error) {
        console.error('解封用户错误:', error);
        showError('bannedUsersError', '解封用户失败，请稍后重试');
    }
}

// 显示加载动画
function showLoader(id) {
    document.getElementById(id).classList.remove('hidden');
}

// 隐藏加载动画
function hideLoader(id) {
    document.getElementById(id).classList.add('hidden');
}

// 显示错误信息
function showError(id, message) {
    const errorElement = document.getElementById(id);
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
    
    // 3秒后自动隐藏错误信息
    setTimeout(() => {
        errorElement.classList.add('hidden');
    }, 3000);
}

// 显示提示信息
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 slide-in';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // 2秒后自动消失
    setTimeout(() => {
        toast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}
    
