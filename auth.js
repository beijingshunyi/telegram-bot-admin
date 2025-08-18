// 认证模块 - 处理密码验证
const crypto = require('crypto');

// 密码哈希函数 - 用于安全存储密码
function hashPassword(password) {
  const salt = 'fixed-salt-for-consistency'; // 固定盐值确保验证一致性
  return crypto.createHmac('sha256', salt)
    .update(password)
    .digest('hex');
}

// 验证密码函数
function verifyPassword(inputPassword, storedHash) {
  // 对输入密码进行相同的哈希处理然后比较
  const inputHash = hashPassword(inputPassword);
  return inputHash === storedHash;
}

// 存储的密码哈希 - 基于你提供的密码"9712202273aA."生成
const validPasswordHash = hashPassword("9712202273aA.");

// 处理认证请求
function handleAuthentication(req, res) {
  const { password } = req.body;
  
  if (!password) {
    return res.status(400).send({ message: "请输入密码" });
  }
  
  try {
    const isAuthenticated = verifyPassword(password, validPasswordHash);
    
    if (isAuthenticated) {
      res.status(200).send({ 
        success: true, 
        message: "认证成功" 
      });
    } else {
      res.status(401).send({ 
        success: false, 
        message: "密钥不正确，请重新输入" 
      });
    }
  } catch (error) {
    console.error("认证错误:", error);
    res.status(500).send({ 
      success: false, 
      message: "认证过程出错，请重试" 
    });
  }
}

module.exports = {
  handleAuthentication,
  // 仅用于测试目的
  _test: {
    hashPassword,
    verifyPassword,
    validPasswordHash
  }
};
