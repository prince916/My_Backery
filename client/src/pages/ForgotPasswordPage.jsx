import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import { authService } from '../services/authService';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async ({ email }) => {
    try {
      setIsLoading(true);
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err) {
      toast.error(err.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-dark px-4 py-16">
      <Helmet><title>Forgot Password — My Bakery</title></Helmet>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="card p-8 text-center">
          <span className="text-5xl">🔐</span>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mt-4">Forgot Password?</h2>

          {sent ? (
            <div className="mt-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✅</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                We've sent a password reset link to your email. Check your inbox and follow the instructions.
              </p>
              <Link to="/login" className="btn-primary mt-6 inline-flex">Back to Login</Link>
            </div>
          ) : (
            <>
              <p className="text-gray-400 text-sm mt-2 mb-6">Enter your email and we'll send you a reset link.</p>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  icon={FiMail}
                  error={errors.email?.message}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
                  })}
                />
                <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
                  Send Reset Link
                </Button>
              </form>
              <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary mt-4 transition-colors">
                <FiArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
