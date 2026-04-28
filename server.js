import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import authRoutes from './routes/authRoutes.js';
import Product from './models/Product.js';
import Collection from './models/Collection.js';
import { syncWithShopify } from './utils/shopifySync.js';
import collectionRoutes from './routes/collectionRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const connectDB = async () => {
    try {
        let mongoUri = process.env.MONGODB_URI;
        
        if (!mongoUri) {
            console.log('No MONGODB_URI found, starting local in-memory database...');
            const mongoServer = await MongoMemoryServer.create();
            mongoUri = mongoServer.getUri();
        }
        
        await mongoose.connect(mongoUri);
        console.log(`✅ Database Connected (${mongoUri.includes('mongodb+srv') ? 'Cloud Atlas' : 'Local Memory'})`);

        // Only sync on startup if not in production or if explicitly requested
        if (process.env.NODE_ENV !== 'production' || process.env.FORCE_SYNC === 'true') {
           console.log('Synchronizing with Shopify store dynamic data...');
           await syncWithShopify();
           console.log('✅ Store data synchronized successfully!');
        }
        
    } catch (error) {
        console.error('Database connection failed:', error);
    }
};

connectDB();

app.use('/api/products', productRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('AT7Store Complete API is successfully active.');
});

app.listen(PORT, () => {
  console.log(`AT7Store Backend running dynamically on port ${PORT}`);
});
