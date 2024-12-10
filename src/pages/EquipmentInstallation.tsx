
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as api from '../api/index';
import { AddLocation } from '../components/AddLocation';
import { EquipmentForm } from '../components/equipments/EquipmentForm';
import { LocationsTable } from '../components/LocationsTable';

export const EquipmentInstallation: React.FC = () => {
  const [locations, setLocations] = useState<Array<{
    districtName: string;
    blockName: string;
    facilityName: string;
  }>>([]);
  const navigate = useNavigate();


  const handleSubmit = async (formData: any) => {
    try {
      if (locations.length === 0) {
        toast.error('Please add at least one location');
        return;
      }

      const requestData = {
        ...formData,
        po_contract_date: formData.po_contract_date.toISOString(),
        locations
      };

      await api.createInstallationRequest(requestData);
      toast.success('Equipment installation request created successfully');
      navigate(`/tenders`);
      // Reset form
      setLocations([]);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create installation request');
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      const response = await api.uploadConsigneeCSV(file);
      setLocations(response.data.locations);

      if (response.data.warnings) {
        toast.warning(response.data.warnings);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to process CSV file');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.downloadTemplate();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'consignee_template.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Failed to download template');
    }
  };

  const handleAddLocation = (location: { districtName: string; blockName: string; facilityName: string }) => {
    setLocations(prev => [...prev, location]);
  };

  const handleRemoveLocation = (index: number) => {
    setLocations(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Create Equipment Installation Request
        </h1>

        <EquipmentForm
          onSubmit={handleSubmit}
          onFileUpload={handleFileUpload}
          onDownloadTemplate={handleDownloadTemplate}
        />

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Locations</h2>
          <AddLocation onAdd={handleAddLocation} />
          <LocationsTable
            locations={locations}
            onRemove={handleRemoveLocation}
          />
        </div>
      </div>
    </div>
  );
};
