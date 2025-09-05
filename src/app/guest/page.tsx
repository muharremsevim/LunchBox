'use client';
import {useSession} from 'next-auth/react';
import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';

const MENU = [
    {
        type: 'Cold', options: ['Rosbief (Met Sla,Bieslok, Peper en Zout)',
            'Salami (Met Sla,Tomaat, Rode Paprika en Bieslook)',
            'Chorizo (Met Sla, Tomaat, Rode Paprika en Bieslook)',
            'Gebraden Gehakt (Met Sla, Augurkjes en Bieslook)',
            'Room Pate (Met Sla, Veenbesjes en Bieslook)',
            'Ardenner Patte (Met SlaVeenbesjes en Bieslook)',
            'Filet American (Met Uitjes, Peper en Zout)',
            'Kipfilet V.H Serena',
            'Kalkoen (Met Sla,Mango,Paprika,Pijnboompitjes en Cumberlandsaus)',
            'Gezond (Kaas, Sla,Komkommer, Tomaat,Ei,Paprika,Wortel en Bieslook)',
            'Super Gezond (Alleen Rauwkorst)',
            'Jonge Kaas (Met Sla, Tomaat en Bieslook)',
            'Belegen Kaas (Met Sla, Tomaat en Bieslook)',
            'Oude Kaas (Met Sla, Tomaat en Bieslook)',
            'Komijnekaas (Met Sla, Tomaat en Bieslook)',
            'Roomkaas (Met Sla, Komkommer en Bieslook)',
            'Brie (Met Sla, Komkommer en Bieslook)',
            'Bleu Castello (Met Sla, Veenbesjes en Mint)',
            'Nootrambol (Met Sla, Roode Paprika en Bieslook)',
            'Turksekaas (Met Sla, Pomodorri, Olijfjes, Peper en Basilicum)',
            'Mozzarella (Met Sla, Tomaat, Pijnboompitjes, Peper en Basilicum)',
            'Zalm (Met Sla, Dille, Peper en Mayonaise)',
            'Roomzalm (Zalm met Sla, Peper, Bieslook en Roomkaas)',
            'Tonijn (Met Sla, Ei, Peper, Bieslook en Mayonaise)',
            'Krabsalade (Met Sla, Wortel, Dille en Peper)',
            'Eier Salade (Met Sla, Tomaat, Paprika, Wortel en Bieslook)',
            'Ei (Met Sla, Tomaat, Paprika, Wortel, Bieslook, Peper, Zout en Mayonaise)',
            'Tost Kasarli',
            'Tost Sucuklu',
            'Kinoa Salatasi',
            'Taze Meyve Salatasi',
            'Mercimek yesil salatasi',
            'Special Areda Salata',
            'Patlican Biber Kizartmasi',
            'Kisir Salatasi',
            'Arpa veya kuskus sehriye salatasi',
            'Kirmizi barbunya salatasi',
            'Yogurtlu Makarna Salatasi',
            'Patates Salatasi',
            'Kozlenmis patlican Salatasi',
            'Custom Order(Check Notes)',
            'Soguk(Cold) Wrap',
            'Icli Kofte Menu',
            'Kahvalti Menu Pogacali']
    },
    {type: 'Diet', options: []},
    {type: 'Salad', options: []},
    {type: 'Menu of the Day', options: []},
];
const DRINKS = ['Milk', 'Karnemelk', 'Ayran', 'Orange Juice', 'Apple Juice'];
// Bread options will be loaded from API

export default function GuestPage() {
    const {data: session, status} = useSession();
    const router = useRouter();
    const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [lunchType, setLunchType] = useState('');
    const [sandwich, setSandwich] = useState('');
    const [bread, setBread] = useState('');
    const [drink, setDrink] = useState('');
    const [customization, setCustomization] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [breadOptions, setBreadOptions] = useState([]);
    const [drinkOptions, setDrinkOptions] = useState([]);

    useEffect(() => {
        // Load bread and drink options
        const loadOptions = async () => {
            try {
                const [breadRes, drinkRes] = await Promise.all([
                    fetch('/api/bread-options'),
                    fetch('/api/drink-options')
                ]);
                
                const [breadData, drinkData] = await Promise.all([
                    breadRes.ok ? breadRes.json() : [],
                    drinkRes.ok ? drinkRes.json() : []
                ]);
                
                setBreadOptions(breadData);
                setDrinkOptions(drinkData);
            } catch (error) {
                console.error('Error loading options:', error);
            }
        };
        
        loadOptions();
    }, []);

    if (status === 'loading') return <div>Loading...</div>;
    if (!session) return <div>Unauthorized</div>;

    const handleSave = async () => {
        setLoading(true);
        setMessage('');
        let customizationText = '[GUEST] ' + customization;
        if (lunchType === 'Cold' && sandwich) {
            customizationText = '[GUEST] ' + sandwich + (customization ? ' - ' + customization : '');
        }
        if (bread) customizationText += ` | Bread: ${bread}`;
        if (drink) customizationText += ` | Drink: ${drink}`;
        customizationText += ' | Price: 10 Euro';
        // Find lunchTypeId
        const lunchTypeId = 1; // fallback, should fetch from API if needed
        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                lunchTypeId,
                date,
                customization: customizationText,
            }),
        });
        if (res.ok) {
            setMessage('Guest order placed!');
            setTimeout(() => router.push('/'), 1000);
        } else {
            const err = await res.json();
            setMessage(err.error || 'Error placing guest order.');
        }
        setLoading(false);
    };

    const options = MENU.find(m => m.type === lunchType)?.options || [];

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-8 flex flex-col gap-4">
                <h1 className="text-2xl font-bold mb-4">Guest Registration (10 Euro)</h1>
                <input
                    type="date"
                    className="border px-3 py-2 rounded text-base"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                />
                <select
                    className="border px-3 py-2 rounded text-base"
                    value={lunchType}
                    onChange={e => {
                        setLunchType(e.target.value);
                        setSandwich('');
                    }}
                >
                    <option value="">Select food type</option>
                    {MENU.map(m => <option key={m.type} value={m.type}>{m.type}</option>)}
                </select>
                {lunchType === 'Cold' && (
                    <select
                        className="border px-3 py-2 rounded text-base"
                        value={sandwich}
                        onChange={e => setSandwich(e.target.value)}
                    >
                        <option value="">Select sandwich</option>
                        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                )}
                <select
                    className="border px-3 py-2 rounded text-base"
                    value={bread}
                    onChange={e => setBread(e.target.value)}
                >
                    <option value="">Select bread</option>
                    {breadOptions.map((b: string) => <option key={b} value={b}>{b}</option>)}
                </select>
                <select
                    className="border px-3 py-2 rounded text-base"
                    value={drink}
                    onChange={e => setDrink(e.target.value)}
                >
                    <option value="">Select drink</option>
                    {DRINKS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <input
                    type="text"
                    className="border px-3 py-2 rounded text-base"
                    placeholder="Customization (max 300 chars)"
                    maxLength={300}
                    value={customization}
                    onChange={e => setCustomization(e.target.value)}
                />
                <button
                    onClick={handleSave}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-base mt-2"
                    disabled={loading || !lunchType || (lunchType === 'Cold' && !sandwich)}
                >Order for Guest
                </button>
                {message && <div className="text-green-600 mt-2">{message}</div>}
            </div>
        </div>
    );
} 