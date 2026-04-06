import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = user
    ? [
        { to: '/home', label: 'Home' },
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/about', label: 'About' },
      ]
    : [
        { to: '/', label: 'Home' },
        { to: '/about', label: 'About' },
      ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-indigo-600 text-white shadow-md">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Brand */}
          <Link to={user ? '/home' : '/'} className="text-xl font-bold tracking-tight hover:opacity-90 transition-opacity">
            me-feels
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex sm:items-center sm:gap-6">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors hover:text-indigo-200 ${
                  isActive(link.to) ? 'text-white border-b-2 border-white pb-0.5' : 'text-indigo-200'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {user ? (
              <div className="flex items-center gap-4 ml-2">
                <span className="text-sm text-indigo-200">{user.name ?? user.email}</span>
                <button
                  onClick={logout}
                  className="text-sm font-medium bg-indigo-700 hover:bg-indigo-800 px-3 py-1.5 rounded transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                to="/"
                className="text-sm font-medium bg-white text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden p-2 rounded hover:bg-indigo-700 transition-colors"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden bg-indigo-700 px-4 pb-4 pt-2 space-y-2">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`block text-sm font-medium py-1.5 ${
                isActive(link.to) ? 'text-white' : 'text-indigo-200 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <p className="text-sm text-indigo-300 py-1.5">{user.name ?? user.email}</p>
              <button
                onClick={() => { logout(); setMenuOpen(false); }}
                className="block w-full text-left text-sm font-medium text-indigo-200 hover:text-white py-1.5"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="block text-sm font-medium text-indigo-200 hover:text-white py-1.5"
            >
              Sign in
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
