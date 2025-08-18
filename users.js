// 用户管理功能
document.addEventListener('DOMContentLoaded', function() {
    // 初始化Supabase客户端
    const supabaseUrl = 'https://your-project-id.supabase.co';
    const supabaseKey = 'your-anon-key';
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    
    // 加载用户列表
    loadUsers();
    
    // 搜索功能
    document.getElementById('userSearch').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        filterUsers(searchTerm);
    });
    
    // 封禁用户
    document.getElementById('usersTable').addEventListener('click', function(e) {
        if (e.target.hasAttribute('data-ban-id')) {
            const userId = e.target.getAttribute('data-ban-id');
            const username = e.target.getAttribute('data-username');
            banUser(userId, username);
        }
    });
});

// 加载用户列表
async function loadUsers() {
    showLoader('usersLoader');
    
    try {
        // 尝试从API获取用户
        const response = await fetch('/api/users');
        
        if (!response.ok) {
            // 如果API失败，尝试直接从Supabase获取
            console.log('API请求失败，尝试直接从Supabase获取用户');
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });
                
            if (error) throw error;
            if (data) {
                displayUsers(data);
                return;
            }
        }
        
        const users = await response.json();
        displayUsers(users);
    } catch (error) {
        console.error('加载用户错误:', error);
        showError('usersError', '无法加载用户列表，请稍后重试');
    } finally {
        hideLoader('usersLoader');
    }
}

// 显示用户列表
function displayUsers(users) {
    const tableBody = document.getElementById('usersTableBody');
    tableBody.innerHTML = '';
    
    if (!users || users.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                    没有找到用户
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
            <td class="px-6 py-4">${user.first_name || '-'}</td>
            <td class="px-6 py-4">${user.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}</td>
            <td class="px-6 py-4">
                <button data-ban-id="${user.user_id}" data-username="${user.username}" 
                    class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors">
                    封禁
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// 过滤用户
function filterUsers(searchTerm) {
    const rows = document.querySelectorAll('#usersTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// 封禁用户
async function banUser(userId, username) {
    if (!confirm(`确定要封禁用户 ${username} 吗？`)) {
        return;
    }
    
    try {
        // 尝试通过API封禁用户
        const response = await fetch(`/api/ban-user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_id: userId })
        });
        
        if (!response.ok) {
            // 如果API失败，尝试直接通过Supabase封禁
            console.log('API请求失败，尝试直接通过Supabase封禁用户');
            const { error } = await supabase
                .from('banned_users')
                .insert([
                    { user_id: userId, banned_at: new Date().toISOString() }
                ]);
                
            if (error) throw error;
        }
        
        // 重新加载用户列表和封禁用户列表
        loadUsers();
        if (window.loadBannedUsers) window.loadBannedUsers();
        showToast(`用户 ${username} 已被封禁`);
    } catch (error) {
        console.error('封禁用户错误:', error);
        showError('usersError', '封禁用户失败，请稍后重试');
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
    
