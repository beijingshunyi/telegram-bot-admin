# Telegram机器人管理后台

这是一个用于管理Telegram机器人的后台管理系统，支持用户管理、教师管理、关键词自动回复管理、用户封禁等功能，并能与Cloudflare Worker和Supabase数据库集成。

## 功能特点

- 用户管理：查看所有用户、封禁/解封用户
- 教师管理：添加、删除教师信息
- 关键词管理：设置自动回复关键词及内容
- 封禁管理：查看和管理被封禁用户
- 与Supabase数据库实时同步
- 执行Cloudflare Worker中的功能

## 安装部署

1. 将所有文件上传到你的GitHub仓库
2. 通过Vercel、Netlify或其他静态网站托管服务部署
3. 确保Supabase数据库已正确配置并包含必要的表

## 数据库表结构

需要在Supabase中创建以下表：

1. users (用户表)
   - id (整数，主键)
   - name (文本)
   - created_at (时间戳)

2. teachers (教师表)
   - id (整数，主键)
   - name (文本)
   - subject (文本)
   - bio (文本)
   - created_at (时间戳)

3. keywords (关键词表)
   - id (整数，主键)
   - keyword (文本)
   - response (文本)
   - created_at (时间戳)

4. banned_users (封禁用户表)
   - user_id (整数，主键)
   - ban_time (时间戳)

## 管理员登录

使用预设的管理员密钥登录：`9712202273aA.`

你可以在`auth.js`文件中修改管理员密钥
