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
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <nav className="flex flex-wrap" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex-1 min-w-0 py-6 px-4 text-center transition-all duration-300 group ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                <div className={`p-2 rounded-lg transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-white/20' 
                    : 'bg-gray-100 group-hover:bg-blue-100'
                }`}>
                  {React.cloneElement(tab.icon, {
                    className: `w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'}`
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