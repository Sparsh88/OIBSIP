import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb+srv://sparshchauhan:sparsh12@cluster0.00t8w7f.mongodb.net/pizza_delivery_db?retryWrites=true&w=majority';

async function check() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB Atlas:');
  const users = await User.find({}).select('+password');
  console.log(`Total users in DB: ${users.length}`);
  for (const u of users) {
    console.log(`\nUser: ${u.name} | Email: "${u.email}" | Role: ${u.role}`);
    console.log(`Password Hash in DB: ${u.password}`);
    const match1 = await bcrypt.compare('Sp@080806', u.password);
    console.log(`Match with "Sp@080806": ${match1}`);
  }
  process.exit(0);
}

check().catch(console.error);
