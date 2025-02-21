import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout({ children }) {
    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 overflow-x-hidden relative">
                <Navbar />
                <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 mt-17">
                    {children}
                </main>
            </div>
        </div>
    );
} 