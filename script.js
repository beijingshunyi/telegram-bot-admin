    // 全局变量
    let currentEditId = null;
    let currentDeleteInfo = null; // 存储当前要删除的信息 {type: 'user|teacher|keyword|banned', id: xxx}
    
    // DOM元素
    const userModal = new bootstrap.Modal(document.getElementById('user-modal'));
    const teacherModal = new bootstrap.Modal(document.getElementById('teacher-modal'));
    const keywordModal = new bootstrap.Modal(document.getElementById('keyword-modal'));
    const bannedModal = new bootstrap.Modal(document.getElementById('banned-modal'));
    const pointsModal = new bootstrap.Modal(document.getElementById('points-modal'));
    const confirmDeleteModal = new bootstrap.Modal(document.getElementById('confirm-delete-modal'));
    
    // 初始化函数
    document.addEventListener('DOMContentLoaded', function() {
        // 加载所有数据
        loadAllData();
        
        // 绑定事件处理程序
        bindEventHandlers();
    });
    
    // 绑定所有事件处理程序
    function bindEventHandlers() {
        // 移动端侧边栏切换
        document.getElementById('menu-toggle').addEventListener('click', toggleMobileSidebar);
        document.getElementById('mobile-sidebar').addEventListener('click', function(e) {
            if (e.target === this) {
                closeMobileSidebar();
            }
        });
        
        // 刷新数据按钮
        document.getElementById('refresh-data').addEventListener('click', refreshAllData);
        
        // 添加按钮点击事件
        document.getElementById('add-user-btn').addEventListener('click', openAddUserModal);
        document.getElementById('add-teacher-btn').addEventListener('click', openAddTeacherModal);
        document.getElementById('add-keyword-btn').addEventListener('click', openAddKeywordModal);
        document.getElementById('add-banned-btn').addEventListener('click', openAddBannedModal);
        
        // 表单提交事件
        document.getElementById('user-form').addEventListener('submit', handleUserFormSubmit);
        document.getElementById('teacher-form').addEventListener('submit', handleTeacherFormSubmit);
        document.getElementById('keyword-form').addEventListener('submit', handleKeywordFormSubmit);
        document.getElementById('banned-form').addEventListener('submit', handleBannedFormSubmit);
        document.getElementById('points-form').addEventListener('submit', handlePointsFormSubmit);
        
        // 确认删除按钮
        document.getElementById('confirm-delete-btn').addEventListener('click', confirmDelete);
    }
    
    // 加载所有数据
    function loadAllData() {
        showLoader();
        
        // 并行加载所有数据
        Promise.all([
            fetchUsersData(),
            fetchTeachersData(),
            fetchKeywordsData(),
            fetchBannedKeywordsData()
        ]).then(() => {
            hideLoader();
            showDataLoadedAlert();
        }).catch(error => {
            hideLoader();
            showAlert('数据加载失败: ' + error.message, 'danger');
            console.error('数据加载错误:', error);
        });
    }
    
    // 刷新所有数据
    function refreshAllData() {
        loadAllData();
    }
    
    // 从API获取用户数据
    function fetchUsersData() {
        return fetch(config.apiUrl + '/users')
            .then(response => {
                if (!response.ok) {
                    throw new Error('获取用户数据失败');
                }
                return response.json();
            })
            .then(users => {
                renderUsersData(users);
            });
    }
    
    // 渲染用户数据
    function renderUsersData(users) {
        const container = document.getElementById('users-container');
        container.innerHTML = '';
        
        if (!users || users.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-3 text-muted">暂无用户数据</td>
                </tr>
            `;
            return;
        }
        
        users.forEach(user => {
            const row = document.createElement('tr');
            row.className = 'fade-in';
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.username || '-'}</td>
                <td>${user.display_name || '-'}</td>
                <td>${user.last_name}${user.first_name}</td>
                <td>${user.points}</td>
                <td>${user.last_checkin || '-'}</td>
                <td>
                    <div class="flex space-x-1">
                        <button class="btn-action btn-edit edit-user" data-id="${user.id}" title="编辑">
                            <i class="fa fa-pencil"></i>
                        </button>
                        <button class="btn-action btn-points adjust-points" data-id="${user.id}" data-name="${user.last_name}${user.first_name}" data-points="${user.points}" title="调整积分">
                            <i class="fa fa-credit-card"></i>
                        </button>
                        <button class="btn-action btn-delete delete-item" data-type="user" data-id="${user.id}" title="删除">
                            <i class="fa fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            container.appendChild(row);
        });
        
        // 绑定用户相关按钮事件
        document.querySelectorAll('.edit-user').forEach(btn => {
            btn.addEventListener('click', function() {
                const userId = this.getAttribute('data-id');
                openEditUserModal(userId);
            });
        });
        
        document.querySelectorAll('.adjust-points').forEach(btn => {
            btn.addEventListener('click', function() {
                const userId = this.getAttribute('data-id');
                const userName = this.getAttribute('data-name');
                const userPoints = this.getAttribute('data-points');
                openPointsModal(userId, userName, userPoints);
            });
        });
        
        document.querySelectorAll('.delete-item[data-type="user"]').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                currentDeleteInfo = { type: 'user', id: id };
                confirmDeleteModal.show();
            });
        });
    }
    
    // 从API获取老师数据
    function fetchTeachersData() {
        return fetch(config.apiUrl + '/teachers')
            .then(response => {
                if (!response.ok) {
                    throw new Error('获取老师数据失败');
                }
                return response.json();
            })
            .then(teachers => {
                renderTeachersData(teachers);
            });
    }
    
    // 渲染老师数据
    function renderTeachersData(teachers) {
        const container = document.getElementById('teachers-container');
        container.innerHTML = '';
        
        if (!teachers || teachers.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-3 text-muted">暂无老师数据</td>
                </tr>
            `;
            return;
        }
        
        teachers.forEach(teacher => {
            let statusClass = '';
            let statusText = '';
            
            switch(teacher.status) {
                case 'approved':
                    statusClass = 'text-green-600 bg-green-100';
                    statusText = '已认证';
                    break;
                case 'pending':
                    statusClass = 'text-yellow-600 bg-yellow-100';
                    statusText = '待审核';
                    break;
                case 'rejected':
                    statusClass = 'text-red-600 bg-red-100';
                    statusText = '已拒绝';
                    break;
            }
            
            const row = document.createElement('tr');
            row.className = 'fade-in';
            row.innerHTML = `
                <td>${teacher.id}</td>
                <td>${teacher.nickname}</td>
                <td>${teacher.age}</td>
                <td>${teacher.region}</td>
                <td>${teacher.service_type}</td>
                <td>${teacher.price}</td>
                <td><span class="px-2 py-1 rounded-full text-xs ${statusClass}">${statusText}</span></td>
                <td>
                    <div class="flex space-x-1">
                        <button class="btn-action btn-edit edit-teacher" data-id="${teacher.id}" title="编辑">
                            <i class="fa fa-pencil"></i>
                        </button>
                        <button class="btn-action btn-delete delete-item" data-type="teacher" data-id="${teacher.id}" title="删除">
                            <i class="fa fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            container.appendChild(row);
        });
        
        // 绑定老师相关按钮事件
        document.querySelectorAll('.edit-teacher').forEach(btn => {
            btn.addEventListener('click', function() {
                const teacherId = this.getAttribute('data-id');
                openEditTeacherModal(teacherId);
            });
        });
        
        document.querySelectorAll('.delete-item[data-type="teacher"]').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                currentDeleteInfo = { type: 'teacher', id: id };
                confirmDeleteModal.show();
            });
        });
    }
    
    // 从API获取关键词数据
    function fetchKeywordsData() {
        return fetch(config.apiUrl + '/keywords')
            .then(response => {
                if (!response.ok) {
                    throw new Error('获取关键词数据失败');
                }
                return response.json();
            })
            .then(keywords => {
                renderKeywordsData(keywords);
            });
    }
    
    // 渲染关键词数据
    function renderKeywordsData(keywords) {
        const container = document.getElementById('keywords-container');
        container.innerHTML = '';
        
        if (!keywords || keywords.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center py-3 text-muted">暂无关键词数据</td>
                </tr>
            `;
            return;
        }
        
        keywords.forEach(keyword => {
            const statusClass = keyword.is_active ? 'text-green-600' : 'text-gray-400';
            const statusText = keyword.is_active ? '启用' : '禁用';
            
            const row = document.createElement('tr');
            row.className = 'fade-in';
            row.innerHTML = `
                <td>${keyword.keyword}</td>
                <td>${keyword.response.substring(0, 30)}${keyword.response.length > 30 ? '...' : ''}</td>
                <td><span class="px-2 py-1 rounded-full text-xs ${statusClass}">${statusText}</span></td>
                <td>
                    <div class="flex space-x-1">
                        <button class="btn-action btn-edit edit-keyword" data-id="${keyword.id}" title="编辑">
                            <i class="fa fa-pencil"></i>
                        </button>
                        <button class="btn-action btn-delete delete-item" data-type="keyword" data-id="${keyword.id}" title="删除">
                            <i class="fa fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            container.appendChild(row);
        });
        
        // 绑定关键词相关按钮事件
        document.querySelectorAll('.edit-keyword').forEach(btn => {
            btn.addEventListener('click', function() {
                const keywordId = this.getAttribute('data-id');
                openEditKeywordModal(keywordId);
            });
        });
        
        document.querySelectorAll('.delete-item[data-type="keyword"]').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                currentDeleteInfo = { type: 'keyword', id: id };
                confirmDeleteModal.show();
            });
        });
    }
    
    // 从API获取禁言词数据
    function fetchBannedKeywordsData() {
        return fetch(config.apiUrl + '/banned-words')
            .then(response => {
                if (!response.ok) {
                    throw new Error('获取禁言词数据失败');
                }
                return response.json();
            })
            .then(bannedKeywords => {
                renderBannedKeywordsData(bannedKeywords);
            });
    }
    
    // 渲染禁言词数据
    function renderBannedKeywordsData(bannedKeywords) {
        const container = document.getElementById('banned-keywords-container');
        container.innerHTML = '';
        
        if (!bannedKeywords || bannedKeywords.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="2" class="text-center py-3 text-muted">暂无禁言词数据</td>
                </tr>
            `;
            return;
        }
        
        bannedKeywords.forEach(keyword => {
            const row = document.createElement('tr');
            row.className = 'fade-in';
            row.innerHTML = `
                <td>${keyword.text}</td>
                <td>
                    <div class="flex space-x-1">
                        <button class="btn-action btn-edit edit-banned" data-id="${keyword.id}" data-text="${keyword.text}" title="编辑">
                            <i class="fa fa-pencil"></i>
                        </button>
                        <button class="btn-action btn-delete delete-item" data-type="banned" data-id="${keyword.id}" title="删除">
                            <i class="fa fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            container.appendChild(row);
        });
        
        // 绑定禁言词相关按钮事件
        document.querySelectorAll('.edit-banned').forEach(btn => {
            btn.addEventListener('click', function() {
                const bannedId = this.getAttribute('data-id');
                const bannedText = this.getAttribute('data-text');
                openEditBannedModal(bannedId, bannedText);
            });
        });
        
        document.querySelectorAll('.delete-item[data-type="banned"]').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                currentDeleteInfo = { type: 'banned', id: id };
                confirmDeleteModal.show();
            });
        });
    }
    
    // 打开添加用户模态框
    function openAddUserModal() {
        document.getElementById('user-modal-title').textContent = '添加用户';
        document.getElementById('user-form').reset();
        userModal.show();
    }
    
    // 打开编辑用户模态框
    function openEditUserModal(userId) {
        // 从API获取单个用户数据
        fetch(config.apiUrl + '/users/' + userId)
            .then(response => {
                if (!response.ok) {
                    throw new Error('获取用户数据失败');
                }
                return response.json();
            })
            .then(user => {
                document.getElementById('user-modal-title').textContent = '编辑用户';
                document.getElementById('user_id').value = user.id;
                document.getElementById('username').value = user.username;
                document.getElementById('display_name').value = user.display_name;
                document.getElementById('first_name').value = user.first_name;
                document.getElementById('last_name').value = user.last_name;
                document.getElementById('points').value = user.points;
                
                currentEditId = userId;
                userModal.show();
            })
            .catch(error => {
                showAlert('加载用户数据失败: ' + error.message, 'danger');
            });
    }
    
    // 处理用户表单提交
    function handleUserFormSubmit(e) {
        e.preventDefault();
        
        const userData = {
            id: document.getElementById('user_id').value,
            username: document.getElementById('username').value,
            display_name: document.getElementById('display_name').value,
            first_name: document.getElementById('first_name').value,
            last_name: document.getElementById('last_name').value,
            points: document.getElementById('points').value
        };
        
        let url = config.apiUrl + '/users';
        let method = 'POST';
        
        // 如果是编辑模式
        if (currentEditId) {
            url = config.apiUrl + '/users/' + currentEditId;
            method = 'PUT';
        }
        
        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('保存用户数据失败');
            }
            return response.json();
        })
        .then(data => {
            userModal.hide();
            fetchUsersData();
            showAlert(currentEditId ? '用户编辑成功' : '用户添加成功', 'success');
            currentEditId = null;
        })
        .catch(error => {
            showAlert('操作失败: ' + error.message, 'danger');
        });
    }
    
    // 其他模态框和表单处理函数...
    // (老师、关键词、禁言词的处理逻辑类似，都需要修改为实际API调用)
    
    // 显示加载指示器
    function showLoader() {
        document.getElementById('data-loader').classList.remove('hidden');
    }
    
    // 隐藏加载指示器
    function hideLoader() {
        document.getElementById('data-loader').classList.add('hidden');
    }
    
    // 显示数据加载完成提示
    function showDataLoadedAlert() {
        const alert = document.getElementById('data-loaded-alert');
        alert.classList.remove('hidden');
        
        // 3秒后自动隐藏
        setTimeout(() => {
            alert.classList.add('hidden');
        }, 3000);
    }
    
    // 显示提示信息
    function showAlert(message, type = 'info') {
        // 创建临时提示元素
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} fixed top-20 right-5 z-50 fade-in`;
        alert.role = 'alert';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        document.body.appendChild(alert);
        
        // 3秒后自动移除
        setTimeout(() => {
            alert.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(alert);
            }, 500);
        }, 3000);
        
        // 点击关闭按钮移除
        alert.querySelector('.btn-close').addEventListener('click', () => {
            document.body.removeChild(alert);
        });
    }
    
    // 移动端侧边栏相关函数...
    function toggleMobileSidebar() {
        const sidebar = document.getElementById('mobile-sidebar');
        const panel = document.getElementById('sidebar-panel');
        
        sidebar.classList.toggle('hidden');
        setTimeout(() => {
            panel.classList.toggle('-translate-x-full');
        }, 10);
    }
    
    function closeMobileSidebar() {
        const sidebar = document.getElementById('mobile-sidebar');
        const panel = document.getElementById('sidebar-panel');
        
        panel.classList.add('-translate-x-full');
        setTimeout(() => {
            sidebar.classList.add('hidden');
        }, 300);
    }
    
