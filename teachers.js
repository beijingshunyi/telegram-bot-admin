// 加载教师列表
function loadTeachers() {
    API.getTeachers().then(teachers => {
        renderTeacherList(teachers);
    });
}

// 渲染教师列表
function renderTeacherList(teachers) {
    const teacherListElement = document.getElementById('teacher-list');
    teacherListElement.innerHTML = '';
    
    if (teachers.length === 0) {
        teacherListElement.innerHTML = `
            <tr>
                <td colspan="3" class="text-center py-4">没有找到教师数据</td>
            </tr>
        `;
        return;
    }
    
    teachers.forEach(teacher => {
        const tr = document.createElement('tr');
        tr.className = 'fade-in';
        tr.innerHTML = `
            <td>${teacher.id}</td>
            <td>${teacher.name}</td>
            <td>${teacher.subject}</td>
            <td>
                <button class="text-blue-600 hover:text-blue-800 mr-2 edit-teacher" data-id="${teacher.id}">
                    <i class="fa fa-edit"></i> 编辑
                </button>
                <button class="text-red-600 hover:text-red-800 delete-teacher" data-id="${teacher.id}">
                    <i class="fa fa-trash"></i> 删除
                </button>
            </td>
        `;
        teacherListElement.appendChild(tr);
    });
    
    // 添加教师操作事件监听
    addTeacherActionListeners();
}

// 添加教师操作按钮监听
function addTeacherActionListeners() {
    // 编辑教师
    document.querySelectorAll('.edit-teacher').forEach(btn => {
        btn.addEventListener('click', () => {
            const teacherId = parseInt(btn.getAttribute('data-id'));
            const teachers = DataStore.getTeachers();
            const teacher = teachers.find(t => t.id === teacherId);
            
            if (teacher) {
                showEditTeacherModal(teacher);
            }
        });
    });
    
    // 删除教师
    document.querySelectorAll('.delete-teacher').forEach(btn => {
        btn.addEventListener('click', () => {
            const teacherId = parseInt(btn.getAttribute('data-id'));
            if (confirm('确定要删除这位教师吗？')) {
                API.deleteTeacher(teacherId).then(success => {
                    if (success) {
                        loadTeachers();
                    }
                });
            }
        });
    });
}

// 显示添加教师模态框
document.getElementById('add-teacher-btn').addEventListener('click', () => {
    showAddTeacherModal();
});

// 添加教师模态框
function showAddTeacherModal() {
    const modalContent = `
        <div class="mb-4">
            <label for="teacher-name" class="block text-gray-700 mb-2">教师名称</label>
            <input type="text" id="teacher-name" 
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="输入教师名称">
        </div>
        <div class="mb-4">
            <label for="teacher-subject" class="block text-gray-700 mb-2">专业领域</label>
            <input type="text" id="teacher-subject" 
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="输入专业领域">
        </div>
    `;
    
    showModal('添加教师', modalContent, () => {
        const name = document.getElementById('teacher-name').value.trim();
        const subject = document.getElementById('teacher-subject').value.trim();
        
        if (!name || !subject) {
            alert('请填写完整的教师信息');
            return false; // 不关闭模态框
        }
        
        API.addTeacher({ name, subject }).then(() => {
            loadTeachers();
        });
    });
}

// 编辑教师模态框
function showEditTeacherModal(teacher) {
    const modalContent = `
        <input type="hidden" id="edit-teacher-id" value="${teacher.id}">
        <div class="mb-4">
            <label for="edit-teacher-name" class="block text-gray-700 mb-2">教师名称</label>
            <input type="text" id="edit-teacher-name" 
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value="${teacher.name}">
        </div>
        <div class="mb-4">
            <label for="edit-teacher-subject" class="block text-gray-700 mb-2">专业领域</label>
            <input type="text" id="edit-teacher-subject" 
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value="${teacher.subject}">
        </div>
    `;
    
    showModal('编辑教师', modalContent, () => {
        const id = parseInt(document.getElementById('edit-teacher-id').value);
        const name = document.getElementById('edit-teacher-name').value.trim();
        const subject = document.getElementById('edit-teacher-subject').value.trim();
        
        if (!name || !subject) {
            alert('请填写完整的教师信息');
            return false; // 不关闭模态框
        }
        
        API.updateTeacher({ id, name, subject }).then(success => {
            if (success) {
                loadTeachers();
            }
        });
    });
}
