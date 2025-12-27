import { motion } from 'motion/react';
import { Youtube, Sparkles, Menu, X, User, Settings, Crown, LogOut, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { ThemeSelector } from './ThemeSelector';
import { useState } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';

interface HeaderProps {
  activeSection: string;
  setActiveSection: (section: any) => void;
  currentUser?: {
    name?: string;
    email?: string;
    role?: string;
    avatarUrl?: string;
  } | null;
  onLogout?: () => void;
}

const IconButton: any = Button;

export function Header({ activeSection, setActiveSection, currentUser, onLogout }: HeaderProps) {

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');

  const displayName = currentUser?.name || currentUser?.email || 'Guest';
  const initials = displayName
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'playlist', label: 'Playlist' },
    { id: 'marketplace', label: 'Marketplace' },
    { id: 'notes', label: 'Notes' },
    { id: 'analytics', label: 'Learning Analytics' },
    { id: 'services', label: 'Services' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
    { id: 'premium', label: 'Premium' },
  ];

  const handleFontSizeChange = (size: 'small' | 'medium' | 'large') => {
    setFontSize(size);
    document.documentElement.style.fontSize =
      size === 'small' ? '14px' : size === 'large' ? '18px' : '16px';
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="site-header sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-primary/20"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-2 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={() => setActiveSection('home')}
          >
            <div className="relative">
              <Youtube className="w-8 h-8 text-primary" />
              <motion.div
                className="absolute -top-1 -right-1"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4 text-accent" />
              </motion.div>
            </div>
            <div className="flex flex-col items-start leading-tighter pt-0.5">
              <span className="text-2xl bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                YTScribe
              </span>

              <i className="text-sm text-muted-foreground mt-1 text-xs">Transform YouTube content with AI</i>

            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-4">
            {navItems.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => setActiveSection(item.id as any)}
                className={`relative px-3 py-2 transition-colors ${activeSection === item.id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.label}
                {activeSection === item.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent"
                  />
                )}
              </motion.button>
            ))}
          </nav>

          {/* Theme Selector, Profile & Mobile Menu */}
          <div className="flex items-center gap-3">
            <ThemeSelector />

            {/* Profile Dropdown / Login avatar */}
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <IconButton
                    variant="outline"
                    size="icon"
                    className="hidden md:flex rounded-full p-0 w-10 h-10 bg-muted overflow-hidden"
                  >
                    <Avatar className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
                      {currentUser?.avatarUrl ? (
                        <AvatarImage src={currentUser.avatarUrl} className="object-cover w-full h-full" />
                      ) : (
                        <AvatarFallback className="bg-purple-500 text-white font-semibold text-lg flex items-center justify-center w-full h-full">
                          {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </IconButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setActiveSection('profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setActiveSection('premium')}>
                      <Crown className="mr-2 h-4 w-4" />
                      <span>Upgrade to Premium</span>
                    </DropdownMenuItem>
                    {currentUser.role === 'admin' && (
                      <DropdownMenuItem onClick={() => setActiveSection('admin')}>
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Admin Panel</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <div className="px-2 py-2">
                      <label className="text-sm text-muted-foreground mb-2 block">Font Size</label>
                      <Select value={fontSize} onValueChange={(value: any) => handleFontSizeChange(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        if (onLogout) onLogout();
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <IconButton
                variant="outline"
                size="icon"
                className="hidden md:flex rounded-full p-0 w-10 h-10 bg-muted overflow-hidden"
                onClick={() => setActiveSection('login')}
              >
                <Avatar className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
                  <AvatarFallback className="bg-purple-500 text-white font-semibold text-lg flex items-center justify-center w-full h-full">
                    U
                  </AvatarFallback>
                </Avatar>
              </IconButton>
            )}

            <IconButton
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </IconButton>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden mt-4 pb-4 space-y-2"
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id as any);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${activeSection === item.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent/10'
                  }`}
              >
                {item.label}
              </button>
            ))}
          </motion.nav>
        )}
      </div>
    </motion.header>
  );
}