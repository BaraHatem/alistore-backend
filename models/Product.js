import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  shopifyId: { type: String, required: true, unique: true },
  handle: { type: String },
  name: { type: String, required: true },
  image: { type: String, required: true },
  description: { type: String },
  category: { type: String },
  allCategories: [{ type: String }],
  price: { type: Number, required: true },
  salePrice: { type: Number, default: null },
  rating: { type: Number, required: true, default: 0 },
  numReviews: { type: Number, required: true, default: 0 },
}, {
  timestamps: true,
});

const Product = mongoose.model('Product', productSchema);

export default Product;
