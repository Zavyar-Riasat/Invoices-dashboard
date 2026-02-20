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

    // ✅ Subtotal (before VAT)
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

// ✅ PRE SAVE HOOK
bookingSchema.pre('save', async function (next) {
  try {
    // 🔢 Generate booking number
    if (this.isNew) {
      const count = await this.constructor.countDocuments();
      const year = new Date().getFullYear().toString().slice(-2);
      this.bookingNumber = `BK-${year}-${(count + 1)
        .toString()
        .padStart(5, '0')}`;
    }

    // ✅ Calculate subtotal from items if not provided
    if (!this.subtotal || this.subtotal === 0) {
      this.subtotal = this.items.reduce(
        (sum, item) => sum + (item.totalPrice || 0),
        0
      );
    }

    // ✅ Calculate VAT (rounded)
    this.vatAmount = Math.round(
      (this.subtotal * this.vatPercentage) / 100
    );

    // ✅ Calculate Grand Total
    this.totalAmount = Math.round(this.subtotal + this.vatAmount);

    // ✅ Calculate Total Paid
    const totalPaid = this.payments
      .filter((p) => p.status === 'completed')
      .reduce((sum, payment) => sum + payment.amount, 0);

    // ✅ Calculate Remaining
    this.remainingAmount = Math.max(0, this.totalAmount - totalPaid);

    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.models.Booking ||
  mongoose.model('Booking', bookingSchema);
