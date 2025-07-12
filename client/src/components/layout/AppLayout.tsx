import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  X, 
  Search, 
  Bell, 
  Settings, 
  User, 
  LogOut,
  Sun,
  Moon,
  Calculator,
  Users,
  PlaneTakeoff,
  HandHeart,
  Calendar,
  FileText,
  Banknote,
  BarChart3,
  Download,
  Upload,
  Save,
  RefreshCw
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface AppLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSave: () => void;
  onExport: () => void;
  onImport: () => void;
  onRefresh: () => void;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  gradient: string;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'แดชบอร์ด',
    icon: <BarChart3 className="w-5 h-5" />,
    description: 'ภาพรวมและสถิติ',
    color: 'text-blue-600',
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    id: 'employees',
    label: 'พนักงาน',
    icon: <Users className="w-5 h-5" />,
    description: 'ข้อมูลบุคลากร',
    color: 'text-purple-600',
    gradient: 'from-purple-500 to-purple-600'
  },
  {
    id: 'travel',
    label: 'ค่าใช้จ่ายในการเดินทาง',
    icon: <PlaneTakeoff className="w-5 h-5" />,
    description: 'คำนวณค่าเดินทาง',
    color: 'text-orange-600',
    gradient: 'from-orange-500 to-orange-600'
  },
  {
    id: 'assistance',
    label: 'เงินช่วยเหลือ',
    icon: <HandHeart className="w-5 h-5" />,
    description: 'ค่าช่วยเหลือพิเศษ',
    color: 'text-pink-600',
    gradient: 'from-pink-500 to-pink-600'
  },
  {
    id: 'workdays',
    label: 'วันทำงาน',
    icon: <Calendar className="w-5 h-5" />,
    description: 'จัดการวันหยุด',
    color: 'text-indigo-600',
    gradient: 'from-indigo-500 to-indigo-600'
  }
];

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  onSave,
  onExport,
  onImport,
  onRefresh
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  const toggleUserMenu = () => setShowUserMenu(!showUserMenu);

  const activeItem = navigationItems.find(item => item.id === activeTab);

  return (
    <div className={`min-h-screen bg-gray-50 ${isDarkMode ? 'dark' : ''}`}>
      {/* Sidebar */}
      <motion.div
        className={`fixed left-0 top-0 h-full bg-white shadow-xl border-r border-gray-200 z-40 transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-72'
        }`}
        initial={false}
        animate={{ width: sidebarCollapsed ? 64 : 288 }}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">ระบบงบประมาณ</h1>
                  <p className="text-xs text-gray-500">Budget Management</p>
                </div>
              </motion.div>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleSidebar}
              className="p-2 hover:bg-gray-100"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                activeTab === item.id 
                  ? `text-blue-600` 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
              style={{
                boxShadow: activeTab === item.id 
                  ? 'inset 8px 8px 16px #d1d5db, inset -8px -8px 16px #ffffff'
                  : '6px 6px 12px #d1d5db, -6px -6px 12px #ffffff',
                backgroundColor: '#f9fafb'
              }}
              whileHover={{ scale: sidebarCollapsed ? 1 : 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {activeTab === item.id && (
                <motion.div
                  className="absolute inset-0 bg-white/10 rounded-xl"
                  layoutId="activeBackground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
              
              <div className={`${activeTab === item.id ? 'text-blue-600' : item.color} transition-colors`}>
                {item.icon}
              </div>
              
              {!sidebarCollapsed && (
                <motion.div
                  className="flex-1 text-left"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="font-medium">{item.label}</div>
                  <div className={`text-xs ${activeTab === item.id ? 'text-blue-500' : 'text-gray-500'}`}>
                    {item.description}
                  </div>
                </motion.div>
              )}
            </motion.button>
          ))}
        </nav>

        {/* Quick Actions */}
        {!sidebarCollapsed && (
          <motion.div
            className="absolute bottom-4 left-4 right-4 space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={onSave}
                className="bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
              >
                <Save className="w-4 h-4 mr-1" />
                บันทึก
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={onExport}
                className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
              >
                <Download className="w-4 h-4 mr-1" />
                ส่งออก
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-72'}`}>
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {activeItem && (
                  <>
                    <div className={`${activeItem.color} bg-gradient-to-r ${activeItem.gradient} p-2 rounded-lg text-white`}>
                      {activeItem.icon}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{activeItem.label}</h2>
                      <p className="text-sm text-gray-500">{activeItem.description}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="ค้นหา..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-2xl focus:outline-none transition-all duration-300 w-64 text-gray-900"
                  style={{
                    boxShadow: 'inset 6px 6px 12px #d1d5db, inset -6px -6px 12px #ffffff'
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onRefresh}
                  className="p-2 hover:bg-gray-100"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={toggleDarkMode}
                  className="p-2 hover:bg-gray-100"
                >
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  className="p-2 hover:bg-gray-100 relative"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </Button>

                {/* User Menu */}
                <div className="relative">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={toggleUserMenu}
                    className="p-2 hover:bg-gray-100"
                  >
                    <User className="w-4 h-4" />
                  </Button>
                  
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
                      >
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">ผู้ใช้งาน</p>
                          <p className="text-xs text-gray-500">admin@example.com</p>
                        </div>
                        <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                          <Settings className="w-4 h-4" />
                          ตั้งค่า
                        </button>
                        <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                          <LogOut className="w-4 h-4" />
                          ออกจากระบบ
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};