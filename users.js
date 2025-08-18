// 用户管理相关功能

// 确保只声明一次bannedUserIds
let bannedUserIds = [];

// 加载用户列表
async function loadUsers() {
    try {
        const response = await fetch('/api/users', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('获取用户列表失败');
        }
        
        const users = await response.json();
        displayUsers(users);
    } catch (error) {
        console.error('加载用户错误:', error);
        alert('无法加载用户列表');
    }
}

// 显示用户列表
function displayUsers(users) {
    const userListElement = document.getElementById('user-list');
    if (!userListElement) return;
    
    userListElement.innerHTML = '';
    
    users.forEach(user => {
        const isBanned = bannedUserIds.includes(user.id);
        const userElement = document.createElement('div');
        userElement.className = `user-item p-3 mb-2 border ${isBanned ? 'bg-red-100' : 'bg-gray-50'}`;
        
        userElement.innerHTML = `
            <h3>${user.username}</h3>
            <p>注册时间: ${new Date(user.registeredAt).toLocaleString()}</p>
            <button class="ban-button ${isBanned ? 'bg-green-500' : 'bg-red-500'} text-white px-2 py-1 rounded" 
                    onclick="${isBanned ? 'unbanUser' : 'banUser'}('${user.id}')">
                ${isBanned ? '解除封禁' : '封禁用户'}
            </button>
        `;
        
        userListElement.appendChild(userElement);
    });
}

// 封禁用户
async function banUser(userId) {
    try {
        const response = await fetch(`/api/users/${userId}/ban`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            bannedUserIds.push(userId);
            loadUsers(); // 重新加载用户列表
        } else {
            throw new Error('封禁用户失败');
        }
    } catch (error) {
        console.error('封禁用户错误:', error);
        alert('无法封禁用户');
    }
}

// 解除封禁
async function unbanUser(userId) {
    try {
        const response = await fetch(`/api/users/${userId}/unban`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            bannedUserIds = bannedUserIds.filter(id => id !== userId);
            loadUsers(); // 重新加载用户列表
        } else {
            throw new Error('解除封禁失败');
        }
    } catch (error) {
        console.error('解除封禁错误:', error);
        alert('无法解除封禁');
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 加载封禁用户ID列表
    fetch('/api/banned-users', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => response.json())
    .then(data => {
        bannedUserIds = data.ids || [];
        loadUsers();
    })
    .catch(error => {
        console.error('加载封禁用户列表错误:', error);
        loadUsers(); // 即使获取封禁列表失败，也尝试加载用户
    });
});
