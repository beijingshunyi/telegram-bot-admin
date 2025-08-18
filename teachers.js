// 老师管理模块变量
let currentTeacherPage = 1;
const teachersPageSize = 20;

// 加载老师列表
async function loadTeachers(page = 1, search = '') {
    try {
        showLoading();
        
        const result = await API.Teacher.getAll(page, teachersPageSize, search);
        
        const tableBody = document.getElementById('teachers-table-body');
        tableBody.innerHTML = '';
        
        if (result.teachers.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                        没有找到老师数据
                    </td>
                </tr>
            `;
        } else {
            result.teachers.forEach(teacher => {
                let statusClass = '';
                let statusText = '';
                
                switch (teacher.status) {
                    case 'approved':
                        statusClass = 'bg-green-100 text-green-800';
                        statusText = '已通过';
                        break;
                    case 'rejected':
                        statusClass = 'bg-red-100 text-red-800';
                        statusText = '已拒绝';
                        break;
                    default:
                        statusClass = 'bg-yellow-100 text-yellow-800';
                        statusText = '待审核';
                }
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">${teacher.id}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${teacher.nickname}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${teacher.age || '未知'}/${teacher.region || '未知'}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${teacher.service_type || '-'}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                            ${statusText}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <button class="text-blue-600 hover:text-blue-900 edit-teacher" data-id="${teacher.id}">
                            <i class="fa fa-pencil"></i> 编辑
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
            
            // 添加编辑事件监听
            document.querySelectorAll('.edit-teacher').forEach(btn => {
                btn.addEventListener('click', () => editTeacher(btn.dataset.id));
            });
        }
        
        // 更新分页信息
        document.getElementById('teachers-showing').textContent = result.teachers.length;
        document.getElementById('teachers-total').textContent = result.total;
        
        // 更新分页按钮状态
        const prevBtn = document.getElementById('teachers-prev');
        const nextBtn = document.getElementById('teachers-next');
        
        prevBtn.disabled = result.page <= 1;
        nextBtn.disabled = result.page >= result.totalPages;
        
        prevBtn.onclick = () => {
            if (result.page > 1) {
                currentTeacherPage = result.page - 1;
                loadTeachers(currentTeacherPage, search);
            }
        };
        
        nextBtn.onclick = () => {
            if (result.page < result.totalPages) {
                currentTeacherPage = result.page + 1;
                loadTeachers(currentTeacherPage, search);
            }
        };
        
        currentTeacherPage = result.page;
        
    } catch (error) {
        console.error('加载老师失败:', error);
        showNotification('加载老师失败: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// 编辑老师
async function editTeacher(teacherId) {
    try {
        showLoading();
        
        // 重置表单
        resetTeacherForm();
        
        if (teacherId) {
            // 编辑现有老师
            const teacher = await API.Teacher.getById(teacherId);
            
            if (teacher) {
                document.getElementById('teacher-id').value = teacher.id;
                document.getElementById('teacher-nickname').value = teacher.nickname || '';
                document.getElementById('teacher-age').value = teacher.age || '';
                document.getElementById('teacher-region').value = teacher.region || '';
                document.getElementById('teacher-telegram').value = teacher.telegram_account || '';
                document.getElementById('teacher-channel').value = teacher.channel || '';
                document.getElementById('teacher-service').value = teacher.service_type || '';
                document.getElementById('teacher-cost').value = teacher.repair_cost || '';
                document.getElementById('teacher-intro').value = teacher.intro || '';
                document.getElementById('teacher-photo-1').value = teacher.photo_url_1 || '';
                document.getElementById('teacher-photo-2').value = teacher.photo_url_2 || '';
                document.getElementById('teacher-photo-3').value = teacher.photo_url_3 || '';
                document.getElementById('teacher-video').value = teacher.video_url || '';
                document.getElementById('teacher-status').value = teacher.status || 'pending';
                
                // 显示图片预览
                previewTeacherImage(1, teacher.photo_url_1);
                previewTeacherImage(2, teacher.photo_url_2);
                previewTeacherImage(3, teacher.photo_url_3);
                
                document.getElementById('teacher-modal-title').textContent = '编辑老师';
            }
        } else {
            // 添加新老师
            document.getElementById('teacher-modal-title').textContent = '添加老师';
        }
        
        document.getElementById('teacher-modal').classList.add('show');
        
    } catch (error) {
        console.error('获取老师信息失败:', error);
        showNotification('获取老师信息失败: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// 预览老师图片
function previewTeacherImage(index, url) {
    const preview = document.getElementById(`preview-photo-${index}`);
    if (url) {
        preview.src = url;
        preview.classList.remove('hidden');
    } else {
        preview.src = '';
        preview.classList.add('hidden');
    }
}

// 重置老师表单
function resetTeacherForm() {
    document.getElementById('teacher-id').value = '';
    document.getElementById('teacher-nickname').value = '';
    document.getElementById('teacher-age').value = '';
    document.getElementById('teacher-region').value = '';
    document.getElementById('teacher-telegram').value = '';
    document.getElementById('teacher-channel').value = '';
    document.getElementById('teacher-service').value = '';
    document.getElementById('teacher-cost').value = '';
    document.getElementById('teacher-intro').value = '';
    document.getElementById('teacher-photo-1').value = '';
    document.getElementById('teacher-photo-2').value = '';
    document.getElementById('teacher-photo-3').value = '';
    document.getElementById('teacher-video').value = '';
    document.getElementById('teacher-status').value = 'pending';
    
    // 隐藏图片预览
    previewTeacherImage(1, '');
    previewTeacherImage(2, '');
    previewTeacherImage(3, '');
}

// 保存老师
async function saveTeacher() {
    try {
        showLoading();
        
        const teacherId = document.getElementById('teacher-id').value;
        const nickname = document.getElementById('teacher-nickname').value;
        const age = parseInt(document.getElementById('teacher-age').value) || 0;
        const region = document.getElementById('teacher-region').value;
        const telegram = document.getElementById('teacher-telegram').value;
        const channel = document.getElementById('teacher-channel').value;
        const service = document.getElementById('teacher-service').value;
        const cost = document.getElementById('teacher-cost').value;
        const intro = document.getElementById('teacher-intro').value;
        const photo1 = document.getElementById('teacher-photo-1').value;
        const photo2 = document.getElementById('teacher-photo-2').value;
        const photo3 = document.getElementById('teacher-photo-3').value;
        const video = document.getElementById('teacher-video').value;
        const status = document.getElementById('teacher-status').value;
        
        // 简单验证
        if (!nickname) {
            throw new Error('请输入老师花名');
        }
        
        const teacherData = {
            nickname,
            age,
            region,
            telegram_account: telegram,
            channel,
            service_type: service,
            repair_cost: cost,
            intro,
            photo_url_1: photo1 || null,
            photo_url_2: photo2 || null,
            photo_url_3: photo3 || null,
            video_url: video || null,
            status
        };
        
        if (teacherId) {
            // 更新现有老师
            teacherData.id = parseInt(teacherId);
            await API.Teacher.update(teacherData);
        } else {
            // 创建新老师
            await API.Teacher.create(teacherData);
        }
        
        // 关闭模态框
        document.getElementById('teacher-modal').classList.remove('show');
        
        // 重新加载老师列表
        loadTeachers(currentTeacherPage, document.getElementById('teacher-search').value);
        
        showNotification(teacherId ? '老师信息已更新' : '老师已添加', 'success');
        
    } catch (error) {
        console.error('保存老师失败:', error);
        showNotification('保存老师失败: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// 删除老师
async function deleteTeacher() {
    if (!confirm('确定要删除这个老师吗？此操作不可撤销！')) {
        return;
    }
    
    try {
        showLoading();
        
        const teacherId = document.getElementById('teacher-id').value;
        await API.Teacher.delete(teacherId);
        
        // 关闭模态框
        document.getElementById('teacher-modal').classList.remove('show');
        
        // 重新加载老师列表
        loadTeachers(currentTeacherPage, document.getElementById('teacher-search').value);
        
        showNotification('老师已删除', 'success');
        
    } catch (error) {
        console.error('删除老师失败:', error);
        showNotification('删除老师失败: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// 初始化老师管理事件
function initTeacherEvents() {
    // 搜索老师
    document.getElementById('teacher-search').addEventListener('input', (e) => {
        const searchTerm = e.target.value.trim();
        loadTeachers(1, searchTerm);
    });
    
    // 添加老师
    document.getElementById('add-teacher-btn').addEventListener('click', () => editTeacher(''));
    
    // 保存老师
    document.getElementById('save-teacher-btn').addEventListener('click', saveTeacher);
    
    // 删除老师
    document.getElementById('delete-teacher-btn').addEventListener('click', deleteTeacher);
    
    // 关闭老师模态框
    document.getElementById('close-teacher-modal').addEventListener('click', () => {
        document.getElementById('teacher-modal').classList.remove('show');
    });
    
    // 点击模态框外部关闭
    document.getElementById('teacher-modal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('teacher-modal')) {
            document.getElementById('teacher-modal').classList.remove('show');
        }
    });
    
    // 图片URL变化时预览
    document.getElementById('teacher-photo-1').addEventListener('change', (e) => {
        previewTeacherImage(1, e.target.value);
    });
    
    document.getElementById('teacher-photo-2').addEventListener('change', (e) => {
        previewTeacherImage(2, e.target.value);
    });
    
    document.getElementById('teacher-photo-3').addEventListener('change', (e) => {
        previewTeacherImage(3, e.target.value);
    });
}

// 导出老师管理函数
window.Teachers = {
    load: loadTeachers,
    initEvents: initTeacherEvents,
    sendRandom: async () => {
        try {
            showLoading();
            await API.Teacher.sendRandom();
            showNotification('随机老师推荐已发送', 'success');
        } catch (error) {
            console.error('发送随机老师失败:', error);
            showNotification('发送随机老师失败: ' + error.message, 'error');
        } finally {
            hideLoading();
        }
    }
};
