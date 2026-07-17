import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiCamera, FiUser, FiPhone, FiSave } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import { userService } from '../../services/index';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import DashboardLayout from '../../components/layout/DashboardLayout';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar?.url || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const fileRef = useRef(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { name: user?.name, phone: user?.phone },
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('name', data.name);
      if (data.phone) formData.append('phone', data.phone);
      if (avatarFile) formData.append('avatar', avatarFile);

      const { data: res } = await userService.updateProfile(formData);
      updateUser(res.user);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Helmet><title>Edit Profile — My Bakery</title></Helmet>

      <div className="max-w-lg">
        <h1 className="section-title mb-6 flex items-center gap-2"><FiUser className="text-primary" />Edit Profile</h1>

        <div className="card p-6 space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                {avatarPreview
                  ? <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  : <span className="text-primary font-bold text-4xl">{user?.name?.[0]?.toUpperCase()}</span>
                }
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-md hover:bg-primary-600 transition-colors"
              >
                <FiCamera className="w-4 h-4" />
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            <p className="text-xs text-gray-400">JPG, PNG or WebP. Max 5MB.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="Priya Sharma"
              icon={FiUser}
              error={errors.name?.message}
              {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Too short' } })}
            />
            <div>
              <label className="label">Email Address</label>
              <input value={user?.email} disabled className="input-field opacity-60 cursor-not-allowed" />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>
            <Input
              label="Phone Number"
              placeholder="+91 98765 43210"
              icon={FiPhone}
              error={errors.phone?.message}
              {...register('phone')}
            />
            <Button type="submit" isLoading={isLoading} size="lg" className="w-full">
              <FiSave className="w-4 h-4" /> Save Changes
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
