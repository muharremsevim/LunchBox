'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

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

export default function AdminOrdersPage() {
  const { data: session, status } = useSession();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (status === 'authenticated' && session.user.isAdmin && date) {
      fetch(`/api/admin/orders?date=${date}`)
        .then(res => res.json())
        .then(setOrders);
    }
  }, [status, session, date]);

  if (status === 'loading') return <div>Loading...</div>;
  if (!session || !session.user.isAdmin) return <div>Unauthorized</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h1 className="text-2xl font-bold mb-4">Orders by Date</h1>
      <div className="mb-4">
        <input
          type="date"
          className="border px-3 py-2 rounded"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
      </div>
      <ul>
        {orders.length === 0 && <li className="text-gray-500">No orders for this date.</li>}
        {orders.map((order: any) => (
          <li key={order.id} className="mb-2">
            <span className="font-semibold">{order.user?.username || order.user?.email}</span> – {orderToString(order)}
          </li>
        ))}
      </ul>
    </div>
  );
}
