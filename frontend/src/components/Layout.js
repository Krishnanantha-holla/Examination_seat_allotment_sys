import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Menu, X } from 'lucide-react';

export const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { label: 'Dashboard', href: '/dashboard', icon: '📊' },
    { label: 'Exams', href: '/exams', icon: '📝' },
    { label: 'Classrooms', href: '/classrooms', icon: '🏫' },
    { label: 'Students', href: '/students', icon: '👥' },
    { label: 'Seating', href: '/seating', icon: '💺' },
    { label: 'Reports', href: '/reports', icon: '📋' },
  ];

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black bg-opacity-50 lg:hidden ${
          isOpen ? 'block' : 'hidden'
        }`}
        onClick={() => setIsOpen(false)}
      />

      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white z-50 transform transition-transform lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold">ExamSeating</h1>
          <p className="text-gray-400 text-sm">System Admin</p>
        </div>

        <nav className="mt-8">
          {menuItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition"
              onClick={() => setIsOpen(false)}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-700">
          <p className="text-sm text-gray-400 mb-4">
            Logged in as <strong>{user?.full_name}</strong>
          </p>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export const Header = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between p-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <h2 className="text-xl font-bold text-gray-800 flex-1 ml-4 lg:ml-0">Dashboard</h2>
      </div>
    </header>
  );
};
