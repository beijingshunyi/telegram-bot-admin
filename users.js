// 用户管理模块变量
let currentUserPage = 1;
const usersPageSize = 20;

// 加载用户列表
async function loadUsers(page = 1, search = '') {
    try {
        showLoading();
        
        const result = await API.User.getAll(page, usersPageSize, search);
        
        const tableBody = document.getElementById('users-table-body');
        tableBody.innerHTML = '';
        
        if (result.users.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                        没有找到用户数据
                    </td>
                </tr>
            `;
        } else {
            result.users.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">${user.user_id}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        ${user.display_name || user.username || `${user.first_name || ''} ${user.last_name || ''}`.trim() || '未知用户'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">${user.points || 0}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${user.last_sign_date || '-'}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <button class="text-blue-600 hover:text-blue-900 edit-user" data-id="${user.user_id}">
                            <i class="fa fa-pencil"></i> 编辑
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
            
            // 添加编辑事件监听
            document.querySelectorAll('.edit-user').forEach(btn => {
                btn.addEventListener('click', () => editUser(btn.dataset.id));
            });
        }
        
        // 更新分页信息
        document.getElementById('users-showing').textContent = result.users.length;
        document.getElementById('users-total').textContent = result.total;
        
        // 更新分页按钮状态
        const prevBtn = document.getElementById('users-prev');
        const nextBtn = document.getElementById('users-next');
        
        prevBtn.disabled = result.page <= 1;
        nextBtn.disabled = result.page >= result.totalPages;
        
        prevBtn.onclick = () => {
            if (result.page > 1) {
                currentUserPage = result.page - 1;
                loadUsers(currentUserPage, search);
            }
        };
        
        nextBtn.onclick = () => {
            if (result.page < result.totalPages) {
                currentUserPage = result.page + 1;
                loadUsers(currentUserPage, search);
            }
        };
        
        currentUserPage = result.page;
        
    } catch (error) {
        console.error('加载用户失败:', error);
        showNotification('加载用户失败: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// 编辑用户
async function editUser(userId) {
    try {
        showLoading();
        
        const user = await API.User.getById(userId);
        
        if (user) {
            document.getElementById('user-id').value = user.user_id;
            document.getElementById('user-name').value = user.display_name || user.username || '';
            document.getElementById('user-points').value = user.points || 0;
            document.getElementById('user-last-sign').value = user.last_sign_date || '';
            
            document.getElementById('user-modal-title').textContent = '编辑用户';
            document.getElementById('user-modal').classList.add('show');
        }
        
    } catch (error) {
        console.error('获取用户信息失败:', error);
        showNotification('获取用户信息失败: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// 保存用户
async function saveUser() {
    try {
        showLoading();
        
        const userId = document.getElementById('user-id').value;
        const name = document.getElementById('user-name').value;
        const points = parseInt(document.getElementById('user-points').value) || 0;
        const lastSign = document.getElementById('user-last-sign').value;
        
        const userData = {
            user_id: userId,
            display_name: name,
            points,
            last_sign_date: lastSign || null
        };
        
        await API.User.update(userData);
        
        // 关闭模态框
        document.getElementById('user-modal').classList.remove('show');
        
        // 重新加载用户列表
        loadUsers(currentUserPage, document.getElementById('user-search').value);
        
        showNotification('用户信息已更新', 'success');
        
    } catch (error) {
        console.error('保存用户失败:', error);
        showNotification('保存用户失败: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// 删除用户
async function deleteUser() {
    if (!confirm('确定要删除这个用户吗？此操作不可撤销！')) {
        return;
    }
    
    try {
        showLoading();
        
        const userId = document.getElementById('user-id').value;
        await API.User.delete(userId);
        
        // 关闭模态框
        document.getElementById('user-modal').classList.remove('show');
        
        // 重新加载用户列表
        loadUsers(currentUserPage, document.getElementById('user-search').value);
        
        showNotification('用户已删除', 'success');
        
    } catch (error) {
        console.error('删除用户失败:', error);
        showNotification('删除用户失败: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// 初始化用户管理事件
function initUserEvents() {
    // 搜索用户
    document.getElementById('user-search').addEventListener('input', (e) => {
        const searchTerm = e.target.value.trim();
        loadUsers(1, searchTerm);
    });
    
    // 保存用户
    document.getElementById('save-user-btn').addEventListener('click', saveUser);
    
    // 删除用户
    document.getElementById('delete-user-btn').addEventListener('click', deleteUser);
    
    // 关闭用户模态框
    document.getElementById('close-user-modal').addEventListener('click', () => {
        document.getElementById('user-modal').classList.remove('show');
    });
    
    // 点击模态框外部关闭
    document.getElementById('user-modal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('user-modal')) {
            document.getElementById('user-modal').classList.remove('show');
        }
    });
}

// 导出用户管理函数
window.Users = {
    load: loadUsers,
    initEvents: initUserEvents
};
