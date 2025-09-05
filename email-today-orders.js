const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');

const prisma = new PrismaClient();

async function main() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const orders = await prisma.order.findMany({
    where: { date: today },
    include: { user: true, lunchType: true },
  });
  if (!orders.length) {
    console.log('No orders for today.');
    return;
  }
  const lines = orders.map(o => `${o.user?.username} (${o.user?.email}): ${o.lunchType?.name}${o.customization ? ' - ' + o.customization : ''}`);
  const text = `Today's Orders:\n\n` + lines.join('\n');

  // Configure your SMTP transport
  const transporter = nodemailer.createTransport({
    host: 'smtp.yourcompany.com', // CHANGE THIS
    port: 587,
    secure: false,
    auth: {
      user: 'm.sevim@dhbbank.com',
      pass: 'YOUR_PASSWORD', // CHANGE THIS
    },
  });

  await transporter.sendMail({
    from: 'm.sevim@dhbbank.com',
    to: 'sevimmuharrem@gmail.com',
    subject: "Today's Lunch Orders",
    text,
  });
  console.log('Email sent!');
}

main().catch(e => { console.error(e); process.exit(1); }); 