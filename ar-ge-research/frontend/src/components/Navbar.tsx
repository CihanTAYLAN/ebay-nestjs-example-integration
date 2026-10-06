import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Store,
  Package,
  Tags,
  ShoppingCart,
  Key,
  Github,
} from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/stores', label: 'Stores', icon: Store },
    { path: '/products', label: 'Products', icon: Package },
    { path: '/categories', label: 'Categories', icon: Tags },
    { path: '/orders', label: 'Orders', icon: ShoppingCart },
    { path: '/auth', label: 'Auth Config', icon: Key },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="text-2xl">🛒</div>
            <span className="text-xl font-bold text-gray-800">
              eBay Integration
            </span>
          </div>

          {/* Navigation Links */}
          <div className="flex space-x-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${isActive(path)
                    ? 'bg-ebay-blue text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* GitHub Link */}
          <div className="flex items-center">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Github size={18} />
              <span className="hidden md:inline">GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
