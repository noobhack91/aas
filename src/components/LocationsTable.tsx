import { X } from 'lucide-react';
import React from 'react';

interface Location {
  districtName: string;
  blockName: string;
  facilityName: string;
  contactName: string;
  contactPhone: number;
  contactEmail: string;
}

interface LocationsTableProps {
  locations: Location[];
  onRemove: (index: number) => void;
}

export const LocationsTable: React.FC<LocationsTableProps> = ({ locations, onRemove }) => {
  if (locations.length === 0) return null;

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">District Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Block Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Facility Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Phone</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {locations.map((location, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{location.districtName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{location.blockName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{location.facilityName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{location.contactName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{location.contactPhone}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{location.contactEmail}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="text-red-600 hover:text-red-900"
                >
                  <X className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
