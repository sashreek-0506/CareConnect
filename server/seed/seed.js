/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const { mongoUri } = require('../config/env');

const User = require('../models/User');
const ProviderProfile = require('../models/ProviderProfile');
const ServiceCategory = require('../models/ServiceCategory');
const AvailabilitySlot = require('../models/AvailabilitySlot');
const ServiceRequest = require('../models/ServiceRequest');
const Quote = require('../models/Quote');
const Booking = require('../models/Booking');
const Invoice = require('../models/Invoice');
const Review = require('../models/Review');
const Dispute = require('../models/Dispute');
const Notification = require('../models/Notification');

const DEMO_PASSWORD = 'Password123!';

function hoursFromNow(h) {
  return new Date(Date.now() + h * 60 * 60 * 1000);
}

async function run() {
  await mongoose.connect(mongoUri);
  console.log('[seed] Connected to', mongoUri);

  console.log('[seed] Clearing existing collections...');
  await Promise.all([
    User.deleteMany({}), ProviderProfile.deleteMany({}), ServiceCategory.deleteMany({}),
    AvailabilitySlot.deleteMany({}), ServiceRequest.deleteMany({}), Quote.deleteMany({}),
    Booking.deleteMany({}), Invoice.deleteMany({}), Review.deleteMany({}),
    Dispute.deleteMany({}), Notification.deleteMany({}),
  ]);

  const passwordHash = await User.hashPassword(DEMO_PASSWORD);

  console.log('[seed] Creating users...');
  const admin = await User.create({ name: 'Asha Rao', email: 'admin@careconnect.dev', passwordHash, role: 'admin' });
  const ops = await User.create({ name: 'Vikram Shah', email: 'ops@careconnect.dev', passwordHash, role: 'ops' });
  const support = await User.create({ name: 'Meera Nair', email: 'support@careconnect.dev', passwordHash, role: 'support' });

  const customer1 = await User.create({ name: 'Priya Menon', email: 'priya@careconnect.dev', passwordHash, role: 'customer', phone: '9876500001' });
  const customer2 = await User.create({ name: 'Rahul Verma', email: 'rahul@careconnect.dev', passwordHash, role: 'customer', phone: '9876500002' });

  const providerUser1 = await User.create({ name: 'Suresh Kumar', email: 'suresh.electric@careconnect.dev', passwordHash, role: 'provider', phone: '9876511001', isVerified: true });
  const providerUser2 = await User.create({ name: 'Lakshmi Iyer', email: 'lakshmi.clean@careconnect.dev', passwordHash, role: 'provider', phone: '9876511002', isVerified: true });
  const providerUser3 = await User.create({ name: 'Manoj Pillai', email: 'manoj.plumb@careconnect.dev', passwordHash, role: 'provider', phone: '9876511003', isVerified: false });

  console.log('[seed] Creating service categories...');
  const [electrical, cleaning, plumbing, appliance, maintenance] = await ServiceCategory.create([
    { name: 'Electrical', description: 'Wiring, switches, fans, and electrical repairs.', icon: 'zap', requiredSkills: ['wiring', 'switchboard', 'fan-installation'], basePricingRule: { model: 'hourly', minPrice: 300, maxPrice: 900 } },
    { name: 'Home Cleaning', description: 'Deep cleaning, regular cleaning, and sanitization.', icon: 'sparkles', requiredSkills: ['deep-cleaning', 'sanitization'], basePricingRule: { model: 'flat', minPrice: 500, maxPrice: 2500 } },
    { name: 'Plumbing', description: 'Leaks, pipe fitting, and bathroom fixtures.', icon: 'droplet', requiredSkills: ['pipe-fitting', 'leak-repair'], basePricingRule: { model: 'hourly', minPrice: 300, maxPrice: 1000 } },
    { name: 'Appliance Repair', description: 'Washing machines, fridges, ACs, and microwaves.', icon: 'settings', requiredSkills: ['ac-repair', 'washing-machine-repair', 'fridge-repair'], basePricingRule: { model: 'hourly', minPrice: 400, maxPrice: 1200 } },
    { name: 'General Maintenance', description: 'Carpentry, painting, and odd jobs.', icon: 'hammer', requiredSkills: ['carpentry', 'painting'], basePricingRule: { model: 'hourly', minPrice: 250, maxPrice: 800 } },
  ]);

  console.log('[seed] Creating provider profiles...');
  const provider1 = await ProviderProfile.create({
    user: providerUser1._id, bio: '10 years fixing home electrical systems.', skills: ['wiring', 'switchboard', 'fan-installation'],
    categories: [electrical._id], serviceAreas: ['Koramangala', 'HSR Layout', 'BTM Layout'], experienceYears: 10,
    pricing: { model: 'hourly', rate: 500 }, verificationStatus: 'approved', avgRating: 4.6, ratingCount: 12, completedJobsCount: 34,
  });

  const provider2 = await ProviderProfile.create({
    user: providerUser2._id, bio: 'Detail-oriented home cleaning specialist.', skills: ['deep-cleaning', 'sanitization'],
    categories: [cleaning._id], serviceAreas: ['Koramangala', 'Indiranagar'], experienceYears: 5,
    pricing: { model: 'flat', rate: 1200 }, verificationStatus: 'approved', avgRating: 4.9, ratingCount: 20, completedJobsCount: 51,
  });

  const provider3 = await ProviderProfile.create({
    user: providerUser3._id, bio: 'Licensed plumber, available for emergencies.', skills: ['pipe-fitting', 'leak-repair'],
    categories: [plumbing._id], serviceAreas: ['Whitefield', 'Marathahalli'], experienceYears: 7,
    pricing: { model: 'hourly', rate: 450 }, verificationStatus: 'pending',
    documents: [{ label: 'Plumbing License', url: 'https://example.com/docs/license-manoj.pdf' }],
  });

  console.log('[seed] Creating availability slots...');
  await AvailabilitySlot.create([
    { provider: provider1._id, startTime: hoursFromNow(24), endTime: hoursFromNow(26) },
    { provider: provider1._id, startTime: hoursFromNow(48), endTime: hoursFromNow(50) },
    { provider: provider2._id, startTime: hoursFromNow(20), endTime: hoursFromNow(23) },
    { provider: provider3._id, startTime: hoursFromNow(30), endTime: hoursFromNow(32) },
  ]);

  console.log('[seed] Creating service requests + full workflow states...');

  // 1) Open request, no quotes yet.
  await ServiceRequest.create({
    customer: customer2._id, description: 'One of my bedroom fans is making a loud grinding noise and getting hot.',
    category: electrical._id, requiredSkills: ['fan-installation', 'wiring'], location: { area: 'HSR Layout', address: '12th Main, HSR Layout' },
    status: 'open',
  });

  // 2) Open request that has a quote (status: quoted).
  const quotedRequest = await ServiceRequest.create({
    customer: customer1._id, description: 'Need a deep cleaning for a 2BHK apartment before moving in.',
    category: cleaning._id, requiredSkills: ['deep-cleaning'], location: { area: 'Koramangala', address: '5th Block, Koramangala' },
    status: 'quoted',
  });
  await Quote.create({ request: quotedRequest._id, provider: provider2._id, price: 1800, estimatedDurationMinutes: 240, notes: 'Includes kitchen deep clean and bathroom sanitization.', status: 'pending' });

  // 3) Fully completed + reviewed booking.
  const completedRequest = await ServiceRequest.create({
    customer: customer1._id, description: 'Kitchen switchboard sparking when I turn on the lights, needs urgent repair.',
    category: electrical._id, requiredSkills: ['wiring', 'switchboard'], location: { area: 'Koramangala', address: '5th Block, Koramangala' },
    status: 'completed',
  });
  const completedQuote = await Quote.create({ request: completedRequest._id, provider: provider1._id, price: 650, estimatedDurationMinutes: 90, notes: 'Will replace the switchboard and check wiring.', status: 'accepted' });
  const completedBooking = await Booking.create({
    request: completedRequest._id, quote: completedQuote._id, customer: customer1._id, provider: provider1._id,
    slot: { startTime: hoursFromNow(-48), endTime: hoursFromNow(-46.5) }, status: 'closed',
    beforeEvidence: ['https://example.com/evidence/before-switchboard.jpg'],
    afterEvidence: ['https://example.com/evidence/after-switchboard.jpg'],
    customerConfirmedAt: hoursFromNow(-46),
    timeline: [
      { status: 'scheduled', note: 'Booking confirmed.', actor: customer1._id, timestamp: hoursFromNow(-72) },
      { status: 'in_progress', note: 'Arrived and started work.', actor: providerUser1._id, timestamp: hoursFromNow(-48) },
      { status: 'completed', note: 'Switchboard replaced and tested.', actor: providerUser1._id, timestamp: hoursFromNow(-46.5), attachments: ['https://example.com/evidence/after-switchboard.jpg'] },
    ],
  });
  await Invoice.create({ booking: completedBooking._id, customer: customer1._id, provider: provider1._id, lineItems: [{ label: 'Service charge', amount: 650 }], total: 650, paymentStatus: 'paid' });
  await Review.create({ booking: completedBooking._id, customer: customer1._id, provider: provider1._id, rating: 5, comment: 'Fast, tidy, and explained everything clearly.' });

  // 4) Cancelled booking.
  const cancelledRequest = await ServiceRequest.create({
    customer: customer2._id, description: 'AC not cooling properly, needs gas refill.',
    category: appliance._id, requiredSkills: ['ac-repair'], location: { area: 'BTM Layout', address: '1st Stage, BTM' },
    status: 'cancelled',
  });
  const cancelledQuote = await Quote.create({ request: cancelledRequest._id, provider: provider1._id, price: 800, estimatedDurationMinutes: 60, status: 'accepted' });
  await Booking.create({
    request: cancelledRequest._id, quote: cancelledQuote._id, customer: customer2._id, provider: provider1._id,
    slot: { startTime: hoursFromNow(-10), endTime: hoursFromNow(-9) }, status: 'cancelled',
    cancellation: { cancelledBy: customer2._id, reason: 'Found someone faster.', cancelledAt: hoursFromNow(-20) },
    timeline: [
      { status: 'scheduled', note: 'Booking confirmed.', actor: customer2._id, timestamp: hoursFromNow(-30) },
      { status: 'cancelled', note: 'Found someone faster.', actor: customer2._id, timestamp: hoursFromNow(-20) },
    ],
  });

  // 5) Disputed booking (in review).
  const disputedRequest = await ServiceRequest.create({
    customer: customer2._id, description: 'Leaking pipe under the kitchen sink, water pooling on the floor.',
    category: plumbing._id, requiredSkills: ['leak-repair'], location: { area: 'Whitefield', address: 'ITPL Main Road' },
    status: 'disputed',
  });
  const disputedQuote = await Quote.create({ request: disputedRequest._id, provider: provider1._id, price: 700, estimatedDurationMinutes: 60, status: 'accepted' });
  const disputedBooking = await Booking.create({
    request: disputedRequest._id, quote: disputedQuote._id, customer: customer2._id, provider: provider1._id,
    slot: { startTime: hoursFromNow(-5), endTime: hoursFromNow(-4) }, status: 'disputed',
    timeline: [
      { status: 'scheduled', note: 'Booking confirmed.', actor: customer2._id, timestamp: hoursFromNow(-8) },
      { status: 'completed', note: 'Pipe resealed.', actor: providerUser1._id, timestamp: hoursFromNow(-4), attachments: ['https://example.com/evidence/pipe-after.jpg'] },
    ],
  });
  const dispute = await Dispute.create({
    booking: disputedBooking._id, raisedBy: customer2._id, reason: 'Leak came back within an hour of the provider leaving.',
    evidence: ['https://example.com/evidence/leak-again.jpg'], status: 'in_review',
    activityLog: [
      { actor: customer2._id, action: 'opened', note: 'Leak came back within an hour of the provider leaving.', timestamp: hoursFromNow(-3) },
      { actor: support._id, action: 'note', note: 'Reaching out to provider for their side of the story.', timestamp: hoursFromNow(-2) },
    ],
  });

  console.log('[seed] Seed data created successfully.');
  console.log('\n--- Demo Logins (all use password: %s) ---', DEMO_PASSWORD);
  console.log('Admin:    admin@careconnect.dev');
  console.log('Ops:      ops@careconnect.dev');
  console.log('Support:  support@careconnect.dev');
  console.log('Customer: priya@careconnect.dev / rahul@careconnect.dev');
  console.log('Provider (verified):   suresh.electric@careconnect.dev / lakshmi.clean@careconnect.dev');
  console.log('Provider (pending):    manoj.plumb@careconnect.dev');
  console.log('\nOpen dispute id for testing: %s', dispute._id.toString());

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
