// Supabase数据库连接和操作
const SUPABASE_URL = "https://tekuxjnnwtqmygibvwux.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRla3V4am5ud3RxbXlnaWJ2d3V4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNDUzNjAsImV4cCI6MjA3MDkyMTM2MH0.RGmuF44husXoJP8y4U1Gx7HqQJ6MsYZVl6_vHtG-KJY";

// 初始化Supabase客户端
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 获取所有用户
async function fetchUsers() {
    const { data, error } = await supabase
        .from('users')
        .select('*');
    
    if (error) throw error;
    return data;
}

// 获取所有老师
async function fetchTeachers() {
    const { data, error } = await supabase
        .from('teachers')
        .select('*');
    
    if (error) throw error;
    return data;
}

// 获取所有关键词
async function fetchKeywords() {
    const { data, error } = await supabase
        .from('keywords')
        .select('*');
    
    if (error) throw error;
    return data;
}

// 获取所有禁言词
async function fetchBannedKeywords() {
    const { data, error } = await supabase
        .from('banned_keywords')
        .select('*');
    
    if (error) throw error;
    return data;
}

// 测试数据库连接
async function testDatabaseConnection() {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .limit(1);
        
        if (error) throw error;
        
        return {
            status: 'success',
            message: '数据库连接正常',
            users_count: data ? data.length : 0
        };
    } catch (error) {
        return {
            status: 'error',
            message: error.message
        };
    }
}

// 调整用户积分
async function adjustUserPoints(userId, pointsChange) {
    try {
        // 先获取当前用户
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('user_id', userId)
            .single();
        
        if (userError) throw userError;
        if (!userData) throw new Error('用户不存在');
        
        // 计算新积分
        const newPoints = Math.max(0, (userData.points || 0) + pointsChange);
        
        // 更新用户积分
        const { error } = await supabase
            .from('users')
            .update({ points: newPoints })
            .eq('user_id', userId);
        
        if (error) throw error;
        
        return {
            status: 'success',
            new_points: newPoints
        };
    } catch (error) {
        throw error;
    }
}

// 添加新老师
async function addTeacher(teacherData) {
    const { error } = await supabase
        .from('teachers')
        .insert([teacherData]);
    
    if (error) throw error;
    
    return { status: 'success' };
}

// 添加新关键词
async function addKeyword(keyword, response) {
    const { error } = await supabase
        .from('keywords')
        .insert([{ keyword, response, is_active: true }]);
    
    if (error) throw error;
    
    return { status: 'success' };
}

// 添加新禁言词
async function addBannedKeyword(keyword) {
    const { error } = await supabase
        .from('banned_keywords')
        .insert([{ keyword }]);
    
    if (error) throw error;
    
    return { status: 'success' };
}

// 删除用户
async function deleteUser(userId) {
    const { error } = await supabase
        .from('users')
        .delete()
        .eq('user_id', userId);
    
    if (error) throw error;
    
    return { status: 'success' };
}

// 删除老师
async function deleteTeacher(teacherId) {
    const { error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', teacherId);
    
    if (error) throw error;
    
    return { status: 'success' };
}

// 删除关键词
async function deleteKeyword(keywordId) {
    const { error } = await supabase
        .from('keywords')
        .delete()
        .eq('id', keywordId);
    
    if (error) throw error;
    
    return { status: 'success' };
}

// 删除禁言词
async function deleteBannedKeyword(bannedId) {
    const { error } = await supabase
        .from('banned_keywords')
        .delete()
        .eq('id', bannedId);
    
    if (error) throw error;
    
    return { status: 'success' };
}

// 切换老师状态
async function toggleTeacherStatus(teacherId, currentStatus) {
    const newStatus = currentStatus === 'approved' ? 'pending' : 'approved';
    
    const { error } = await supabase
        .from('teachers')
        .update({ status: newStatus })
        .eq('id', teacherId);
    
    if (error) throw error;
    
    return { status: 'success', new_status: newStatus };
}

// 切换关键词状态
async function toggleKeywordStatus(keywordId, isActive) {
    const { error } = await supabase
        .from('keywords')
        .update({ is_active: !isActive })
        .eq('id', keywordId);
    
    if (error) throw error;
    
    return { status: 'success', is_active: !isActive };
}
