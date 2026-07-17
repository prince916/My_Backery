import { NavLink, Outlet } from 'react-router-dom';
import { FiUser, FiPackage, FiHeart, FiMapPin, FiSettings, FiChevronRight } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard',            icon: FiUser,     label: 'Overview',        end: true },
  { to: '/dashboard/profile',    icon: FiUser,     label: 'Profile' },
  { to: '/dashboard/orders',     icon: FiPackage,  label: 'My Orders' },
  { to: '/dashboard/wishlist',   icon: FiHeart,    label: 'Wishlist' },
  { to: '/dashboard/addresses',  icon: FiMapPin,   label: 'Addresses' },
  { to: '/dashboard/settings',   icon: FiSettings, label: 'Settings' },
];

export default function DashboardLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-5">
              {/* User info */}
              <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100 dark:border-dark-border">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {user?.avatar?.url
                    ? <img src={user.avatar.url} alt={user?.name} className="w-full h-full object-cover" />
                    : <span className="text-primary font-bold text-xl">{user?.name?.[0]?.toUpperCase()}</span>
                  }
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>
              </div>

              {/* Nav */}
              <nav className="space-y-0.5">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                        isActive ? 'bg-primary/10 text-primary' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-border hover:text-primary'
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    <FiChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
