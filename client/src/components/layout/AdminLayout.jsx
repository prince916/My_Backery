import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  FiGrid, FiShoppingBag, FiTag, FiPackage, FiUsers,
  FiPercent, FiStar, FiBarChart2, FiMenu, FiX, FiHome,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/admin',            icon: FiGrid,       label: 'Dashboard',   end: true },
  { to: '/admin/products',   icon: FiShoppingBag,label: 'Products' },
  { to: '/admin/categories', icon: FiTag,        label: 'Categories' },
  { to: '/admin/orders',     icon: FiPackage,    label: 'Orders' },
  { to: '/admin/users',      icon: FiUsers,      label: 'Users' },
  { to: '/admin/coupons',    icon: FiPercent,    label: 'Coupons' },
  { to: '/admin/reviews',    icon: FiStar,       label: 'Reviews' },
  { to: '/admin/analytics',  icon: FiBarChart2,  label: 'Analytics' },
];

const AdminLayout = ({ children }) => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-dark">
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64
        bg-white dark:bg-dark-card border-r border-gray-100 dark:border-dark-border
        transform transition-transform duration-300 flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100 dark:border-dark-border">
          <Link to="/admin" className="flex items-center gap-2">
            <span className="text-2xl">🍰</span>
            <span className="font-heading font-bold text-primary">Admin Panel</span>
          </Link>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-white shadow-card'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-border hover:text-primary'
                }`
              }
            >
              <item.icon className="w-4.5 h-4.5 flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="px-4 py-4 border-t border-gray-100 dark:border-dark-border">
          <Link to="/" className="flex items-center gap-2 text-xs text-gray-400 hover:text-primary transition-colors">
            <FiHome className="w-4 h-4" />
            Back to Website
          </Link>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white dark:bg-dark-card border-b border-gray-100 dark:border-dark-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
          <button className="lg:hidden btn-ghost p-2 rounded-xl" onClick={() => setSidebarOpen(true)}>
            <FiMenu className="w-5 h-5" />
          </button>
          <h1 className="font-heading font-semibold text-gray-900 dark:text-white text-lg">My Bakery Admin</h1>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold text-sm">{user?.name?.[0]?.toUpperCase()}</span>
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200">{user?.name}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
