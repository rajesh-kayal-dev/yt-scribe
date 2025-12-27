import { useEffect } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { getCurrentUser } from '../../api/auth';

export function AuthSuccessPage({ onAuthSuccess, onNavigate }) {
  useEffect(() => {
    async function handleAuthSuccess() {
      const search = window.location.search || '';
      const params = new URLSearchParams(search);
      const token = params.get('token');

      if (token) {
        try {
          // Optional: Store token if you also use localStorage-based auth somewhere
          window.localStorage.setItem('authToken', token);
        } catch (e) {
          // Ignore storage errors
        }
      }

      try {
        const data = await getCurrentUser();
        if (onAuthSuccess) {
          onAuthSuccess(data.user || null);
        }
        toast.success('Signed in successfully');
        onNavigate('home');
      } catch (error) {
        toast.error('Authentication failed');
        onNavigate('login');
      }
    }

    handleAuthSuccess();
  }, [onAuthSuccess, onNavigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-3"
      >
        <p className="text-lg font-medium">Completing sign-in…</p>
        <p className="text-sm text-muted-foreground">
          Please wait while we finalize your login.
        </p>
      </motion.div>
    </div>
  );
}
