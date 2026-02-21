import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
      sparse: true,
    },

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
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

    invoiceDate: {
      type: Date,
      default: Date.now,
    },

    dueDate: {
      type: Date,
    },

    items: [
      {
        name: { type: String, default: '' },
        quantity: { type: Number, default: 0 },
        unit: { type: String, default: 'pc' },
        unitPrice: { type: Number, default: 0 },
        totalPrice: { type: Number, default: 0 },
        _id: false
      },
    ],

    extraCharges: [
      {
        description: { type: String, required: true },
        amount: { type: Number, required: true },
        type: { 
          type: String, 
          enum: ['parking', 'waiting', 'fuel', 'toll', 'stairs', 'other'],
          default: 'other' 
        },
        date: { type: Date, default: Date.now },
        notes: { type: String, default: '' },
        _id: false
      },
    ],

    subtotal: {
      type: Number,
      required: true,
    },

    vatPercentage: {
      type: Number,
      default: 15,
    },

    vatAmount: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    amountPaid: {
      type: Number,
      default: 0,
    },

    remainingAmount: {
      type: Number,
      default: 0,
    },

    paymentStatus: {
      type: String,
      enum: ['paid', 'partial', 'unpaid', 'overdue'],
      default: 'unpaid',
    },

    signature: {
      data: String,
      signedBy: String,
      signedAt: Date,
      ipAddress: String,
      _id: false
    },

    deliveryConfirmed: {
      type: Boolean,
      default: false,
    },

    deliveryConfirmedAt: Date,

    emailSent: {
      type: Boolean,
      default: false,
    },

    emailSentAt: Date,
    emailSentTo: String,

    status: {
      type: String,
      enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
      default: 'draft',
    },

    notes: String,
    termsAndConditions: String,
  },
  { 
    timestamps: true,
  }
);

// Generate invoice number before validation
invoiceSchema.pre('validate', async function(next) {
  if (this.isNew && !this.invoiceNumber) {
    try {
      const year = new Date().getFullYear().toString().slice(-2);
      const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
      
      // Find the last invoice of the current month
      const lastInvoice = await this.constructor
        .findOne({ invoiceNumber: new RegExp(`^INV-${year}${month}-`) })
        .sort({ createdAt: -1 })
        .exec();

      let nextNumber = 1;
      if (lastInvoice && lastInvoice.invoiceNumber) {
        const parts = lastInvoice.invoiceNumber.split('-');
        if (parts.length >= 3) {
          const num = parseInt(parts[2], 10);
          if (!isNaN(num)) {
            nextNumber = num + 1;
          }
        }
      }

      this.invoiceNumber = `INV-${year}${month}-${nextNumber.toString().padStart(4, '0')}`;
      console.log('Generated invoice number:', this.invoiceNumber);
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

export default mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema);