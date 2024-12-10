import React from 'react';
import { TenderDetails } from '../types';
import { Calendar, Truck, Clock } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface TenderHeaderProps {
  tender: TenderDetails;
}

export const TenderHeader: React.FC<TenderHeaderProps> = ({ tender }) => {
  const calculateDaysLeft = () => {
    const poDate = new Date(tender.poDate);
    const daysToDeliver = tender.leadTimeToDeliver;
    const deliveryDate = new Date(poDate.setDate(poDate.getDate() + daysToDeliver));
    const daysLeft = differenceInDays(deliveryDate, new Date());
    return daysLeft;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Tender Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-sm text-gray-600">Tender Number</p>
            <p className="font-semibold">{tender.tenderNumber}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Truck className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-sm text-gray-600">Authority Type</p>
            <p className="font-semibold">{tender.authorityType}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-sm text-gray-600">Lead Time (Delivery)</p>
            <p className="font-semibold">{tender.leadTimeToDeliver} days</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-sm text-gray-600">Lead Time (Installation)</p>
            <p className="font-semibold">{tender.leadTimeToInstall} days</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div>
            <p className="text-sm text-gray-600">Equipment Name</p>
            <p className="font-semibold">{tender.equipmentName}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div>
            <p className="text-sm text-gray-600">PO Date</p>
            <p className="font-semibold">{format(new Date(tender.poDate), 'dd/MM/yyyy')}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div>
            <p className="text-sm text-gray-600">Days Left to Deliver</p>
            <p className={`font-semibold ${calculateDaysLeft() < 5 ? 'text-red-600' : 'text-green-600'}`}>
              {calculateDaysLeft()} days
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <p className={`font-semibold ${
              tender.status === 'Completed' ? 'text-green-600' :
              tender.status === 'Partially Completed' ? 'text-yellow-600' :
              tender.status === 'Closed' ? 'text-red-600' :
              'text-gray-600'
            }`}>
              {tender.status}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};