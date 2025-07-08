import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Calendar, 
  ChevronDown, 
  Upload, 
  X,
  Plus,
  Minus
} from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'date' | 'file' | 'array';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string; }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: any) => string | null;
  };
  defaultValue?: any;
  disabled?: boolean;
  className?: string;
  arrayFields?: FormField[];
}

interface FormBuilderProps {
  fields: FormField[];
  onSubmit: (data: Record<string, any>) => void;
  onCancel?: () => void;
  initialData?: Record<string, any>;
  submitLabel?: string;
  cancelLabel?: string;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  className?: string;
}

export const FormBuilder: React.FC<FormBuilderProps> = ({
  fields,
  onSubmit,
  onCancel,
  initialData = {},
  submitLabel = 'บันทึก',
  cancelLabel = 'ยกเลิก',
  title,
  subtitle,
  loading = false,
  className = ''
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const data: Record<string, any> = {};
    fields.forEach(field => {
      if (field.type === 'array') {
        data[field.name] = initialData[field.name] || [{}];
      } else {
        data[field.name] = initialData[field.name] || field.defaultValue || '';
      }
    });
    return data;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});

  const validateField = (field: FormField, value: any): string | null => {
    if (field.required && (!value || value === '')) {
      return `${field.label} จำเป็นต้องกรอก`;
    }

    if (field.validation) {
      const { min, max, pattern, custom } = field.validation;
      
      if (min !== undefined && value.length < min) {
        return `${field.label} ต้องมีอย่างน้อย ${min} ตัวอักษร`;
      }
      
      if (max !== undefined && value.length > max) {
        return `${field.label} ต้องมีไม่เกิน ${max} ตัวอักษร`;
      }
      
      if (pattern && !new RegExp(pattern).test(value)) {
        return `${field.label} รูปแบบไม่ถูกต้อง`;
      }
      
      if (custom) {
        const customError = custom(value);
        if (customError) return customError;
      }
    }

    return null;
  };

  const handleChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  const handleArrayChange = (fieldName: string, index: number, subFieldName: string, value: any) => {
    setFormData(prev => {
      const newArray = [...(prev[fieldName] || [])];
      newArray[index] = { ...newArray[index], [subFieldName]: value };
      return { ...prev, [fieldName]: newArray };
    });
  };

  const addArrayItem = (fieldName: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: [...(prev[fieldName] || []), {}]
    }));
  };

  const removeArrayItem = (fieldName: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_: any, i: number) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    fields.forEach(field => {
      const error = validateField(field, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
      }
    });
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit(formData);
  };

  const renderField = (field: FormField, index: number) => {
    const value = formData[field.name];
    const error = errors[field.name];
    
    const commonProps = {
      id: field.name,
      disabled: field.disabled || loading,
      className: `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
        error ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
      } ${field.className || ''}`
    };

    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <input
            {...commonProps}
            type={field.type}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
          />
        );

      case 'password':
        return (
          <div className="relative">
            <input
              {...commonProps}
              type={showPassword[field.name] ? 'text' : 'password'}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(prev => ({ ...prev, [field.name]: !prev[field.name] }))}
            >
              {showPassword[field.name] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        );

      case 'number':
        return (
          <input
            {...commonProps}
            type="text"
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleChange(field.name, parseFloat(e.target.value) || 0)}
          />
        );

      case 'textarea':
        return (
          <textarea
            {...commonProps}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            rows={4}
          />
        );

      case 'select':
        return (
          <div className="relative">
            <select
              {...commonProps}
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
            >
              <option value="">{field.placeholder || 'เลือก...'}</option>
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
          </div>
        );

      case 'checkbox':
        return (
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id={field.name}
              checked={value}
              onChange={(e) => handleChange(field.name, e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={field.disabled || loading}
            />
            <label htmlFor={field.name} className="text-sm font-medium text-gray-700">
              {field.label}
            </label>
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map(option => (
              <div key={option.value} className="flex items-center gap-3">
                <input
                  type="radio"
                  id={`${field.name}-${option.value}`}
                  name={field.name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  disabled={field.disabled || loading}
                />
                <label htmlFor={`${field.name}-${option.value}`} className="text-sm font-medium text-gray-700">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );

      case 'date':
        return (
          <div className="relative">
            <input
              {...commonProps}
              type="date"
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
          </div>
        );

      case 'file':
        return (
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-4 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">คลิกเพื่ออัพโหลด</span> หรือลากไฟล์มาวาง
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                onChange={(e) => handleChange(field.name, e.target.files?.[0])}
                disabled={field.disabled || loading}
              />
            </label>
          </div>
        );

      case 'array':
        return (
          <div className="space-y-4">
            {value.map((item: any, arrayIndex: number) => (
              <Card key={arrayIndex} className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">รายการที่ {arrayIndex + 1}</h4>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => removeArrayItem(field.name, arrayIndex)}
                    className="p-1"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {field.arrayFields?.map((subField, subIndex) => (
                    <div key={subIndex}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {subField.label}
                        {subField.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <input
                        type={subField.type}
                        placeholder={subField.placeholder}
                        value={item[subField.name] || ''}
                        onChange={(e) => handleArrayChange(field.name, arrayIndex, subField.name, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={field.disabled || loading}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            ))}
            <Button
              type="button"
              variant="secondary"
              onClick={() => addArrayItem(field.name)}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              เพิ่มรายการ
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className={`max-w-4xl mx-auto ${className}`}>
      {(title || subtitle) && (
        <div className="p-6 border-b border-gray-200">
          {title && <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>}
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-6">
          {fields.map((field, index) => (
            <motion.div
              key={field.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              {field.type !== 'checkbox' && (
                <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
              )}
              
              {renderField(field, index)}
              
              {errors[field.name] && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-600 text-sm mt-1"
                >
                  {errors[field.name]}
                </motion.p>
              )}
            </motion.div>
          ))}
        </div>
        
        <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="flex-1"
          >
            {submitLabel}
          </Button>
          
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              className="flex-1"
            >
              {cancelLabel}
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
};