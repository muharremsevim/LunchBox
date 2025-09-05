'use client';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from "next/link";
import {usePathname} from "next/navigation";
import LinkButton from "@/app/components/LinkButton";

function getWeekdays(startDate: Date, weekOffset: number) {
  // Get Monday of the week
  const monday = new Date(startDate);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7) + weekOffset * 7);
  const days = [];
  for (let d = 0; d < 5; d++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + d);
    days.push({
      date: day.toISOString().slice(0, 10),
      dayName: day.toLocaleDateString('en-US', { weekday: 'long' }),
      isToday: day.toDateString() === new Date().toDateString(),
    });
  }
  return days;
}

function getMonday(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay();
  // ISO: Monday is 1, Sunday is 0 (so treat Sunday as 7)
  const isoDay = day === 0 ? 7 : day;
  d.setUTCDate(d.getUTCDate() - (isoDay - 1));
  return d;
}

function getWeekdaysForDisplay(today: Date) {
  // Always show current week's Monday to Friday, even if today is weekend
  const thisMonday = getMonday(today);
  const nextMonday = new Date(thisMonday);
  nextMonday.setDate(thisMonday.getDate() + 7);
  const getWeek = (monday: Date) => Array.from({ length: 5 }, (_, d) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + d);
    return {
      date: day.toISOString().slice(0, 10),
      dayName: day.toLocaleDateString('en-US', { weekday: 'long' }),
      isToday: day.toDateString() === today.toDateString(),
    };
  });
  return {
    thisWeek: getWeek(thisMonday),
    nextWeek: getWeek(nextMonday),
  };
}

function getAmsterdamNow() {
  // Use Intl.DateTimeFormat to get Amsterdam local time
  const now = new Date();
  const ams = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Amsterdam' }));
  return ams;
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const [lunchTypes, setLunchTypes] = useState([]);
  const [orders, setOrders] = useState<any>({});
  const [selectedType, setSelectedType] = useState('');
  const [customization, setCustomization] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [editOrderId, setEditOrderId] = useState<number|null>(null);
  const [editLunchType, setEditLunchType] = useState('');
  const [editCustomization, setEditCustomization] = useState('');
  const [activeDate, setActiveDate] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [lunchTypesRes, ordersRes] = await Promise.all([
          fetch('/api/lunch-types'),
          status === 'authenticated' ? fetch('/api/orders') : Promise.resolve(null)
        ]);
        
        const [lunchTypesData, ordersData] = await Promise.all([
          lunchTypesRes.json(),
          ordersRes ? ordersRes.json() : Promise.resolve({})
        ]);
        
        setLunchTypes(lunchTypesData);
        if (status === 'authenticated') {
          setOrders(ordersData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
  }, [status]);

  const now = getAmsterdamNow();
  const todayStr = now.toISOString().slice(0, 10);
  const isPast = (dateStr: string) => {
    const boxDate = new Date(new Date(dateStr).toLocaleString('en-US', { timeZone: 'Europe/Amsterdam' }));
    return boxDate < new Date(now.getFullYear(), now.getMonth(), now.getDate());
  };
  const isToday = (dateStr: string) => dateStr === todayStr;
  const isTodayAfter10 = now.getHours() >= 10;

  const { thisWeek, nextWeek } = getWeekdaysForDisplay(new Date());

  const getOrderForDate = (date: string) => {
    for (const week of Object.values(orders)) {
      for (const order of week as any[]) {
        if (order.date.slice(0, 10) === date) return order;
      }
    }
    return null;
  };

  const canOrder = (date: string) => {
    if (isPast(date)) return false;
    if (isToday(date) && isTodayAfter10) return false;
    return true;
  };

  const handleOrder = async (date: string) => {
    if (!selectedType) return;
    setLoading(true);
    setMessage('');
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lunchTypeId: Number(selectedType),
        date,
        customization,
      }),
    });
    if (res.ok) {
      setMessage('Order placed!');
      fetch('/api/orders').then((r) => r.json()).then(setOrders);
      setSelectedType('');
      setCustomization('');
      setActiveDate('');
    } else {
      const err = await res.json();
      setMessage(err.error || 'Error placing order.');
    }
    setLoading(false);
  };

  const handleEdit = (order: any) => {
    setEditOrderId(order.id);
    setEditLunchType(order.lunchTypeId.toString());
    setEditCustomization(order.customization || '');
    setActiveDate(order.date.slice(0, 10));
  };

  const handleEditSave = async (order: any) => {
    setLoading(true);
    setMessage('');
    const res = await fetch('/api/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: order.id,
        lunchTypeId: Number(editLunchType),
        date: order.date,
        customization: editCustomization,
      }),
    });
    if (res.ok) {
      setMessage('Order updated!');
      setEditOrderId(null);
      setEditLunchType('');
      setEditCustomization('');
      setActiveDate('');
      fetch('/api/orders').then((r) => r.json()).then(setOrders);
    } else {
      const err = await res.json();
      setMessage(err.error || 'Error updating order.');
    }
    setLoading(false);
  };

  if (status === 'loading') return <div>Loading...</div>;
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-sm text-center">
          <h1 className="text-2xl font-bold mb-6">LunchBox</h1>
          <p className="mb-4">You must be logged in to order lunch.</p>
          <button onClick={() => signIn()} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">Sign in</button>
        </div>
      </div>
    );
  }
  const adminLinkClasses = (isActive) =>
      `rounded px-4 py-1 text-sm font-semibold transition 
     ${isActive ? 'bg-blue-900' : 'bg-blue-700 hover:bg-blue-800'} 
     text-white`;
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Logo and nav bar */}
      <div className="flex flex-col items-center w-full mb-8">
        <div className="flex items-center w-full max-w-6xl mx-auto mt-4 mb-2 px-4">
          <div className="flex-shrink-0">
            <Image src="/dhb-logo.png" alt="Logo" className={`logo`} width={74} height={68} />
          </div>
        </div>
        {/* Header navigation */}
        <div className="flex gap-4 items-center flex-wrap">
          <button 
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium shadow-md hover:shadow-lg"
          >
            Home
          </button>
          <button 
            onClick={() => window.location.href = '/guest'}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium shadow-md hover:shadow-lg"
          >
            Guest Registration
          </button>
          {/* Admin links */}
          {session?.user?.isAdmin && (
              <>
                <button 
                  onClick={() => window.location.href = '/admin/users'}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
                >
                  Users
                </button>
                <button 
                  onClick={() => window.location.href = '/admin/orders'}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
                >
                  Orders
                </button>
                <button 
                  onClick={() => window.location.href = '/admin/today'}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
                >
                  Today's Orders
                </button>
                <button 
                  onClick={() => window.location.href = '/admin/settings'}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
                >
                  Email Settings
                </button>
              </>
          )}
        </div>
      </div>
      {/* Day view as card-deck (this week) */}
      <div className="page-content">
        <div className="container">
          <div className="row home-row-1 faq-row clearfix padding-75">
            <div className="col-12 col-lg-12">
              <div className="card-deck">
                {thisWeek.map(({ date, dayName }) => {
                  const order = getOrderForDate(date);
                  const editable = canOrder(date);
                  return (
                    <div key={date} className={`card home-card ${editable ? 'can-edit' : ''}`}>
                      <div className="card-body">
                        <h1 className="card-title">{date.slice(8,10)}/{date.slice(5,7)}</h1>
                        <h2 className="card-text">{dayName}</h2>
                        <h3 className="card-text">{order?.lunchType?.name ? String(order.lunchType.name).toUpperCase() : ''}</h3>
                      </div>
                      {editable && (
                        <ul className="list-group list-group-flush">
                          <li className="list-group-item">
                            <div 
                              className="order-action-area cursor-pointer hover:bg-gray-50 transition-colors"
                              onClick={() => window.location.href = order ? `/order/${date}?edit=1` : `/order/${date}`}
                            >
                              {order ? 'Edit' : 'Order'}
                            </div>
                          </li>
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          <div className="col-12 col-lg-12 mt-20">
            <div className="card-deck">
              {nextWeek.map(({ date, dayName }) => {
                const order = getOrderForDate(date);
                const editable = canOrder(date);
                return (
                  <div key={date} className={`card home-card ${editable ? 'can-edit' : ''}`}>
                    <div className="card-body">
                      <h1 className="card-title">{date.slice(8,10)}/{date.slice(5,7)}</h1>
                      <h2 className="card-text">{dayName}</h2>
                      <h3 className="card-text">{order?.lunchType?.name ? String(order.lunchType.name).toUpperCase() : ''}</h3>
                    </div>
                    {editable && (
                      <ul className="list-group list-group-flush">
                        <li className="list-group-item">
                          <div 
                            className="order-action-area cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => window.location.href = order ? `/order/${date}?edit=1` : `/order/${date}`}
                          >
                            {order ? 'Edit' : 'Order'}
                          </div>
                        </li>
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
