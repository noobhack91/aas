// src/components/modals/LogisticsModal.tsx  
import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { toast } from 'react-toastify';
import * as api from '../../api';
import { FileDisplay } from '../FileDisplay';
import { BaseModal } from './BaseModal';
import { BaseModalProps, UploadedDetails } from './type';

export const LogisticsModal: React.FC<BaseModalProps> = ({  
  isOpen,  
  onClose,  
  onSubmit,  
  consigneeId  
}) => {  
  const [loading, setLoading] = useState(true);  
  const [details, setDetails] = useState<UploadedDetails>({  
    date: null,  
    courierName: '',  
    docketNumber: '',  
    documents: []  
  });  
  const [files, setFiles] = useState<FileList | null>(null);  

  useEffect(() => {  
    if (isOpen && consigneeId) {  
      fetchExistingDetails();  
    }  
  }, [isOpen, consigneeId]);  

  const fetchExistingDetails = async () => {  
    try {  
      const response = await api.getConsigneeDetails(consigneeId);  
      const logisticsDetails = response.data.logisticsDetails;  

      if (logisticsDetails) {  
        setDetails({  
          date: logisticsDetails.date ? new Date(logisticsDetails.date) : null,  
          courierName: logisticsDetails.courierName || '',  
          docketNumber: logisticsDetails.docketNumber || '',  
          documents: logisticsDetails.documents || []  
        });  
      }  
    } catch (error) {  
      toast.error('Failed to fetch logistics details');  
    } finally {  
      setLoading(false);  
    }  
  };  

  const handleDeleteFile = async (url: string) => {  
    try {  
      await api.deleteFile(url, 'logistics');  
      setDetails(prev => ({  
        ...prev,  
        documents: prev.documents?.filter(doc => doc !== url) || []  
      }));  
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
    formData.append('courierName', details.courierName || '');  
    formData.append('docketNumber', details.docketNumber || '');  

    if (files) {  
      Array.from(files).forEach(file => {  
        formData.append('documents', file);  
      });  
    }  

    await onSubmit(formData);  
  };  

  return (  
    <BaseModal isOpen={isOpen} onClose={onClose} title="Update Logistics Details">  
      {loading ? (  
        <div className="flex justify-center py-4">  
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>  
        </div>  
      ) : (  
        <form onSubmit={handleSubmit} className="space-y-4">  
          <div>  
            <label className="block text-sm font-medium text-gray-700">Date</label>  
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
            <label className="block text-sm font-medium text-gray-700">Courier Name</label>  
            <input  
              type="text"  
              value={details.courierName}  
              onChange={(e) => setDetails(prev => ({ ...prev, courierName: e.target.value }))}  
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"  
              required  
            />  
          </div>  

          <div>  
            <label className="block text-sm font-medium text-gray-700">Docket Number</label>  
            <input  
              type="text"  
              value={details.docketNumber}  
              onChange={(e) => setDetails(prev => ({ ...prev, docketNumber: e.target.value }))}  
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"  
              required  
            />  
          </div>  

          <div>  
            <label className="block text-sm font-medium text-gray-700">Upload Documents</label>  
            <input  
              type="file"  
              multiple  
              onChange={(e) => setFiles(e.target.files)}  
              className="mt-1 block w-full"  
              accept=".pdf,.jpg,.jpeg,.png"  
            />  
          </div>  

          {details.documents && details.documents.length > 0 && (  
            <FileDisplay  
              files={details.documents}  
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