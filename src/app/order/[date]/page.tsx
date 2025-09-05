'use client';
import { use, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Bread and drink options will be loaded from API

export default function OrderPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = searchParams.get('edit') === '1';
  const [lunchTypes, setLunchTypes] = useState<any[]>([]);
  const [coldOptions, setColdOptions] = useState<string[]>([]);
  const [breadOptions, setBreadOptions] = useState<string[]>([]);
  const [drinkOptions, setDrinkOptions] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [customization, setCustomization] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [drink, setDrink] = useState('');
  const [bread, setBread] = useState('');
  const [existingOrder, setExistingOrder] = useState<any>(null);

  useEffect(() => {
    // Load data in parallel for better performance
    const loadData = async () => {
      try {
        const [lunchTypesRes, coldOptionsRes, breadOptionsRes, drinkOptionsRes] = await Promise.all([
          fetch('/api/lunch-types'),
          fetch('/api/cold-options'),
          fetch('/api/bread-options'),
          fetch('/api/drink-options')
        ]);
        
        const [lunchTypesData, coldOptionsData, breadOptionsData, drinkOptionsData] = await Promise.all([
          lunchTypesRes.ok ? lunchTypesRes.json() : [],
          coldOptionsRes.ok ? coldOptionsRes.json() : [],
          breadOptionsRes.ok ? breadOptionsRes.json() : [],
          drinkOptionsRes.ok ? drinkOptionsRes.json() : []
        ]);
        
        setLunchTypes(lunchTypesData);
        setColdOptions(coldOptionsData);
        setBreadOptions(breadOptionsData);
        setDrinkOptions(drinkOptionsData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
  }, []); // Only run once on mount
  
  useEffect(() => {
    // If editing, fetch existing order for this date and prefill fields
    if (isEdit) {
      const loadExistingOrder = async () => {
        try {
          const res = await fetch('/api/orders');
          const orders = await res.json();
          
          // Find order for this specific date
          for (const week of Object.values(orders)) {
            for (const order of week as any[]) {
              if (order.date.slice(0, 10) === date) {
                setExistingOrder(order);
                setSelectedType(order.lunchType?.name || '');
                setCustomization(order.customization || '');
                
                // Set bread and drink from separate fields
                if (order.breadType) {
                  setBread(order.breadType);
                }
                if (order.drinkType) {
                  setDrink(order.drinkType);
                }
                
                // Set main customization
                setCustomization(order.customization || '');
                
                // For Cold orders, use the coldType field if available
                if (order.lunchType?.name === 'Cold') {
                  if (order.coldType) {
                    setSelectedOption(order.coldType);
                  } else {
                    // Fallback: try to extract from old customization format
                    if (order.customization) {
                      const parts = order.customization.split(' | ');
                      const coldPart = parts[0];
                      if (coldPart && !coldPart.includes(' | ') && !coldPart.startsWith('Bread: ') && !coldPart.startsWith('Drink: ')) {
                        setSelectedOption(coldPart);
                      }
                    }
                  }
                }
                break;
              }
            }
          }
        } catch (error) {
          console.error('Error loading existing order:', error);
        }
      };
      
      loadExistingOrder();
    }
  }, [date, isEdit]);

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    
    // Validation
    if (!selectedType) {
      setMessage('Please select a lunch type.');
      setLoading(false);
      return;
    }
    
    const lunchTypeId = lunchTypes.find((lt: any) => lt.name === selectedType)?.id;
    if (!lunchTypeId) {
      setMessage('Please select a valid lunch type.');
      setLoading(false);
      return;
    }
    
    // Cold type is required for Cold lunch type
    if (selectedType === 'Cold' && !selectedOption) {
      setMessage('Please select a cold sandwich type.');
      setLoading(false);
      return;
    }
    
    // Build customization text (only for main customization)
    let customizationText = '';
    if (customization) {
      customizationText = customization;
    }
    
    const method = isEdit ? 'PUT' : 'POST';
    const body: any = {
      lunchTypeId,
      date,
      customization: customizationText,
      coldType: selectedType === 'Cold' ? selectedOption : null,
      breadType: bread || null,
      drinkType: drink || null,
    };
    if (isEdit && existingOrder) {
      body.id = existingOrder.id;
    }
    
    try {
      const res = await fetch('/api/orders', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      if (res.ok) {
        router.push('/');
      } else {
        const errorText = await res.text();
        let errorMessage = 'Error saving order.';
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If JSON parsing fails, use the raw text
          errorMessage = errorText || errorMessage;
        }
        
        setMessage(errorMessage);
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    }
    
    setLoading(false);
  };

  const isOrderEnabled = !!lunchTypes.length && selectedType && 
    ((selectedType !== 'Cold') || selectedOption) && 
    !!lunchTypes.find((lt: any) => lt.name === selectedType);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex bg-white rounded-lg shadow-lg w-full max-w-4xl p-8 gap-8">
        {/* Left: Menu */}
        <div className="w-1/2 border-r pr-8 max-h-[80vh]">
          <h2 className="text-xl font-bold mb-4">Cold Options</h2>
          <ul className="list-disc pl-4 text-sm">
            {coldOptions.map((opt: string) => <li key={opt}>{opt}</li>)}
          </ul>
        </div>
        {/* Right: Order form */}
        <div className="w-1/2 flex flex-col gap-4">
          <h2 className="text-xl font-bold mb-2">Order for {date}</h2>
          <select
            className="border px-3 py-2 rounded text-base"
            value={selectedType}
            onChange={e => { setSelectedType(e.target.value); setSelectedOption(''); }}
            disabled={!lunchTypes.length}
          >
            <option value="">Select food type</option>
            {lunchTypes.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
          </select>
          {selectedType === 'Cold' && (
            <select
              className="border px-3 py-2 rounded text-base"
              value={selectedOption}
              onChange={e => setSelectedOption(e.target.value)}
            >
              <option value="">Select cold option</option>
              {coldOptions.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
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
            {drinkOptions.map((d: string) => <option key={d} value={d}>{d}</option>)}
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
            disabled={loading || !isOrderEnabled}
          >{isEdit ? 'Save Changes' : 'Order'}</button>
          {message && <div className="text-red-500 mt-2">{message}</div>}
        </div>
      </div>
    </div>
  );
} 