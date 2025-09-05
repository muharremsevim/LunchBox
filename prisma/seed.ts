// Import PrismaClient for database access and Prisma for types
import {PrismaClient, Prisma} from '@prisma/client';
// Import bcrypt for password hashing
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
    console.log(`✅ Start seeding ...`);

    // --- 1. Delete Old Data (Best Practice) ---
    // To ensure a clean slate, delete in reverse order of dependency.
    console.log('🗑️  Deleting existing data...');
    await prisma.parameter.deleteMany({});
    await prisma.lunchType.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('✅ Existing data deleted.');

    // --- 2. Create Users ---
    console.log('🌱 Seeding users...');
    // Use Prisma's generated types for full type safety and autocompletion
    const usersData: Prisma.UserCreateInput[] = [
        {
            username: 'testuser',
            email: 'test@example.com',
            // Store plain password here, we will hash it in the loop
            password: 'testpass',
            isAdmin: true,
        },
        {
            username: 'muharrem',
            email: 'm.sevim@dhbbank.com',
            password: 'Dhbbank2025!',
            isAdmin: false,
        },
    ];

    for (const userData of usersData) {
        // Hash the password before creating the user
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        await prisma.user.upsert({
            where: {email: userData.email},
            update: {},
            create: {
                ...userData,
                password: hashedPassword,
            },
        });
    }
    console.log(`✅ ${usersData.length} users seeded.`);

    // --- 3. Create Lunch Types ---
    console.log('🌱 Seeding lunch types...');
    const lunchTypesData: Prisma.LunchTypeCreateInput[] = [
        {name: 'Cold', price: 4.3},
        {name: 'Salad', price: 4.3},
        {name: 'Diet', price: 4.3},
        {name: 'Menu of the Day', price: 4.3},
    ];

    for (const lunch of lunchTypesData) {
        await prisma.lunchType.upsert({
            where: {name: lunch.name},
            update: {},
            create: lunch,
        });
    }
    console.log(`✅ ${lunchTypesData.length} lunch types seeded.`);

    // --- 4. Create Parameters ---
    console.log('🌱 Seeding parameters...');

    // Cold options with short keys and full descriptions
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

    // Create numbered cold option parameters
    let coldIndex = 1;
    for (const [key, value] of Object.entries(coldOptionsMap)) {
        await prisma.parameter.upsert({
            where: {key: `cold_${coldIndex}`},
            update: {value: key},
            create: {key: `cold_${coldIndex}`, value: key},
        });
        coldIndex++;
    }

    // Bread options
    const breadOptions = [
        "Italiaanse Bol", "Ciabatta", "Boeren Bol", "Witte en Bruine Pistolet", "Grof Volkoren Bolletje",
        "Demi Baguette Rustiek", "Demi Baguette Meergranen", "Zacht Witte Broodje", "Zacht Bruin Broodje"
    ];

    // Create numbered bread parameters
    let breadIndex = 1;
    for (const bread of breadOptions) {
        await prisma.parameter.upsert({
            where: {key: `bread_${breadIndex}`},
            update: {value: bread},
            create: {key: `bread_${breadIndex}`, value: bread},
        });
        breadIndex++;
    }

    // Drink options
    const drinkOptions = [
        "Melk", "Karnemelk", "Ayran", "Orange Juice", "Apple Juice"];

    // Create numbered drink parameters
    let drinkIndex = 1;
    for (const drink of drinkOptions) {
        await prisma.parameter.upsert({
            where: {key: `drink_${drinkIndex}`},
            update: {value: drink},
            create: {key: `drink_${drinkIndex}`, value: drink},
        });
        drinkIndex++;
    }

    await prisma.parameter.upsert({
        where: {key: 'email_sender'},
        update: {value: 'm.sevim@dhbbank.com'},
        create: {key: 'email_sender', value: 'm.sevim@dhbbank.com'},
    });

    await prisma.parameter.upsert({
        where: {key: 'email_recipient'},
        update: {value: 'sevimmuharrem@gmail.com;m.sevim@dhbbank.com'},
        create: {key: 'email_recipient', value: 'sevimmuharrem@gmail.com;m.sevim@dhbbank.com'},
    });
    console.log(`✅ Parameters seeded.`);
}

main()
    .catch((e) => {
        console.error("❌ An error occurred while seeding the database:");
        if (e instanceof Error) {
            console.error(e.message);
        } else {
            console.error(e);
        }
        process.exit(1);
    })
    .finally(async () => {
        console.log('🔚 Disconnecting Prisma Client...');
        await prisma.$disconnect();
    });