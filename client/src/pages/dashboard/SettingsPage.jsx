import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiLock, FiShield, FiMoon, FiBell, FiTrash2 } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import { authService } from '../../services/authService';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import DashboardLayout from '../../components/layout/DashboardLayout';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { isDark, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const [passLoading, setPassLoading] = useState(false);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
  const newPassword = watch('newPassword');

  const onPasswordSubmit = async (data) => {
    try {
      setPassLoading(true);
      await authService.updatePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password updated successfully!');
      reset();
    } catch (err) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Helmet><title>Settings — My Bakery</title></Helmet>

      <div className="max-w-lg space-y-6">
        <h1 className="section-title flex items-center gap-2"><FiShield className="text-primary" />Settings</h1>

        {/* Appearance */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><FiMoon className="text-primary" />Appearance</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm text-gray-700 dark:text-gray-300">Dark Mode</p>
              <p className="text-xs text-gray-400 mt-0.5">Switch between light and dark themes</p>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isDark ? 'bg-primary' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${isDark ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>

        {/* Change password */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><FiLock className="text-primary" />Change Password</h2>
          <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              placeholder="Current password"
              icon={FiLock}
              error={errors.currentPassword?.message}
              {...register('currentPassword', { required: 'Required' })}
            />
            <Input
              label="New Password"
              type="password"
              placeholder="Min 8 characters"
              icon={FiLock}
              error={errors.newPassword?.message}
              {...register('newPassword', { required: 'Required', minLength: { value: 8, message: 'At least 8 characters' } })}
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Repeat new password"
              icon={FiLock}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Required',
                validate: (val) => val === newPassword || 'Passwords do not match',
              })}
            />
            <Button type="submit" isLoading={passLoading} className="w-full">Update Password</Button>
          </form>
        </div>

        {/* Danger zone */}
        <div className="card p-5 border-red-200 dark:border-red-900/50">
          <h2 className="font-semibold text-red-500 mb-4 flex items-center gap-2"><FiTrash2 />Danger Zone</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Logging out will clear your session. You'll need to sign in again.</p>
          <Button variant="danger" onClick={logout}>Logout from Account</Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
