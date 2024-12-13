import { format } from 'date-fns';
import { Eye } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import ReactPaginate from 'react-paginate';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { toast } from 'react-toastify';
import * as api from '../api';

interface TenderListFilters {
  startDate: Date | null;
  endDate: Date | null;
  tenderNumber: string;
  district: string | null;
  block: string | null;
  status: string | null;
  accessoriesPending: string | null;
  installationPending: string | null;
  invoicePending: string | null;
}

const statusOptions = [
  { value: 'Draft', label: 'Draft' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Partially Completed', label: 'Partially Completed' },
  { value: 'Completed', label: 'Completed' }
];

const yesNoOptions = [
  { value: 'Yes', label: 'Yes' },
  { value: 'No', label: 'No' }
];

export const TenderList: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<TenderListFilters>({
    startDate: null,
    endDate: null,
    tenderNumber: '',
    district: null,
    block: null,
    status: null,
    accessoriesPending: null,
    installationPending: null,
    invoicePending: null
  });

  const Tooltip: React.FC<{ content: string[] }> = ({ content }) => (
    <div className="absolute z-10 bg-black text-white p-2 rounded shadow-lg text-sm">
      <ul className="list-disc list-inside">
        {content.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Partially Completed':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const [tenders, setTenders] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const ITEMS_PER_PAGE = 50;
  const [hoveredTender, setHoveredTender] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchTenders();
  }, [currentPage, filters]);

  const fetchInitialData = async () => {
    try {
      const [districtsRes, blocksRes] = await Promise.all([
        api.getDistricts(),
        api.getBlocks()
      ]);

      setDistricts(districtsRes.data.map((d: string) => ({ value: d, label: d })));
      setBlocks(blocksRes.data.map((b: string) => ({ value: b, label: b })));
    } catch (error) {
      toast.error('Failed to load filter options');
    }
  };

  const fetchTenders = async () => {
    setLoading(true);
    try {
      const response = await api.searchTenders({
        ...filters,
        page: currentPage + 1,
        limit: ITEMS_PER_PAGE
      });

      setTenders(response.data.tenders);
      setTotalPages(Math.ceil(response.data.total / ITEMS_PER_PAGE));
    } catch (error) {
      toast.error('Failed to fetch tenders');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = ({ selected }: { selected: number }) => {
    setCurrentPage(selected);
  };

  const handleViewTender = (tenderId: string) => {
    navigate(`/tenders/${tenderId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Tender List</h1>

        {/* Search Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <div className="flex space-x-2">
                <DatePicker
                  selected={filters.startDate}
                  onChange={(date) => setFilters({ ...filters, startDate: date })}
                  className="w-full rounded-md border-gray-300 shadow-sm"
                  placeholderText="Start Date"
                />
                <DatePicker
                  selected={filters.endDate}
                  onChange={(date) => setFilters({ ...filters, endDate: date })}
                  className="w-full rounded-md border-gray-300 shadow-sm"
                  placeholderText="End Date"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tender Number</label>
              <input
                type="text"
                value={filters.tenderNumber}
                onChange={(e) => setFilters({ ...filters, tenderNumber: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm"
                placeholder="Enter tender number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
              <Select
                value={districts.find(d => d.value === filters.district)}
                onChange={(option) => setFilters({ ...filters, district: option?.value || null })}
                options={districts}
                isClearable
                placeholder="Select district"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Block</label>
              <Select
                value={blocks.find(b => b.value === filters.block)}
                onChange={(option) => setFilters({ ...filters, block: option?.value || null })}
                options={blocks}
                isClearable
                placeholder="Select block"
              />
            </div>

            <div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <Select
                  value={statusOptions.find(s => s.value === filters.status)}
                  onChange={(option) => setFilters({ ...filters, status: option?.value || null })}
                  options={statusOptions}
                  isClearable
                  placeholder="Select status"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Accessories Pending</label>
              <Select
                value={yesNoOptions.find(o => o.value === filters.accessoriesPending)}
                onChange={(option) => setFilters({ ...filters, accessoriesPending: option?.value || null })}
                options={yesNoOptions}
                isClearable
                placeholder="Select option"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Installation Pending</label>
              <Select
                value={yesNoOptions.find(o => o.value === filters.installationPending)}
                onChange={(option) => setFilters({ ...filters, installationPending: option?.value || null })}
                options={yesNoOptions}
                isClearable
                placeholder="Select option"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Pending</label>
              <Select
                value={yesNoOptions.find(o => o.value === filters.invoicePending)}
                onChange={(option) => setFilters({ ...filters, invoicePending: option?.value || null })}
                options={yesNoOptions}
                isClearable
                placeholder="Select option"
              />
            </div>
          </div>
        </div>

        {/* Tender List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tender Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tender Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PO Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : tenders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No tenders found
                  </td>
                </tr>
              ) : (
                tenders.map((tender: any) => (
                  <tr key={tender.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(tender.createdAt), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{tender.tenderNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(tender.poDate), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(tender.status)}`}>
                        {tender.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewTender(tender.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {tenders.length > 0 && (
          <div className="mt-4">
            <ReactPaginate
              previousLabel="Previous"
              nextLabel="Next"
              pageCount={totalPages}
              onPageChange={handlePageChange}
              containerClassName="flex justify-center mt-4 space-x-2"
              previousClassName="px-3 py-2 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
              nextClassName="px-3 py-2 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
              pageClassName="px-3 py-2 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
              activeClassName="bg-blue-600 text-black border-blue-600 hover:bg-blue-700"
              disabledClassName="opacity-50 cursor-not-allowed"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TenderList;