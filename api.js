// 配置数据库连接
const SUPABASE_URL = "https://tekuxjnnwtqmygibvwux.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRla3V4am5ud3RxbXlnaWJ2d3V4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNDUzNjAsImV4cCI6MjA3MDkyMTM2MH0.RGmuF44husXoJP8y4U1Gx7HqQJ6MsYZVl6_vHtG-KJY";
const WORKER_URL = "https://telegram-bot.jbk123jbk.workers.dev";
const API_KEY = "9712202273aA.";

// 初始化Supabase客户端
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// API调用封装
const API = {
    // 认证相关
    verifyAdminKey: async (key) => {
        try {
            const response = await fetch(`${WORKER_URL}/auth/verify`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-Key": API_KEY
                },
                body: JSON.stringify({ key })
            });
            return response.json();
        } catch (error) {
            console.error("验证密钥失败:", error);
            return { success: false };
        }
    },

    // 用户管理
    getUsers: async () => {
        try {
            // 从数据库获取用户
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });
                
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error("获取用户失败:", error);
            return [];
        }
    },

    // 教师管理
    getTeachers: async () => {
        try {
            const { data, error } = await supabase
                .from('teachers')
                .select('*')
                .order('created_at', { ascending: false });
                
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error("获取教师失败:", error);
            return [];
        }
    },

    addTeacher: async (teacherData) => {
        try {
            const response = await fetch(`${WORKER_URL}/teachers/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-Key": API_KEY
                },
                body: JSON.stringify(teacherData)
            });
            return response.json();
        } catch (error) {
            console.error("添加教师失败:", error);
            return { success: false };
        }
    },

    deleteTeacher: async (id) => {
        try {
            const response = await fetch(`${WORKER_URL}/teachers/delete`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-Key": API_KEY
                },
                body: JSON.stringify({ id })
            });
            return response.json();
        } catch (error) {
            console.error("删除教师失败:", error);
            return { success: false };
        }
    },

    // 关键词管理
    getKeywords: async () => {
        try {
            const { data, error } = await supabase
                .from('keywords')
                .select('*')
                .order('created_at', { ascending: false });
                
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error("获取关键词失败:", error);
            return [];
        }
    },

    addKeyword: async (keyword, response) => {
        try {
            const response = await fetch(`${WORKER_URL}/keywords/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-Key": API_KEY
                },
                body: JSON.stringify({ keyword, response })
            });
            return response.json();
        } catch (error) {
            console.error("添加关键词失败:", error);
            return { success: false };
        }
    },

    updateKeyword: async (id, keyword, response) => {
        try {
            const response = await fetch(`${WORKER_URL}/keywords/update`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-Key": API_KEY
                },
                body: JSON.stringify({ id, keyword, response })
            });
            return response.json();
        } catch (error) {
            console.error("更新关键词失败:", error);
            return { success: false };
        }
    },

    deleteKeyword: async (id) => {
        try {
            const response = await fetch(`${WORKER_URL}/keywords/delete`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-Key": API_KEY
                },
                body: JSON.stringify({ id })
            });
            return response.json();
        } catch (error) {
            console.error("删除关键词失败:", error);
            return { success: false };
        }
    },

    // 封禁管理
    getBannedUsers: async () => {
        try {
            const { data, error } = await supabase
                .from('banned_users')
                .select('*')
                .order('ban_time', { ascending: false });
                
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error("获取封禁用户失败:", error);
            return [];
        }
    },

    addBannedUser: async (userId) => {
        try {
            const response = await fetch(`${WORKER_URL}/banned/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-Key": API_KEY
                },
                body: JSON.stringify({ user_id: userId, ban_time: new Date().toISOString() })
            });
            return response.json();
        } catch (error) {
            console.error("封禁用户失败:", error);
            return { success: false };
        }
    },

    removeBannedUser: async (userId) => {
        try {
            const response = await fetch(`${WORKER_URL}/banned/remove`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-Key": API_KEY
                },
                body: JSON.stringify({ user_id: userId })
            });
            return response.json();
        } catch (error) {
            console.error("解封用户失败:", error);
            return { success: false };
        }
    },

    // 执行Worker功能
    executeWorkerFunction: async (functionName, params = {}) => {
        try {
            const response = await fetch(`${WORKER_URL}/functions/${functionName}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-Key": API_KEY
                },
                body: JSON.stringify(params)
            });
            return response.json();
        } catch (error) {
            console.error(`执行Worker功能 ${functionName} 失败:`, error);
            return { success: false, error: error.message };
        }
    }
};

// 初始化Supabase
window.addEventListener('DOMContentLoaded', () => {
    // 检查Supabase是否初始化成功
    if (supabase) {
        console.log('Supabase数据库连接成功');
        // 登录成功后自动加载数据
        if (localStorage.getItem('adminAuthenticated') === 'true') {
            loadAllData();
        }
    } else {
        console.error('Supabase数据库连接失败');
        showNotification('数据库连接失败，请刷新页面重试', 'error');
    }
});

// 批量加载所有数据
function loadAllData() {
    // 显示加载状态
    document.getElementById('loading-indicator').classList.remove('hidden');
    
    // 并行加载所有数据
    Promise.all([
        API.getUsers(),
        API.getTeachers(),
        API.getKeywords(),
        API.getBannedUsers()
    ]).then(() => {
        // 隐藏加载状态
        document.getElementById('loading-indicator').classList.add('hidden');
        showNotification('数据加载成功', 'success');
    }).catch(() => {
        document.getElementById('loading-indicator').classList.add('hidden');
        showNotification('数据加载失败', 'error');
    });
}
