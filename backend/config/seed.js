/**
 * Database Seeder
 *
 * This script populates the database with:
 * - A default admin account
 * - A default police officer account
 * - Sample violation records for testing
 *
 * Run with: npm run seed
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/User');
const Violation = require('../models/Violation');

// ✅ Correct environment variable
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI not found in environment variables');
  process.exit(1);
}

const sampleViolations = [
  { vehicleNumber: 'MH12AB1234', violationType: 'Signal Jump', date: new Date('2024-12-01'), time: '09:30', location: 'MG Road Junction, Mumbai', fineAmount: 1000, status: 'Paid' },
  { vehicleNumber: 'DL5SAB1234', violationType: 'Over Speeding', date: new Date('2024-12-05'), time: '14:15', location: 'NH48, Delhi', fineAmount: 2000, status: 'Pending' },
  { vehicleNumber: 'KA03MN4567', violationType: 'No Helmet', date: new Date('2024-12-08'), time: '11:00', location: 'Brigade Road, Bangalore', fineAmount: 500, status: 'Pending' },
  { vehicleNumber: 'MH12AB1234', violationType: 'Wrong Parking', date: new Date('2024-12-10'), time: '16:45', location: 'Linking Road, Mumbai', fineAmount: 500, status: 'Paid' },
  { vehicleNumber: 'TN09CD7890', violationType: 'Drunk Driving', date: new Date('2024-12-12'), time: '23:00', location: 'Anna Salai, Chennai', fineAmount: 10000, status: 'Disputed' },
  { vehicleNumber: 'GJ01AA1111', violationType: 'No Seat Belt', date: new Date('2024-12-15'), time: '08:30', location: 'Sardar Patel Ring Road, Ahmedabad', fineAmount: 1000, status: 'Paid' },
  { vehicleNumber: 'RJ14DC2222', violationType: 'Using Mobile While Driving', date: new Date('2024-12-18'), time: '12:00', location: 'Tonk Road, Jaipur', fineAmount: 1500, status: 'Pending' },
  { vehicleNumber: 'UP32GH3333', violationType: 'Wrong Side Driving', date: new Date('2024-12-20'), time: '07:15', location: 'Hazratganj, Lucknow', fineAmount: 1000, status: 'Pending' },
  { vehicleNumber: 'WB02IJ4444', violationType: 'Overloading', date: new Date('2024-12-22'), time: '10:30', location: 'VIP Road, Kolkata', fineAmount: 3000, status: 'Pending' },
  { vehicleNumber: 'AP28KL5555', violationType: 'No License', date: new Date('2024-12-28'), time: '15:00', location: 'Jubilee Hills, Hyderabad', fineAmount: 5000, status: 'Pending' },
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    await User.deleteMany({});
    await Violation.deleteMany({});
    console.log('🗑️ Cleared existing data');

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@traffic.gov',
      password: 'admin123',
      role: 'admin',
      badgeNumber: 'ADMIN001',
    });

    console.log('👤 Admin created');

    const officer = await User.create({
      name: 'Officer Sharma',
      email: 'officer@traffic.gov',
      password: 'officer123',
      role: 'police',
      badgeNumber: 'MUM2024001',
    });

    console.log('👮 Officer created');

    const violationsWithOfficer = sampleViolations.map(v => ({
      ...v,
      recordedBy: officer._id,
      officerName: officer.name,
    }));

    await Violation.insertMany(violationsWithOfficer);
    console.log(`📋 Inserted ${sampleViolations.length} violations`);

    console.log('✅ Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder failed:', error.message);
    process.exit(1);
  }
}

seedDatabase();