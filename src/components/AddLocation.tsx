import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface AddLocationProps {
  onAdd: (location: { districtName: string; blockName: string; facilityName: string }) => void;
}

export const AddLocation: React.FC<AddLocationProps> = ({ onAdd }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [location, setLocation] = useState({
    districtName: '',
    blockName: '',
    facilityName: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.districtName && location.blockName && location.facilityName) {
      onAdd(location);
      setLocation({ districtName: '', blockName: '', facilityName: '' });
      setIsOpen(false);
    }
  };

  return (
    <div className="mt-4">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <Plus className="h-5 w-5 mr-1" />
          Add Location
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">District Name</label>
              <input
                type="text"
                value={location.districtName}
                onChange={(e) => setLocation(prev => ({ ...prev, districtName: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Block Name</label>
              <input
                type="text"
                value={location.blockName}
                onChange={(e) => setLocation(prev => ({ ...prev, blockName: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Facility Name</label>
              <input
                type="text"
                value={location.facilityName}
                onChange={(e) => setLocation(prev => ({ ...prev, facilityName: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
