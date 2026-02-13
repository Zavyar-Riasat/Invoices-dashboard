import mongoose from "mongoose";

const quoteSchema = new mongoose.Schema(
  {
    quoteNumber: {
      type: String,
      unique: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
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
    items: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
        unit: {
          type: String,
          required: true,
        },
        unitPrice: {
          type: Number,
          required: true,
        },
        totalPrice: {
          type: Number,
          required: true,
        },
        notes: {
          type: String,
        },
      },
    ],
    additionalCharges: [
      {
        description: {
          type: String,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        type: {
          type: String,
          enum: ["fuel", "labor", "packing", "vat", "other"],
          default: "other",
        },
      },
    ],
    discounts: [
      {
        description: {
          type: String,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        type: {
          type: String,
          enum: ["percentage", "fixed"],
          default: "fixed",
        },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },
    totalDiscount: {
      type: Number,
      required: true,
      default: 0,
    },
    totalAdditionalCharges: {
      type: Number,
      required: true,
      default: 0,
    },
    vatAmount: {
      type: Number,
      default: 0,
    },
    vatPercentage: {
      type: Number,
      default: 15,
    },
    grandTotal: {
      type: Number,
      required: true,
      default: 0,
    },
    validityDays: {
      type: Number,
      default: 30,
    },
    status: {
      type: String,
      enum: ["draft", "sent", "pending", "accepted", "rejected", "expired", "converted"],
      default: "draft",
    },
    notes: {
      type: String,
    },
    termsConditions: {
      type: String,
      default: "Payment due within 30 days. Prices valid for 30 days.",
    },
    sentVia: [
      {
        method: {
          type: String,
          enum: ["email", "sms", "whatsapp"],
        },
        sentAt: {
          type: Date,
        },
        sentTo: String,
      },
    ],
    convertedToBooking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Generate quote number before save
quoteSchema.pre("save", async function (next) {
  if (this.isNew && !this.quoteNumber) {
    try {
      const count = await this.constructor.countDocuments();
      const year = new Date().getFullYear().toString().slice(-2);
      this.quoteNumber = `QT-${year}-${(count + 1).toString().padStart(5, "0")}`;
    } catch (error) {
      console.error("Error generating quote number:", error);
      // Fallback to timestamp-based number
      const timestamp = Date.now().toString().slice(-8);
      this.quoteNumber = `QT-${year}-${timestamp}`;
    }
  }
  next();
});

// Calculate totals before save
quoteSchema.pre("save", function (next) {
  try {
    // Calculate subtotal from items
    this.subtotal = this.items.reduce(
      (sum, item) => {
        const itemTotal = item.quantity * item.unitPrice;
        item.totalPrice = itemTotal; // Ensure item totalPrice is set
        return sum + itemTotal;
      },
      0
    );

    // Calculate total additional charges
    this.totalAdditionalCharges = this.additionalCharges.reduce(
      (sum, charge) => sum + (charge.amount || 0),
      0
    );

    // Calculate total discount
    this.totalDiscount = this.discounts.reduce(
      (sum, discount) => {
        if (discount.type === "percentage") {
          return sum + (this.subtotal * (discount.amount / 100));
        }
        return sum + (discount.amount || 0);
      },
      0
    );

    // Calculate VAT base
    const vatBase = this.subtotal + this.totalAdditionalCharges - this.totalDiscount;
    
    // Calculate VAT amount
    this.vatAmount = (vatBase * (this.vatPercentage || 15)) / 100;
    
    // Calculate grand total
    this.grandTotal = vatBase + this.vatAmount;

    // Ensure all numeric values are numbers
    this.subtotal = Number(this.subtotal.toFixed(2));
    this.totalAdditionalCharges = Number(this.totalAdditionalCharges.toFixed(2));
    this.totalDiscount = Number(this.totalDiscount.toFixed(2));
    this.vatAmount = Number(this.vatAmount.toFixed(2));
    this.grandTotal = Number(this.grandTotal.toFixed(2));

  } catch (error) {
    console.error("Error calculating quote totals:", error);
  }
  
  next();
});

export default mongoose.models.Quote || mongoose.model("Quote", quoteSchema);