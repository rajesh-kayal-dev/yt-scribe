import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, Chrome, Github, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Separator } from '../ui/separator';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner';
import { loginUser } from '../../api/auth';

// Props:
// - onNavigate(page): tell the App which page to show next
// - onAuthSuccess(user): called when login succeeds so App can store the user
export function LoginPage({ onNavigate, onAuthSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // Call the backend /api/auth/login API
  // On success, the backend sets HTTP-only cookies and returns basic user info
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await loginUser({ email, password });
      if (onAuthSuccess) {
        onAuthSuccess(data.user);
      }
      toast.success(data.message || 'Welcome back!');
      onNavigate('home');
    } catch (error) {
      toast.error(error.message || 'Failed to log in');
    } finally {
      setLoading(false);
    }
  };

  const API_URL = 'http://localhost:5000';

  // For OAuth, we simply redirect the browser to the backend OAuth route
  const handleSocialLogin = (provider) => {
    if (provider === 'google') {
      window.location.href = `${API_URL}/api/auth/google`;
    } else if (provider === 'github') {
      window.location.href = `${API_URL}/api/auth/github`;
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Graphic */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-accent to-primary p-12 flex-col justify-between relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <h1 className="text-4xl text-white mb-4">Welcome Back to YTScribe</h1>
          <p className="text-white/90 text-lg">
            Continue your learning journey with AI-powered tools and smart organization.
          </p>
        </motion.div>

        {/* Decorative Elements */}
        <div className="relative z-10 space-y-6">
          {[
            { icon: '📚', text: 'Organize your learning with playlists' },
            { icon: '✨', text: 'AI-generated notes from videos' },
            { icon: '📊', text: 'Track your progress and achievements' },
            { icon: '⏱️', text: 'Study smarter with Pomodoro timer' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="flex items-center gap-3 text-white"
            >
              <div className="text-3xl">{item.icon}</div>
              <span className="text-lg">{item.text}</span>
            </motion.div>
          ))}
        </div>

        {/* Background Decorations */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
          className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="absolute top-4 left-4">
          <Button
            type="button"
            variant="ghost"
            className="flex items-center gap-2"
            onClick={() => {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                onNavigate('home');
              }
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl mb-2">Sign In</h2>
            <p className="text-muted-foreground">
              Welcome back! Please enter your details
            </p>
          </div>

          <Card className="p-8 border-primary/20">
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Input */}
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

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-sm">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(!!checked)}
                  />
                  <label htmlFor="remember" className="text-sm cursor-pointer">
                    Remember me
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('forgot')}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>

              {/* Divider */}
              <div className="relative">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                  Or continue with
                </span>
              </div>

              {/* Social Login */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSocialLogin('google')}
                >
                  <Chrome className="w-4 h-4 mr-2" />
                  Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSocialLogin('github')}
                >
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </Button>
              </div>
            </form>
          </Card>

          {/* Sign Up Link */}
          <p className="text-center mt-6 text-sm text-muted-foreground">
            Don't have an account?{' '}
            <button
              onClick={() => onNavigate('register')}
              className="text-primary hover:underline"
            >
              Sign up for free
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
