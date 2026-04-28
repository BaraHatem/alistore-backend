import express from 'express';
import Collection from '../models/Collection.js';
import Product from '../models/Product.js';

const router = express.Router();

// GET all collections
router.get('/', async (req, res) => {
  try {
    const collections = await Collection.find({});
    res.json(collections);
  } catch (error) {
    res.status(500).json({ message: 'Server Error loading collections' });
  }
});

// GET products by collection handle
router.get('/:handle/products', async (req, res) => {
  try {
    const collection = await Collection.findOne({ handle: req.params.handle });
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    
    const products = await Product.find({ 
      allCategories: collection.title.toLowerCase() 
    });
    
    res.json({
      collection,
      products
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error loading collection products' });
  }
});

export default router;
