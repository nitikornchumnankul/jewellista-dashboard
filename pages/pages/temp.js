import { useState, useEffect } from 'react';

const StatusOverviewTable = ({ data }) => {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Helper functions
  const getCastingStatus = (row) => 
    (!row.cast_completed || row.cast_completed < Math.abs(row.order_quantity)) 
      ? 'In Progress' 
      : 'Completed';

  const getShipmentStatus = (row) => 
    (!row.export_to_ie || row.pending_export) 
      ? 'Pending' 
      : 'Shipped';

  // Filtering logic
  const checkSearch = (row) => {
    if (!searchTerm) return true;
    const searchValues = [
      row.distribution_center,
      row.sales_order,
      getCastingStatus(row),
      Math.abs(row.cast_completed || 0).toString(),
      Math.abs(row.cast_shortage || 0).toString(),
      getShipmentStatus(row),
      Math.abs(row.export_to_ie || 0).toString(),
      Math.abs(row.pending_export || 0).toString(),
    ];
    return searchValues.some(v => v.toLowerCase().includes(searchTerm.toLowerCase()));
  };

  const filteredData = data.filter(row => {
    const passesFilters = Object.entries(activeFilters).every(([key, value]) => {
      switch (key) {
        case 'casting_status': return getCastingStatus(row) === value;
        case 'shipment_status': return getShipmentStatus(row) === value;
        case 'cast_completed': return Math.abs(row.cast_completed) === value;
        case 'cast_shortage': return Math.abs(row.cast_shortage) === value;
        case 'export_to_ie': return Math.abs(row.export_to_ie) === value;
        case 'pending_export': return Math.abs(row.pending_export) === value;
        default: return row[key] === value;
      }
    });
    return passesFilters && checkSearch(row);
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Interactive filtering
  const handleCellClick = (column, value) => {
    setActiveFilters(prev => {
      if (prev[column] === value) {
        const newFilters = { ...prev };
        delete newFilters[column];
        return newFilters;
      }
      return { ...prev, [column]: value };
    });
  };

  useEffect(() => setCurrentPage(1), [activeFilters, searchTerm]);

  return (
    <div className="p-4">
      {/* Search and Active Filters */}
      <div className="mb-6 space-y-4">
        <input
          type="text"
          placeholder="Search across all columns..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded-lg"
        />
        
        <div className="flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([key, value]) => (
            <div key={key} className="bg-blue-100 px-3 py-1 rounded-full flex items-center">
              <span className="text-sm">{key}: {value}</span>
              <button 
                onClick={() => setActiveFilters(prev => {
                  const newFilters = { ...prev };
                  delete newFilters[key];
                  return newFilters;
                })}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h6 className="text-2xl font-bold text-gray-700 mb-6">Status Overview</h6>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse shadow-md rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-100 text-gray-700 uppercase text-sm leading-normal">
                {['Distribution Center', 'Sales Order', 'Casting Status', 'Cast Completed',
                  'Cast Shortage', 'Shipment Status', 'Export to IE', 'Pending Export'].map((header) => (
                  <th key={header} className="border-b p-3 text-left">{header}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {paginatedData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50 transition cursor-pointer">
                  {/* Distribution Center */}
                  <td 
                    className="border-b p-3 text-gray-700"
                    onClick={() => handleCellClick('distribution_center', row.distribution_center)}
                  >
                    {row.distribution_center}
                  </td>

                  {/* Sales Order */}
                  <td
                    className="border-b p-3 text-gray-700"
                    onClick={() => handleCellClick('sales_order', row.sales_order)}
                  >
                    {row.sales_order}
                  </td>

                  {/* Casting Status */}
                  <td
                    className="border-b p-3 font-medium"
                    onClick={() => handleCellClick('casting_status', getCastingStatus(row))}
                  >
                    {getCastingStatus(row) === 'In Progress' ? (
                      <div className="flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-yellow-500">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        <span>In Progress</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-500">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                        <span>Completed</span>
                      </div>
                    )}
                  </td>

                  {/* Cast Completed */}
                  <td 
                    className="border-b p-3"
                    onClick={() => handleCellClick('cast_completed', Math.abs(row.cast_completed || 0))}
                  >
                    {Math.abs(row.cast_completed || 0)}
                    <div className="w-full mt-2 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(Math.abs(row.cast_completed || 0) / Math.abs(row.order_quantity) * 100}%` }}></div>
                    </div>
                  </td>

                  {/* Cast Shortage */}
                  <td 
                    className="border-b p-3"
                    onClick={() => handleCellClick('cast_shortage', Math.abs(row.cast_shortage || 0))}
                  >
                    {Math.abs(row.cast_shortage || 0)}
                    <div className="w-full mt-2 bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(Math.abs(row.cast_shortage || 0) / Math.abs(row.order_quantity) * 100}%` }}></div>
                    </div>
                  </td>

                  {/* Shipment Status */}
                  <td
                    className="border-b p-3 font-medium"
                    onClick={() => handleCellClick('shipment_status', getShipmentStatus(row))}
                  >
                    {getShipmentStatus(row) === 'Pending' ? (
                      <div className="flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-yellow-500">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                        </svg>
                        <span>Pending</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-500">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                        </svg>
                        <span>Shipped</span>
                      </div>
                    )}
                  </td>

                  {/* Export to IE */}
                  <td 
                    className="border-b p-3 text-gray-700"
                    onClick={() => handleCellClick('export_to_ie', Math.abs(row.export_to_ie || 0))}
                  >
                    {Math.abs(row.export_to_ie || 0)}
                  </td>

                  {/* Pending Export */}
                  <td 
                    className="border-b p-3 text-gray-700"
                    onClick={() => handleCellClick('pending_export', Math.abs(row.pending_export || 0))}
                  >
                    {Math.abs(row.pending_export || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls - ใช้โค้ดเดิมที่ให้มา */}
        {/* ... โค้ด Pagination เดิม ... */}
      </div>
    </div>
  );
};