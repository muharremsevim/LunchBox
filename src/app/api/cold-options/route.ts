import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Cold options mapping from keys to full descriptions
    const coldOptionsMap: Record<string, string> = {
      "Rosbief": "Rosbief (Met Sla, Bieslok, Peper en Zout)",
      "Salami": "Salami (Met Sla, Tomaat, Rode Paprika en Bieslook)",
      "Chorizo": "Chorizo (Met Sla, Tomaat, Rode Paprika en Bieslook)",
      "Gebraden Gehakt": "Gebraden Gehakt (Met Sla, Augurkjes en Bieslook)",
      "Room Pate": "Room Pate (Met Sla, Veenbesjes en Bieslook)",
      "Ardenner Patte": "Ardenner Patte (Met Sla, Veenbesjes en Bieslook)",
      "Filet American": "Filet American (Met Uitjes, Peper en Zout)",
      "Kipfilet V.H Serena": "Kipfilet V.H Serena",
      "Kalkoen": "Kalkoen (Met Sla, Mango, Paprika, Pijnboompitjes en Cumberlandsaus)",
      "Gezond": "Gezond (Kaas, Sla, Komkommer, Tomaat, Ei, Paprika, Wortel en Bieslook)",
      "Super Gezond": "Super Gezond (Alleen Rauwkorst)",
      "Jonge Kaas": "Jonge Kaas (Met Sla, Tomaat en Bieslook)",
      "Belegen Kaas": "Belegen Kaas (Met Sla, Tomaat en Bieslook)",
      "Oude Kaas": "Oude Kaas (Met Sla, Tomaat en Bieslook)",
      "Komijnekaas": "Komijnekaas (Met Sla, Tomaat en Bieslook)",
      "Roomkaas": "Roomkaas (Met Sla, Komkommer en Bieslook)",
      "Brie": "Brie (Met Sla, Komkommer en Bieslook)",
      "Bleu Castello": "Bleu Castello (Met Sla, Veenbesjes en Mint)",
      "Nootrambol": "Nootrambol (Met Sla, Roode Paprika en Bieslook)",
      "Turksekaas": "Turksekaas (Met Sla, Pomodori, Olijfjes, Peper en Basilicum)",
      "Mozzarella": "Mozzarella (Met Sla, Tomaat, Pijnboompitjes, Peper en Basilicum)",
      "Zalm": "Zalm (Met Sla, Dille, Peper en Mayonaise)",
      "Roomzalm": "Roomzalm (Zalm met Sla, Peper, Bieslook en Roomkaas)",
      "Tonijn": "Tonijn (Met Sla, Ei, Peper, Bieslook en Mayonaise)",
      "Krabsalade": "Krabsalade (Met Sla, Wortel, Dille en Peper)",
      "Eier Salade": "Eier Salade (Met Sla, Tomaat, Paprika, Wortel en Bieslook)",
      "Ei": "Ei (Met Sla, Tomaat, Paprika, Wortel, Bieslook, Peper, Zout en Mayonaise)",
      "Tost Kasarli": "Tost Kasarli",
      "Tost Sucuklu": "Tost Sucuklu",
      "Kinoa Salatasi": "Kinoa Salatasi",
      "Taze Meyve Salatasi": "Taze Meyve Salatasi",
      "Mercimek yesil salatasi": "Mercimek yesil salatasi",
      "Special Areda Salata": "Special Areda Salata",
      "Patlican Biber Kizartmasi": "Patlican Biber Kizartmasi",
      "Kisir Salatasi": "Kisir Salatasi",
      "Arpa veya kuskus sehriye salatasi": "Arpa veya kuskus sehriye salatasi",
      "Kirmizi barbunya salatasi": "Kirmizi barbunya salatasi",
      "Yogurtlu Makarna Salatasi": "Yogurtlu Makarna Salatasi",
      "Patates Salatasi": "Patates Salatasi",
      "Kozlenmis patlican Salatasi": "Kozlenmis patlican Salatasi",
      "Custom Order(Check Notes)": "Custom Order(Check Notes)",
      "Soguk(Cold) Wrap": "Soguk(Cold) Wrap",
      "Icli Kofte Menu": "Icli Kofte Menu",
      "Kahvalti Menu Pogacali": "Kahvalti Menu Pogacali"
    };

    const coldOptions = await prisma.parameter.findMany({
      where: { key: { startsWith: 'cold_' } },
      select: { value: true },
      orderBy: { key: 'asc' }
    });
    
    // Map the short keys to full descriptions
    const options = coldOptions.map(param => coldOptionsMap[param.value] || param.value);
    
    const response = NextResponse.json(options);
    response.headers.set('Cache-Control', 'public, max-age=3600');
    return response;
  } catch (error) {
    console.error('Error fetching cold options:', error);
    return NextResponse.json({ error: 'Failed to fetch cold options' }, { status: 500 });
  }
} 