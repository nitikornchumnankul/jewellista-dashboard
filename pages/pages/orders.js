import React from 'react';
import Layout from '../../components/Layout';

export default function Orders() {
    return (
        <Layout>
            <div className="p-6">
                <h1 className="text-2xl font-semibold mb-6">Orders Management</h1>
                
                {/* Filters */}
                <div className="mb-6 flex gap-4">
                    <input
                        type="text"
                        placeholder="Search order ID..."
                        className="px-4 py-2 border rounded-lg"
                    />
                    <select className="px-4 py-2 border rounded-lg">
                        <option>All Status</option>
                        <option>Pending</option>
                        <option>Processing</option>
                        <option>Completed</option>
                        <option>Cancelled</option>
                    </select>
                    <input
                        type="date"
                        className="px-4 py-2 border rounded-lg"
                    />
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap">#ORD-001</td>
                                <td className="px-6 py-4 whitespace-nowrap">John Doe</td>
                                <td className="px-6 py-4 whitespace-nowrap">2024-02-20</td>
                                <td className="px-6 py-4 whitespace-nowrap">$1,299.99</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                        Pending
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button className="text-blue-600 hover:text-blue-900">View Details</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
} 