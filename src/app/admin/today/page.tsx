'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function orderToString(order: any) {
  let str = order.lunchType?.name || '';
  if (order.lunchType?.name === 'Cold' && order.customization) {
    const [sandwich, rest] = order.customization.split(' - ');
    str += ` – ${sandwich}`;
    if (rest) str += ` – ${rest}`;
  } else if (order.customization) {
    str += ` – ${order.customization}`;
  }
  return str;
}

export default function AdminTodayPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (status === 'authenticated' && session.user.isAdmin) {
      const loadData = async () => {
        try {
          const [ordersRes, usersRes] = await Promise.all([
            fetch(`/api/admin/orders?date=${today}`),
            fetch('/api/admin/users')
          ]);
          
          const [ordersData, usersData] = await Promise.all([
            ordersRes.json(),
            usersRes.json()
          ]);
          
          setOrders(ordersData);
          setUsers(usersData);
        } catch (error) {
          console.error('Error loading admin data:', error);
        }
      };
      
      loadData();
    }
  }, [status, session, today]);

  if (status === 'loading') return <div>Loading...</div>;
  if (!session || !session.user.isAdmin) return <div>Unauthorized</div>;

  // Map userId to order
  const orderMap = Object.fromEntries(orders.map((o: any) => [o.userId, o]));

  // Time restriction logic (same as in main page)
  const now = new Date();
  const isTodayAfter10 = now.getHours() >= 10;
  const isWeekend = () => {
    const day = now.getDay();
    return day === 0 || day === 6;
  };

  const canOrderToday = !isTodayAfter10 && !isWeekend();

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h1 className="text-2xl font-bold mb-4">Today's Orders</h1>
      {!canOrderToday && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          {isTodayAfter10 ? "Orders cannot be created or edited after 10 AM today." : "Orders cannot be created or edited on weekends."}
        </div>
      )}
      <ul>
        {users.length === 0 && <li className="text-gray-500">No users found.</li>}
        {users.map((user: any) => {
          const order = orderMap[user.id];
          return (
            <li key={user.id} className="mb-2 flex items-center gap-2">
              <span className="font-semibold">{user.username || user.email}</span> – {order ? orderToString(order) : <span className="text-gray-400">No order</span>}
              {canOrderToday && (
                <button
                  className="ml-2 text-blue-600 text-xs border px-2 py-1 rounded hover:bg-blue-100"
                  onClick={() => router.push(`/order/${today}?edit=1&user=${user.id}`)}
                >{order ? 'Edit' : 'Create'}</button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
} 