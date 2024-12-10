import React from 'react';
import Select from 'react-select';
import { Search } from 'lucide-react';

interface ConsigneeSearchProps {
  districts: string[];
  selectedDistricts: string[];
  onDistrictChange: (districts: string[]) => void;
}

export const ConsigneeSearch: React.FC<ConsigneeSearchProps> = ({
  districts,
  selectedDistricts,
  onDistrictChange,
}) => {
  const options = districts.map(district => ({
    value: district,
    label: district,
  }));

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center space-x-2 mb-4">
        <Search className="w-5 h-5 text-gray-500" />
        <h3 className="text-lg font-semibold">Search Consignee</h3>
      </div>
      
      <Select
        isMulti
        options={options}
        value={options.filter(option => selectedDistricts.includes(option.value))}
        onChange={(selected) => {
          onDistrictChange(selected ? selected.map(item => item.value) : []);
        }}
        className="w-full"
        placeholder="Select districts..."
        classNamePrefix="select"
      />
    </div>
  );
};