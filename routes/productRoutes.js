import express from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product.js';

const router = express.Router();

// GET all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server Error loading products' });
  }
});

// GET specific product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product Not Found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error loading product details' });
  }
});

// POST Add new product manually by Admin User
router.post('/', async (req, res) => {
  try {
    const { name, price, salePrice, image, category, description } = req.body;
    
    const product = new Product({
      name: name || 'New Original Product',
      price: price || 0,
      salePrice: salePrice || null,
      image: image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
      category: category || 'General',
      description: description || 'Beautifully crafted item uniquely added by the store owner.',
      rating: 5,
      numReviews: 0
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to add product to database' });
  }
});

// DELETE remove product permanently
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (product) {
      res.json({ message: 'Product definitively removed from database' });
    } else {
      res.status(404).json({ message: 'Product Not Found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error removing product' });
  }
});

export default router;
