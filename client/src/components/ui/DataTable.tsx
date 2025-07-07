import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal,
  Edit3,
  Check,
  X,
  ArrowUpDown
} from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  filterable?: boolean;
  exportable?: boolean;
  editable?: boolean;
  onEdit?: (row: T, index: number) => void;
  onDelete?: (row: T, index: number) => void;
  className?: string;
  pageSize?: number;
  title?: string;
  subtitle?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchable = true,
  filterable = false,
  exportable = false,
  editable = false,
  onEdit,
  onDelete,
  className = '',
  pageSize = 10,
  title,
  subtitle
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<T | null>(null);

  const filteredData = useMemo(() => {
    let result = [...data];

    // Search filter
    if (searchTerm) {
      result = result.filter(row =>
        Object.values(row).some(value =>
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Sort
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const handleSort = (key: keyof T) => {
    const column = columns.find(col => col.key === key);
    if (!column?.sortable) return;

    setSortConfig(prev => {
      if (prev?.key === key) {
        return prev.direction === 'asc' 
          ? { key, direction: 'desc' }
          : null;
      }
      return { key, direction: 'asc' };
    });
  };

  const handleEdit = (row: T, index: number) => {
    setEditingRow(index);
    setEditingData({ ...row });
  };

  const handleSaveEdit = () => {
    if (editingData && editingRow !== null && onEdit) {
      onEdit(editingData, editingRow);
    }
    setEditingRow(null);
    setEditingData(null);
  };

  const handleCancelEdit = () => {
    setEditingRow(null);
    setEditingData(null);
  };

  const handleExport = () => {
    const csvContent = [
      columns.map(col => col.label).join(','),
      ...filteredData.map(row => 
        columns.map(col => row[col.key]).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data-export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      {/* Header */}
      {(title || searchable || filterable || exportable) && (
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {title && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                {subtitle && (
                  <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
                )}
              </div>
            )}
            
            <div className="flex flex-wrap items-center gap-3">
              {searchable && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="ค้นหา..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                  />
                </div>
              )}
              
              {filterable && (
                <Button variant="secondary" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  ตัวกรอง
                </Button>
              )}
              
              {exportable && (
                <Button variant="secondary" size="sm" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  ส่งออก
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-6 py-4 text-left font-semibold text-gray-900 ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-200' : ''
                  } ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : ''}`}
                  style={{ width: column.width }}
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && (
                      <div className="flex flex-col">
                        {sortConfig?.key === column.key ? (
                          sortConfig.direction === 'asc' ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )
                        ) : (
                          <ArrowUpDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    )}
                  </div>
                </th>
              ))}
              {(editable || onDelete) && (
                <th className="px-6 py-4 text-center font-semibold text-gray-900 w-20">
                  การดำเนินการ
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {paginatedData.map((row, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={`px-6 py-4 ${
                        column.align === 'center' ? 'text-center' : 
                        column.align === 'right' ? 'text-right' : ''
                      }`}
                    >
                      {editingRow === index ? (
                        <input
                          type="text"
                          value={editingData?.[column.key] || ''}
                          onChange={(e) => 
                            setEditingData(prev => prev ? { ...prev, [column.key]: e.target.value } : null)
                          }
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        column.render ? column.render(row[column.key], row, index) : row[column.key]
                      )}
                    </td>
                  ))}
                  {(editable || onDelete) && (
                    <td className="px-6 py-4 text-center">
                      {editingRow === index ? (
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={handleSaveEdit}
                            className="p-1"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleCancelEdit}
                            className="p-1"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          {editable && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleEdit(row, index)}
                              className="p-1"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => onDelete(row, index)}
                              className="p-1"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </td>
                  )}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-6 bg-gray-50 border-t border-gray-200">
          <div className="text-sm text-gray-700">
            แสดง {(currentPage - 1) * pageSize + 1} ถึง {Math.min(currentPage * pageSize, filteredData.length)} จาก {filteredData.length} รายการ
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              ก่อนหน้า
            </Button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={currentPage === page ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="w-8"
              >
                {page}
              </Button>
            ))}
            
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            >
              ถัดไป
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}