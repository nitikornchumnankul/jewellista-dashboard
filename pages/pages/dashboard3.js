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
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-sm border-r border-gray-200">
                <div className="flex flex-col h-full">
                    {/* Logo Section */}
                    <div className="flex items-center justify-center h-17 border-b border-gray-200">
                        <img
                            className="h-17 w-auto"
                            src="/jewellista.png"
                            alt="Jewellista Logo"
                        />
                    </div>
                    
                    {/* Navigation Links */}
                    <nav className="flex-1 px-4 py-4">
                        <div className="space-y-2">
                            <a href="#" className="flex items-center space-x-3 px-4 py-3 text-blue-600 bg-blue-50 rounded-lg font-medium">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                <span>Dashboard</span>
                            </a>
                            <a href="#" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                                <span>Stock</span>
                            </a>
                            <a href="#" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <span>Orders</span>
                            </a>
                            <a href="#" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <span>Reports</span>
                            </a>
                            <a href="#" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>Settings</span>
                            </a>
                        </div>
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-x-hidden">
                {/* Navigation Bar - Fixed */}
                <nav className="fixed top-0 right-0 left-64 z-10 bg-white shadow-sm border-b border-gray-200">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-17">
                            {/* Left side - Page Title */}
                            <h1 className="text-xl font-semibold text-gray-800">Stock Management</h1>

                            {/* Right side - User Controls */}
                            <div className="flex items-center space-x-4">
                                {/* Search */}
                                <div className="hidden md:flex items-center">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search..."
                                            className="w-64 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <svg className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Notifications */}
                                <button className="p-2 rounded-full hover:bg-gray-100">
                                    <svg className="h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                </button>

                                {/* User Profile */}
                                <div className="flex items-center space-x-3">
                                    <img
                                        className="h-8 w-8 rounded-full"
                                        src="/jewellista.png"
                                        alt="User avatar"
                                    />
                                    <div className="hidden md:block">
                                        <p className="text-sm font-medium text-gray-700">Admin</p>
                                        <p className="text-xs text-gray-500">Admin</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Main Content Area - Add top padding to account for fixed navbar */}
                <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 mt-17">
                    {/* Overview Cards */}
                    <section className="mb-6">
                        <div className="grid grid-cols-1 gap-6">
                            {/* Production Overview */}
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h2 className="text-2xl font-inter font-semibold mb-4 text-gray-900">Production Overview</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {/* Total Orders */}
                                    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-600">Total Orders</p>
                                                <p className="text-2xl font-bold text-gray-800">{totalOrders}</p>
                                            </div>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Pending Orders */}
                                    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-600">Pending Orders</p>
                                                <p className="text-2xl font-bold text-gray-800">{pendingOrders}</p>
                                            </div>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Completed Orders */}
                                    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-600">Completed Orders</p>
                                                <p className="text-2xl font-bold text-gray-800">{completedOrders}</p>
                                            </div>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Shipment Overview */}
                            <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                                <h2 className="text-2xl font-inter font-semibold mb-4 text-gray-900">Shipment Overview</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {/* Total Shipped - เปลี่ยนจากสีเขียวเป็นสีน้ำเงิน */}
                                    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-600">Total Shipped</p>
                                                <p className="text-2xl font-bold text-gray-800">{completedOrders}</p>
                                            </div>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Pending Shipments */}
                                    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-600">Pending Shipments</p>
                                                <p className="text-2xl font-bold text-gray-800">{pendingOrders}</p>
                                            </div>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Failed Shipments */}
                                    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-600">Failed Shipments</p>
                                                <p className="text-2xl font-bold text-gray-800">0</p>
                                            </div>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Chart / Analysis Section */}
                    <section className="mb-6 bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">
                            {selectedRowData
                                ? `Order Analysis - ${selectedRowData.sales_order}`
                                : 'Weekly Production Analysis'
                            }
                        </h2>
                        <div className="h-64">
                            <Line
                                data={selectedRowData ? getSelectedRowGraphData() : lineGraphData}
                                options={{
                                    responsive: true,
                                    scales: {
                                        y: { beginAtZero: true }
                                    }
                                }}
                            />
                        </div>
                    </section>

                    {/* Data Table */}
                    <section className="bg-white p-6 rounded-2xl shadow">
                        <h2 className="text-2xl font-bold text-gray-700 mb-6">Status Overview</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-100 text-gray-700 uppercase text-sm">
                                        <th className="px-6 py-4 bg-gray-50 text-left text-xs font-inter font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">
                                            <div className="flex items-center space-x-2">
                                                <span>Distribution Center</span>
                                                <button
                                                    onClick={() => setShowFilter(!showFilter)}
                                                    className="hover:bg-gray-100 p-1 rounded focus:outline-none"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                                    </svg>
                                                </button>
                                                {/* Dropdown Filter */}
                                                {showFilter && (
                                                    <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg z-50 border">
                                                        <div className="p-2">
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
                                                            {uniqueDistributionCenters.map((center) => (
                                                                <div
                                                                    key={center}
                                                                    className={`px-4 py-2 text-sm cursor-pointer rounded ${activeFilters.distribution_center === center
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
                                        <th className="px-6 py-4 bg-gray-50 text-left text-xs font-inter font-medium text-gray-500 uppercase tracking-wider">Sales Order</th>
                                        <th className="px-6 py-4 bg-gray-50 text-left text-xs font-inter font-medium text-gray-500 uppercase tracking-wider">Cast Completed</th>
                                        <th className="px-6 py-4 bg-gray-50 text-left text-xs font-inter font-medium text-gray-500 uppercase tracking-wider">Casting Status</th>
                                        <th className="px-6 py-4 bg-gray-50 text-left text-xs font-inter font-medium text-gray-500 uppercase tracking-wider">Cast Shortage</th>
                                        <th className="px-6 py-4 bg-gray-50 text-left text-xs font-inter font-medium text-gray-500 uppercase tracking-wider">Pending Export</th>
                                        <th className="px-6 py-4 bg-gray-50 text-left text-xs font-inter font-medium text-gray-500 uppercase tracking-wider">Export to IE</th>
                                        <th className="px-6 py-4 bg-gray-50 text-left text-xs font-inter font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">Shipment Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedData.map((row, index) => (
                                        <tr key={index} 
                                            className={`hover:bg-gray-50 transition-colors duration-150 ease-in-out cursor-pointer
                                                ${selectedRowData === row ? 'bg-blue-50 hover:bg-blue-100' : ''}`}
                                            onClick={() => handleRowClick(row)}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.distribution_center}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{row.sales_order}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {Math.abs(row.cast_completed || 0)}
                                                <div className="w-full mt-2 bg-gray-200 rounded-full h-2">
                                                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(Math.abs(row.cast_completed || 0) / Math.abs(row.order_quantity)) * 100}%` }}></div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
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
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{Math.abs(row.cast_shortage || 0)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{Math.abs(row.pending_export || 0)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{Math.abs(row.export_to_ie || 0)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {(!row.export_to_ie || row.pending_export) ? (
                                                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                                                        Pending
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                                        Shipped
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Pagination Controls */}
                    <section className="mt-6">
                        <div className="flex flex-col sm:flex-row items-center justify-between bg-gray-50 border-t border-gray-200 px-4 py-3">
                            {/* Mobile Pagination */}
                            <div className="flex justify-between w-full sm:hidden">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="ml-3 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                            {/* Desktop Pagination */}
                            <div className="hidden sm:flex items-center justify-between w-full">
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
                                        className="px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}