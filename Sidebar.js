import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  FaUsers, 
  FaChalkboardTeacher, 
  FaKey, 
  FaBan, 
  FaHome,
  FaRobot
} from 'react-icons/fa';

const Sidebar = () => {
  const router = useRouter();
  const { pathname } = router;

  return (
    <div className="bg-gray-800 text-white w-64 h-screen fixed left-0 top-0 p-4">
      <div className="text-center mb-8">
        <h1 className="text-xl font-bold">Telegram北京修车超级机器人管理后台</h1>
        <div className="mt-2 text-sm text-gray-400">
          版本 1.0.0
        </div>
      </div>
      
      <nav>
        <ul className="space-y-2">
          <li>
            <Link 
              href="/" 
              className={`flex items-center p-3 rounded-lg ${pathname === '/' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            >
              <FaHome className="mr-3" />
              <span>首页</span>
            </Link>
          </li>
          <li>
            <Link 
              href="/users" 
              className={`flex items-center p-3 rounded-lg ${pathname === '/users' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            >
              <FaUsers className="mr-3" />
              <span>用户管理</span>
            </Link>
          </li>
          <li>
            <Link 
              href="/teachers" 
              className={`flex items-center p-3 rounded-lg ${pathname === '/teachers' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            >
              <FaChalkboardTeacher className="mr-3" />
              <span>老师管理</span>
            </Link>
          </li>
          <li>
            <Link 
              href="/keywords" 
              className={`flex items-center p-3 rounded-lg ${pathname === '/keywords' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            >
              <FaKey className="mr-3" />
              <span>关键词管理</span>
            </Link>
          </li>
          <li>
            <Link 
              href="/banned" 
              className={`flex items-center p-3 rounded-lg ${pathname === '/banned' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            >
              <FaBan className="mr-3" />
              <span>禁言词管理</span>
            </Link>
          </li>
        </ul>
      </nav>
      
      <div className="absolute bottom-4 left-0 right-0 px-4">
        <div className="bg-gray-700 p-3 rounded-lg text-center text-sm">
          <FaRobot className="inline-block mr-2" />
          机器人状态: 运行中
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
