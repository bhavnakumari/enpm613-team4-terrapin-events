import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import umdArenaImage from 'figma:asset/3fc834086fb25400b52cb9a396ec6c845aa019d4.png';
import umdLogo from 'figma:asset/189578bb779c335a21221fb95ce560ad61750ffc.png';

export function LoginPage() {
  const [directoryId, setDirectoryId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(directoryId, password);
      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src={umdArenaImage}
          alt="University of Maryland Arena"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#E21833]/20 dark:bg-[#C11528]/30" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-white max-w-md">
            <h2 className="mb-4 text-white font-bold">
              Welcome to UMD Events
            </h2>
            <p className="text-xl text-white/90">
              Join thousands of students discovering and creating amazing campus experiences.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
        {/* Decorative Graphics - UMD Style */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Large Diagonal Stripe - Top Right */}
          <div
            className="absolute -top-32 -right-32 w-96 h-96 bg-[#E21833]/8 dark:bg-[#E21833]/5"
            style={{ transform: 'rotate(-25deg)' }}
          />

          {/* Diagonal Stripe - Bottom Left */}
          <div
            className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-[#E21833]/10 dark:bg-[#E21833]/6"
            style={{ transform: 'rotate(35deg)' }}
          />

          {/* Yellow/Gold Accent Rectangles (Maryland colors) */}
          <div
            className="absolute top-20 right-12 w-32 h-32 bg-[#FFD100]/15 dark:bg-[#FFD100]/8"
            style={{ transform: 'rotate(-15deg)' }}
          />

          <div
            className="absolute bottom-32 left-16 w-40 h-40 bg-[#FFD100]/12 dark:bg-[#FFD100]/6"
            style={{ transform: 'rotate(20deg)' }}
          />

          {/* Angular Geometric Shapes */}
          <svg
            className="absolute top-1/4 right-16 w-40 h-40 text-[#E21833]/8 dark:text-[#E21833]/5"
            viewBox="0 0 200 200"
          >
            <polygon points="50,0 200,80 150,200 0,120" fill="currentColor" />
          </svg>

          <svg
            className="absolute bottom-1/4 left-20 w-32 h-32 text-[#E21833]/10 dark:text-[#E21833]/6"
            viewBox="0 0 200 200"
          >
            <polygon points="100,0 200,100 100,200 0,100" fill="currentColor" />
          </svg>

          {/* Small Accent Shapes */}
          <div
            className="absolute top-40 left-1/4 w-20 h-20 bg-[#E21833]/12 dark:bg-[#E21833]/7"
            style={{ transform: 'rotate(45deg)' }}
          />

          <div
            className="absolute bottom-1/3 right-1/4 w-16 h-16 bg-[#FFD100]/18 dark:bg-[#FFD100]/10"
            style={{ transform: 'rotate(-30deg)' }}
          />

          {/* Diagonal Lines */}
          <svg
            className="absolute top-0 right-0 w-full h-full text-[#E21833]/5 dark:text-[#E21833]/3"
            viewBox="0 0 1000 1000"
          >
            <line x1="800" y1="0" x2="1000" y2="200" stroke="currentColor" strokeWidth="3" />
            <line x1="850" y1="0" x2="1000" y2="150" stroke="currentColor" strokeWidth="2" />
            <line x1="0" y1="800" x2="200" y2="1000" stroke="currentColor" strokeWidth="3" />
            <line x1="0" y1="850" x2="150" y2="1000" stroke="currentColor" strokeWidth="2" />
          </svg>

          {/* Overlapping Transparent Rectangles */}
          <div
            className="absolute top-1/3 right-1/3 w-48 h-48 border-4 border-[#E21833]/15 dark:border-[#E21833]/10"
            style={{ transform: 'rotate(15deg)' }}
          />

          <div
            className="absolute bottom-1/3 left-1/3 w-36 h-36 border-3 border-[#FFD100]/20 dark:border-[#FFD100]/12"
            style={{ transform: 'rotate(-20deg)' }}
          />

          {/* Angular Corner Accents */}
          <svg
            className="absolute top-0 left-0 w-32 h-32 text-[#E21833]/12 dark:text-[#E21833]/7"
            viewBox="0 0 100 100"
          >
            <polygon points="0,0 100,0 0,100" fill="currentColor" />
          </svg>

          <svg
            className="absolute bottom-0 right-0 w-40 h-40 text-[#FFD100]/15 dark:text-[#FFD100]/8"
            viewBox="0 0 100 100"
          >
            <polygon points="100,100 0,100 100,0" fill="currentColor" />
          </svg>
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="flex justify-center mb-4">
              <motion.img
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                src={umdLogo}
                alt="University of Maryland"
                className="h-24 w-auto"
              />
            </div>
            <h1 className="mb-2 text-gray-900 dark:text-white">Sign In</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Access your event management account
              Via UMD CAS Authentication
            </p>
          </motion.div>

          {/* Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Directory ID Field */}
                <div className="space-y-2">
                  <Label htmlFor="directoryId" className="text-gray-700 dark:text-gray-300">
                    Directory ID
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="directoryId"
                      type="text"
                      placeholder="Enter your UMD Directory ID"
                      value={directoryId}
                      onChange={(e) => setDirectoryId(e.target.value)}
                      className="pl-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    />
                    <Label
                      htmlFor="remember"
                      className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
                    >
                      Remember me
                    </Label>
                  </div>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-[#E21833] dark:text-[#FF4458] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    className="w-full bg-[#E21833] hover:bg-[#C11528] text-white dark:bg-[#C11528] dark:hover:bg-[#A01020]"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </motion.div>
              </form>
            </Card>
          </motion.div>

          {/* Back to Landing */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 text-center"
          >
            <Link
              to="/"
              className="text-sm text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              ← Back to Home
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}