import { Check, ClipboardCheck, Edit, FileSpreadsheet, FileText, Package, Truck } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ConsigneeDetails } from '../types';
import { AccessoriesModal } from './modals/AccessoriesModal';

const Tooltip: React.FC<{ content: string[] }> = ({ content }) => (
  <div className="absolute z-10 bg-black text-white p-2 rounded shadow-lg text-sm -mt-20">
    <ul className="list-disc list-inside">
      {content.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  </div>
);

interface ConsigneeListProps {
  consignees: ConsigneeDetails[];
  onUpdateLogistics: (id: string) => void;
  onUpdateChallan: (id: string) => void;
  onUpdateInstallation: (id: string) => void;
  onUpdateInvoice: (id: string) => void;
  onUpdateSerialNumber: (id: string, serialNumber: string) => void;
  onUpdateAccessories: (id: string) => void;
}

export const ConsigneeList: React.FC<ConsigneeListProps> = ({
  consignees,
  onUpdateLogistics,
  onUpdateChallan,
  onUpdateInstallation,
  onUpdateInvoice,
  onUpdateSerialNumber,
  onUpdateAccessories
}) => {
  const { user } = useAuth();
  const [editingSerialNumber, setEditingSerialNumber] = useState<string | null>(null);
  const [tempSerialNumber, setTempSerialNumber] = useState<string>('');
  const [hoveredConsignee, setHoveredConsignee] = useState<string | null>(null);
  const [accessoriesModal, setAccessoriesModal] = useState(false);
  const [selectedConsignee, setSelectedConsignee] = useState<ConsigneeDetails | null>(null);

  const getStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
      'Processing': 'bg-gray-100 text-gray-800',
      'Dispatched': 'bg-blue-100 text-blue-800',
      'Installation Pending': 'bg-yellow-100 text-yellow-800',
      'Installation Done': 'bg-green-100 text-green-800',
      'Invoice Done': 'bg-purple-100 text-purple-800',
      'Bill Submitted': 'bg-indigo-100 text-indigo-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleEditSerialNumber = (id: string, serialNumber: string) => {
    if (user?.roles.includes('admin')) {
      setEditingSerialNumber(id); // Enable editing for the selected row
      setTempSerialNumber(serialNumber); // Set current serial number to temp for editing
    }
  };

  const handleSaveSerialNumber = (id: string) => {
    if (tempSerialNumber !== '') {
      onUpdateSerialNumber(id, tempSerialNumber);
      setEditingSerialNumber(null); // Exit editing mode
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr No</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">District/Consignee</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Block Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Facility Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accessories</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial Number</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {consignees.map((consignee) => (
            <tr key={consignee.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{consignee.srNo}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{consignee.districtName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{consignee.blockName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{consignee.facilityName}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(consignee.consignmentStatus)}`}
                >
                  {consignee.consignmentStatus}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {consignee.accessoriesPending.status ? (
                  <div
                    className="relative"
                    onMouseEnter={() => setHoveredConsignee(consignee.id)}
                    onMouseLeave={() => setHoveredConsignee(null)}
                  >
                    <div className="flex items-center text-blue-600 cursor-pointer">
                      <Package className="w-5 h-5 mr-1" />
                      <span>({consignee.accessoriesPending.count})</span>
                      <button
                        onClick={() => {
                          setSelectedConsignee(consignee);
                          setAccessoriesModal(true);
                        }}
                        className="text-yellow-600 hover:text-yellow-900 ml-2"
                        title="Manage Accessories"
                      >
                        <Package className="w-5 h-5" />
                      </button>
                    </div>
                    {hoveredConsignee === consignee.id && (
                      <Tooltip content={consignee.accessoriesPending.items || []} />
                    )}
                  </div>
                ) : (
                  <span className="text-green-600 flex items-center">
                    <Check className="w-5 h-5 mr-1" />
                    No
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {editingSerialNumber === consignee.id ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={tempSerialNumber}
                      onChange={(e) => setTempSerialNumber(e.target.value)}
                      className="border rounded px-2 py-1 text-sm"
                      placeholder="Enter S/N"
                    />
                    <button
                      onClick={() => handleSaveSerialNumber(consignee.id)}
                      className="text-green-600"
                      title="Save Serial Number"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{consignee.serialNumber || '-'}</span>
                    {user?.roles.some((role: any) => role.includes('admin')) && (
                      <button
                        onClick={() => handleEditSerialNumber(consignee.id, consignee.serialNumber || '')}
                        className="text-blue-600"
                        title="Edit Serial Number"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                {user?.roles.some((role: any) => role.includes('admin')) ? (
                  <>
                    <button
                      onClick={() => onUpdateLogistics(consignee.id)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Update Logistics"
                    >
                      <Truck className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onUpdateChallan(consignee.id)}
                      className="text-green-600 hover:text-green-900"
                      title="Update Challan"
                    >
                      <FileText className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onUpdateInstallation(consignee.id)}
                      className="text-purple-600 hover:text-purple-900"
                      title="Update Installation"
                    >
                      <ClipboardCheck className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onUpdateInvoice(consignee.id)}
                      className="text-orange-600 hover:text-orange-900"
                      title="Update Invoice"
                    >
                      <FileSpreadsheet className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <>
                    {user?.roles.some((role: any) => role.includes('logistics')) && (
                      <button
                        onClick={() => onUpdateLogistics(consignee.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Update Logistics"
                      >
                        <Truck className="w-5 h-5" />
                      </button>
                    )}
                    {user?.roles.some((role: any) => role.includes('challan')) && (
                      <button
                        onClick={() => onUpdateChallan(consignee.id)}
                        className="text-green-600 hover:text-green-900"
                        title="Update Challan"
                      >
                        <FileText className="w-5 h-5" />
                      </button>
                    )}
                    {user?.roles.some((role: any) => role.includes('installation')) && (
                      <button
                        onClick={() => onUpdateInstallation(consignee.id)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Update Installation"
                      >
                        <ClipboardCheck className="w-5 h-5" />
                      </button>
                    )}
                    {user?.roles.some((role: any) => role.includes('invoice')) && (
                      <button
                        onClick={() => onUpdateInvoice(consignee.id)}
                        className="text-orange-600 hover:text-orange-900"
                        title="Update Invoice"
                      >
                        <FileSpreadsheet className="w-5 h-5" />
                      </button>
                    )}
                  </>
                )}
              </td>

            </tr>
          ))}
        </tbody>
      </table>
      {selectedConsignee && (
        <AccessoriesModal
          isOpen={accessoriesModal}
          onClose={() => setAccessoriesModal(false)}
          consigneeId={selectedConsignee.id}
          accessories={selectedConsignee.accessoriesPending}
          onUpdate={() => {
            onUpdateAccessories(selectedConsignee.id);
            setAccessoriesModal(false);
          }}
        />
      )}
    </div>
  );
};
