import { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Tooltip as ChartTooltip,
    Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ChartTooltip, Legend);

export default function Dashboard1() {
    const [data, setData] = useState([]);
    const [filters, setFilters] = useState({
        distribution_center: "",
        sales_order: "",
        pool: "",
        item_number: "",
        mold: "",
        order_quantity: "",
        ship_month: "",
        week_ship: "",
        production_department: "",
        cast_completed: "",
        cast_shortage: "",
        casting_deadline: "",
        export_to_ie: "",
        pending_export: "",
        remarks: "",
    });
    const [selectedColumn, setSelectedColumn] = useState(null);
    const [selectedValue, setSelectedValue] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(false);

    // Add these state variables at the component level
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilters, setActiveFilters] = useState({});

    // เพิ่ม state สำหรับเก็บข้อมูลที่เลือก
    const [selectedRowData, setSelectedRowData] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        setLoading(true);
        axios.get("http://localhost:8000/csv-to-json/?file_path=PAN.csv")
            .then((response) => {
                setData(response?.data || []);
                console.log(response.data); // ตรวจสอบ key จริง

            })
            .catch((error) => {
                setData([]);
            })
            .finally(() => setLoading(false));
    };

    const exportToCSV = () => {
        if (!Array.isArray(filteredData) || filteredData.length === 0) {
            alert("No data to export!");
            return;
        }

        const firstRow = filteredData[0] || {};
        const headers = Object.keys(firstRow).join(",");

        const csvRows = filteredData.map(row =>
            Object.values(row)
                .map(value => {
                    const sanitized = value ?? "";
                    return `"${sanitized}"`;
                })
                .join(",")
        );

        const csvString = [headers, ...csvRows].join("\n");
        const blob = new Blob([csvString], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "filtered_data.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // ฟังก์ชันสำหรับประมวลผลสถานะต่าง ๆ
    const getCastingStatus = (row) =>
        (!row.cast_completed || row.cast_completed < Math.abs(row.order_quantity))
            ? 'In Progress'
            : 'Completed';

    const getShipmentStatus = (row) =>
        (!row.export_to_ie || row.pending_export)
            ? 'Pending'
            : 'Shipped';

    // ฟังก์ชันตรวจสอบการค้นหา
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

    // กรองข้อมูล
    const filteredData = data.filter(row => {
        const passesFilters = Object.entries(activeFilters).every(([key, value]) => {
            switch (key) {
                case 'casting_status': return getCastingStatus(row) === value;
                case 'shipment_status': return getShipmentStatus(row) === value;
                case 'cast_completed': return Math.abs(row.cast_completed || 0) === value;
                case 'cast_shortage': return Math.abs(row.cast_shortage || 0) === value;
                case 'export_to_ie': return Math.abs(row.export_to_ie || 0) === value;
                case 'pending_export': return Math.abs(row.pending_export || 0) === value;
                default: return row[key] === value;
            }
        });
        return passesFilters && checkSearch(row);
    });

    const totalOrders = filteredData.length;
    const completedOrders = filteredData.filter((item) =>
        item.cast_completed !== null && Math.abs(item.cast_completed) >= Math.abs(item.order_quantity)
    ).length;
    const pendingOrders = totalOrders - completedOrders;

    // ฟังก์ชันจัดการการคลิกเซลล์
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

    // Reset page when filters change
    useEffect(() => setCurrentPage(1), [activeFilters, searchTerm]);

    // ลบ weeklyProductionData mock data ออก และสร้างฟังก์ชันใหม่สำหรับคำนวณข้อมูลรายสัปดาห์
    const calculateWeeklyData = (data) => {
        // จัดกลุ่มข้อมูลตามสัปดาห์
        const weeklyData = {
            1: { totalProduction: 0, completedItems: 0 },
            2: { totalProduction: 0, completedItems: 0 },
            3: { totalProduction: 0, completedItems: 0 },
            4: { totalProduction: 0, completedItems: 0 },
            5: { totalProduction: 0, completedItems: 0 }
        };

        data.forEach(order => {
            const week = 1; // ใช้ค่าเริ่มต้นเป็น 1
            
            // เพิ่มจำนวนการผลิตทั้งหมด
            weeklyData[week].totalProduction += Math.abs(order.order_quantity || 0);
            
            // เพิ่มจำนวนที่เสร็จสมบูรณ์
            if (order.cast_completed && Math.abs(order.cast_completed) >= Math.abs(order.order_quantity)) {
                weeklyData[week].completedItems += Math.abs(order.order_quantity);
            }
        });

        // แปลงเป็น array format
        return Object.entries(weeklyData).map(([week, data]) => ({
            week: parseInt(week),
            totalProduction: data.totalProduction,
            completedItems: data.completedItems
        }));
    };

    // อัพเดท lineGraphData ให้ใช้ข้อมูลจริง
    const lineGraphData = {
        labels: calculateWeeklyData(filteredData).map(item => `Week ${item.week}`),
        datasets: [
            {
                label: "Total Production",
                data: calculateWeeklyData(filteredData).map(item => item.totalProduction),
                borderColor: "rgba(75, 192, 192, 1)",
                fill: false,
            },
            {
                label: "Completed Items",
                data: calculateWeeklyData(filteredData).map(item => item.completedItems),
                borderColor: "rgba(153, 102, 255, 1)",
                fill: false,
            },
        ],
    };

    // เพิ่มฟังก์ชันสำหรับข้อมูลกราฟของแถวที่เลือก
    const getSelectedRowGraphData = () => {
        if (!selectedRowData) return lineGraphData;
        
        return {
            labels: ['Cast Completed', 'Cast Shortage', 'Export to IE', 'Pending Export'],
            datasets: [{
                label: `Order ${selectedRowData.sales_order} Statistics`,
                data: [
                    Math.abs(selectedRowData.cast_completed || 0),
                    Math.abs(selectedRowData.cast_shortage || 0),
                    Math.abs(selectedRowData.export_to_ie || 0),
                    Math.abs(selectedRowData.pending_export || 0)
                ],
                borderColor: "rgba(75, 192, 192, 1)",
                backgroundColor: [
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)'
                ],
                fill: true,
            }]
        };
    };

    // เพิ่มฟังก์ชันจัดการการคลิกที่แถว
    const handleRowClick = (row) => {
        setSelectedRowData(row === selectedRowData ? null : row);
    };

    const [showFilter, setShowFilter] = useState(false);
    const [uniqueDistributionCenters, setUniqueDistributionCenters] = useState([]);

    useEffect(() => {
        if (data.length > 0) {
            const unique = [...new Set(data.map(item => item.distribution_center))];
            setUniqueDistributionCenters(unique);
        }
    }, [data]);
    const handleFilterSelect = (value) => {
        setActiveFilters(prev => ({
            ...prev,
            distribution_center: value
        }));
        setShowFilter(false);
    };
    // Replace the old handleChangePage and handleChangeRowsPerPage with:
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1); // Reset to first page when changing items per page
    };
    // Then later, before return():
    const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="mb-6">
        <div className="mb-6 w-full">
            <nav className="bg-white shadow-md w-screen">
                <div className="px-4 sm:px-6 lg:px-8 w-full">
                    <div className="relative flex items-center h-16 w-full">
                        {/* Logo on the far left */}
                        <div className="flex-shrink-0">
                            <img className="h-20 w-auto" src="/jewellista.png" alt="Your Logo" />
                        </div>
                        {/* Navigation links and buttons aligned to the far right */}
                        <div className="flex-grow flex justify-end items-center">
                            <div className="flex space-x-4">
                                <a href="#" className="text-gray-800 hover:bg-gray-100 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium">Home</a>
                                <a href="#" className="text-gray-800 hover:bg-gray-100 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium">Overview</a>
                                <a href="#" className="text-gray-800 hover:bg-gray-100 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium">Reports</a>
                                <a href="#" className="text-gray-800 hover:bg-gray-100 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium">Settings</a>
                            </div>
                            {/* Optional right-side button */}
                            <button className="bg-white p-1 rounded-full text-gray-800 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800">
                                <span className="sr-only">View notifications</span>
                                {/* Icon */}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
        </div>





            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 w-full">
                {/* Production Overview */}
                <div className="bg-white p-6 rounded-lg shadow-lg col-span-1 lg:col-span-3 w-full">
                    <h6 className="text-2xl font-semibold mb-4">Production Overview</h6>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                        <div className="bg-green-100 p-4 rounded-lg shadow-md w-full">
                            <h5 className="text-2xl md:text-3xl">{totalOrders}</h5>
                            <p className="text-lg">Total Orders</p>
                        </div>
                        <div className="bg-blue-100 p-4 rounded-lg shadow-md w-full">
                            <h5 className="text-2xl md:text-3xl">{completedOrders}</h5>
                            <p className="text-lg">Completed Orders</p>
                        </div>
                        <div className="bg-yellow-100 p-4 rounded-lg shadow-md w-full">
                            <h5 className="text-2xl md:text-3xl">{pendingOrders}</h5>
                            <p className="text-lg">Pending Orders</p>
                        </div>
                    </div>
                </div>

                {/* Shipment Overview */}
                <div className="bg-white p-6 rounded-lg shadow-lg col-span-1 lg:col-span-3 w-full">
                    <h6 className="text-2xl font-semibold mb-4">Shipment Overview</h6>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                        <div className="bg-indigo-100 p-4 rounded-lg shadow-md w-full">
                            <h5 className="text-2xl md:text-3xl">{completedOrders}</h5>
                            <p className="text-lg">Total Shipped</p>
                        </div>
                        <div className="bg-orange-100 p-4 rounded-lg shadow-md w-full">
                            <h5 className="text-2xl md:text-3xl">{pendingOrders}</h5>
                            <p className="text-lg">Total Pending Shipments</p>
                        </div>
                        <div className="bg-red-100 p-4 rounded-lg shadow-md w-full">
                            <h5 className="text-2xl md:text-3xl">0</h5>
                            <p className="text-lg">Total Failed Shipments</p>
                        </div>
                    </div>
                </div>
            </div>



            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h6 className="text-xl mb-4 font-semibold">
                    {selectedRowData 
                        ? `Order Analysis - ${selectedRowData.sales_order}`
                        : 'Weekly Production Analysis'
                    }
                </h6>
                <div className="h-64">
                    <Line 
                        data={selectedRowData ? getSelectedRowGraphData() : lineGraphData}
                        options={{
                            responsive: true,
                            scales: {
                                y: {
                                    beginAtZero: true
                                }
                            }
                        }}
                    />
                </div>
            </div>


            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h6 className="text-2xl font-bold text-gray-700 mb-6">Status Overview</h6>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse shadow-md rounded-lg overflow-hidden">
                        <thead>
                            <tr className="bg-gray-100 text-gray-700 uppercase text-sm leading-normal">
                                <th className="border-b p-3 text-left relative">
                                    <div className="flex items-center space-x-2">
                                        <span>Distribution Center</span>
                                        <button 
                                            onClick={() => setShowFilter(!showFilter)}
                                            className="hover:bg-gray-100 p-1 rounded"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                            </svg>
                                        </button>
                                        
                                        {/* Dropdown Menu */}
                                        {showFilter && (
                                            <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg z-50 border">
                                                <div className="p-2">
                                                    {/* Clear Filter Option */}
                                                    <div 
                                                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer rounded"
                                                        onClick={() => {
                                                            const newFilters = { ...activeFilters };
                                                            delete newFilters.distribution_center;
                                                            setActiveFilters(newFilters);
                                                            setShowFilter(false);
                                                        }}
                                                    >
                                                        Clear Filter
                                                    </div>
                                                    
                                                    {/* Filter Options */}
                                                    {uniqueDistributionCenters.map((center) => (
                                                        <div
                                                            key={center}
                                                            className={`px-4 py-2 text-sm cursor-pointer rounded ${
                                                                activeFilters.distribution_center === center 
                                                                ? 'bg-blue-100 text-blue-800' 
                                                                : 'text-gray-700 hover:bg-gray-100'
                                                            }`}
                                                            onClick={() => handleFilterSelect(center)}
                                                        >
                                                            {center}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </th>
                                <th className="border-b p-3 text-left">Sales Order</th>
                                <th className="border-b p-3 text-left">Casting Status</th>
                                <th className="border-b p-3 text-left">Cast Completed</th>
                                <th className="border-b p-3 text-left">Cast Shortage</th>
                                <th className="border-b p-3 text-left">Shipment Status</th>
                                <th className="border-b p-3 text-left">Export to IE</th>
                                <th className="border-b p-3 text-left">Pending Export</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.map((row, index) => (
                                <tr 
                                    key={index} 
                                    className={`hover:bg-gray-50 transition cursor-pointer ${
                                        selectedRowData === row ? 'bg-blue-50' : ''
                                    }`}
                                    onClick={() => handleRowClick(row)}
                                >
                                    <td className="border-b p-3 text-gray-700">{row.distribution_center}</td>
                                    <td className="border-b p-3 text-gray-700">{row.sales_order}</td>
                                    <td className="border-b p-3 font-medium">
                                        {(!row.cast_completed || row.cast_completed < Math.abs(row.order_quantity)) ? (
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
                                    <td className="border-b p-3">
                                        {Math.abs(row.cast_completed || 0)}
                                        <div className="w-full mt-2 bg-gray-200 rounded-full h-2">
                                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(Math.abs(row.cast_completed || 0) / Math.abs(row.order_quantity)) * 100}%` }}></div>
                                        </div>
                                    </td>
                                    <td className="border-b p-3">
                                        {Math.abs(row.cast_shortage || 0)}
                                        <div className="w-full mt-2 bg-gray-200 rounded-full h-2">
                                            <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(Math.abs(row.cast_shortage || 0) / Math.abs(row.order_quantity)) * 100}%` }}></div>
                                        </div>
                                    </td>
                                    <td className="border-b p-3 font-medium">
                                        {(!row.export_to_ie || row.pending_export) ? (
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
                                    <td className="border-b p-3 text-gray-700">{Math.abs(row.export_to_ie || 0)}</td>
                                    <td className="border-b p-3 text-gray-700">{Math.abs(row.pending_export || 0)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-4 px-4 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Next
                    </button>
                </div>

                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-700">
                            Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                            <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of{' '}
                            <span className="font-medium">{filteredData.length}</span> results
                        </span>
                        <select
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
                            className="border rounded-md p-1 text-sm text-gray-700"
                        >
                            {[1, 5, 10, 20, 50, 100].map((size) => (
                                <option key={size} value={size}>
                                    Show {size}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex space-x-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}