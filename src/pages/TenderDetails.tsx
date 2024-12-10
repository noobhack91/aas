import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as api from '../api';
import { ConsigneeList } from '../components/ConsigneeList';
import { ConsigneeSearch } from '../components/ConsigneeSearch';
import { TenderHeader } from '../components/TenderHeader';
import { ChallanModal } from '../components/modals/ChallanModal';
import { InstallationModal } from '../components/modals/InstallationModal';
import { InvoiceModal } from '../components/modals/InvoiceModal';
import { LogisticsModal } from '../components/modals/LogisticsModal';
import { ConsigneeDetails, TenderDetails as ITenderDetails } from '../types';
const Tooltip: React.FC<{ content: string[] }> = ({ content }) => (
  <div className="absolute z-10 bg-black text-white p-2 rounded shadow-lg text-sm">
    <ul className="list-disc list-inside">
      {content.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  </div>
);
export const TenderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tender, setTender] = useState<ITenderDetails | null>(null);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [consignees, setConsignees] = useState<ConsigneeDetails[]>([]);
  const [selectedConsigneeId, setSelectedConsigneeId] = useState<string>('');
  const [modals, setModals] = useState({
    logistics: false,
    challan: false,
    installation: false,
    invoice: false
  });
  const [loading, setLoading] = useState(true);
  const [hoveredTender, setHoveredTender] = useState<string | null>(null);

  useEffect(() => {
    fetchTenderDetails();
  }, [id]);

  const fetchTenderDetails = async () => {
    try {
      const response = await api.getTenderById(id!);
      setTender(response.data);
      setConsignees(response.data.consignees || []);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load tender details');
      setLoading(false);
    }
  };

  const handleDistrictChange = (districts: string[]) => {
    setSelectedDistricts(districts);
  };

  const handleUpdateLogistics = (id: string) => {
    setSelectedConsigneeId(id);
    setModals({ ...modals, logistics: true });
  };

  const handleUpdateChallan = (id: string) => {
    setSelectedConsigneeId(id);
    setModals({ ...modals, challan: true });
  };

  const handleUpdateInstallation = (id: string) => {
    setSelectedConsigneeId(id);
    setModals({ ...modals, installation: true });
  };

  const handleUpdateInvoice = (id: string) => {
    setSelectedConsigneeId(id);
    setModals({ ...modals, invoice: true });
  };
  const handleUpdateAccessories = async (id: string) => {
    await fetchTenderDetails(); // Refresh data after accessories update  
  };

  const handleUpdateSerialNumber = async (id: string, serialNumber: string) => {
    try {
      await api.updateConsigneeStatus(id, { serialNumber });
      setConsignees(prevConsignees =>
        prevConsignees.map(consignee =>
          consignee.id === id ? { ...consignee, serialNumber } : consignee
        )
      );
      toast.success('Serial number updated successfully');
    } catch (error) {
      toast.error('Failed to update serial number');
    }
  };
  const handleExportCSV = async () => {
    try {
      const response = await api.exportTenderData(id!);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `tender_${tender?.tenderNumber}_report.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Export successful');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const handleModalSubmit = async (type: string, data: FormData) => {
    try {
      let response;
      switch (type) {
        case 'Logistics':
          response = await api.uploadLogistics(data);
          break;
        case 'Challan':
          response = await api.uploadChallan(data);
          break;
        case 'Installation':
          response = await api.uploadInstallation(data);
          break;
        case 'Invoice':
          response = await api.uploadInvoice(data);
          break;
      }

      await fetchTenderDetails(); // Refresh data
      toast.success(`${type} details updated successfully`);
      setModals({ ...modals, [type.toLowerCase()]: false });
    } catch (error) {
      toast.error(`Failed to update ${type.toLowerCase()} details`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Tender Details</h1>
          <button
            onClick={handleExportCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-md"
          >
            Export to CSV
          </button>
        </div>

        {tender && <TenderHeader tender={tender} />}

        <ConsigneeSearch
          districts={Array.from(new Set(consignees.map(c => c.districtName)))}
          selectedDistricts={selectedDistricts}
          onDistrictChange={handleDistrictChange}
        />

        <ConsigneeList
          consignees={consignees.filter(c =>
            selectedDistricts.length === 0 || selectedDistricts.includes(c.districtName)
          )}
          onUpdateLogistics={handleUpdateLogistics}
          onUpdateChallan={handleUpdateChallan}
          onUpdateInstallation={handleUpdateInstallation}
          onUpdateInvoice={handleUpdateInvoice}
          onUpdateSerialNumber={handleUpdateSerialNumber}
          onUpdateAccessories={handleUpdateAccessories}

        />

        <LogisticsModal
          isOpen={modals.logistics}
          onClose={() => setModals({ ...modals, logistics: false })}
          onSubmit={(data) => handleModalSubmit('Logistics', data)}
          consigneeId={selectedConsigneeId}
        />

        <ChallanModal
          isOpen={modals.challan}
          onClose={() => setModals({ ...modals, challan: false })}
          onSubmit={(data) => handleModalSubmit('Challan', data)}
          consigneeId={selectedConsigneeId}
        />

        <InstallationModal
          isOpen={modals.installation}
          onClose={() => setModals({ ...modals, installation: false })}
          onSubmit={(data) => handleModalSubmit('Installation', data)}
          consigneeId={selectedConsigneeId}
        />

        <InvoiceModal
          isOpen={modals.invoice}
          onClose={() => setModals({ ...modals, invoice: false })}
          onSubmit={(data) => handleModalSubmit('Invoice', data)}
          consigneeId={selectedConsigneeId}
        />

      </div>
    </div>
  );
};

export default TenderDetails;
