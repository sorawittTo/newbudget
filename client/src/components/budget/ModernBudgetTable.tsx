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

  // Create organized items for display with proper category structure
  const organizedItems = useMemo(() => {
    const organized: BudgetItem[] = [];
    
    // Define the category structure and item mappings in proper order
    const categoryStructure = [
      {
        name: 'รวมงบประมาณรายจ่ายดำเนินงาน',
        type: 'main_header',
        items: []
      },
      {
        name: 'หมวด 1 : ค่าใช้จ่ายเกี่ยวกับพนักงาน',
        type: 'header',
        items: ['ค่าใช้จ่ายกิจกรรมส่งเสริมค่านิยมร่วมขององค์กร']
      },
      {
        name: 'หมวด 2 : ค่าใช้จ่ายดำเนินงานทั่วไป',
        type: 'header',
        items: [
          'ค่าไฟฟ้า', 'ค่าน้ำประปา', 'ค่าโทรศัพท์', 'ค่าวัสดุทั่วไป', 'ค่าวัสดุงานธนบัตร',
          'ค่าน้ำมันเชื้อเพลิง', 'ค่าจ้าง', 'ค่าจ้างแรงงานและทำของ', 'ค่าจ้างแรงงาน/ทำของ-งานตามพันธกิจหลัก',
          'ค่าไปรษณียากรและพัสดุไปรษณีย์', 'ค่าขนส่ง',
          'ค่าซ่อมแซมและบำรุงรักษา', 'ค่าตอบแทน', 'ค่าเช่า', 'ค่าเช่าเครื่องถ่ายเอกสาร',
          'ค่าเช่ายานพาหนะ', 'ค่าธรรมเนียม', 'ค่ารับรอง', 'ค่าใช้จ่ายในการเดินทาง',
          'ค่าทรัพยากรสาสนเทศห้องสมุด', 'ค่าจัดประชุม/ชี้แจง', 'ค่าใช้จ่ายในการจัดงานและพิธีต่าง ๆ',
          'ค่าใช้จ่ายเบ็ดเตล็ด'
        ]
      },
      {
        name: 'หมวด 4 : เงินช่วยเหลือภายในนอกและเงินบริจาค',
        type: 'header',
        items: ['เงินบริจาค']
      },
      {
        name: 'หมวด 58: ค่าใช้จ่ายด้านการผลิต',
        type: 'header',
        items: ['ค่าวัสดุผลิต - ทั่วไป']
      },
      {
        name: 'รวมงบประมาณรายจ่ายสินทรัพย์',
        type: 'main_header',
        items: []
      },
      {
        name: 'หมวด 7 : สินทรัพย์ถาวร',
        type: 'header',
        items: [
          'ครุภัณฑ์เครื่องใช้ไฟฟ้าและประปา', 'ครุภัณฑ์เบ็ดเตล็ด', 'ครุภัณฑ์ยานพาหนะและขนส่ง',
          'ค่าเสริมสร้างปรับปรุงอาคารสถานที่'
        ]
      }
    ];
    
    // Group items by name+code
    const itemGroups = new Map<string, BudgetItem[]>();
    filteredItems.forEach(item => {
      const key = `${item.name}-${item.code || ''}`;
      if (!itemGroups.has(key)) {
        itemGroups.set(key, []);
      }
      itemGroups.get(key)!.push(item);
    });
    
    // Process each category in order
    categoryStructure.forEach(category => {
      const categoryKey = `${category.name}-`;
      const categoryGroup = itemGroups.get(categoryKey);
      
      if (categoryGroup && categoryGroup.length >= 2) {
        // Add category header
        organized.push(...categoryGroup);
        
        // Add items under this category
        category.items.forEach(itemName => {
          const itemKey = `${itemName}-`;
          const itemGroup = itemGroups.get(itemKey);
          if (itemGroup && itemGroup.length >= 2) {
            organized.push(...itemGroup);
          }
          
          // Also check for items with codes
          Array.from(itemGroups.entries())
            .filter(([key, group]) => {
              return key.startsWith(itemName + '-') && 
                     key !== itemKey && 
                     group.length >= 2 &&
                     group[0].type === null;
            })
            .sort(([, a], [, b]) => a[0].name.localeCompare(b[0].name, 'th'))
            .forEach(([, group]) => {
              organized.push(...group);
            });
        });
      }
    });
    
    return organized;
  }, [filteredItems]);
  
  // Create grouped items for display
  const groupedItems = useMemo(() => {
    const groups: BudgetItem[][] = [];
    
    for (let i = 0; i < organizedItems.length; i += 2) {
      const year1Item = organizedItems[i];
      const year2Item = organizedItems[i + 1];
      
      if (year1Item && year2Item && 
          year1Item.name === year2Item.name && 
          year1Item.code === year2Item.code) {
        groups.push([year1Item, year2Item]);
      }
    }
    
    return groups;
  }, [organizedItems]);

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

  // Define summary items and their sub-items
  const summaryItems = {
    'ค่าจ้าง': ['ค่าจ้างแรงงานและทำของ', 'ค่าจ้างแรงงาน/ทำของ-งานตามพันธกิจหลัก', 'ค่าไปรษณียากรและพัสดุไปรษณีย์', 'ค่าขนส่ง'],
    'ค่าเช่า': ['ค่าเช่าเครื่องถ่ายเอกสาร', 'ค่าเช่ายานพาหนะ']
  };

  // Helper function to check if an item is a summary item
  const isSummaryItem = (itemName: string): boolean => {
    return Object.keys(summaryItems).includes(itemName);
  };

  // Helper function to calculate summary total
  const calculateSummaryTotal = (summaryName: string, year: number): number => {
    const subItems = summaryItems[summaryName as keyof typeof summaryItems];
    if (!subItems) return 0;
    
    let total = 0;
    
    for (const subItemName of subItems) {
      const matchingItems = budgetItems.filter(item => 
        item.name === subItemName && 
        item.year === year && 
        (!item.type || item.type === null)
      );
      
      for (const item of matchingItems) {
        const amount = parseFloat(String(item.amount)) || 0;
        total += amount;
      }
    }
    
    return total;
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

  const renderBudgetItem = (group: BudgetItem[], index: number) => {
    const year1Item = group.find(item => item.year === selectedYear1);
    const year2Item = group.find(item => item.year === selectedYear2);
    
    if (!year1Item || !year2Item) return null;
    
    // Check if this is a summary item and calculate totals
    const isSummary = isSummaryItem(year1Item.name);
    const year1Amount = isSummary ? calculateSummaryTotal(year1Item.name, year1Item.year) : year1Item.amount;
    const year2Amount = isSummary ? calculateSummaryTotal(year2Item.name, year2Item.year) : year2Item.amount;
    
    const safeYear1Amount = isNaN(year1Amount) ? 0 : year1Amount;
    const safeYear2Amount = isNaN(year2Amount) ? 0 : year2Amount;
    const { diff, percentage } = calculateDifference(safeYear1Amount, safeYear2Amount);
    
    const getRowStyle = () => {
      if (year1Item.type === 'main_header') {
        return 'bg-gradient-to-r from-blue-100 to-indigo-100 border-l-4 border-blue-500 font-bold text-blue-900';
      } else if (year1Item.type === 'header') {
        return 'bg-gradient-to-r from-slate-100 to-gray-100 border-l-4 border-slate-400 font-semibold text-slate-800';
      }
      return 'bg-white hover:bg-slate-50 border-l-4 border-transparent';
    };

    return (
      <motion.div
        key={`${year1Item.name}-${year1Item.code || ''}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`${getRowStyle()} p-4 border-b border-slate-200 transition-all duration-300`}
      >
        <div className="grid grid-cols-12 gap-4 items-center">
          {/* Item Name */}
          <div className="col-span-3">
            <div className="font-medium">{year1Item.name}</div>
            {year1Item.code && (
              <div className="text-xs text-slate-500 mt-1">{year1Item.code}</div>
            )}
          </div>
          
          {/* Code */}
          <div className="col-span-1 text-sm text-slate-600">
            {year1Item.code || '-'}
          </div>
          
          {/* Year 1 Amount */}
          <div className="col-span-2">
            {editMode && !year1Item.type && !isSummary ? (
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
              <div className={`text-right font-mono ${isSummary ? 'bg-yellow-50 p-2 rounded border-2 border-yellow-200' : ''}`}>
                {year1Item.type ? '-' : formatCurrency(isSummary ? (isNaN(year1Amount) ? 0 : year1Amount) : year1Item.amount)}
                {isSummary && (
                  <div className="text-xs text-yellow-600 mt-1">
                    ผลรวม {summaryItems[year1Item.name as keyof typeof summaryItems].length} รายการ
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Year 2 Amount */}
          <div className="col-span-2">
            {editMode && !year2Item.type && !isSummary ? (
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
              <div className={`text-right font-mono ${isSummary ? 'bg-yellow-50 p-2 rounded border-2 border-yellow-200' : ''}`}>
                {year2Item.type ? '-' : formatCurrency(isSummary ? (isNaN(year2Amount) ? 0 : year2Amount) : year2Item.amount)}
                {isSummary && (
                  <div className="text-xs text-yellow-600 mt-1">
                    ผลรวม {summaryItems[year2Item.name as keyof typeof summaryItems].length} รายการ
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Difference */}
          <div className="col-span-2 text-center">
            {!year1Item.type ? (
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
            {editMode && !year1Item.type && !isSummary ? (
              <input
                type="text"
                value={year1Item.notes || ''}
                onChange={(e) => handleNotesChange(year1Item.id!, e.target.value)}
                placeholder="หมายเหตุ..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                style={{
                  boxShadow: 'inset 4px 4px 8px rgba(0,0,0,0.1), inset -4px -4px 8px rgba(255,255,255,0.8)'
                }}
              />
            ) : (
              <div className={`text-sm ${isSummary ? 'text-yellow-600 font-medium' : 'text-slate-600'}`}>
                {isSummary ? 'คำนวณอัตโนมัติ' : (year1Item.notes || '-')}
              </div>
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
        
        <div>
          {groupedItems.map((group, index) => renderBudgetItem(group, index))}
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