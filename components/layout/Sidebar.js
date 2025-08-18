import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  FiHome,
  FiUsers,
  FiUserPlus,
  FiTag,
  FiBan,
  FiSettings,
  FiSend,
  FiDatabase
} from 'react-icons/fi';

const Sidebar = () => {
  const router = useRouter();
  const currentPath = router.pathname;

  return (
    <div className="w-64 bg-white h-screen shadow-sm p-4 flex flex-col">
      <div className="mb-8 pt-2">
        <h1 className="text-xl font-bold text-primary">
          Telegram北京修车超级机器人管理后台
        </h1>
        <p className="text-sm text-dark-2 mt-1">管理您的机器人和数据</p>
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-1">
          <li>
            <Link 
              href="/" 
              className={`sidebar-item ${currentPath === '/' ? 'active' : ''}`}
            >
              <FiHome size={20} />
              <span>仪表盘</span>
            </Link>
          </li>
          <li>
            <Link 
              href="/users" 
              className={`sidebar-item ${currentPath === '/users' ? 'active' : ''}`}
            >
              <FiUsers size={20} />
              <span>用户管理</span>
            </Link>
          </li>
          <li>
            <Link 
              href="/teachers" 
              className={`sidebar-item ${currentPath === '/teachers' ? 'active' : ''}`}
            >
              <FiUserPlus size={20} />
              <span>老师管理</span>
            </Link>
          </li>
          <li>
            <Link 
              href="/keywords" 
              className={`sidebar-item ${currentPath === '/keywords' ? 'active' : ''}`}
            >
              <FiTag size={20} />
              <span>关键词回复</span>
            </Link>
          </li>
          <li>
            <Link 
              href="/banned" 
              className={`sidebar-item ${currentPath === '/banned' ? 'active' : ''}`}
            >
              <FiBan size={20} />
              <span>禁言词管理</span>
            </Link>
          </li>
          <li>
            <Link 
              href="/send-random" 
              className={`sidebar-item ${currentPath === '/send-random' ? 'active' : ''}`}
            >
              <FiSend size={20} />
              <span>发送随机老师</span>
            </Link>
          </li>
          <li>
            <Link 
              href="/system" 
              className={`sidebar-item ${currentPath === '/system' ? 'active' : ''}`}
            >
              <FiDatabase size={20} />
              <span>系统状态</span>
            </Link>
          </li>
        </ul>
      </nav>
      
      <div className="pt-4 border-t border-light-1">
        <p className="text-xs text-dark-2 text-center">
          版本 1.0.0
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
