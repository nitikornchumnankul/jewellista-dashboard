import React from 'react';
import Layout from '../../components/Layout';

export default function Reports() {
    return (
        <Layout>
            <div className="p-6">
                <h1 className="text-2xl font-semibold mb-6">Reports & Analytics</h1>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-gray-500 text-sm">Total Sales</h3>
                        <p className="text-2xl font-semibold">$24,999</p>
                        <span className="text-green-500 text-sm">+12.5% from last month</span>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-gray-500 text-sm">Total Orders</h3>
                        <p className="text-2xl font-semibold">156</p>
                        <span className="text-green-500 text-sm">+5.3% from last month</span>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-gray-500 text-sm">Average Order Value</h3>
                        <p className="text-2xl font-semibold">$160.25</p>
                        <span className="text-red-500 text-sm">-2.1% from last month</span>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-gray-500 text-sm">Total Customers</h3>
                        <p className="text-2xl font-semibold">892</p>
                        <span className="text-green-500 text-sm">+8.2% from last month</span>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4">Sales Overview</h3>
                        <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                            Chart Placeholder
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4">Top Products</h3>
                        <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                            Chart Placeholder
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
} 