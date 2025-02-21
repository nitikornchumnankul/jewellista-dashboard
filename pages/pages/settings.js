import React from 'react';
import Layout from '../../components/Layout';

export default function Settings() {
    return (
        <Layout>
            <div className="p-6">
                <h1 className="text-2xl font-semibold mb-6">Settings</h1>

                <div className="bg-white rounded-lg shadow">
                    {/* Profile Settings */}
                    <div className="p-6 border-b">
                        <h2 className="text-lg font-medium mb-4">Profile Settings</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Store Name
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border rounded-lg"
                                    defaultValue="Jewellista Store"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-2 border rounded-lg"
                                    defaultValue="contact@jewellista.com"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Notification Settings */}
                    <div className="p-6 border-b">
                        <h2 className="text-lg font-medium mb-4">Notification Settings</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium">Email Notifications</h3>
                                    <p className="text-sm text-gray-500">Receive email about new orders</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium">SMS Notifications</h3>
                                    <p className="text-sm text-gray-500">Receive SMS for order updates</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="p-6">
                        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
} 