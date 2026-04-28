import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema({
  shopifyId: { type: String, required: true, unique: true },
  handle: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  productCount: { type: Number, default: 0 }
}, {
  timestamps: true,
});

const Collection = mongoose.model('Collection', collectionSchema);

export default Collection;
