import mongoose from 'mongoose';

const deliverySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['completed', 'pending', 'cancelled'],
    default: 'completed'
  },
  notes: {
    type: String,
    trim: true
  }
}, { _id: false });

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        // Basic phone validation - accepts +, digits, spaces, hyphens, parentheses
        return /^[\+]?[1-9][\d\s\-\(\)]{8,}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        // Email is optional, but if provided, validate it
        if (!v) return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    minlength: [5, 'Address must be at least 5 characters'],
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  shiftingDate: {
    type: Date,
    required: [true, 'Shifting date is required'],
    validate: {
      validator: function(v) {
        // Date should not be in the future
        return v <= new Date();
      },
      message: props => `Shifting date cannot be in the future!`
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'completed'],
    default: 'active'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  deliveries: [deliverySchema],
  totalDeliveries: {
    type: Number,
    default: 0,
    min: 0
  },
  totalSpent: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Update totalDeliveries and totalSpent before saving
clientSchema.pre('save', function(next) {
  this.totalDeliveries = this.deliveries.length;
  this.totalSpent = this.deliveries.reduce((total, delivery) => {
    return total + (delivery.amount || 0);
  }, 0);
  
  // Round to 2 decimal places
  this.totalSpent = Math.round(this.totalSpent * 100) / 100;
  
  next();
});

// Add text index for searching
clientSchema.index({ 
  name: 'text', 
  phone: 'text', 
  email: 'text', 
  address: 'text' 
});

// Create or retrieve model
const Client = mongoose.models.Client || mongoose.model('Client', clientSchema);

export default Client;