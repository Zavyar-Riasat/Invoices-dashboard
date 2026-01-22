import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    unique: true,
    minlength: [2, 'Item name must be at least 2 characters'],
    maxlength: [100, 'Item name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Furniture',
      'Electronics',
      'Appliances',
      'Kitchen',
      'Bedroom',
      'Living Room',
      'Office',
      'Other'
    ],
    default: 'Furniture'
  },
  basePrice: {
    type: Number,
    required: [true, 'Base price is required'],
    min: [0, 'Price cannot be negative'],
    max: [1000000, 'Price is too high']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['piece', 'set', 'kg', 'cubic meter', 'item'],
    default: 'piece'
  },
  size: {
    type: String,
    enum: ['Small', 'Medium', 'Large', 'Extra Large', 'Custom'],
    default: 'Medium'
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard', 'Expert'],
    default: 'Medium'
  },
  imageUrl: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

// Create text index for search
itemSchema.index({
  name: 'text',
  description: 'text',
  category: 'text'
});

// Create or retrieve model
const Item = mongoose.models.Item || mongoose.model('Item', itemSchema);

export default Item;