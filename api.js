// 确保只创建一个Supabase实例
let supabase;

function initSupabase() {
    if (!supabase) {
        const supabaseUrl = 'YOUR_SUPABASE_URL';
        const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
        
        if (!supabaseUrl || !supabaseKey) {
            console.error('Supabase URL和Key未配置');
            return null;
        }
        
        supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
        console.log('Supabase数据库连接成功');
    }
    return supabase;
}

// 用户登录
async function login(email, password) {
    const client = initSupabase();
    if (!client) return { error: 'Supabase未初始化' };
    
    try {
        const { data, error } = await client.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        return { data: null, error: error.message };
    }
}

// 获取当前登录用户
async function getCurrentUser() {
    const client = initSupabase();
    if (!client) return null;
    
    const { data: { session }, error } = await client.auth.getSession();
    if (error || !session) return null;
    
    return session.user;
}

// 登出
async function logout() {
    const client = initSupabase();
    if (!client) return { error: 'Supabase未初始化' };
    
    const { error } = await client.auth.signOut();
    return { error: error ? error.message : null };
}

// 获取用户列表
async function getUsers() {
    const client = initSupabase();
    if (!client) return { data: null, error: 'Supabase未初始化' };
    
    const { data, error } = await client
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
        
    return { data, error: error ? error.message : null };
}

// 获取被禁用户列表
async function getBannedUsers() {
    const client = initSupabase();
    if (!client) return { data: null, error: 'Supabase未初始化' };
    
    const { data, error } = await client
        .from('banned_users')
        .select('*')
        .order('banned_at', { ascending: false });
        
    return { data, error: error ? error.message : null };
}

// 禁言用户
async function banUser(userId, reason) {
    const client = initSupabase();
    if (!client) return { error: 'Supabase未初始化' };
    
    // 先获取用户信息
    const { data: userData } = await client
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
        
    if (!userData) {
        return { error: '用户不存在' };
    }
    
    // 将用户添加到禁言列表
    const { data, error } = await client
        .from('banned_users')
        .insert([
            { 
                user_id: userId, 
                username: userData.username,
                reason: reason,
                banned_at: new Date().toISOString()
            }
        ]);
        
    return { data, error: error ? error.message : null };
}

// 解除禁言
async function unbanUser(bannedUserId) {
    const client = initSupabase();
    if (!client) return { error: 'Supabase未初始化' };
    
    const { error } = await client
        .from('banned_users')
        .delete()
        .eq('id', bannedUserId);
        
    return { error: error ? error.message : null };
}

// 检查用户是否已登录，如果没有则重定向到登录页
async function checkAuth() {
    const user = await getCurrentUser();
    if (!user && window.location.pathname !== '/login.html') {
        window.location.href = '/login.html';
        return false;
    }
    return true;
}
