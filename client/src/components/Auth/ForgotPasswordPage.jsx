import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { toast } from 'sonner';
import { requestPasswordReset } from '../../api/auth';

export function ForgotPasswordPage({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await requestPasswordReset(email);
      setEmailSent(true);
      toast.success(data.message || 'Password reset link sent!');
    } catch (error) {
      toast.error(error.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-background via-background to-accent/5">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Button
          variant="ghost"
          onClick={() => onNavigate('login')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
        </Button>

        <Card className="p-8 border-primary/20">
          {!emailSent ? (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl mb-2">Forgot Password?</h2>
                <p className="text-sm text-muted-foreground">
                  No worries, we'll send you reset instructions
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-2xl mb-2">Check Your Email</h2>
              <p className="text-sm text-muted-foreground mb-6">
                We sent a password reset link to
              </p>
              <p className="text-sm mb-6">{email}</p>
              <p className="text-xs text-muted-foreground mb-6">
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => setEmailSent(false)}
                  className="text-primary hover:underline"
                >
                  try another email
                </button>
              </p>
              <Button
                onClick={() => onNavigate('login')}
                variant="outline"
                className="w-full"
              >
                Back to Login
              </Button>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
