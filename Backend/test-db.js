import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: './.env' });

console.log('Connecting to:', process.env.MONGO_URI);

try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Successfully connected to MongoDB');
    await mongoose.connection.close();
    console.log('Connection closed');
    process.exit(0);
} catch (err) {
    console.error('Connection failed:', err);
    process.exit(1);
}
