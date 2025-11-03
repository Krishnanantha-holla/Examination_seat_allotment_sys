import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Header, Sidebar } from '../components/Layout';
import { BarChart3, Users, BookOpen, Layers } from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const stats = [
    { label: 'Total Exams', value: '0', icon: BookOpen, color: 'bg-blue-500' },
    { label: 'Total Students', value: '0', icon: Users, color: 'bg-green-500' },
    { label: 'Total Classrooms', value: '0', icon: Layers, color: 'bg-purple-500' },
    { label: 'Allocations Done', value: '0', icon: BarChart3, color: 'bg-orange-500' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, {user?.full_name}! 👋
              </h1>
              <p className="text-gray-600 mt-2">Here's your system overview</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                      </div>
                      <div className={`${stat.color} p-3 rounded-lg`}>
                        <Icon className="text-white" size={24} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Quick Actions</h2>
                <div className="space-y-2">
                  <a href="/exams" className="block p-3 hover:bg-blue-50 rounded-lg text-blue-600 font-medium">→ Manage Exams</a>
                  <a href="/students" className="block p-3 hover:bg-green-50 rounded-lg text-green-600 font-medium">→ Manage Students</a>
                  <a href="/classrooms" className="block p-3 hover:bg-purple-50 rounded-lg text-purple-600 font-medium">→ Manage Classrooms</a>
                  <a href="/seating" className="block p-3 hover:bg-orange-50 rounded-lg text-orange-600 font-medium">→ Allocate Seats</a>
                </div>
              </div>

              <div className="card">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Recent Activity</h2>
                <div className="text-gray-600 text-center py-8">
                  <p>No recent activity</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
