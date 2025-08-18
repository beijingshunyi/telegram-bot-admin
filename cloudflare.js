// Cloudflare Worker交互
const WORKER_URL = "https://telegram-bot.jbk123jbk.workers.dev";
const ADMIN_API_KEY = "9712202273aA.";

// 测试Worker连接
async function testWorkerConnection() {
    try {
        const response = await fetch(`${WORKER_URL}/test-db`, {
            method: 'GET'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP错误! 状态码: ${response.status}`);
        }
        
        const result = await response.json();
        return {
            status: 'success',
            message: 'Worker连接正常',
            details: result
        };
    } catch (error) {
        return {
            status: 'error',
            message: error.message
        };
    }
}

// 触发发送随机老师
async function triggerSendTeacher() {
    try {
        const response = await fetch(`${WORKER_URL}/send-random-teacher`, {
            method: 'GET',
            headers: {
                'Admin-Key': ADMIN_API_KEY
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP错误! 状态码: ${response.status}`);
        }
        
        const result = await response.text();
        return {
            status: 'success',
            message: '随机老师已发送',
            details: result
        };
    } catch (error) {
        throw error;
    }
}

// 测试数据库
async function testDatabase() {
    try {
        const response = await fetch(`${WORKER_URL}/test-db`, {
            method: 'GET'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP错误! 状态码: ${response.status}`);
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        throw error;
    }
}

// 批量调整积分
async function batchAdjustPoints(pointsChange) {
    // 注意：实际项目中需要更复杂的实现
    // 这里仅为演示
    return {
        status: 'success',
        message: `已为所有用户调整积分 ${pointsChange > 0 ? '+' : ''}${pointsChange}`
    };
}

// 清除缓存
async function clearCache() {
    // 注意：实际项目中需要更复杂的实现
    // 这里仅为演示
    return {
        status: 'success',
        message: '缓存已清除'
    };
}
