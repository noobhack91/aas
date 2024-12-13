// src/pages/AccessoryConsumableManagement.tsx  
import React from 'react';
import { AccessoryConsumableManager } from '../components/AccessoryConsumableManager';

export const AccessoryConsumableManagement: React.FC = () => {  
  return (  
    <div className="min-h-screen bg-gray-100 p-6">  
      <div className="max-w-7xl mx-auto space-y-6">  
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Items</h1>  

        <AccessoryConsumableManager type="accessory" />  
        <AccessoryConsumableManager type="consumable" />  
      </div>  
    </div>  
  );  
};  