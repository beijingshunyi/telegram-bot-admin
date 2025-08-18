// 全局变量
let supabase;
let SUPABASE_URL = "https://tekuxjnnwtqmygibvwux.supabase.co";
let SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRla3V4am5ud3RxbXlnaWJ2d3V4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNDUzNjAsImV4cCI6MjA3MDkyMTM2MH0.RGmuF44husXoJP8y4U1Gx7HqQJ6MsYZVl6_vHtG-KJY";
let WORKER_URL = "https://telegram-bot.jbk123jbk.workers.dev";
let ADMIN_API_KEY = "9712202273aA.";
let BOT_TOKEN = "8341196303:AAFbT_px8I12_q2b7AI_c00N3nHzFwLb4pg";
let ADMIN_ID = "8392100400";

// 初始化Supabase
function initSupabase() {
    if (supabase) return;
    
    // 从本地存储加载设置
    const savedSettings = localStorage.getItem('botAdminSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        SUPABASE_URL = settings.supabaseUrl || SUPABASE_URL;
        SUPABASE_KEY = settings.supabaseKey || SUPABASE_KEY;
        WORKER_URL = settings.workerUrl || WORKER_URL;
        ADMIN_API_KEY = settings.adminKey || ADMIN_API_KEY;
        BOT_TOKEN = settings.botToken || BOT_TOKEN;
        ADMIN_ID = settings.adminId || ADMIN_ID;
    }
    
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

// 保存设置到本地存储
function saveSettingsToLocalStorage() {
    const settings = {
        supabaseUrl: SUPABASE_URL,
        supabaseKey: SUPABASE_KEY,
        workerUrl: WORKER_URL,
        adminKey: ADMIN_API_KEY,
        botToken: BOT_TOKEN,
        adminId: ADMIN_ID
    };
    localStorage.setItem('botAdminSettings', JSON.stringify(settings));
}

// 更新设置
function updateSettings(settings) {
    if (settings.supabaseUrl) SUPABASE_URL = settings.supabaseUrl;
    if (settings.supabaseKey) SUPABASE_KEY = settings.supabaseKey;
    if (settings.workerUrl) WORKER_URL = settings.workerUrl;
    if (settings.adminKey) ADMIN_API_KEY = settings.adminKey;
    if (settings.botToken) BOT_TOKEN = settings.botToken;
    if (settings.adminId) ADMIN_ID = settings.adminId;
    
    // 重新初始化Supabase
    supabase = null;
    initSupabase();
    
    // 保存到本地存储
    saveSettingsToLocalStorage();
}

// 获取设置
function getSettings() {
    return {
        supabaseUrl: SUPABASE_URL,
        supabaseKey: SUPABASE_KEY,
        workerUrl: WORKER_URL,
        adminKey: ADMIN_API_KEY,
        botToken: BOT_TOKEN,
        adminId: ADMIN_ID
    };
}

// API请求通用函数
async function apiRequest(endpoint, method = 'GET', data = null) {
    try {
        const url = `${WORKER_URL}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Admin-Key': ADMIN_API_KEY
            }
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(url, options);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'API请求失败');
        }
        
        return result;
    } catch (error) {
        console.error('API请求错误:', error);
        throw error;
    }
}

// 用户相关API
const UserAPI = {
    // 获取所有用户
    async getAll(page = 1, pageSize = 20, search = '') {
        initSupabase();
        
        let query = supabase
            .from('users')
            .select('*', { count: 'exact' })
            .range((page - 1) * pageSize, page * pageSize - 1);
        
        if (search) {
            query = query.or(`display_name.ilike.%${search}%,username.ilike.%${search}%,user_id.ilike.%${search}%`);
        }
        
        const { data, error, count } = await query;
        
        if (error) throw error;
        
        return {
            users: data || [],
            total: count || 0,
            page,
            pageSize,
            totalPages: Math.ceil((count || 0) / pageSize)
        };
    },
    
    // 获取单个用户
    async getById(userId) {
        initSupabase();
        
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('user_id', userId)
            .single();
        
        if (error) throw error;
        return data;
    },
    
    // 更新用户
    async update(user) {
        initSupabase();
        
        const { data, error } = await supabase
            .from('users')
            .upsert(user)
            .eq('user_id', user.user_id)
            .select();
        
        if (error) throw error;
        return data[0];
    },
    
    // 删除用户
    async delete(userId) {
        initSupabase();
        
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('user_id', userId);
        
        if (error) throw error;
        return true;
    },
    
    // 获取今日签到人数
    async getTodaySigns() {
        initSupabase();
        const today = new Date().toISOString().split('T')[0];
        
        const { count, error } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('last_sign_date', today);
        
        if (error) throw error;
        return count || 0;
    },
    
    // 获取积分排名前10的用户
    async getTopUsers(limit = 10) {
        initSupabase();
        
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('points', { ascending: false })
            .limit(limit);
        
        if (error) throw error;
        return data || [];
    },
    
    // 获取最近新增用户
    async getRecentUsers(limit = 5) {
        initSupabase();
        
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);
        
        if (error) throw error;
        return data || [];
    }
};

// 老师相关API
const TeacherAPI = {
    // 获取所有老师
    async getAll(page = 1, pageSize = 20, search = '') {
        initSupabase();
        
        let query = supabase
            .from('teachers')
            .select('*', { count: 'exact' })
            .range((page - 1) * pageSize, page * pageSize - 1);
        
        if (search) {
            query = query.or(`nickname.ilike.%${search}%,region.ilike.%${search}%,service_type.ilike.%${search}%`);
        }
        
        const { data, error, count } = await query;
        
        if (error) throw error;
        
        return {
            teachers: data || [],
            total: count || 0,
            page,
            pageSize,
            totalPages: Math.ceil((count || 0) / pageSize)
        };
    },
    
    // 获取单个老师
    async getById(id) {
        initSupabase();
        
        const { data, error } = await supabase
            .from('teachers')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        return data;
    },
    
    // 创建老师
    async create(teacher) {
        initSupabase();
        
        const { data, error } = await supabase
            .from('teachers')
            .insert([teacher])
            .select();
        
        if (error) throw error;
        return data[0];
    },
    
    // 更新老师
    async update(teacher) {
        initSupabase();
        
        const { data, error } = await supabase
            .from('teachers')
            .upsert(teacher)
            .eq('id', teacher.id)
            .select();
        
        if (error) throw error;
        return data[0];
    },
    
    // 删除老师
    async delete(id) {
        initSupabase();
        
        const { error } = await supabase
            .from('teachers')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        return true;
    },
    
    // 发送随机老师推荐
    async sendRandom() {
        return apiRequest('/send-random-teacher', 'GET');
    }
};

// 关键词相关API
const KeywordAPI = {
    // 获取所有关键词
    async getAll(page = 1, pageSize = 20, search = '') {
        initSupabase();
        
        let query = supabase
            .from('keywords')
            .select('*', { count: 'exact' })
            .range((page - 1) * pageSize, page * pageSize - 1);
        
        if (search) {
            query = query.or(`keyword.ilike.%${search}%,response.ilike.%${search}%`);
        }
        
        const { data, error, count } = await query;
        
        if (error) throw error;
        
        return {
            keywords: data || [],
            total: count || 0,
            page,
            pageSize,
            totalPages: Math.ceil((count || 0) / pageSize)
        };
    },
    
    // 获取单个关键词
    async getById(id) {
        initSupabase();
        
        const { data, error } = await supabase
            .from('keywords')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        return data;
    },
    
    // 创建关键词
    async create(keyword) {
        initSupabase();
        
        const { data, error } = await supabase
            .from('keywords')
            .insert([keyword])
            .select();
        
        if (error) throw error;
        return data[0];
    },
    
    // 更新关键词
    async update(keyword) {
        initSupabase();
        
        const { data, error } = await supabase
            .from('keywords')
            .upsert(keyword)
            .eq('id', keyword.id)
            .select();
        
        if (error) throw error;
        return data[0];
    },
    
    // 删除关键词
    async delete(id) {
        initSupabase();
        
        const { error } = await supabase
            .from('keywords')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        return true;
    }
};

// 禁言词相关API
const BannedKeywordAPI = {
    // 获取所有禁言词
    async getAll(page = 1, pageSize = 20, search = '') {
        initSupabase();
        
        let query = supabase
            .from('banned_keywords')
            .select('*', { count: 'exact' })
            .range((page - 1) * pageSize, page * pageSize - 1);
        
        if (search) {
            query = query.ilike('keyword', `%${search}%`);
        }
        
        const { data, error, count } = await query;
        
        if (error) throw error;
        
        return {
            banned: data || [],
            total: count || 0,
            page,
            pageSize,
            totalPages: Math.ceil((count || 0) / pageSize)
        };
    },
    
    // 获取单个禁言词
    async getById(id) {
        initSupabase();
        
        const { data, error } = await supabase
            .from('banned_keywords')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        return data;
    },
    
    // 创建禁言词
    async create(keyword) {
        initSupabase();
        
        const { data, error } = await supabase
            .from('banned_keywords')
            .insert([keyword])
            .select();
        
        if (error) throw error;
        return data[0];
    },
    
    // 更新禁言词
    async update(keyword) {
        initSupabase();
        
        const { data, error } = await supabase
            .from('banned_keywords')
            .upsert(keyword)
            .eq('id', keyword.id)
            .select();
        
        if (error) throw error;
        return data[0];
    },
    
    // 删除禁言词
    async delete(id) {
        initSupabase();
        
        const { error } = await supabase
            .from('banned_keywords')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        return true;
    }
};

// 数据库操作API
const DatabaseAPI = {
    // 测试数据库连接
    async testConnection() {
        return apiRequest('/test-db', 'GET');
    },
    
    // 清空所有数据
    async clearAllData() {
        return apiRequest('/clear-all-data', 'POST');
    }
};

// 导出API
window.API = {
    initSupabase,
    updateSettings,
    getSettings,
    User: UserAPI,
    Teacher: TeacherAPI,
    Keyword: KeywordAPI,
    BannedKeyword: BannedKeywordAPI,
    Database: DatabaseAPI
};
