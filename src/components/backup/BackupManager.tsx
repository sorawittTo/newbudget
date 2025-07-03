import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Download, 
  Upload, 
  Save, 
  RotateCcw, 
  AlertTriangle,
  CheckCircle,
  FileText,
  Calendar,
  Database,
  Shield
} from 'lucide-react';

interface BackupManagerProps {
  onExportData: () => void;
  onImportData: (data: any) => void;
  onSaveData: () => void;
  onResetData: () => void;
}

export const BackupManager: React.FC<BackupManagerProps> = ({
  onExportData,
  onImportData,
  onSaveData,
  onResetData
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [lastBackup, setLastBackup] = useState<Date | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Get all data from localStorage
      const allData = {
        budgetData: localStorage.getItem('budgetSystem_budgetData_v3'),
        employees: localStorage.getItem('budgetSystem_employeeData_v2'),
        masterRates: localStorage.getItem('budgetSystem_masterRates_v1'),
        specialAssist1: localStorage.getItem('budgetSystem_assist1Data_v1'),
        overtime: localStorage.getItem('budgetSystem_overtimeData_v1'),
        holidays: localStorage.getItem('budgetSystem_holidaysData_v1'),
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      const blob = new Blob([JSON.stringify(allData, null, 2)], { 
        type: 'application/json' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `budget-system-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      setLastBackup(new Date());
      onExportData();
    } catch (error) {
      console.error('Export failed:', error);
      alert('เกิดข้อผิดพลาดในการส่งออกข้อมูล');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Validate backup file
        if (!data.version || !data.exportDate) {
          throw new Error('ไฟล์สำรองข้อมูลไม่ถูกต้อง');
        }

        // Confirm import
        const confirmMessage = `คุณต้องการนำเข้าข้อมูลสำรองจากวันที่ ${new Date(data.exportDate).toLocaleDateString('th-TH')} ใช่หรือไม่?\n\nการดำเนินการนี้จะเขียนทับข้อมูลปัจจุบันทั้งหมด`;
        
        if (window.confirm(confirmMessage)) {
          // Restore data to localStorage
          Object.entries(data).forEach(([key, value]) => {
            if (key !== 'exportDate' && key !== 'version' && value) {
              const storageKey = `budgetSystem_${key === 'budgetData' ? 'budgetData_v3' :
                                 key === 'employees' ? 'employeeData_v2' :
                                 key === 'masterRates' ? 'masterRates_v1' :
                                 key === 'specialAssist1' ? 'assist1Data_v1' :
                                 key === 'overtime' ? 'overtimeData_v1' :
                                 key === 'holidays' ? 'holidaysData_v1' : key}`;
              localStorage.setItem(storageKey, value as string);
            }
          });

          onImportData(data);
          alert('นำเข้าข้อมูลสำเร็จ กรุณารีเฟรชหน้าเว็บ');
          window.location.reload();
        }
      } catch (error) {
        console.error('Import failed:', error);
        alert('เกิดข้อผิดพลาดในการนำเข้าข้อมูล: ' + (error as Error).message);
      } finally {
        setIsImporting(false);
      }
    };

    reader.readAsText(file);
    event.target.value = '';
  };

  const handleReset = () => {
    const confirmMessage = 'คุณต้องการลบข้อมูลทั้งหมดและกลับไปใช้ค่าเริ่มต้นใช่หรือไม่?\n\nการกระทำนี้ไม่สามารถย้อนกลับได้';
    
    if (window.confirm(confirmMessage)) {
      onResetData();
    }
  };

  const getStorageInfo = () => {
    try {
      let totalSize = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key) && key.startsWith('budgetSystem_')) {
          totalSize += localStorage[key].length;
        }
      }
      return {
        size: (totalSize / 1024).toFixed(2) + ' KB',
        items: Object.keys(localStorage).filter(k => k.startsWith('budgetSystem_')).length
      };
    } catch {
      return { size: 'ไม่ทราบ', items: 0 };
    }
  };

  const storageInfo = getStorageInfo();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">จัดการข้อมูลสำรอง</h2>
        <p className="text-gray-600">
          สำรองข้อมูล นำเข้าข้อมูล และจัดการข้อมูลระบบ
        </p>
      </div>

      {/* Storage Info */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500 rounded-full">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">ข้อมูลในระบบ</h3>
              <p className="text-gray-600">
                ขนาดข้อมูล: {storageInfo.size} • รายการ: {storageInfo.items} ชุดข้อมูล
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">บันทึกล่าสุด</p>
            <p className="font-medium">{new Date().toLocaleDateString('th-TH')}</p>
          </div>
        </div>
      </Card>

      {/* Backup Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-green-100 rounded-lg mr-3">
              <Download className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">ส่งออกข้อมูลสำรอง</h3>
              <p className="text-sm text-gray-600">สร้างไฟล์สำรองข้อมูลทั้งหมด</p>
            </div>
          </div>
          
          <div className="space-y-3 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              ข้อมูลงบประมาณทั้งหมด
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              ข้อมูลพนักงานและตารางอัตรา
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              การตั้งค่าและการคำนวณ
            </div>
          </div>

          {lastBackup && (
            <div className="mb-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">
                สำรองข้อมูลล่าสุด: {lastBackup.toLocaleString('th-TH')}
              </p>
            </div>
          )}

          <Button 
            onClick={handleExport}
            disabled={isExporting}
            className="w-full"
            variant="success"
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'กำลังส่งออก...' : 'ส่งออกข้อมูลสำรอง'}
          </Button>
        </Card>

        {/* Import */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <Upload className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">นำเข้าข้อมูลสำรอง</h3>
              <p className="text-sm text-gray-600">กู้คืนข้อมูลจากไฟล์สำรอง</p>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2" />
              จะเขียนทับข้อมูลปัจจุบัน
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Shield className="w-4 h-4 text-blue-500 mr-2" />
              ตรวจสอบความถูกต้องของไฟล์
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-purple-500 mr-2" />
              แสดงวันที่สำรองข้อมูล
            </div>
          </div>

          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              disabled={isImporting}
              className="hidden"
              id="import-backup"
            />
            <Button
              onClick={() => document.getElementById('import-backup')?.click()}
              disabled={isImporting}
              className="w-full"
              variant="secondary"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isImporting ? 'กำลังนำเข้า...' : 'เลือกไฟล์สำรอง'}
            </Button>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">การดำเนินการเพิ่มเติม</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={onSaveData}
            variant="primary"
            className="flex items-center justify-center"
          >
            <Save className="w-4 h-4 mr-2" />
            บันทึกข้อมูลปัจจุบัน
          </Button>
          
          <Button
            onClick={handleReset}
            variant="danger"
            className="flex items-center justify-center"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            รีเซ็ตข้อมูลทั้งหมด
          </Button>
        </div>
      </Card>

      {/* Help */}
      <Card className="p-6 bg-gray-50">
        <div className="flex items-start space-x-3">
          <FileText className="w-5 h-5 text-gray-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-gray-900 mb-2">คำแนะนำการใช้งาน</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• สำรองข้อมูลเป็นประจำเพื่อป้องกันการสูญหาย</li>
              <li>• ไฟล์สำรองจะมีชื่อรวมวันที่เพื่อง่ายต่อการจัดการ</li>
              <li>• การนำเข้าข้อมูลจะเขียนทับข้อมูลปัจจุบันทั้งหมด</li>
              <li>• ควรทดสอบไฟล์สำรองก่อนใช้งานจริง</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};