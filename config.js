// ===== 配置信息 =====
const config = {
  WORKER_URL: "https://your-worker-domain", // 替换为您的Cloudflare Worker域名
  ADMIN_API_KEY: "S3cureP@ssw0rd!123", // 与Worker中设置的ADMIN_API_KEY相同
  SUPABASE_URL: "https://tekuxjnnwtqmygibvwux.supabase.co",
  SUPABASE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRla3V4am5ud3RxbXlnaWJ2d3V4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNDUzNjAsImV4cCI6MjA3MDkyMTM2MH0.RGmuF44husXoJP8y4U1Gx7HqQJ6MsYZVl6_vHtG-KJY",
  
  // API端点
  API_ENDPOINTS: {
    GET_DATA: "/admin-api",
    UPDATE_USER: "/admin-api",
    ADD_KEYWORD: "/admin-api",
    DELETE_TEACHER: "/admin-api"
  }
};