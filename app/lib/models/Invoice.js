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

// Generate invoice number before validation with gap-finding logic
invoiceSchema.pre('validate', async function(next) {
  if (this.isNew && !this.invoiceNumber) {
    try {
      const year = new Date().getFullYear().toString().slice(-2);
      const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
      const pattern = `^INV-${year}${month}-`;
      
      console.log(`🔍 Finding next invoice number for pattern: ${pattern}`);
      
      // Find all invoices of the current month and sort by invoice number
      const invoices = await this.constructor
        .find({ 
          invoiceNumber: new RegExp(pattern) 
        })
        .sort({ invoiceNumber: 1 })
        .lean();

      let nextNumber = 1;
      
      if (invoices.length > 0) {
        // Extract all numbers and sort them
        const numbers = invoices.map(inv => {
          const parts = inv.invoiceNumber.split('-');
          const num = parseInt(parts[2], 10);
          return isNaN(num) ? 0 : num;
        }).filter(num => num > 0).sort((a, b) => a - b);
        
        console.log('📊 Existing invoice numbers:', numbers);
        
        // Find the first gap in the sequence
        let foundGap = false;
        for (let i = 0; i < numbers.length; i++) {
          if (numbers[i] !== i + 1) {
            nextNumber = i + 1;
            foundGap = true;
            console.log(`🕳️ Found gap at position ${i + 1}`);
            break;
          }
        }
        
        // If no gap found, use the next number after the last one
        if (!foundGap) {
          nextNumber = numbers.length + 1;
          console.log(`📈 No gaps found, using next number: ${nextNumber}`);
        }
      } else {
        console.log('📭 No existing invoices found for this month');
      }

      this.invoiceNumber = `INV-${year}${month}-${nextNumber.toString().padStart(4, '0')}`;
      console.log('✅ Generated invoice number:', this.invoiceNumber);
      next();
    } catch (error) {
      console.error('❌ Error generating invoice number:', error);
      next(error);
    }
  } else {
    next();
  }
});

export default mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema);