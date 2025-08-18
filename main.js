// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化Supabase
    API.initSupabase();
    
    // 初始化认证
    Auth.initAuthEvents();
    Auth.checkAuthStatus();
    
    // 初始化各模块事件
    Users.initEvents();
    Teachers.initEvents();
    Keywords.initEvents();
    Banned.initEvents();
    
    // 初始化导航事件
    initNavigation();
    
    // 初始化设置页面
    initSettingsPage();
    
    // 初始化数据库操作页面
    initDatabasePage();
    
    // 初始化仪表盘
    if (Auth.isAuthenticated()) {
        loadDashboardData();
    }
});

// 初始化导航
function initNavigation() {
    // 导航链接点击事件
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            showSection(section);
            
            // 在移动设备上点击导航后关闭侧边栏
            if (window.innerWidth < 768) {
                document.getElementById('sidebar').classList.remove('show');
                document.querySelector('.overlay').classList.remove('show');
            }
        });
    });
    
    // 移动端菜单切换
    document.getElementById('menu-toggle').addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        document.body.appendChild(overlay);
        
        sidebar.classList.add('show');
        overlay.classList.add('show');
        
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('show');
            overlay.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(overlay);
            }, 300);
        });
    });
}

// 显示指定的 section
function showSection(sectionName) {
    // 隐藏所有 section
    document.querySelectorAll('section[id$="-section"]').forEach(section => {
        section.classList.add('hidden');
    });
    
    // 显示选中的 section
    const section = document.getElementById(`${sectionName}-section`);
    if (section) {
        section.classList.remove('hidden');
        
        // 更新导航链接的 active 状态
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.dataset.section === sectionName) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        // 更新页面标题
        document.querySelector('header h2').textContent = 
            sectionName === 'dashboard' ? '仪表盘' :
            sectionName === 'users' ? '用户管理' :
            sectionName === 'teachers' ? '老师管理' :
            sectionName === 'keywords' ? '关键词回复' :
            sectionName === 'banned' ? '禁言词管理' :
            sectionName === 'settings' ? '系统设置' :
            sectionName === 'database' ? '数据库操作' : '仪表盘';
        
        // 加载对应的数据
        if (sectionName === 'users') {
            Users.load();
        } else if (sectionName === 'teachers') {
            Teachers.load();
        } else if (sectionName === 'keywords') {
            Keywords.load();
        } else if (sectionName === 'banned') {
            Banned.load();
        } else if (sectionName === 'settings') {
            loadSettings();
        } else if (sectionName === 'dashboard') {
            loadDashboardData();
        }
    }
}

// 加载仪表盘数据
async function loadDashboardData() {
    try {
        showLoading();
        
        // 并行加载数据
        const [
            totalUsersResult,
            totalTeachersResult,
            todaySigns,
            topUsers,
            recentUsers
        ] = await Promise.all([
           