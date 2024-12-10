import { Download, Upload } from 'lucide-react';
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import Select, { MultiValue } from 'react-select';
import { z } from 'zod';

// Define validation schema matching backend
const installationSchema = z.object({
  tender_number: z.string().min(1).max(100),
  authority_type: z.enum([
    'UPMSCL', 'AUTONOMOUS', 'CMSD', 'DGME', 'AIIMS', 'SGPGI', 'KGMU', 'BHU', 
    'BMSICL', 'OSMCL', 'TRADE', 'GDMC', 'AMSCL'
  ]),
  po_contract_date: z.date(),
  equipment: z.string().min(1),
  lead_time_to_deliver: z.number().positive(),
  lead_time_to_install: z.number().positive(),
  remarks: z.string().optional(),
  has_accessories: z.boolean(),
  selected_accessories: z.array(z.string()).optional()
});

type InstallationFormData = z.infer<typeof installationSchema>;

interface EquipmentFormProps {
  onSubmit: (data: InstallationFormData) => void;
  onFileUpload: (file: File) => void;
  onDownloadTemplate: () => void;
}

interface AccessoryOption {
  value: string;
  label: string;
}

const accessoryOptions: AccessoryOption[] = [
  { value: 'UPS', label: 'UPS' },
  { value: 'Stabilizer', label: 'Stabilizer' },
  { value: 'Battery', label: 'Battery' },
  { value: 'Printer', label: 'Printer' },
  { value: 'Computer', label: 'Computer' },
  { value: 'Monitor', label: 'Monitor' },
  { value: 'Cable', label: 'Cable' },
  { value: 'Software', label: 'Software' }
];

const authorityOptions = [
  { value: 'UPMSCL', label: 'UPMSCL' },
  { value: 'AUTONOMOUS', label: 'AUTONOMOUS' },
  { value: 'CMSD', label: 'CMSD' },
  { value: 'DGME', label: 'DGME' },
  { value: 'AIIMS', label: 'AIIMS' },
  { value: 'SGPGI', label: 'SGPGI' },
  { value: 'KGMU', label: 'KGMU' },
  { value: 'BHU', label: 'BHU' },
  { value: 'BMSICL', label: 'BMSICL' },
  { value: 'OSMCL', label: 'OSMCL' },
  { value: 'TRADE', label: 'TRADE' },
  { value: 'GDMC', label: 'GDMC' },
  { value: 'AMSCL', label: 'AMSCL' }
];

export const EquipmentForm: React.FC<EquipmentFormProps> = ({
  onSubmit,
  onFileUpload,
  onDownloadTemplate
}) => {
  const [formData, setFormData] = useState<Partial<InstallationFormData>>({
    tender_number: '',
    authority_type: 'UPMSCL',
    po_contract_date: null,
    equipment: '',
    lead_time_to_deliver: undefined,
    lead_time_to_install: undefined,
    remarks: '',
    has_accessories: false,
    selected_accessories: []
  });

  const [errors, setErrors] = useState<Partial<Record<keyof InstallationFormData, string>>>({});

  const validateForm = (): boolean => {
    try {
      installationSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof InstallationFormData, string>> = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof InstallationFormData;
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData as InstallationFormData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Tender Number</label>
          <input
            type="text"
            required
            value={formData.tender_number}
            onChange={(e) => setFormData(prev => ({ ...prev, tender_number: e.target.value }))}
            className={`mt-1 block w-full h-10 px-3 rounded-md border border-black shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.tender_number ? 'border-red-500' : ''}`}
          />
          {errors.tender_number && (
            <p className="mt-1 text-sm text-red-600">{errors.tender_number}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Authority Type</label>
          <Select
            options={authorityOptions}
            value={authorityOptions.find(opt => opt.value === formData.authority_type)}
            onChange={(option) => setFormData(prev => ({ ...prev, authority_type: option?.value as 'UPSMC' | 'UKSMC' | 'SGPGIMS' }))}
            styles={{
              control: (base) => ({
                ...base,
                height: '2.5rem',
                minHeight: '2.5rem'
              })
            }}
            className={`mt-1 block w-full rounded-md border border-black focus:border-blue-500 focus:ring-blue-500 ${errors.authority_type ? 'border-red-500' : ''}`}
          />
          {errors.authority_type && (
            <p className="mt-1 text-sm text-red-600">{errors.authority_type}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">PO Date</label>
          <DatePicker
            selected={formData.po_contract_date}
            onChange={(date) => setFormData(prev => ({ ...prev, po_contract_date: date }))}
            className={`mt-1 block w-full h-10 px-3 rounded-md border border-black shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.po_contract_date ? 'border-red-500' : ''}`}
            dateFormat="yyyy-MM-dd"
          />
          {errors.po_contract_date && (
            <p className="mt-1 text-sm text-red-600">{errors.po_contract_date}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Equipment Name</label>
          <input
            type="text"
            required
            value={formData.equipment}
            onChange={(e) => setFormData(prev => ({ ...prev, equipment: e.target.value }))}
            className={`mt-1 block w-full h-10 px-3 rounded-md border border-black shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.equipment ? 'border-red-500' : ''}`}
          />
          {errors.equipment && (
            <p className="mt-1 text-sm text-red-600">{errors.equipment}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Lead Time to Deliver (days)</label>
          <input
            type="number"
            required
            min="1"
            value={formData.lead_time_to_deliver || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, lead_time_to_deliver: parseInt(e.target.value) }))}
            className={`mt-1 block w-full h-10 px-3 rounded-md border border-black shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.lead_time_to_deliver ? 'border-red-500' : ''}`}
          />
          {errors.lead_time_to_deliver && (
            <p className="mt-1 text-sm text-red-600">{errors.lead_time_to_deliver}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Lead Time to Install (days)</label>
          <input
            type="number"
            required
            min="1"
            value={formData.lead_time_to_install || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, lead_time_to_install: parseInt(e.target.value) }))}
            className={`mt-1 block w-full h-10 px-3 rounded-md border border-black shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.lead_time_to_install ? 'border-red-500' : ''}`}
          />
          {errors.lead_time_to_install && (
            <p className="mt-1 text-sm text-red-600">{errors.lead_time_to_install}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Remarks</label>
        <textarea
          value={formData.remarks}
          onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
          className="mt-1 block w-full rounded-md border border-black shadow-sm focus:border-blue-500 focus:ring-blue-500"
          rows={3}
        />
      </div>

      <div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="hasAccessories"
            checked={formData.has_accessories}
            onChange={(e) => setFormData(prev => ({ ...prev, has_accessories: e.target.checked }))}
            className="rounded border border-black text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="hasAccessories" className="ml-2 text-sm text-gray-700">
            Has Accessories
          </label>
        </div>

        {formData.has_accessories && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Select Accessories</label>
            <Select
              isMulti
              options={accessoryOptions}
              value={formData.selected_accessories?.map(accessory => ({
                value: accessory,
                label: accessory
              }))}
              onChange={(selectedOptions: MultiValue<AccessoryOption>) => {
                setFormData(prev => ({
                  ...prev,
                  selected_accessories: selectedOptions.map(option => option.value)
                }));
              }}
              styles={{
                control: (base) => ({
                  ...base,
                  height: '2.5rem',
                  minHeight: '2.5rem'
                })
              }}
              className="mt-1"
              classNamePrefix="select"
              placeholder="Select accessories..."
            />
            {errors.selected_accessories && (
              <p className="mt-1 text-sm text-red-600">{errors.selected_accessories}</p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex space-x-4">
          <label className="relative cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            <Upload className="h-5 w-5 inline-block mr-2" />
            Upload CSV
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onFileUpload(file);
              }}
              accept=".csv"
              className="hidden"
            />
          </label>
          <button
            type="button"
            onClick={onDownloadTemplate}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <Download className="h-5 w-5 mr-1" />
            Download Template
          </button>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          Submit
        </button>
      </div>
    </form>
  );
};