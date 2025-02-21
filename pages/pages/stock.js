'use client';

import React from 'react';
import Layout from '../../components/Layout';

export default function Stock() {
    return (
        <Layout>
            <div className="p-6">
                <h1 className="text-2xl font-semibold mb-6">Stock Management</h1>
                
                {/* Search and Filter Section */}
                <div className="mb-6 flex justify-between items-center">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="px-4 py-2 border rounded-lg"
                        />
                        <select className="px-4 py-2 border rounded-lg">
                            <option>All Categories</option>
                            <option>Rings</option>
                            <option>Necklaces</option>
                            <option>Earrings</option>
                        </select>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                        Add New Product
                    </button>
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-lg shadow">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Product
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Stock
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                Diamond Ring
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm text-gray-900">Rings</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm text-gray-900">15</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm text-gray-900">$999.99</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                                    <button className="text-red-600 hover:text-red-900">Delete</button>
                                </td>
                            </tr>
                            {/* Add more rows as needed */}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
}