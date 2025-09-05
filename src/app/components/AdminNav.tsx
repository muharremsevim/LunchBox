'use client';

import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function AdminNav() {
    const { data: session, status } = useSession();
    const pathname = usePathname();

    if (status !== 'authenticated') return null;

    return (
        <nav className="bg-gray-900 text-white p-2 flex gap-4 justify-center items-center shadow-md">
            {/* Home button */}
            <button 
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
                Home
            </button>

            {/* Admin links */}
            {session?.user?.isAdmin && (
                <>
                    <button 
                        onClick={() => window.location.href = '/admin/users'}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Users
                    </button>
                    <button 
                        onClick={() => window.location.href = '/admin/orders'}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Orders
                    </button>
                    <button 
                        onClick={() => window.location.href = '/admin/today'}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Today's Orders
                    </button>
                    <button 
                        onClick={() => window.location.href = '/admin/settings'}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Email Settings
                    </button>
                </>
            )}
        </nav>
    );
}
