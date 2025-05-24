import React from 'react';
import { Link, useLocation } from 'react-router-dom'; // Will be used once routing is set up
import { useAuth } from '../../hooks/useAuth';

const Navbar: React.FC = () => {
  const { authState, signOutUser } = useAuth();
  const location = useLocation(); // To highlight the active link

  // Define NavLink items
  // The actual 'to' paths will depend on the router setup (e.g. with or without a base path like /my-screen-time-app/)
  // For now, assuming paths are from the root of where the app is served.
  const navItems = [
    { path: '/home', label: 'Home' },
    { path: '/history', label: 'History' },
    { path: '/timeline', label: 'Timeline' },
    { path: '/settings', label: 'Settings' },
  ];

  // Placeholder for Link component if react-router-dom is not fully integrated yet in the test environment.
  // In a real scenario, Link from react-router-dom would be used.
  const RouterLink = Link; // or ({to, children, className}) => <a href={`#${to}`} className={className}>{children}</a>;


  if (!authState.user) {
    return null; // Don't show navbar if user is not signed in (or show a minimal one)
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <RouterLink to="/home" className="text-2xl font-bold text-blue-600">
              ScreenTime
            </RouterLink>
          </div>
          <div className="hidden md:flex space-x-4">
            {navItems.map((item) => (
              <RouterLink
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium
                  ${location.pathname === item.path || (location.pathname === '/' && item.path === '/home') 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}
              >
                {item.label}
              </RouterLink>
            ))}
          </div>
          <div className="hidden md:block">
             <button
                 onClick={signOutUser}
                 className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-white bg-red-500 hover:bg-red-600"
             >
                 Sign Out
             </button>
          </div>
          {/* Mobile menu button (optional, can be added later if needed) */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
