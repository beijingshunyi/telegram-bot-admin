// 加载教师列表
function loadTeachers() {
    API.getTeachers().then(teachers => {
        DataStore.setTeachers(teachers);
        renderTeachersList(teachers);
    });
}

// 渲染教师列表
function renderTeachersList(teachers) {
    const teachersListElement = document.getElementById('teachers-list');
    teachersListElement.innerHTML = '';
    
    if (teachers.length === 0) {
        teachersListElement.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4">没有教师数据</td>
            </tr>
        `;
        return;
    }
    
    teachers.forEach(teacher => {
        const tr = document.createElement('tr');
        tr.className = 'fade-in';
        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${teacher.id}</td>
            <td class="px-6 py-4 whitespace-nowrap">${teacher.name}</td>
            <td class="px-6 py-4 whitespace-nowrap">${teacher.subject}</td>
            <td class="px-6 py-4 whitespace-nowrap">${formatDate(teacher.created_at)}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <button class="text-red-600 hover:text-red-800 delete-teacher-btn" data-id="${teacher.id}">
                    <i class="fa fa-trash"></i> 删除
                </button>
            </td>
        `;
        teachersListElement.appendChild(tr);
    });
    
    // 添加删除事件监听
    addDeleteTeacherListeners();
}

// 添加删除教师监听
function addDeleteTeacherListeners() {
    document.querySelectorAll('.delete-teacher-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.getAttribute('data-id'));
            const teacher = DataStore.getTeachers().find(t => t.id === id);
            
            if (confirm(`确定要删除教师 "${teacher.name}" 吗？`)) {
                API.deleteTeacher(id).then(success => {
                    if (success) {
                        loadTeachers();
                        showNotification('教师已成功删除', 'success');
                    } else {
                        showNotification('删除教师失败', 'error');
                    }
                });
            }
        });
    });
}

// 添加教师表单提交
document.getElementById('add-teacher-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const teacherData = {
        id: parseInt(document.getElementById('teacher-id').value.trim()),
        name: document.getElementById('teacher-name').value.trim(),
        subject: document.getElementById('teacher-subject').value.trim(),
        bio: document.getElementById('teacher-bio').value.trim(),
        created_at: new Date().toISOString()
    };
    
    // 验证ID是否已存在
    const existingTeacher = DataStore.getTeachers().find(t => t.id === teacherData.id);
    if (existingTeacher) {
        showNotification('该教师ID已存在', 'error');
        return;
    }
    
    API.addTeacher(teacherData).then(success => {
        if (success) {
            // 重置表单
            document.getElementById('add-teacher-form').reset();
            // 重新加载教师列表
            loadTeachers();
            showNotification('教师添加成功', 'success');
        } else {
            showNotification('添加教师失败', 'error');
        }
    });
});

// 格式化日期
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
}
