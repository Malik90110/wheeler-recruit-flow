
import React from 'react';
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  Trophy, 
  Calendar, 
  FileText,
  Settings
} from 'lucide-react';
import { useUserRoles } from '@/hooks/useUserRoles';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  const { isManager, loading } = useUserRoles();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'logger', label: 'Activity Logger', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'contests', label: 'Contests', icon: Trophy },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'bulletin', label: 'Bulletin Board', icon: FileText },
  ];

  // Add User Management for managers and admins
  if (!loading && isManager) {
    menuItems.push({ id: 'users', label: 'User Management', icon: Settings });
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">WorkHub</h2>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                  : 'text-gray-700'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
