const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  mrp: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['Men', 'Women', 'Kids', 'Accessories', 'Footwear', 'Ethnic', 'Winterwear', 'Activewear']
  },
  brand: {
    type: String,
    required: true
  },
  images: [{ type: String }],
  sizes: [{ type: String }],
  colors: [{
    name: String,
    hex: String
  }],
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  featured: {
    type: Boolean,
    default: false
  },
  tags: [{ type: String }]
}, {
  timestamps: true
});

productSchema.index({ name: 'text', description: 'text', brand: 'text' });

module.exports = mongoose.model('Product', productSchema);
