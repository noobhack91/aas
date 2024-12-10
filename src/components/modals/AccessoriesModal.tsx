// src/components/modals/AccessoriesModal.tsx  

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import * as api from '../../api';
import { BaseModal } from './BaseModal';

interface AccessoriesModalProps {  
  isOpen: boolean;  
  onClose: () => void;  
  consigneeId: string;  
  accessories: {  
    status: boolean;  
    count: number;  
    items: string[];  
  };  
  onUpdate: () => void;  
}  

export const AccessoriesModal: React.FC<AccessoriesModalProps> = ({  
  isOpen,  
  onClose,  
  consigneeId,  
  accessories,  
  onUpdate  
}) => {  
  const [pendingAccessories, setPendingAccessories] = useState(accessories.items);  

  const handleToggleAccessory = async (accessoryName: string) => {  
    try {  
      await api.updateAccessoriesStatus(consigneeId, {  
        accessoryName,  
        status: !pendingAccessories.includes(accessoryName)  
      });  

      setPendingAccessories(prev =>   
        prev.includes(accessoryName)   
          ? prev.filter(item => item !== accessoryName)  
          : [...prev, accessoryName]  
      );  

      toast.success('Accessory status updated successfully');  
      onUpdate();  
    } catch (error) {  
      toast.error('Failed to update accessory status');  
    }  
  };  

  return (  
    <BaseModal isOpen={isOpen} onClose={onClose} title="Manage Accessories">  
      <div className="space-y-4">  
        <div className="grid grid-cols-1 gap-4">  
          {accessories.items.map((accessory) => (  
            <div key={accessory} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">  
              <span className="text-sm font-medium text-gray-700">{accessory}</span>  
              <button  
                onClick={() => handleToggleAccessory(accessory)}  
                className={`px-3 py-1 rounded-full text-sm font-medium ${  
                  pendingAccessories.includes(accessory)  
                    ? 'bg-yellow-100 text-yellow-800'  
                    : 'bg-green-100 text-green-800'  
                }`}  
              >  
                {pendingAccessories.includes(accessory) ? 'Pending' : 'Complete'}  
              </button>  
            </div>  
          ))}  
        </div>  

        <div className="flex justify-end mt-6">  
          <button  
            onClick={onClose}  
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"  
          >  
            Close  
          </button>  
        </div>  
      </div>  
    </BaseModal>  
  );  
};  