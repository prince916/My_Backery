import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiLock } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import { authService } from '../services/authService';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const { token }  = useParams();
  const navigate   = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async ({ password: pw }) => {
    try {
      setIsLoading(true);
      await authService.resetPassword(token, pw);
      toast.success('Password reset successful! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Reset link is invalid or expired');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-dark px-4 py-16">
      <Helmet><title>Reset Password — My Bakery</title></Helmet>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="card p-8 text-center">
          <span className="text-5xl">🔑</span>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mt-4 mb-2">Set New Password</h2>
          <p className="text-gray-400 text-sm mb-6">Choose a strong password for your account.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
            <Input
              label="New Password"
              type="password"
              placeholder="Min 8 characters"
              icon={FiLock}
              error={errors.password?.message}
              {...register('password', { required: 'Password required', minLength: { value: 8, message: 'At least 8 characters' } })}
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Repeat password"
              icon={FiLock}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Please confirm',
                validate: (val) => val === password || 'Passwords do not match',
              })}
            />
            <Button type="submit" isLoading={isLoading} className="w-full" size="lg">Reset Password</Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
