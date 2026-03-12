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

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_traffic_db';

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
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Violation.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@traffic.gov',
      password: 'admin123',
      role: 'admin',
      badgeNumber: 'ADMIN001'
    });
    console.log('👤 Admin created: admin@traffic.gov / admin123');

    // Create police officer
    const officer = await User.create({
      name: 'Officer Sharma',
      email: 'officer@traffic.gov',
      password: 'officer123',
      role: 'police',
      badgeNumber: 'MUM2024001'
    });
    console.log('👮 Officer created: officer@traffic.gov / officer123');

    // Create violations linked to officer
    const violationsWithOfficer = sampleViolations.map(v => ({
      ...v,
      recordedBy: officer._id,
      officerName: officer.name
    }));

    await Violation.insertMany(violationsWithOfficer);
    console.log(`📋 Created ${sampleViolations.length} sample violations`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('   Admin   → Email: admin@traffic.gov   | Password: admin123');
    console.log('   Officer → Email: officer@traffic.gov | Password: officer123');
    console.log('\n🔍 Test Vehicle Numbers: MH12AB1234, DL5SAB1234, KA03MN4567');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seedDatabase();
