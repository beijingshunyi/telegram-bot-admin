import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Sidebar from './Sidebar';
import { FiMenu, FiX } from 'react-icons/fi';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  // 检测屏幕尺寸
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 路由变化时关闭侧边栏
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [router.pathname, isMobile]);

  return (
    <div className="flex min-h-screen">
      {/* 移动端侧边栏 */}
      {isMobile && (
        <>
          <div 
            className={`fixed inset-0 bg-black/50 z-20 transition-opacity duration-200 ${
              sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => setSidebarOpen(false)}
          />
          <div 
            className={`fixed left-0 top-0 bottom-0 z-30 transition-transform duration-300 transform ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <Sidebar />
          </div>
        </>
      )}

      {/* 桌面端侧边栏 */}
      {!isMobile && <Sidebar />}

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部导航 */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          {isMobile && (
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md hover:bg-light-1"
            >
              <FiMenu size={24} />
            </button>
          )}
          <h2 className="text-lg font-medium">
            {router.pathname === '/' && '仪表盘'}
            {router.pathname === '/users' && '用户管理'}
            {router.pathname === '/teachers' && '老师管理'}
            {router.pathname === '/keywords' && '关键词回复'}
            {router.pathname === '/banned' && '禁言词管理'}
            {router.pathname === '/send-random' && '发送随机老师'}
            {router.pathname === '/system' && '系统状态'}
          </h2>
          <div>
            <span className="text-sm text-dark-2">管理员</span>
          </div>
        </header>

        {/* 页面内容 */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
