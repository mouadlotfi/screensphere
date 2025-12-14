'use client';

import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext.jsx';

export default function Settings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { supabase, user } = useAuth();

  const isFormValid = useMemo(
    () => Boolean(currentPassword && newPassword && confirmPassword && newPassword === confirmPassword && newPassword.length >= 8),
    [confirmPassword, currentPassword, newPassword],
  );

  const updatePassword = async () => {
    if (!isFormValid) {
      toast.error('Passwords must match and be at least 8 characters long.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (!supabase || !user?.email) {
        toast.error('You must be signed in to update your password.');
        return;
      }

      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (verifyError) {
        toast.error('Current password is incorrect.', { position: toast.POSITION.TOP_CENTER });
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        toast.error(error.message || 'Unable to update password. Please try again.', {
          position: toast.POSITION.TOP_CENTER,
        });
        return;
      }

      toast.success('Password updated successfully', { position: toast.POSITION.TOP_CENTER });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error('Unable to update password. Please try again.', { position: toast.POSITION.TOP_CENTER });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4">
      <div className="w-full rounded-2xl border border-white/10 bg-neutral-900/80 p-8 shadow-2xl">
        <h2 className="text-3xl font-semibold text-white">Update password</h2>
        <p className="mt-2 text-sm text-white/60">
          Strengthen your account by choosing a unique passphrase. Your new password needs at least eight characters.
        </p>

        <form
          className="mt-6 space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            updatePassword();
          }}
        >
          <div className="space-y-2">
            <label htmlFor="current-password" className="text-sm font-medium text-white">
              Current password
            </label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-white placeholder:text-white/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
              placeholder="Enter your current password"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="new-password" className="text-sm font-medium text-white">
                New password
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-white placeholder:text-white/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                placeholder="Create a new password"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-medium text-white">
                Confirm password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-white placeholder:text-white/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                placeholder="Repeat new password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="w-full rounded-full bg-cyan-600 px-6 py-3 text-sm font-semibold text-black transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:bg-cyan-900 disabled:text-white/50"
          >
            {isSubmitting ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
}
