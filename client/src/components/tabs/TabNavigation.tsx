import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calculator, 
  Users, 
  Car, 
  Heart, 
  Calendar
} from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const tabs: Tab[] = [
  { 
    id: 'budget', 
    label: 'งบประมาณ', 
    icon: <Calculator className="w-5 h-5" />,
    description: 'จัดการตารางงบประมาณประจำปี'
  },
  { 
    id: 'employees', 
    label: 'พนักงาน', 
    icon: <Users className="w-5 h-5" />,
    description: 'จัดการข้อมูลพนักงานและอัตราค่าใช้จ่าย'
  },
  { 
    id: 'travel', 
    label: 'ค่าเดินทาง', 
    icon: <Car className="w-5 h-5" />,
    description: 'คำนวณค่าเดินทางทุกประเภท'
  },
  { 
    id: 'assistance', 
    label: 'เงินช่วยเหลือ', 
    icon: <Heart className="w-5 h-5" />,
    description: 'จัดการเงินช่วยเหลือและค่าล่วงเวลา'
  },
  { 
    id: 'workday', 
    label: 'วันทำงาน', 
    icon: <Calendar className="w-5 h-5" />,
    description: 'คำนวณวันทำงานและวันหยุด'
  }
];

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="mb-8">
      <div className="bg-gray-100 rounded-3xl p-4" style={{
        boxShadow: '12px 12px 24px #d1d5db, -12px -12px 24px #ffffff'
      }}>
        <nav className="flex flex-wrap gap-3" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex-1 min-w-0 py-6 px-4 text-center transition-all duration-300 group rounded-2xl ${
                activeTab === tab.id
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
              style={{
                boxShadow: activeTab === tab.id
                  ? 'inset 8px 8px 16px #d1d5db, inset -8px -8px 16px #ffffff'
                  : '8px 8px 16px #d1d5db, -8px -8px 16px #ffffff',
                backgroundColor: '#f9fafb'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.boxShadow = '6px 6px 12px #d1d5db, -6px -6px 12px #ffffff';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.boxShadow = '8px 8px 16px #d1d5db, -8px -8px 16px #ffffff';
                }
              }}
            >
              <div className="flex flex-col items-center space-y-2">
                <div className={`p-3 rounded-2xl transition-all duration-300 ${
                  activeTab === tab.id 
                    ? 'text-blue-600' 
                    : 'text-gray-500 group-hover:text-blue-500'
                }`}
                style={{
                  boxShadow: activeTab === tab.id
                    ? 'inset 4px 4px 8px #d1d5db, inset -4px -4px 8px #ffffff'
                    : '4px 4px 8px #d1d5db, -4px -4px 8px #ffffff',
                  backgroundColor: '#f9fafb'
                }}>
                  {React.cloneElement(tab.icon, {
                    className: `w-5 h-5 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-600 group-hover:text-blue-600'}`
                  })}
                </div>
                <div>
                  <div className="font-semibold text-sm">{tab.label}</div>
                  <div className={`text-xs mt-1 ${
                    activeTab === tab.id ? 'text-white/80' : 'text-gray-500'
                  }`}>
                    {tab.description}
                  </div>
                </div>
              </div>
              
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-white"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};