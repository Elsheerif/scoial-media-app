import mongoose from 'mongoose';
import { DB_URL_ATLAS, DB_URL_LOCAL, NODE_ENV } from '../config/config.service.js';

async function testDBconnection() {
    const databaseUrl = NODE_ENV === 'production' ? DB_URL_ATLAS || DB_URL_LOCAL : DB_URL_LOCAL || DB_URL_ATLAS;
    if (!databaseUrl) throw new Error('A MongoDB connection URL is required');
    await mongoose.connect(databaseUrl);
    console.log('MongoDB connected successfully');
}

export default testDBconnection;