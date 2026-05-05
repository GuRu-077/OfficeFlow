'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Bell, Search, Menu, Check, Moon, Sun, LogOut, Settings, User as UserIcon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Notification } from '@/lib/types';
import { formatDistanceToNow, parseISO } from 'date-fns';

export function Header() {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  useEffect(() => {
    if (user) {
      db.getNotifications(user.id).then(n => {
        if (n.length === 0) {
          setNotifications([
            { id: '1', recipientId: user.id, type: 'info', message: 'Your meeting "Team Sync" was confirmed.', readStatus: false, createdAt: new Date().toISOString() },
            { id: '2', recipientId: user.id, type: 'warning', message: 'Boardroom A is under maintenance.', readStatus: true, createdAt: new Date(Date.now() - 3600000).toISOString() },
          ]);
        } else {
          setNotifications(n);
        }
      });
    }
  }, [user]);

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const unreadCount = notifications.filter(n => !n.readStatus).length;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, readStatus: true } : n));
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'info': return 'text-blue-500';
      case 'warning': return 'text-orange-500';
      case 'success': return 'text-emerald-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-50">
      <div className="flex items-center flex-1">
        <button className="p-2 -ml-2 mr-2 md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <Menu className="w-6 h-6" />
        </button>
        <div className="max-w-md w-full relative hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
            placeholder="Search meetings, rooms, or people..."
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4 relative">
        {/* Dark Mode Toggle */}
        <button 
          onClick={toggleDarkMode}
          className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none transition-colors"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button 
            className="relative p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden z-50">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/80">
                <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                <button 
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700"
                  onClick={() => setNotifications(notifications.map(n => ({ ...n, readStatus: true })))}
                >
                  Mark all read
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                {notifications.length > 0 ? (
                  notifications.map(notification => (
                    <div key={notification.id} className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${!notification.readStatus ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}>
                      <div className="flex justify-between items-start gap-3">
                        <div className={`mt-0.5 ${getIconColor(notification.type)}`}>
                          <Bell className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm ${!notification.readStatus ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-600 dark:text-gray-300'}`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {formatDistanceToNow(parseISO(notification.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        {!notification.readStatus && (
                          <button 
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md text-gray-400 hover:text-emerald-500 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                    No new notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button 
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
            className="flex items-center gap-3 border-l border-gray-200 dark:border-gray-700 pl-4 focus:outline-none"
          >
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-medium text-gray-900 dark:text-white leading-none">{user.name}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{user.role}</span>
            </div>
            <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800 hover:ring-2 ring-indigo-500 transition-all">
              {user.name.charAt(0)}
            </div>
          </button>

          {showProfile && (
            <div className="absolute right-0 top-12 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden z-50">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <p className="font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
              </div>
              <div className="p-2 space-y-1">
                <Link href="/dashboard/profile" onClick={() => setShowProfile(false)} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors text-left">
                  <UserIcon className="w-4 h-4 text-gray-400" />
                  My Profile
                </Link>
                <Link href="/dashboard/settings" onClick={() => setShowProfile(false)} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors text-left">
                  <Settings className="w-4 h-4 text-gray-400" />
                  Settings
                </Link>
              </div>
              <div className="p-2 border-t border-gray-100 dark:border-gray-700">
                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
