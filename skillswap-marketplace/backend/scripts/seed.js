/**
 * scripts/seed.js
 * Run: node scripts/seed.js
 * Populates MongoDB with realistic test data: users, services, bookings, reviews, messages
 */
require('dotenv').config();
const mongoose = require('mongoose');

const User    = require('../src/models/user.model');
const Service = require('../src/models/service.model');
const Booking = require('../src/models/booking.model');
const Review  = require('../src/models/review.model');
const Message = require('../src/models/message.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/skill-exchange';

// ── Seed data ─────────────────────────────────────────────────────────────────

const PROVIDERS = [
  {
    name: 'Alex Chen', email: 'alex@skillswap.dev', password: 'Password123',
    role: 'provider', bio: 'Full-stack developer with 8 years experience building scalable web applications.',
    skillsOffered: ['React','Node.js','Python','TypeScript','PostgreSQL'],
    location: { type:'Point', coordinates:[0,0], city:'San Francisco', state:'CA', country:'USA' },
    rating: { average: 4.9, count: 127 }, isVerified: true,
  },
  {
    name: 'Sarah Kim', email: 'sarah@skillswap.dev', password: 'Password123',
    role: 'provider', bio: 'Creative designer specializing in user-centered digital experiences and brand identity.',
    skillsOffered: ['UI/UX','Figma','Branding','Illustrator','Motion Design'],
    location: { type:'Point', coordinates:[0,0], city:'New York', state:'NY', country:'USA' },
    rating: { average: 4.8, count: 93 }, isVerified: true,
  },
  {
    name: 'Marcus Williams', email: 'marcus@skillswap.dev', password: 'Password123',
    role: 'provider', bio: 'PhD candidate helping students excel in STEM subjects with personalized attention.',
    skillsOffered: ['Mathematics','Physics','Chemistry','SAT Prep','Calculus'],
    location: { type:'Point', coordinates:[0,0], city:'Chicago', state:'IL', country:'USA' },
    rating: { average: 5.0, count: 64 }, isVerified: true,
  },
  {
    name: 'Priya Patel', email: 'priya@skillswap.dev', password: 'Password123',
    role: 'provider', bio: 'Certified personal trainer with a passion for holistic wellness and sustainable fitness.',
    skillsOffered: ['Yoga','HIIT','Strength Training','Nutrition','Meditation'],
    location: { type:'Point', coordinates:[0,0], city:'Austin', state:'TX', country:'USA' },
    rating: { average: 4.7, count: 156 }, isVerified: true,
  },
  {
    name: "James O'Brien", email: 'james@skillswap.dev', password: 'Password123',
    role: 'provider', bio: 'Professional musician with 15 years performance experience offering lessons for all skill levels.',
    skillsOffered: ['Guitar','Piano','Music Theory','Songwriting','Bass'],
    location: { type:'Point', coordinates:[0,0], city:'Nashville', state:'TN', country:'USA' },
    rating: { average: 4.9, count: 48 }, isVerified: true,
  },
  {
    name: 'Maria Santos', email: 'maria@skillswap.dev', password: 'Password123',
    role: 'provider', bio: 'Native Spanish speaker offering conversational and academic language lessons at all levels.',
    skillsOffered: ['Spanish','Portuguese','English as Second Language','French Basics'],
    location: { type:'Point', coordinates:[0,0], city:'Miami', state:'FL', country:'USA' },
    rating: { average: 4.8, count: 82 }, isVerified: true,
  },
];

const CUSTOMERS = [
  { name: 'John Doe',   email: 'john@test.com',   password: 'Password123', role: 'customer' },
  { name: 'Emma Lee',   email: 'emma@test.com',    password: 'Password123', role: 'customer' },
  { name: 'Mike Ross',  email: 'mike@test.com',    password: 'Password123', role: 'customer' },
];

const SERVICE_TEMPLATES = [
  { title: 'Full-Stack Web Development Session',  category: 'coding',    amount: 85,  description: 'One-on-one React/Node.js development session. Code review, architecture planning, debugging.' },
  { title: 'UI/UX Design Consultation',           category: 'design',    amount: 75,  description: 'User interface and experience design review. Figma prototyping and design system guidance.' },
  { title: 'STEM Tutoring — Math & Physics',      category: 'tutoring',  amount: 55,  description: 'Personalized tutoring for high school and university level Math, Physics, and Chemistry.' },
  { title: 'Yoga & Wellness Coaching',            category: 'fitness',   amount: 60,  description: 'Holistic yoga session including breathing exercises, posture correction, and mindfulness.' },
  { title: 'Guitar & Piano Lessons',              category: 'music',     amount: 70,  description: 'Music lessons for beginners to advanced players. Theory, technique, and practical playing.' },
  { title: 'Spanish Language Lessons',            category: 'language',  amount: 45,  description: 'Conversational Spanish for beginners to advanced speakers. Business Spanish also available.' },
];

// ── Main ──────────────────────────────────────────────────────────────────────

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing seed data
  const seedEmails = [...PROVIDERS, ...CUSTOMERS].map(u => u.email);
  await User.deleteMany({ email: { $in: seedEmails } });
  console.log('🗑️  Cleared existing seed users');

  // Create providers
  const providerDocs = [];
  for (const p of PROVIDERS) {
    const doc = await User.create(p);
    providerDocs.push(doc);
  }
  console.log(`✅ Created ${providerDocs.length} providers`);

  // Create customers
  const customerDocs = [];
  for (const c of CUSTOMERS) {
    const doc = await User.create(c);
    customerDocs.push(doc);
  }
  console.log(`✅ Created ${customerDocs.length} customers`);

  // Create services (one per provider)
  await Service.deleteMany({ providerId: { $in: providerDocs.map(p => p._id) } });
  const serviceDocs = [];
  for (let i = 0; i < providerDocs.length; i++) {
    const tpl = SERVICE_TEMPLATES[i];
    const svc = await Service.create({
      providerId:  providerDocs[i]._id,
      title:       tpl.title,
      description: tpl.description,
      category:    tpl.category,
      pricing:     { type: 'hourly', amount: tpl.amount, currency: 'USD' },
      isRemote:    true,
      isActive:    true,
      tags:        providerDocs[i].skillsOffered.slice(0, 3),
      rating:      providerDocs[i].rating,
      totalBookings: providerDocs[i].rating.count * 2,
    });
    serviceDocs.push(svc);
  }
  console.log(`✅ Created ${serviceDocs.length} services`);

  // Create bookings
  await Booking.deleteMany({
    $or: [
      { providerId: { $in: providerDocs.map(p => p._id) } },
      { customerId: { $in: customerDocs.map(c => c._id) } },
    ],
  });

  const bookingDocs = [];
  const statuses = ['completed','completed','confirmed','pending'];
  for (let i = 0; i < Math.min(serviceDocs.length, 4); i++) {
    const customer  = customerDocs[i % customerDocs.length];
    const provider  = providerDocs[i];
    const service   = serviceDocs[i];
    const status    = statuses[i];
    const daysAgo   = i < 2 ? -(7 + i * 3) : (3 + i);  // past or future
    const date      = new Date();
    date.setDate(date.getDate() + daysAgo);

    const b = await Booking.create({
      serviceId:  service._id,
      providerId: provider._id,
      customerId: customer._id,
      timeSlot:   { date, startTime: '10:00', endTime: '11:00', duration: 60 },
      status,
      price:      { amount: service.pricing.amount, currency: 'USD' },
      notes:      'Looking forward to the session!',
      isReviewed: status === 'completed',
      statusHistory: [{ status, changedBy: customer._id }],
    });
    bookingDocs.push(b);
  }
  console.log(`✅ Created ${bookingDocs.length} bookings`);

  // Create reviews for completed bookings
  await Review.deleteMany({
    $or: [
      { providerId: { $in: providerDocs.map(p => p._id) } },
    ],
  });

  const reviewComments = [
    'Absolutely incredible session! Alex explained everything clearly and helped me fix a complex bug. Will definitely book again.',
    "Sarah's design feedback transformed my project completely. She has an incredible eye for detail and UX flow.",
  ];

  let reviewCount = 0;
  for (let i = 0; i < bookingDocs.length; i++) {
    if (bookingDocs[i].status !== 'completed') continue;
    await Review.create({
      bookingId:  bookingDocs[i]._id,
      serviceId:  bookingDocs[i].serviceId,
      providerId: bookingDocs[i].providerId,
      customerId: bookingDocs[i].customerId,
      rating:     5,
      comment:    reviewComments[reviewCount] || 'Great session, highly recommend!',
      isVerified: true,
    });
    reviewCount++;
  }
  console.log(`✅ Created ${reviewCount} reviews`);

  // Create some messages
  await Message.deleteMany({
    $or: [
      { senderId:   { $in: [...providerDocs, ...customerDocs].map(u => u._id) } },
      { receiverId: { $in: [...providerDocs, ...customerDocs].map(u => u._id) } },
    ],
  });

  const msgExchanges = [
    { from: customerDocs[0], to: providerDocs[0], messages: [
      { content: 'Hi Alex! I saw your profile — I need help with a React performance issue.' },
      { content: "Hey John! I'd be happy to help. Can you share more details about the issue?", reverse: true },
      { content: 'Sure! My app re-renders too often. I suspect it\'s a context problem.' },
      { content: "That sounds like a classic context issue. Let's do a session tomorrow at 10am?", reverse: true },
    ]},
    { from: customerDocs[1], to: providerDocs[1], messages: [
      { content: 'Sarah, I love your work! Can we schedule a design review for my app?' },
      { content: "Absolutely! Send me your current designs and I'll have a look before our session.", reverse: true },
    ]},
  ];

  for (const exchange of msgExchanges) {
    let createdAt = new Date(Date.now() - 3600000 * 2); // 2 hours ago
    for (const m of exchange.messages) {
      const sender   = m.reverse ? exchange.to   : exchange.from;
      const receiver = m.reverse ? exchange.from : exchange.to;
      const chatId   = [sender._id.toString(), receiver._id.toString()].sort().join('_');
      await Message.create({
        chatId, senderId: sender._id, receiverId: receiver._id,
        content: m.content, type: 'text',
        createdAt, updatedAt: createdAt,
      });
      createdAt = new Date(createdAt.getTime() + 300000); // 5 min apart
    }
  }
  console.log('✅ Created message threads');

  console.log('\n🎉 Seed complete! Test credentials:');
  console.log('  Providers: alex@skillswap.dev / sarah@skillswap.dev / ... (Password123)');
  console.log('  Customers: john@test.com / emma@test.com / mike@test.com (Password123)');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
