// 主功能脚本
document.addEventListener('DOMContentLoaded', function() {
    // 初始化
    init();
    
    // 设置最后更新时间
    document.getElementById('last-update-time').textContent = new Date().toLocaleString();
    
    // 菜单切换功能
    const menuItems = document.querySelectorAll('.menu-item');
    const contentSections = document.querySelectorAll('.content-section');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-section');
            
            // 更新活动菜单项
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // 显示对应内容区域
            contentSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection) {
                    section.classList.add('active');
                }
            });
        });
    });
    
    // 绑定按钮事件
    document.getElementById('refresh-btn').addEventListener('click', refreshDashboard);
    document.getElementById('send-teacher-btn').addEventListener('click', triggerSendTeacher);
    document.getElementById('test-db-btn').addEventListener('click', testDatabase);
    document.getElementById('test-worker-btn').addEventListener('click', testWorker);
    document.getElementById('trigger-teacher-btn').addEventListener('click', triggerSendTeacher);
    document.getElementById('test-db-connection-btn').addEventListener('click', testDatabase);
    document.getElementById('batch-points-btn').addEventListener('click', batchAdjustPoints);
    document.getElementById('clear-cache-btn').addEventListener('click', clearCache);
    document.getElementById('refresh-logs-btn').addEventListener('click', refreshLogs);
    document.getElementById('clear-logs-btn').addEventListener('click', clearLogs);
    
    // 用户管理按钮
    document.getElementById('adjust-points-btn').addEventListener('click', showAdjustPointsModal);
    document.getElementById('add-teacher-btn').addEventListener('click', showAddTeacherModal);
    document.getElementById('add-keyword-btn').addEventListener('click', showAddKeywordModal);
    document.getElementById('add-banned-btn').addEventListener('click', showAddBannedModal);
    
    // 搜索功能
    document.getElementById('user-search').addEventListener('input', filterUsers);
    document.getElementById('keyword-search').addEventListener('input', filterKeywords);
    document.getElementById('banned-search').addEventListener('input', filterBanned);
    document.getElementById('teacher-filter').addEventListener('change', filterTeachers);
    
    // 日志级别筛选
    document.getElementById('log-level').addEventListener('change', filterLogs);
});

// 初始化函数
function init() {
    // 检查数据库连接
    checkDatabaseConnection();
    
    // 检查Worker连接
    checkWorkerConnection();
    
    // 加载仪表盘数据
    refreshDashboard();
    
    // 加载用户数据
    loadUsers();
    
    // 加载老师数据
    loadTeachers();
    
    // 加载关键词数据
    loadKeywords();
    
    // 加载禁言词数据
    loadBannedKeywords();
    
    // 加载日志
    refreshLogs();
}

// 检查数据库连接状态
function checkDatabaseConnection() {
    testDatabaseConnection()
        .then(result => {
            const statusEl = document.getElementById('db-status');
            if (result.status === 'success') {
                statusEl.textContent = '连接正常';
                statusEl.style.color = 'var(--success-color)';
            } else {
                statusEl.textContent = '连接失败';
                statusEl.style.color = 'var(--danger-color)';
            }
        })
        .catch(error => {
            document.getElementById('db-status').textContent = '连接失败';
            document.getElementById('db-status').style.color = 'var(--danger-color)';
            logError(`数据库连接检查失败: ${error.message}`);
        });
}

// 检查Worker连接状态
function checkWorkerConnection() {
    testWorkerConnection()
        .then(result => {
            const statusEl = document.getElementById('worker-status');
            if (result.status === 'success') {
                statusEl.textContent = '运行正常';
                statusEl.style.color = 'var(--success-color)';
            } else {
                statusEl.textContent = '连接失败';
                statusEl.style.color = 'var(--danger-color)';
            }
        })
        .catch(error => {
            document.getElementById('worker-status').textContent = '连接失败';
            document.getElementById('worker-status').style.color = 'var(--danger-color)';
            logError(`Worker连接检查失败: ${error.message}`);
        });
}

// 刷新仪表盘数据
function refreshDashboard() {
    fetchUsers().then(users => {
        document.getElementById('total-users').textContent = users.length;
    });
    
    fetchTeachers().then(teachers => {
        document.getElementById('total-teachers').textContent = teachers.length;
    });
    
    fetchKeywords().then(keywords => {
        document.getElementById('total-keywords').textContent = keywords.length;
    });
    
    fetchBannedKeywords().then(banned => {
        document.getElementById('total-banned').textContent = banned.length;
    });
    
    logInfo('仪表盘数据已刷新');
}

// 加载用户数据
function loadUsers() {
    fetchUsers()
        .then(users => {
            const tbody = document.querySelector('#users-table tbody');
            tbody.innerHTML = '';
            
            users.forEach(user => {
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>${user.user_id}</td>
                    <td>${user.display_name || user.username || user.first_name || '未设置'}</td>
                    <td>${user.points || 0}</td>
                    <td>${user.last_sign_date || '从未签到'}</td>
                    <td class="table-actions">
                        <div class="btn-icon btn-edit" title="编辑" onclick="showEditUserModal(${user.user_id})">
                            <i class="fas fa-edit"></i>
                        </div>
                        <div class="btn-icon btn-delete" title="删除" onclick="deleteUser(${user.user_id})">
                            <i class="fas fa-trash"></i>
                        </div>
                    </td>
                `;
                
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            logError(`加载用户数据失败: ${error.message}`);
        });
}

// 加载老师数据
function loadTeachers() {
    fetchTeachers()
        .then(teachers => {
            const tbody = document.querySelector('#teachers-table tbody');
            tbody.innerHTML = '';
            
            teachers.forEach(teacher => {
                const statusClass = teacher.status === 'approved' ? 'success' : 
                                  teacher.status === 'pending' ? 'warning' : 'danger';
                const statusText = teacher.status === 'approved' ? '已批准' : 
                                  teacher.status === 'pending' ? '待审核' : '已拒绝';
                
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>${teacher.nickname}</td>
                    <td>${teacher.age}</td>
                    <td>${teacher.region}</td>
                    <td><span class="status-indicator ${statusClass}">${statusText}</span></td>
                    <td class="table-actions">
                        <div class="btn-icon btn-edit" title="编辑" onclick="showEditTeacherModal(${teacher.id})">
                            <i class="fas fa-edit"></i>
                        </div>
                        <div class="btn-icon btn-delete" title="删除" onclick="deleteTeacher(${teacher.id})">
                            <i class="fas fa-trash"></i>
                        </div>
                        <div class="btn-icon btn-toggle" title="切换状态" onclick="toggleTeacherStatus(${teacher.id}, '${teacher.status}')">
                            <i class="fas fa-sync"></i>
                        </div>
                    </td>
                `;
                
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            logError(`加载老师数据失败: ${error.message}`);
        });
}

// 加载关键词数据
function loadKeywords() {
    fetchKeywords()
        .then(keywords => {
            const tbody = document.querySelector('#keywords-table tbody');
            tbody.innerHTML = '';
            
            keywords.forEach(keyword => {
                const statusClass = keyword.is_active ? 'success' : 'danger';
                const statusText = keyword.is_active ? '启用' : '禁用';
                
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>${keyword.keyword}</td>
                    <td>${keyword.response.substring(0, 50)}${keyword.response.length > 50 ? '...' : ''}</td>
                    <td><span class="status-indicator ${statusClass}">${statusText}</span></td>
                    <td class="table-actions">
                        <div class="btn-icon btn-edit" title="编辑" onclick="showEditKeywordModal(${keyword.id})">
                            <i class="fas fa-edit"></i>
                        </div>
                        <div class="btn-icon btn-delete" title="删除" onclick="deleteKeyword(${keyword.id})">
                            <i class="fas fa-trash"></i>
                        </div>
                        <div class="btn-icon btn-toggle" title="切换状态" onclick="toggleKeywordStatus(${keyword.id}, ${keyword.is_active})">
                            <i class="fas fa-power-off"></i>
                        </div>
                    </td>
                `;
                
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            logError(`加载关键词数据失败: ${error.message}`);
        });
}

// 加载禁言词数据
function loadBannedKeywords() {
    fetchBannedKeywords()
        .then(banned => {
            const tbody = document.querySelector('#banned-table tbody');
            tbody.innerHTML = '';
            
            banned.forEach(item => {
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>${item.keyword}</td>
                    <td class="table-actions">
                        <div class="btn-icon btn-edit" title="编辑" onclick="showEditBannedModal(${item.id})">
                            <i class="fas fa-edit"></i>
                        </div>
                        <div class="btn-icon btn-delete" title="删除" onclick="deleteBannedKeyword(${item.id})">
                            <i class="fas fa-trash"></i>
                        </div>
                    </td>
                `;
                
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            logError(`加载禁言词数据失败: ${error.message}`);
        });
}

// 显示调整积分模态框
function showAdjustPointsModal() {
    const modalContent = `
        <div class="modal active" id="adjust-points-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>调整用户积分</h3>
                    <button class="modal-close" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="adjust-user-id">用户ID:</label>
                        <input type="number" id="adjust-user-id" placeholder="输入用户ID">
                    </div>
                    <div class="form-group">
                        <label for="adjust-points">积分变化:</label>
                        <input type="number" id="adjust-points" placeholder="正数增加，负数减少">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="action-btn" onclick="closeModal()">取消</button>
                    <button class="action-btn primary" onclick="adjustUserPoints()">确认调整</button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modal-container').innerHTML = modalContent;
}

// 显示添加老师模态框
function showAddTeacherModal() {
    const modalContent = `
        <div class="modal active" id="add-teacher-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>添加新老师</h3>
                    <button class="modal-close" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="teacher-nickname">花名:</label>
                        <input type="text" id="teacher-nickname" placeholder="输入花名">
                    </div>
                    <div class="form-group">
                        <label for="teacher-age">年龄:</label>
                        <input type="number" id="teacher-age" placeholder="输入年龄">
                    </div>
                    <div class="form-group">
                        <label for="teacher-region">地区:</label>
                        <input type="text" id="teacher-region" placeholder="输入地区">
                    </div>
                    <div class="form-group">
                        <label for="teacher-account">Telegram账号:</label>
                        <input type="text" id="teacher-account" placeholder="输入Telegram账号">
                    </div>
                    <div class="form-group">
                        <label for="teacher-channel">频道链接:</label>
                        <input type="text" id="teacher-channel" placeholder="输入频道链接">
                    </div>
                    <div class="form-group">
                        <label for="teacher-service">服务类型:</label>
                        <input type="text" id="teacher-service" placeholder="输入服务类型">
                    </div>
                    <div class="form-group">
                        <label for="teacher-cost">修车费:</label>
                        <input type="text" id="teacher-cost" placeholder="输入修车费">
                    </div>
                    <div class="form-group">
                        <label for="teacher-intro">自我介绍:</label>
                        <textarea id="teacher-intro" rows="3" placeholder="输入自我介绍"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="action-btn" onclick="closeModal()">取消</button>
                    <button class="action-btn primary" onclick="addTeacher()">添加老师</button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modal-container').innerHTML = modalContent;
}

// 日志记录函数
function logInfo(message) {
    addLog(message, 'info');
}

function logWarning(message) {
    addLog(message, 'warning');
}

function logError(message) {
    addLog(message, 'error');
}

function addLog(message, level) {
    const logsList = document.getElementById('logs-list');
    const logItem = document.createElement('li');
    logItem.className = `log-item log-${level}`;
    
    const icon = level === 'info' ? 'fa-info-circle' : 
                level === 'warning' ? 'fa-exclamation-triangle' : 'fa-exclamation-circle';
    
    logItem.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${new Date().toLocaleString()} - ${message}</span>
    `;
    
    logsList.appendChild(logItem);
    logsList.scrollTop = logsList.scrollHeight;
}

// 其他函数将在后续文件中实现...
