// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化菜单切换
    initMenuSwitch();
    
    // 如果已登录，加载所有数据
    if (localStorage.getItem('telegram_bot_admin_logged_in') === 'true') {
        loadAllData();
    }
});

// 初始化菜单切换功能
function initMenuSwitch() {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            // 移除所有菜单的active类
            menuItems.forEach(menu => menu.classList.remove('active'));
            // 给当前点击的菜单添加active类
            item.classList.add('active');
            
            // 隐藏所有内容页
            const contentPages = document.querySelectorAll('.content-page');
            contentPages.forEach(page => page.classList.add('hidden'));
            
            // 显示对应的内容页
            const targetId = item.getAttribute('data-target');
            document.getElementById(targetId).classList.remove('hidden');
            document.getElementById(targetId).classList.add('fade-in');
        });
    });
}

// 加载所有数据
function loadAllData() {
    loadUsers();
    loadTeachers();
    loadKeywords();
    loadBannedUsers();
}

// 初始化模态框功能
function initModal() {
    const modal = document.getElementById('modal');
    const cancelBtn = document.getElementById('modal-cancel');
    
    // 取消按钮关闭模态框
    cancelBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });
    
    // 点击模态框外部关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
}

// 显示模态框
function showModal(title, content, saveCallback) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    const saveBtn = document.getElementById('modal-save');
    
    // 设置模态框内容
    modalTitle.textContent = title;
    modalContent.innerHTML = content;
    
    // 移除之前的事件监听（避免多次触发）
    const newSaveBtn = saveBtn.cloneNode(true);
    saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
    
    // 添加保存按钮事件
    newSaveBtn.addEventListener('click', () => {
        const result = saveCallback();
        if (result !== false) { // 如果回调返回false，则不关闭模态框
            modal.classList.add('hidden');
        }
    });
    
    // 显示模态框
    modal.classList.remove('hidden');
}

// 初始化模态框
initModal();
