// 模拟数据存储（实际项目中会替换为真实API）
const DataStore = {
    // 用户数据
    users: [
        { id: 1, username: 'user1', registerTime: '2023-01-01', status: '正常' },
        { id: 2, username: 'user2', registerTime: '2023-01-02', status: '正常' },
        { id: 3, username: 'user3', registerTime: '2023-01-03', status: '封禁' }
    ],
    
    // 教师数据
    teachers: [
        { id: 1, name: '张老师', subject: '数学' },
        { id: 2, name: '李老师', subject: '英语' }
    ],
    
    // 关键词数据
    keywords: [
        { keyword: '你好', response: '您好！有什么可以帮助您的吗？' },
        { keyword: '课程', response: '我们提供多种优质课程，欢迎咨询。' }
    ],
    
    // 封禁列表
    banned: [
        { userId: 3, banTime: '2023-01-10' }
    ],
    
    // 用户相关方法
    getUsers: function() {
        return [...this.users];
    },
    
    getUserById: function(id) {
        return this.users.find(user => user.id === id);
    },
    
    searchUsers: function(keyword) {
        return this.users.filter(user => 
            user.username.includes(keyword) || 
            user.id.toString().includes(keyword)
        );
    },
    
    banUser: function(id) {
        const user = this.getUserById(id);
        if (user) {
            user.status = '封禁';
            this.banned.push({
                userId: id,
                banTime: new Date().toLocaleDateString()
            });
            return true;
        }
        return false;
    },
    
    unbanUser: function(id) {
        const user = this.getUserById(id);
        if (user) {
            user.status = '正常';
            this.banned = this.banned.filter(item => item.userId !== id);
            return true;
        }
        return false;
    },
    
    // 教师相关方法
    getTeachers: function() {
        return [...this.teachers];
    },
    
    addTeacher: function(teacher) {
        const newId = this.teachers.length > 0 
            ? Math.max(...this.teachers.map(t => t.id)) + 1 
            : 1;
        const newTeacher = { id: newId, ...teacher };
        this.teachers.push(newTeacher);
        return newTeacher;
    },
    
    updateTeacher: function(updatedTeacher) {
        const index = this.teachers.findIndex(t => t.id === updatedTeacher.id);
        if (index !== -1) {
            this.teachers[index] = updatedTeacher;
            return true;
        }
        return false;
    },
    
    deleteTeacher: function(id) {
        const initialLength = this.teachers.length;
        this.teachers = this.teachers.filter(t => t.id !== id);
        return this.teachers.length < initialLength;
    },
    
    // 关键词相关方法
    getKeywords: function() {
        return [...this.keywords];
    },
    
    addKeyword: function(keyword, response) {
        this.keywords.push({ keyword, response });
        return true;
    },
    
    updateKeyword: function(oldKeyword, newKeyword, newResponse) {
        const index = this.keywords.findIndex(k => k.keyword === oldKeyword);
        if (index !== -1) {
            this.keywords[index] = { keyword: newKeyword, response: newResponse };
            return true;
        }
        return false;
    },
    
    deleteKeyword: function(keyword) {
        const initialLength = this.keywords.length;
        this.keywords = this.keywords.filter(k => k.keyword !== keyword);
        return this.keywords.length < initialLength;
    },
    
    // 封禁相关方法
    getBannedUsers: function() {
        return [...this.banned];
    },
    
    addBannedUser: function(userId) {
        // 检查用户是否存在
        const userExists = this.users.some(u => u.id === userId);
        if (!userExists) return false;
        
        // 检查是否已封禁
        const alreadyBanned = this.banned.some(b => b.userId === userId);
        if (alreadyBanned) return false;
        
        this.banned.push({
            userId,
            banTime: new Date().toLocaleDateString()
        });
        
        // 更新用户状态
        const user = this.getUserById(userId);
        if (user) {
            user.status = '封禁';
        }
        
        return true;
    },
    
    removeBannedUser: function(userId) {
        const initialLength = this.banned.length;
        this.banned = this.banned.filter(b => b.userId !== userId);
        
        // 更新用户状态
        const user = this.getUserById(userId);
        if (user) {
            user.status = '正常';
        }
        
        return this.banned.length < initialLength;
    }
};

// 暴露接口方法（模拟API调用）
const API = {
    // 用户接口
    getUsers: () => {
        return new Promise(resolve => {
            setTimeout(() => resolve(DataStore.getUsers()), 300);
        });
    },
    
    searchUsers: (keyword) => {
        return new Promise(resolve => {
            setTimeout(() => resolve(DataStore.searchUsers(keyword)), 300);
        });
    },
    
    banUser: (id) => {
        return new Promise(resolve => {
            setTimeout(() => resolve(DataStore.banUser(id)), 300);
        });
    },
    
    unbanUser: (id) => {
        return new Promise(resolve => {
            setTimeout(() => resolve(DataStore.unbanUser(id)), 300);
        });
    },
    
    // 教师接口
    getTeachers: () => {
        return new Promise(resolve => {
            setTimeout(() => resolve(DataStore.getTeachers()), 300);
        });
    },
    
    addTeacher: (teacher) => {
        return new Promise(resolve => {
            setTimeout(() => resolve(DataStore.addTeacher(teacher)), 300);
        });
    },
    
    updateTeacher: (teacher) => {
        return new Promise(resolve => {
            setTimeout(() => resolve(DataStore.updateTeacher(teacher)), 300);
        });
    },
    
    deleteTeacher: (id) => {
        return new Promise(resolve => {
            setTimeout(() => resolve(DataStore.deleteTeacher(id)), 300);
        });
    },
    
    // 关键词接口
    getKeywords: () => {
        return new Promise(resolve => {
            setTimeout(() => resolve(DataStore.getKeywords()), 300);
        });
    },
    
    addKeyword: (keyword, response) => {
        return new Promise(resolve => {
            setTimeout(() => resolve(DataStore.addKeyword(keyword, response)), 300);
        });
    },
    
    updateKeyword: (oldKeyword, newKeyword, newResponse) => {
        return new Promise(resolve => {
            setTimeout(() => resolve(DataStore.updateKeyword(oldKeyword, newKeyword, newResponse)), 300);
        });
    },
    
    deleteKeyword: (keyword) => {
        return new Promise(resolve => {
            setTimeout(() => resolve(DataStore.deleteKeyword(keyword)), 300);
        });
    },
    
    // 封禁接口
    getBannedUsers: () => {
        return new Promise(resolve => {
            setTimeout(() => resolve(DataStore.getBannedUsers()), 300);
        });
    },
    
    addBannedUser: (userId) => {
        return new Promise(resolve => {
            setTimeout(() => resolve(DataStore.addBannedUser(userId)), 300);
        });
    },
    
    removeBannedUser: (userId) => {
        return new Promise(resolve => {
            setTimeout(() => resolve(DataStore.removeBannedUser(userId)), 300);
        });
    }
};
