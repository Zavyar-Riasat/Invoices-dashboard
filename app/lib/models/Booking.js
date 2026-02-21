import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      unique: true,
      sparse: true,
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

    items: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Item',
        },
        name: String,
        quantity: Number,
        unit: String,
        unitPrice: Number,
        totalPrice: Number,
      },
    ],

    // ✅ Extra Charges
    extraCharges: [
      {
        description: {
          type: String,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
        type: {
          type: String,
          enum: ['parking', 'waiting', 'fuel', 'toll', 'stairs', 'other'],
          default: 'other',
        },
        date: {
          type: Date,
          default: Date.now,
        },
        notes: String,
      },
    ],

    // ✅ Total Extra Charges (calculated field)
    totalExtraCharges: {
      type: Number,
      default: 0,
    },

    // ✅ Subtotal (before VAT) - now includes items + extra charges
    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },

    // ✅ VAT %
    vatPercentage: {
      type: Number,
      default: 15,
    },

    // ✅ VAT Amount
    vatAmount: {
      type: Number,
      default: 0,
    },

    // ✅ Grand Total (subtotal + VAT)
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },

    // Payment array
    payments: [
      {
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
          enum: [
            'cash',
            'credit_card',
            'debit_card',
            'bank_transfer',
            'cheque',
          ],
          required: true,
        },
        reference: String,
        notes: String,
        status: {
          type: String,
          enum: ['pending', 'completed', 'failed'],
          default: 'completed',
        },
      },
    ],

    // Optional advance amount (legacy support)
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
      enum: [
        'pending',
        'confirmed',
        'in_progress',
        'completed',
        'cancelled',
      ],
      default: 'pending',
    },

    assignedStaff: [
      {
        staffId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        name: String,
        role: String,
      },
    ],

    notes: String,
    specialInstructions: String,

    invoiceGenerated: {
      type: Boolean,
      default: false,
    },

    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
    },

    // Additional payment history
    paymentHistory: [
      {
        amount: {
          type: Number,
          required: true,
        },
        method: {
          type: String,
          enum: ['cash', 'card', 'bank_transfer', 'check', 'online'],
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
        notes: String,
      },
    ],
  },
  { timestamps: true }
);

// ✅ PRE SAVE HOOK - Updated to include extra charges
bookingSchema.pre('save', async function (next) {
  try {
    // 🔢 Generate booking number for new bookings
    if (this.isNew) {
      const year = new Date().getFullYear().toString().slice(-2);

      // Find the last booking of the current year
      const lastBooking = await this.constructor
        .findOne({ bookingNumber: new RegExp(`^BK-${year}-`) })
        .sort({ createdAt: -1 })
        .exec();

      let nextNumber = 1;
      if (lastBooking && lastBooking.bookingNumber) {
        // Extract the numeric part and increment
        const parts = lastBooking.bookingNumber.split('-'); // ["BK", "26", "00002"]
        nextNumber = parseInt(parts[2], 10) + 1;
      }

      this.bookingNumber = `BK-${year}-${nextNumber.toString().padStart(5, '0')}`;
    }

    // ✅ Calculate total extra charges
    this.totalExtraCharges = (this.extraCharges || []).reduce(
      (sum, charge) => sum + (charge.amount || 0),
      0
    );

    // ✅ Calculate items total
    const itemsTotal = this.items.reduce(
      (sum, item) => sum + (item.totalPrice || 0),
      0
    );

    // ✅ Subtotal = items + extra charges
    this.subtotal = itemsTotal + this.totalExtraCharges;

    // ✅ Calculate VAT (rounded)
    this.vatAmount = Math.round((this.subtotal * this.vatPercentage) / 100);

    // ✅ Calculate Grand Total
    this.totalAmount = Math.round(this.subtotal + this.vatAmount);

    // ✅ Calculate Total Paid from payments array
    const totalPaid = (this.payments || [])
      .filter((p) => p.status === 'completed')
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);

    // ✅ Also check paymentHistory for backward compatibility
    const totalPaidFromHistory = (this.paymentHistory || []).reduce(
      (sum, p) => sum + (p.amount || 0),
      0
    );

    // Use the larger of the two (in case payments are stored in different places)
    const finalTotalPaid = Math.max(totalPaid, totalPaidFromHistory, this.advanceAmount || 0);

    // ✅ Calculate Remaining
    this.remainingAmount = Math.max(0, this.totalAmount - finalTotalPaid);

    // ✅ Update advanceAmount to match total paid (for consistency)
    this.advanceAmount = finalTotalPaid;

    next();
  } catch (error) {
    console.error('Error in booking pre-save hook:', error);
    next(error);
  }
});

export default mongoose.models.Booking ||
  mongoose.model('Booking', bookingSchema);