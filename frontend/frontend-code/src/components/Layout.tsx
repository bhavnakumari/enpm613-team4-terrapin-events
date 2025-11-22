import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, ChevronDown, Home, Moon, Sun, User, LogOut, Settings, BarChart3 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import umdLogo from 'figma:asset/8ef10b040742fd233b03a0b22231b3a8da677868.png';
import umdSeal from 'figma:asset/34a60833cb29dc738c67a734f46659394aa1e0fe.png';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAdmin, isOrganizer } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <header className="bg-card border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Link to="/" className="flex items-center gap-3">
              <img 
                src={umdSeal} 
                alt="University of Maryland Seal" 
                className="h-12 w-auto object-contain"
              />
              <span className="text-gray-900 dark:text-white font-bold">
                University of Maryland
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-6 text-sm">
              <Link
                to="/"
                className={`hover:text-[#E21833] transition-colors ${
                  isActive('/') ? 'text-[#E21833]' : ''
                }`}
              >
                Home
              </Link>
              <Link
                to="/events"
                className={`hover:text-[#E21833] transition-colors ${
                  isActive('/events') ? 'text-[#E21833]' : ''
                }`}
              >
                Events Catalog
              </Link>
              {isOrganizer && (
                <Link
                  to="/create-event"
                  className={`hover:text-[#E21833] transition-colors ${
                    isActive('/create-event') ? 'text-[#E21833]' : ''
                  }`}
                >
                  Create Event
                </Link>
              )}
              {(isAdmin || isOrganizer) && (
                <Link
                  to="/analytics"
                  className={`hover:text-[#E21833] transition-colors ${
                    isActive('/analytics') ? 'text-[#E21833]' : ''
                  }`}
                >
                  Analytics
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`hover:text-[#E21833] transition-colors ${
                    isActive('/admin') ? 'text-[#E21833]' : ''
                  }`}
                >
                  Admin
                </Link>
              )}
            </nav>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="hover:bg-muted h-auto p-2"
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors">
                  <div className="w-8 h-8 bg-[#E21833] dark:bg-[#C11528] rounded-full flex items-center justify-center text-white">
                    <User className="w-4 h-4" />
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm">
                  <div>{user?.name || 'John Terp'}</div>
                  <div className="text-xs text-muted-foreground">{user?.email || 'john@umd.edu'}</div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="w-4 h-4 mr-2" />
                  Profile & Registrations
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate('/analytics')}>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    My Analytics
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-card border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="mb-4">About</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/" className="hover:text-[#E21833]">About Us</Link></li>
                <li><Link to="/" className="hover:text-[#E21833]">Contact</Link></li>
                <li><Link to="/" className="hover:text-[#E21833]">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4">Events</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/events" className="hover:text-[#E21833]">Browse Events</Link></li>
                <li><Link to="/create-event" className="hover:text-[#E21833]">Create Event</Link></li>
                <li><Link to="/events" className="hover:text-[#E21833]">Event Guidelines</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/" className="hover:text-[#E21833]">Help Center</Link></li>
                <li><Link to="/" className="hover:text-[#E21833]">Safety</Link></li>
                <li><Link to="/" className="hover:text-[#E21833]">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4">Connect</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-[#E21833]">Twitter</a></li>
                <li><a href="#" className="hover:text-[#E21833]">Instagram</a></li>
                <li><a href="#" className="hover:text-[#E21833]">Facebook</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2025 University of Maryland. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}