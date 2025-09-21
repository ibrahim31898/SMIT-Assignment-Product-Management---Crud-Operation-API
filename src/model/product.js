// model/product.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const updateHistorySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  changes: { type: Object, default: {} },
  updatedAt: { type: Date, default: Date.now },
}, { _id: false });

const productSchema = new Schema({
  name: { type: String, required: true, trim: true, minlength: 1 },
  description: { type: String },
  price: { type: Number, default: 0, min: 0 },
  category: { type: String, default: 'general' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updateHistory: { type: [updateHistorySchema], default: [] },
}, {
  collection: 'products',
  timestamps: true,
});

const Product = mongoose.model('Product', productSchema);
module.exports = { Product };
