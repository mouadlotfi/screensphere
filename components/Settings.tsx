'use client';

import { FormEvent, useMemo, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';

export default function Settings() {
  const searchParams = useSearchParams();

  // Name update state
  const [newName, setNewName] = useState<string>('');
  const [isUpdatingName, setIsUpdatingName] = useState<boolean>(false);

  // Password update state
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  // Email update state
  const [newEmail, setNewEmail] = useState<string>('');
  const [isUpdatingEmail, setIsUpdatingEmail] = useState<boolean>(false);

  // Delete account state
  const [deletePassword, setDeletePassword] = useState<string>('');
  const [isDeletingAccount, setIsDeletingAccount] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [showDeletePassword, setShowDeletePassword] = useState<boolean>(false);

  const { supabase, user, refreshUser } = useAuth();
  const router = useRouter();

  const isFormValid = useMemo(
    () => Boolean(currentPassword && newPassword && confirmPassword && newPassword === confirmPassword && newPassword.length >= 8),
    [confirmPassword, currentPassword, newPassword],
  );

  // Initialize name field with current user name
  useEffect(() => {
    if (user?.name) {
      setNewName(user.name);
    }
  }, [user?.name]);

  // Show success message if redirected after email change and refresh user data
  useEffect(() => {
    if (searchParams.get('email_changed') === 'true') {
      // Refresh user data to get the updated email
      refreshUser();
      toast.success('Your email address has been updated successfully!', {
        position: 'top-center',
      });
      // Clean up the URL
      router.replace('/settings');
    }
  }, [searchParams, router, refreshUser]);

  const updateName = async () => {
    if (!newName || !newName.trim()) {
      toast.error('Please enter a name.');
      return;
    }

    if (newName.trim() === user?.name) {
      toast.error('This is already your current name.');
      return;
    }

    if (!supabase || !user) {
      toast.error('You must be signed in to update your name.');
      return;
    }

    setIsUpdatingName(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: { name: newName.trim() },
      });

      if (error) {
        toast.error(error.message || 'Unable to update name. Please try again.', {
          position: 'top-center',
        });
        return;
      }

      // Refresh user data to reflect the change
      await refreshUser();

      toast.success('Name updated successfully!', {
        position: 'top-center',
      });
    } catch {
      toast.error('Unable to update name. Please try again.', { position: 'top-center' });
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleNameSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await updateName();
  };

  const updatePassword = async () => {
    if (!isFormValid) {
      toast.error('Passwords must match and be at least 8 characters long.');
      return;
    }

    if (!supabase || !user?.email) {
      toast.error('You must be signed in to update your password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (verifyError) {
        toast.error('Current password is incorrect.', { position: 'top-center' });
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        toast.error(error.message || 'Unable to update password. Please try again.', {
          position: 'top-center',
        });
        return;
      }

      toast.success('Password updated successfully', { position: 'top-center' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast.error('Unable to update password. Please try again.', { position: 'top-center' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await updatePassword();
  };

  const updateEmail = async () => {
    if (!newEmail || !newEmail.trim()) {
      toast.error('Please enter a new email address.');
      return;
    }

    if (newEmail === user?.email) {
      toast.error('This is already your current email address.');
      return;
    }

    if (!supabase || !user) {
      toast.error('You must be signed in to update your email.');
      return;
    }

    setIsUpdatingEmail(true);

    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail.trim(),
      });

      if (error) {
        toast.error(error.message || 'Unable to update email. Please try again.', {
          position: 'top-center',
        });
        return;
      }

      toast.success('Confirmation email sent! Please check both your old and new email addresses.', {
        position: 'top-center',
      });
      setNewEmail('');
    } catch {
      toast.error('Unable to update email. Please try again.', { position: 'top-center' });
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleEmailSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await updateEmail();
  };

  const deleteAccount = async () => {
    if (!deletePassword) {
      toast.error('Please enter your password to confirm account deletion.');
      return;
    }

    try {
      setIsDeletingAccount(true);

      if (!supabase || !user) {
        toast.error('You must be signed in to delete your account.');
        return;
      }

      // Get the current session to get the JWT token
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        toast.error('Unable to verify your session. Please sign in again.');
        return;
      }

      // Call the delete account API
      const response = await fetch('/api/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          password: deletePassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Unable to delete account. Please try again.');
        return;
      }

      toast.success('Account deleted successfully. Redirecting...');

      // Sign out and redirect to home
      await supabase.auth.signOut();
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch {
      toast.error('Unable to delete account. Please try again.');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleDeleteConfirm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    deleteAccount();
  };

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4">
      <div className="w-full rounded-2xl border border-white/10 bg-neutral-900/80 p-8 shadow-2xl">
        {/* Profile Section */}
        <h2 className="text-3xl font-semibold text-white">Profile</h2>
        <p className="mt-2 text-sm text-white/60">
          Update your display name. This is how you&apos;ll appear across ScreenSphere.
        </p>

        <form className="mt-6 space-y-5" onSubmit={handleNameSubmit}>
          <div className="space-y-2">
            <label htmlFor="display-name" className="text-sm font-medium text-white">
              Display name
            </label>
            <input
              id="display-name"
              type="text"
              value={newName}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setNewName(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-white placeholder:text-white/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
              placeholder="Enter your display name"
              required
            />
          </div>

          <button
            type="submit"
            disabled={!newName || newName.trim() === user?.name || isUpdatingName}
            className="w-full rounded-full bg-cyan-600 px-6 py-3 text-sm font-semibold text-black transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:bg-cyan-900 disabled:text-white/50"
          >
            {isUpdatingName ? 'Updating…' : 'Update name'}
          </button>
        </form>

        {/* Password Section */}
        <div className="mt-12 border-t border-white/10 pt-8">
          <h2 className="text-3xl font-semibold text-white">Update password</h2>
          <p className="mt-2 text-sm text-white/60">
            Strengthen your account by choosing a unique passphrase. Your new password needs at least eight characters.
          </p>

          <form
            className="mt-6 space-y-5"
            onSubmit={handleSubmit}
          >
            <div className="space-y-2">
              <label htmlFor="current-password" className="text-sm font-medium text-white">
                Current password
              </label>
              <div className="relative">
                <input
                  id="current-password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => setCurrentPassword(event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-2 pr-12 text-white placeholder:text-white/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                  placeholder="Enter your current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                  aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                >
                  {showCurrentPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="new-password" className="text-sm font-medium text-white">
                  New password
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setNewPassword(event.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-2 pr-12 text-white placeholder:text-white/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                    placeholder="Create a new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirm-password" className="text-sm font-medium text-white">
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(event.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-2 pr-12 text-white placeholder:text-white/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                    placeholder="Repeat new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
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

        {/* Email Section */}
        <div className="mt-12 border-t border-white/10 pt-8">
          <h2 className="text-3xl font-semibold text-white">Update email address</h2>
          <p className="mt-2 text-sm text-white/60">
            Change the email address associated with your account. You&apos;ll need to confirm the change via email.
          </p>

          <form className="mt-6 space-y-5" onSubmit={handleEmailSubmit}>
            <div className="space-y-2">
              <label htmlFor="current-email" className="text-sm font-medium text-white">
                Current email
              </label>
              <input
                id="current-email"
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white/50 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="new-email" className="text-sm font-medium text-white">
                New email address
              </label>
              <input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setNewEmail(event.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-white placeholder:text-white/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                placeholder="Enter your new email address"
                required
              />
            </div>

            <button
              type="submit"
              disabled={!newEmail || isUpdatingEmail}
              className="w-full rounded-full bg-cyan-600 px-6 py-3 text-sm font-semibold text-black transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:bg-cyan-900 disabled:text-white/50"
            >
              {isUpdatingEmail ? 'Sending confirmation…' : 'Update email'}
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="mt-12 border-t border-white/10 pt-8">
          <h3 className="text-lg font-semibold text-red-400">Danger Zone</h3>
          <p className="mt-2 text-sm text-white/60">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="mt-4 rounded-full bg-red-600/20 px-6 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-600/30 border border-red-600/40"
            >
              Delete Account
            </button>
          ) : (
            <form onSubmit={handleDeleteConfirm} className="mt-4 space-y-4 rounded-lg bg-red-600/10 border border-red-600/20 p-4">
              <div className="space-y-2">
                <label htmlFor="delete-password" className="text-sm font-medium text-white">
                  Enter your password to confirm
                </label>
                <div className="relative">
                  <input
                    id="delete-password"
                    type={showDeletePassword ? 'text' : 'password'}
                    value={deletePassword}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setDeletePassword(event.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-lg border border-red-600/40 bg-red-600/10 px-4 py-2 pr-12 text-white placeholder:text-white/40 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500/40"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowDeletePassword(!showDeletePassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                    aria-label={showDeletePassword ? 'Hide password' : 'Show password'}
                  >
                    {showDeletePassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isDeletingAccount || !deletePassword}
                  className="flex-1 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-900 disabled:text-white/50"
                >
                  {isDeletingAccount ? 'Deleting…' : 'Delete Account'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeletePassword('');
                  }}
                  className="flex-1 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
