// src/components/modals/ChallanModal.tsx  
import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { toast } from 'react-toastify';
import * as api from '../../api';
import { FileDisplay } from '../FileDisplay';
import { BaseModal } from './BaseModal';
import { BaseModalProps, UploadedDetails } from './type';

export const ChallanModal: React.FC<BaseModalProps> = ({  
  isOpen,  
  onClose,  
  onSubmit,  
  consigneeId  
}) => {  
  const [loading, setLoading] = useState(true);  
  const [details, setDetails] = useState<UploadedDetails>({  
    date: null,  
    filePath: ''  
  });  
  const [file, setFile] = useState<File | null>(null);  

  useEffect(() => {  
    if (isOpen && consigneeId) {  
      fetchExistingDetails();  
    }  
  }, [isOpen, consigneeId]);  

  const fetchExistingDetails = async () => {  
    try {  
      const response = await api.getConsigneeDetails(consigneeId);  
      const challanDetails = response.data.challanReceipt;  

      if (challanDetails) {  
        setDetails({  
          date: challanDetails.date ? new Date(challanDetails.date) : null,  
          filePath: challanDetails.filePath || ''  
        });  
      }  
    } catch (error) {  
      toast.error('Failed to fetch challan details');  
    } finally {  
      setLoading(false);  
    }  
  };  

  const handleDeleteFile = async (url: string) => {  
    try {  
      await api.deleteFile(url, 'challan');  
      setDetails(prev => ({ ...prev, filePath: '' }));  
      toast.success('File deleted successfully');  
    } catch (error) {  
      toast.error('Failed to delete file');  
    }  
  };  

  const handleSubmit = async (e: React.FormEvent) => {  
    e.preventDefault();  
    const formData = new FormData();  
    formData.append('consigneeId', consigneeId);  
    formData.append('date', details.date?.toString() || '');  
    if (file) {  
      formData.append('file', file);  
    }  
    await onSubmit(formData);  
  };  

  return (  
    <BaseModal isOpen={isOpen} onClose={onClose} title="Update Challan Receipt">  
      {loading ? (  
        <div className="flex justify-center py-4">  
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>  
        </div>  
      ) : (  
        <form onSubmit={handleSubmit} className="space-y-4">  
          <div>  
            <label className="block text-sm font-medium text-gray-700">Receipt Date</label>  
            <DatePicker  
              selected={details.date}  
              onChange={(date: Date) => setDetails(prev => ({ ...prev, date }))}  
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"  
              dateFormat="yyyy-MM-dd"  
              placeholderText="Select date"  
              required  
            />  
          </div>  

          <div>  
            <label className="block text-sm font-medium text-gray-700">Upload Receipt</label>  
            <input  
              type="file"  
              onChange={(e) => setFile(e.target.files?.[0] || null)}  
              className="mt-1 block w-full"  
              accept=".pdf,.jpg,.jpeg,.png"  
            />  
          </div>  

          {details.filePath && (  
            <FileDisplay  
              files={[details.filePath]}  
              onDelete={handleDeleteFile}  
            />  
          )}  

          <div className="flex justify-end space-x-3 mt-6">  
            <button  
              type="button"  
              onClick={onClose}  
              className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50"  
            >  
              Cancel  
            </button>  
            <button  
              type="submit"  
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"  
            >  
              Save  
            </button>  
          </div>  
        </form>  
      )}  
    </BaseModal>  
  );  
};  