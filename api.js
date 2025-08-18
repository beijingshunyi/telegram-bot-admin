// API模块 - 处理所有数据请求和数据库连接
class API {
    constructor() {
        // 初始化Supabase客户端（使用用户提供的正确信息）
        this.supabaseUrl = 'https://tekuxjnnwtqmygibvwux.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRla3V4am5ud3RxbXlnaWJ2d3V4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNDUzNjAsImV4cCI6MjA3MDkyMTM2MH0.RGmuF44husXoJP8y4U1Gx7HqQJ6MsYZVl6_vHtG-KJY';
        
        // 确保Supabase已加载
        if (window.supabase) {
            this.supabase = window.supabase.createClient(
                this.supabaseUrl, 
                this.supabaseKey
            );
            console.log('Supabase数据库连接成功');
        } else {
            console.error('Supabase客户端未加载，请检查是否已引入Supabase JS库');
            this.supabase = null;
        }
        
        // 管理员密钥（用户提供的统一密钥）
        this.adminKey = '9712202273aA.';
    }
    
    // 验证管理员密钥
    verifyAdminKey(inputKey) {
        return inputKey === this.adminKey;
    }
    
    // 获取所有用户
    async getUsers() {
        if (!this.supabase) return { data: null, error: 'Supabase未初始化' };
        
        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });
                
            return { data, error };
        } catch (err) {
            return { data: null, error: err.message };
        }
    }
    
    // 获取所有教师
    async getTeachers() {
        if (!this.supabase) return { data: null, error: 'Supabase未初始化' };
        
        try {
            const { data, error } = await this.supabase
                .from('teachers')
                .select('*')
                .order('name');
                
            return { data, error };
        } catch (err) {
            return { data: null, error: err.message };
        }
    }
    
    // 添加教师
    async addTeacher(teacher) {
        if (!this.supabase) return { error: 'Supabase未初始化' };
        
        try {
            const { error } = await this.supabase
                .from('teachers')
                .insert([teacher]);
                
            return { error };
        } catch (err) {
            return { error: err.message };
        }
    }
    
    // 删除教师
    async deleteTeacher(id) {
        if (!this.supabase) return { error: 'Supabase未初始化' };
        
        try {
            const { error } = await this.supabase
                .from('teachers')
                .delete()
                .eq('id', id);
                
            return { error };
        } catch (err) {
            return { error: err.message };
        }
    }
    
    // 获取所有关键词
    async getKeywords() {
        if (!this.supabase) return { data: null, error: 'Supabase未初始化' };
        
        try {
            const { data, error } = await this.supabase
                .from('keywords')
                .select('*')
                .order('keyword');
                
            return { data, error };
        } catch (err) {
            return { data: null, error: err.message };
        }
    }
    
    // 添加关键词
    async addKeyword(keyword, response) {
        if (!this.supabase) return { error: 'Supabase未初始化' };
        
        try {
            const { error } = await this.supabase
                .from('keywords')
                .insert([{ keyword, response }]);
                
            return { error };
        } catch (err) {
            return { error: err.message };
        }
    }
    
    // 更新关键词
    async updateKeyword(id, keyword, response) {
        if (!this.supabase) return { error: 'Supabase未初始化' };
        
        try {
            const { error } = await this.supabase
                .from('keywords')
                .update({ keyword, response })
                .eq('id', id);
                
            return { error };
        } catch (err) {
            return { error: err.message };
        }
    }
    
    // 删除关键词
    async deleteKeyword(id) {
        if (!this.supabase) return { error: 'Supabase未初始化' };
        
        try {
            const { error } = await this.supabase
                .from('keywords')
                .delete()
                .eq('id', id);
                
            return { error };
        } catch (err) {
            return { error: err.message };
        }
    }
    
    // 获取所有被封禁用户
    async getBannedUsers() {
        if (!this.supabase) return { data: null, error: 'Supabase未初始化' };
        
        try {
            const { data, error } = await this.supabase
                .from('banned_users')
                .select('*')
                .order('ban_time', { ascending: false });
                
            return { data, error };
        } catch (err) {
            return { data: null, error: err.message };
        }
    }
    
    // 添加封禁用户
    async addBannedUser(userId) {
        if (!this.supabase) return { error: 'Supabase未初始化' };
        
        try {
            const { error } = await this.supabase
                .from('banned_users')
                .insert([{ 
                    user_id: userId, 
                    ban_time: new Date().toISOString() 
                }]);
                
            return { error };
        } catch (err) {
            return { error: err.message };
        }
    }
    
    // 移除封禁用户
    async removeBannedUser(userId) {
        if (!this.supabase) return { error: 'Supabase未初始化' };
        
        try {
            const { error } = await this.supabase
                .from('banned_users')
                .delete()
                .eq('user_id', userId);
                
            return { error };
        } catch (err) {
            return { error: err.message };
        }
    }
    
    // 调用Cloudflare Worker
    async callWorker(endpoint, data = {}) {
        const workerUrl = 'https://telegram-bot.jbk123jbk.workers.dev';
        
        try {
            const response = await fetch(`${workerUrl}/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Worker请求失败');
            }
            
            return { data: result, error: null };
        } catch (err) {
            return { data: null, error: err.message };
        }
    }
}

// 初始化API实例（确保全局唯一）
if (!window.api) {
    window.api = new API();
}
