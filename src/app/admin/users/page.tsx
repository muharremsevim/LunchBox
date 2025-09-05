'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session.user.isAdmin) {
      const loadUsers = async () => {
        try {
          const res = await fetch('/api/admin/users');
          const usersData = await res.json();
          setUsers(usersData);
        } catch (error) {
          console.error('Error loading users:', error);
        }
      };
      
      loadUsers();
    }
  }, [status, session]);

  const toggleAdminRights = async (userId: number, currentAdminStatus: boolean) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isAdmin: !currentAdminStatus }),
      });
      if (res.ok) {
        // Refresh the users list
        const updatedUsers = await fetch('/api/admin/users').then(res => res.json());
        setUsers(updatedUsers);
      } else {
        console.error('Failed to update admin rights');
      }
    } catch (error) {
      console.error('Error updating admin rights:', error);
    }
    setLoading(false);
  };

  if (status === 'loading') return <div>Loading...</div>;
  if (!session || !session.user.isAdmin) return <div>Unauthorized</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <table className="w-full text-left border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Admin</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user: any) => (
            <tr key={user.id} className="border-t">
              <td className="p-2">{user.username}</td>
              <td className="p-2">{user.email}</td>
              <td className="p-2">{user.isAdmin ? 'Yes' : 'No'}</td>
              <td className="p-2">
                <button
                  onClick={() => toggleAdminRights(user.id, user.isAdmin)}
                  disabled={loading}
                  className={`px-3 py-1 rounded text-xs ${
                    user.isAdmin 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-green-500 text-white hover:bg-green-600'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {user.isAdmin ? 'Revoke Admin' : 'Grant Admin'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 