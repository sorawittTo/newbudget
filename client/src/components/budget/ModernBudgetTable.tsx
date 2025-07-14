import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { NeumorphismIconButton } from '../ui/NeumorphismIconButton';
import { ToggleSwitch } from '../ui/ToggleSwitch';
import { SaveButton } from '../ui/SaveButton';
import { 
  Calculator, 
  Edit, 
  FileText, 
  Plus, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Filter,
  RefreshCw,
  Download
} from 'lucide-react';
import { formatCurrency } from '../../utils/calculations';

interface BudgetItem {
  id?: number;
  type?: 'main_header' | 'header' | null;
  code?: string;
  accountCode?: string;
  name: string;
  year: number;
  amount: number;
  notes?: string;
}

interface ModernBudgetTableProps {
  onSave: () => void;
  onNavigate: (tab: string) => void;
}

export const ModernBudgetTable: React.FC<ModernBudgetTableProps> = ({
  onSave,
  onNavigate
}) => {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [selectedYear1, setSelectedYear1] = useState(2568);
  const [selectedYear2, setSelectedYear2] = useState(2569);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'main_header' | 'header' | 'item'>('all');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newItem, setNewItem] = useState<Partial<BudgetItem>>({});
  const [loading, setLoading] = useState(true);

  // Fetch budget items from database
  useEffect(() => {
    const fetchBudgetItems = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/budget-items');
        const data = await response.json();
        setBudgetItems(data);
      } catch (error) {
        console.error('Error fetching budget items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBudgetItems();
  }, []);

  // Filter and search budget items
  const filteredItems = useMemo(() => {
    let filtered = budgetItems;
    
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterType !== 'all') {
      if (filterType === 'item') {
        filtered = filtered.filter(item => !item.type);
      } else {
        filtered = filtered.filter(item => item.type === filterType);
      }
    }
    
    return filtered;
  }, [budgetItems, searchTerm, filterType]);

  // Organize items by category structure
  const organizedDisplayItems = useMemo(() => {
    const organized: BudgetItem[] = [];
    
    // Define the proper order of categories and their items
    const categoryStructure = [
      {
        header: 'รวมงบประมาณรายจ่ายดำเนินงาน',
        isMainHeader: true,
        items: []
      },
      {
        header: 'หมวด 1 : ค่าใช้จ่ายเกี่ยวกับพนักงาน',
        isMainHeader: false,
        items: ['ค่าใช้จ่ายกิจกรรมส่งเสริมค่านิยมร่วมขององค์กร']
      },
      {
        header: 'หมวด 2 : ค่าใช้จ่ายดำเนินงานทั่วไป',
        isMainHeader: false,
        items: [
          'ค่าไฟฟ้า', 'ค่าน้ำประปา', 'ค่าโทรศัพท์', 'ค่าวัสดุทั่วไป', 'ค่าวัสดุงานธนบัตร',
          'ค่าน้ำมันเชื้อเพลิง', 'ค่าจ้าง', 'ค่าไปรษณียากรและพัสดุไปรษณีย์', 'ค่าขนส่ง',
          'ค่าจ้างแรงงานและทำของ', 'ค่าจ้างแรงงาน/ทำของ-งานตามพันธกิจหลัก',
          'ค่าซ่อมแซมและบำรุงรักษา', 'ค่าตอบแทน', 'ค่าเช่า', 'ค่าเช่าเครื่องถ่ายเอกสาร',
          'ค่าเช่ายานพาหนะ', 'ค่าธรรมเนียม', 'ค่ารับรอง', 'ค่าใช้จ่ายในการเดินทาง',
          'ค่าทรัพยากรสาสนเทศห้องสมุด', 'ค่าจัดประชุม/ชี้แจง', 'ค่าใช้จ่ายในการจัดงานและพิธีต่าง ๆ',
          'ค่าใช้จ่ายเบ็ดเตล็ด'
        ]
      },
      {
        header: 'หมวด 4 : เงินช่วยเหลือภายในนอกและเงินบริจาค',
        isMainHeader: false,
        items: ['เงินบริจาค']
      },
      {
        header: 'หมวด 58: ค่าใช้จ่ายด้านการผลิต',
        isMainHeader: false,
        items: ['ค่าวัสดุผลิต - ทั่วไป']
      },
      {
        header: 'รวมงบประมาณรายจ่ายสินทรัพย์',
        isMainHeader: true,
        items: []
      },
      {
        header: 'หมวด 7 : สินทรัพย์ถาวร',
        isMainHeader: false,
        items: [
          'ครุภัณฑ์เครื่องใช้ไฟฟ้าและประปา', 'ครุภัณฑ์เบ็ดเตล็ด', 'ครุภัณฑ์ยานพาหนะและขนส่ง',
          'ค่าเสริมสร้างปรับปรุงอาคารสถานที่'
        ]
      }
    ];

    // Create a map of all items for quick lookup
    const itemMap = new Map<string, BudgetItem>();
    filteredItems.forEach(item => {
      const key = `${item.name}-${item.code || ''}`;
      itemMap.set(key, item);
    });

    // Build organized structure
    categoryStructure.forEach(category => {
      // Add category header
      const headerKey = `${category.header}-`;
      const headerItem = itemMap.get(headerKey);
      if (headerItem) {
        organized.push(headerItem);
      }
      
      // Add items under this category
      category.items.forEach(itemName => {
        const itemKey = `${itemName}-`;
        const item = itemMap.get(itemKey);
        if (item) {
          organized.push(item);
        }
        
        // Also check for items with codes
        itemMap.forEach((item, key) => {
          if (key.startsWith(itemName + '-') && key !== itemKey) {
            organized.push(item);
          }
        });
      });
    });

    return organized;
  }, [filteredItems]);

  const handleAmountChange = (id: number, amount: number) => {
    setBudgetItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, amount } : item
      )
    );
  };

  const handleNotesChange = (id: number, notes: string) => {
    setBudgetItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, notes } : item
      )
    );
  };

  const handleAddItem = () => {
    if (newItem.name) {
      const newId = Math.max(...budgetItems.map(item => item.id || 0)) + 1;
      
      [selectedYear1, selectedYear2].forEach(year => {
        setBudgetItems(prev => [...prev, {
          id: newId + year,
          name: newItem.name!,
          code: newItem.code,
          year,
          amount: 0,
          notes: newItem.notes || ''
        }]);
      });
      
      setNewItem({});
    }
  };

  const handleDeleteItem = (name: string, code?: string) => {
    setBudgetItems(prev => 
      prev.filter(item => 
        !(item.name === name && item.code === code)
      )
    );
  };

  const calculateDifference = (year1Amount: number, year2Amount: number) => {
    const diff = year2Amount - year1Amount;
    const percentage = year1Amount > 0 ? (diff / year1Amount) * 100 : 0;
    return { diff, percentage };
  };

  const calculateCategoryTotals = (type: string) => {
    let year1Total = 0;
    let year2Total = 0;
    
    filteredItems.forEach(item => {
      if (item.type === type) {
        if (item.year === selectedYear1) year1Total += item.amount;
        if (item.year === selectedYear2) year2Total += item.amount;
      }
    });
    
    return { year1Total, year2Total };
  };

  const renderTableHeader = () => (
    <div className="bg-gradient-to-r from-slate-100 to-blue-50 p-4 rounded-t-2xl border-b border-slate-200">
      <div className="grid grid-cols-12 gap-4 items-center font-semibold text-slate-700">
        <div className="col-span-3">รายการ</div>
        <div className="col-span-1">รหัส</div>
        <div className="col-span-2 text-center">ปี {selectedYear1}</div>
        <div className="col-span-2 text-center">ปี {selectedYear2}</div>
        <div className="col-span-2 text-center">ผลต่าง</div>
        <div className="col-span-2">หมายเหตุ</div>
      </div>
    </div>
  );

  const renderBudgetItem = (item: BudgetItem, index: number) => {
    const correspondingItem = organizedDisplayItems.find(i => 
      i.name === item.name && 
      i.code === item.code && 
      i.year === (item.year === selectedYear1 ? selectedYear2 : selectedYear1)
    );
    
    if (!correspondingItem) return null;
    
    const year1Item = item.year === selectedYear1 ? item : correspondingItem;
    const year2Item = item.year === selectedYear2 ? item : correspondingItem;
    
    const { diff, percentage } = calculateDifference(year1Item.amount, year2Item.amount);
    
    const getRowStyle = () => {
      if (item.type === 'main_header') {
        return 'bg-gradient-to-r from-blue-100 to-indigo-100 border-l-4 border-blue-500 font-bold text-blue-900';
      } else if (item.type === 'header') {
        return 'bg-gradient-to-r from-slate-100 to-gray-100 border-l-4 border-slate-400 font-semibold text-slate-800';
      }
      return 'bg-white hover:bg-slate-50 border-l-4 border-transparent';
    };

    return (
      <motion.div
        key={`${item.name}-${item.code || ''}-${item.year}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`${getRowStyle()} p-4 border-b border-slate-200 transition-all duration-300`}
      >
        <div className="grid grid-cols-12 gap-4 items-center">
          {/* Item Name */}
          <div className="col-span-3">
            <div className="font-medium">{item.name}</div>
            {item.code && (
              <div className="text-xs text-slate-500 mt-1">{item.code}</div>
            )}
          </div>
          
          {/* Code */}
          <div className="col-span-1 text-sm text-slate-600">
            {item.code || '-'}
          </div>
          
          {/* Year 1 Amount */}
          <div className="col-span-2">
            {editMode && !item.type ? (
              <input
                type="text"
                value={year1Item.amount.toLocaleString()}
                onChange={(e) => {
                  const value = parseFloat(e.target.value.replace(/,/g, '')) || 0;
                  handleAmountChange(year1Item.id!, value);
                }}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  boxShadow: 'inset 4px 4px 8px rgba(0,0,0,0.1), inset -4px -4px 8px rgba(255,255,255,0.8)'
                }}
              />
            ) : (
              <div className="text-right font-mono">
                {item.type ? '-' : formatCurrency(year1Item.amount)}
              </div>
            )}
          </div>
          
          {/* Year 2 Amount */}
          <div className="col-span-2">
            {editMode && !item.type ? (
              <input
                type="text"
                value={year2Item.amount.toLocaleString()}
                onChange={(e) => {
                  const value = parseFloat(e.target.value.replace(/,/g, '')) || 0;
                  handleAmountChange(year2Item.id!, value);
                }}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  boxShadow: 'inset 4px 4px 8px rgba(0,0,0,0.1), inset -4px -4px 8px rgba(255,255,255,0.8)'
                }}
              />
            ) : (
              <div className="text-right font-mono">
                {item.type ? '-' : formatCurrency(year2Item.amount)}
              </div>
            )}
          </div>
          
          {/* Difference */}
          <div className="col-span-2 text-center">
            {!item.type ? (
              <>
                <div className={`font-mono text-sm ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {diff >= 0 ? '+' : ''}{formatCurrency(diff)}
                </div>
                <div className={`text-xs ${diff >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {percentage >= 0 ? '+' : ''}{percentage.toFixed(1)}%
                </div>
              </>
            ) : (
              <div className="text-sm text-slate-400">-</div>
            )}
          </div>
          
          {/* Notes */}
          <div className="col-span-2">
            {editMode && !item.type ? (
              <input
                type="text"
                value={item.notes || ''}
                onChange={(e) => handleNotesChange(item.id!, e.target.value)}
                placeholder="หมายเหตุ..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                style={{
                  boxShadow: 'inset 4px 4px 8px rgba(0,0,0,0.1), inset -4px -4px 8px rgba(255,255,255,0.8)'
                }}
              />
            ) : (
              <div className="text-sm text-slate-600">{item.notes || '-'}</div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">กำลังโหลดข้อมูลงบประมาณ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50" 
           style={{ boxShadow: '16px 16px 32px #d1d5db, -16px -16px 32px #ffffff' }}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100" 
                 style={{ boxShadow: '8px 8px 16px #d1d5db, -8px -8px 16px #ffffff' }}>
              <Calculator className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">ตารางงบประมาณ</h1>
              <p className="text-slate-600">จัดการและเปรียบเทียบงบประมาณรายปี</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Year Selection */}
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/80" 
                 style={{ boxShadow: 'inset 8px 8px 16px #d1d5db, inset -8px -8px 16px #ffffff' }}>
              <select
                value={selectedYear1}
                onChange={(e) => setSelectedYear1(parseInt(e.target.value))}
                className="px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none"
              >
                {[2568, 2569, 2570, 2571, 2572].map(year => (
                  <option key={year} value={year}>พ.ศ. {year}</option>
                ))}
              </select>
              
              <span className="text-slate-600">vs</span>
              
              <select
                value={selectedYear2}
                onChange={(e) => setSelectedYear2(parseInt(e.target.value))}
                className="px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none"
              >
                {[2568, 2569, 2570, 2571, 2572].map(year => (
                  <option key={year} value={year}>พ.ศ. {year}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-3">
              <ToggleSwitch 
                isActive={editMode}
                onToggle={setEditMode}
                label="แก้ไข"
                size="md"
              />
              <SaveButton 
                onClick={onSave}
                size="md"
              />
              <NeumorphismIconButton
                icon={Download}
                label="ส่งออก Excel"
                onClick={() => {}}
                variant="secondary"
                size="md"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ค้นหารายการงบประมาณ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none"
          >
            <option value="all">ทั้งหมด</option>
            <option value="main_header">หัวข้อหลัก</option>
            <option value="header">หัวข้อย่อย</option>
            <option value="item">รายการ</option>
          </select>
          
          <NeumorphismIconButton
            icon={RefreshCw}
            label="รีเฟรช"
            onClick={() => {
              setSearchTerm('');
              setFilterType('all');
            }}
            variant="secondary"
            size="md"
          />
        </div>
      </Card>

      {/* Budget Table */}
      <Card className="overflow-hidden">
        {renderTableHeader()}
        
        <div className="max-h-96 overflow-y-auto">
          {organizedDisplayItems
            .filter(item => item.year === selectedYear1)
            .map((item, index) => renderBudgetItem(item, index))}
        </div>
        
        {/* Summary Footer */}
        <div className="bg-gradient-to-r from-slate-100 to-blue-50 p-4 border-t border-slate-200">
          <div className="flex justify-between items-center">
            <div className="text-lg font-semibold text-slate-800">
              รวมทั้งหมด
            </div>
            <div className="flex gap-8">
              <div className="text-right">
                <div className="text-sm text-slate-600">ปี {selectedYear1}</div>
                <div className="font-mono font-bold text-lg text-blue-600">
                  {formatCurrency(
                    filteredItems
                      .filter(item => item.year === selectedYear1)
                      .reduce((sum, item) => sum + item.amount, 0)
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-600">ปี {selectedYear2}</div>
                <div className="font-mono font-bold text-lg text-blue-600">
                  {formatCurrency(
                    filteredItems
                      .filter(item => item.year === selectedYear2)
                      .reduce((sum, item) => sum + item.amount, 0)
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};