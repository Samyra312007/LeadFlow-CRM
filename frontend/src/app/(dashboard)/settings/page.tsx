'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type PasswordForm = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (values: PasswordForm) => {
    setSubmitting(true);
    try {
      await api.put('/auth/password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success('Password updated successfully');
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary">Settings</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">Manage your account settings.</p>
      </div>

      <Card>
        <CardHeader>
          <h3 className="font-headline-sm text-headline-sm text-primary">Profile</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-bold text-2xl">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-label-md text-label-md text-primary font-semibold">{user?.name}</p>
              <p className="text-body-sm text-on-surface-variant">{user?.email}</p>
              <p className="text-body-sm text-on-surface-variant capitalize">{user?.role}</p>
            </div>
          </div>
          <Button variant="outline" onClick={logout}>
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Sign Out
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="font-headline-sm text-headline-sm text-primary">Change Password</h3>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input label="Current Password" type="password" placeholder="••••••••" error={errors.currentPassword?.message} {...register('currentPassword')} />
            <Input label="New Password" type="password" placeholder="••••••••" error={errors.newPassword?.message} {...register('newPassword')} />
            <Input label="Confirm New Password" type="password" placeholder="••••••••" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating...
                </span>
              ) : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
