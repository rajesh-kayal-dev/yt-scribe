import { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Lock, Eye, EyeOff, Chrome, Github } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Separator } from '../ui/separator';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner';
import { registerUser } from '../../api/auth';

// Props:
// - onNavigate(page): tell the App which page to show next
// - onAuthSuccess(user): called when registration succeeds so App can store the user
export function RegisterPage({ onNavigate, onAuthSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!agreedToTerms) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    setLoading(true);

    try {
      const data = await registerUser({ name, email, password, confirmPassword });
      if (onAuthSuccess) {
        onAuthSuccess(data.user);
      }
      toast.success(data.message || 'Account created successfully!');
      onNavigate('home');
    } catch (error) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignup = (provider) => {
    if (provider === 'Google') {
      window.location.href = 'http://localhost:5000/api/auth/google';
    } else if (provider === 'GitHub') {
      window.location.href = 'http://localhost:5000/api/auth/github';
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Graphic */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-accent via-primary to-accent p-12 flex-col justify-between relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <h1 className="text-4xl text-white mb-4">Start Your Learning Journey</h1>
          <p className="text-white/90 text-lg">
            Join thousands of learners using YTScribe to study smarter and achieve more.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-2 gap-6">
          {[
            { number: '10K+', label: 'Active Learners' },
            { number: '50K+', label: 'Videos Organized' },
            { number: '100K+', label: 'Notes Created' },
            { number: '4.9★', label: 'User Rating' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="text-white"
            >
              <div className="text-3xl mb-1">{stat.number}</div>
              <div className="text-white/80 text-sm">{stat.label}</div>
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

      {/* Right Panel - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md my-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl mb-2">Create Account</h2>
            <p className="text-muted-foreground">
              Get started with your free account
            </p>
          </div>

          <Card className="p-8 border-primary/20">
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Name Input */}
              <div className="space-y-2">
                <label className="text-sm">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

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
                    placeholder="Create a password"
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

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <label className="text-sm">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(!!checked)}
                  className="mt-1"
                />
                <label htmlFor="terms" className="text-sm cursor-pointer">
                  I agree to the{' '}
                  <a href="#" className="text-primary hover:underline">
                    Terms and Conditions
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                </label>
              </div>

              {/* Register Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>

              {/* Divider */}
              <div className="relative">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                  Or sign up with
                </span>
              </div>

              {/* Social Signup */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSocialSignup('Google')}
                >
                  <Chrome className="w-4 h-4 mr-2" />
                  Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSocialSignup('GitHub')}
                >
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </Button>
              </div>
            </form>
          </Card>

          {/* Login Link */}
          <p className="text-center mt-6 text-sm text-muted-foreground">
            Already have an account?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="text-primary hover:underline"
            >
              Sign in
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
