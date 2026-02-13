import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  bookingNumber: {
    type: String,
    required: true,
    unique: true,
  },
  quote: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quote',
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  clientName: {
    type: String,
    required: true,
  },
  clientPhone: {
    type: String,
    required: true,
  },
  clientEmail: {
    type: String,
  },
  shiftingDate: {
    type: Date,
    required: true,
  },
  shiftingTime: {
    type: String,
    required: true,
  },
  pickupAddress: {
    type: String,
    required: true,
  },
  deliveryAddress: {
    type: String,
    required: true,
  },
  items: [{
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
    },
    name: String,
    quantity: Number,
    unit: String,
    unitPrice: Number,
    totalPrice: Number,
  }],
  totalAmount: {
    type: Number,
    required: true,
  },
  payments: [{
    amount: {
      type: Number,
      required: true,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'cheque'],
      required: true,
    },
    reference: String,
    notes: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed',
    },
  }],
  advanceAmount: {
    type: Number,
    default: 0,
  },
  remainingAmount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
    default: 'pending',
  },
  assignedStaff: [{
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    name: String,
    role: String,
  }],
  notes: {
    type: String,
  },
  specialInstructions: {
    type: String,
  },
  invoiceGenerated: {
    type: Boolean,
    default: false,
  },
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Generate booking number before save
bookingSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await this.constructor.countDocuments();
    const year = new Date().getFullYear().toString().slice(-2);
    this.bookingNumber = `BK-${year}-${(count + 1).toString().padStart(5, '0')}`;
  }
  
  // Calculate remaining amount
  const totalPaid = this.payments
    .filter(p => p.status === 'completed')
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  this.remainingAmount = Math.max(0, this.totalAmount - totalPaid);
  
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Booking || mongoose.model('Booking', bookingSchema);