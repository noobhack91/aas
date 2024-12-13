// src/components/equipments/EquipmentForm.tsx  
import { Download, Upload } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import Select, { MultiValue } from 'react-select';
import { z } from 'zod';
import * as api from '../../api';

// Update validation schema to include consumables  
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
  selected_accessories: z.array(z.string()).optional(),  
  has_consumables: z.boolean(),  
  selected_consumables: z.array(z.string()).optional()  
});  

type InstallationFormData = z.infer<typeof installationSchema>;  

interface EquipmentFormProps {  
  onSubmit: (data: InstallationFormData) => void;  
  onFileUpload: (file: File) => void;  
  onDownloadTemplate: () => void;  
}  

interface Option {  
  value: string;  
  label: string;  
}  

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
    selected_accessories: [],  
    has_consumables: false,  
    selected_consumables: []  
  });  

  const [errors, setErrors] = useState<Partial<Record<keyof InstallationFormData, string>>>({});  
  const [accessoryOptions, setAccessoryOptions] = useState<Option[]>([]);  
  const [consumableOptions, setConsumableOptions] = useState<Option[]>([]);  

  // Fetch accessories and consumables on component mount  
  useEffect(() => {  
    const fetchItems = async () => {  
      try {  
        const [accessoriesRes, consumablesRes] = await Promise.all([  
          api.getAccessories(),  
          api.getConsumables()  
        ]);  

        setAccessoryOptions(  
          accessoriesRes.data  
            .filter((item: any) => item.isActive)  
            .map((item: any) => ({  
              value: item.name,  
              label: item.name  
            }))  
        );  

        setConsumableOptions(  
          consumablesRes.data  
            .filter((item: any) => item.isActive)  
            .map((item: any) => ({  
              value: item.name,  
              label: item.name  
            }))  
        );  
      } catch (error) {  
        console.error('Failed to fetch items:', error);  
      }  
    };  

    fetchItems();  
  }, []);  

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
        {/* Basic Information */}  
        <div>  
          <label className="block text-sm font-medium text-gray-700">Tender Number</label>  
          <input  
            type="text"  
            required  
            value={formData.tender_number}  
            onChange={(e) => setFormData(prev => ({ ...prev, tender_number: e.target.value }))}  
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.tender_number ? 'border-red-500' : ''}`}  
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
            onChange={(option) => setFormData(prev => ({ ...prev, authority_type: option?.value as any }))}  
            className={errors.authority_type ? 'border-red-500' : ''}  
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
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.po_contract_date ? 'border-red-500' : ''}`}  
            dateFormat="yyyy-MM-dd"  
          />  
          {errors.po_contract_date && (  
            <p className="mt-1 text-sm text-red-600">{errors.po_contract_date}</p>  
          )}  
        </div>  

        {/* Equipment Details */}  
        <div>  
          <label className="block text-sm font-medium text-gray-700">Equipment Name</label>  
          <input  
            type="text"  
            required  
            value={formData.equipment}  
            onChange={(e) => setFormData(prev => ({ ...prev, equipment: e.target.value }))}  
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.equipment ? 'border-red-500' : ''}`}  
          />  
          {errors.equipment && (  
            <p className="mt-1 text-sm text-red-600">{errors.equipment}</p>  
          )}  
        </div>  

        {/* Lead Times */}  
        <div>  
          <label className="block text-sm font-medium text-gray-700">Lead Time to Deliver (days)</label>  
          <input  
            type="number"  
            required  
            min="1"  
            value={formData.lead_time_to_deliver || ''}  
            onChange={(e) => setFormData(prev => ({ ...prev, lead_time_to_deliver: parseInt(e.target.value) }))}  
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.lead_time_to_deliver ? 'border-red-500' : ''}`}  
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
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.lead_time_to_install ? 'border-red-500' : ''}`}  
          />  
          {errors.lead_time_to_install && (  
            <p className="mt-1 text-sm text-red-600">{errors.lead_time_to_install}</p>  
          )}  
        </div>  
      </div>  

      {/* Remarks */}  
      <div>  
        <label className="block text-sm font-medium text-gray-700">Remarks</label>  
        <textarea  
          value={formData.remarks}  
          onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}  
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"  
          rows={3}  
        />  
      </div>  

      {/* Accessories Section */}  
      <div>  
        <div className="flex items-center">  
          <input  
            type="checkbox"  
            id="hasAccessories"  
            checked={formData.has_accessories}  
            onChange={(e) => setFormData(prev => ({ ...prev, has_accessories: e.target.checked }))}  
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"  
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
              onChange={(selectedOptions: MultiValue<Option>) => {  
                setFormData(prev => ({  
                  ...prev,  
                  selected_accessories: selectedOptions.map(option => option.value)  
                }));  
              }}  
              className="mt-1"  
            />  
          </div>  
        )}  
      </div>  

      {/* Consumables Section */}  
      <div>  
        <div className="flex items-center">  
          <input  
            type="checkbox"  
            id="hasConsumables"  
            checked={formData.has_consumables}  
            onChange={(e) => setFormData(prev => ({ ...prev, has_consumables: e.target.checked }))}  
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"  
          />  
          <label htmlFor="hasConsumables" className="ml-2 text-sm text-gray-700">  
            Has Consumables  
          </label>  
        </div>  

        {formData.has_consumables && (  
          <div className="mt-4">  
            <label className="block text-sm font-medium text-gray-700">Select Consumables</label>  
            <Select  
              isMulti  
              options={consumableOptions}  
              value={formData.selected_consumables?.map(consumable => ({  
                value: consumable,  
                label: consumable  
              }))}  
              onChange={(selectedOptions: MultiValue<Option>) => {  
                setFormData(prev => ({  
                  ...prev,  
                  selected_consumables: selectedOptions.map(option => option.value)  
                }));  
              }}  
              className="mt-1"  
            />  
          </div>  
        )}  
      </div>  

      {/* Action Buttons */}  
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