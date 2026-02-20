"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiDollarSign,
  FiUser,
  FiPhone,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiLoader,
  FiEdit2,
  FiTrash2,
  FiChevronDown,
  FiChevronUp,
  FiPlus,
  FiFileText,
  FiSend,
  FiX,
  FiMail,
  FiDownload,
  FiAlertCircle,
  FiInfo,
  FiPackage,
  FiCreditCard,
} from "react-icons/fi";
import { format } from "date-fns";


// Dynamically import PDF components
const BookingDownloadButton = dynamic(
  () =>
    import("@/app/lib/pdf/BookingPDF").then((mod) => ({
      default: mod.BookingDownloadButton,
    })),
  { ssr: false },
);

const BookingCard = ({
  booking,
  onRefresh,
  expandedBookingId,
  setExpandedBookingId,
}) => {
  const isExpanded = expandedBookingId === booking._id;
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [paymentDate, setPaymentDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [processingPayment, setProcessingPayment] = useState(false);
// Add this near the top of the component, after the props
console.log("BookingCard rendered with booking ID:", booking?._id);
  // Validate booking data
  if (!booking || !booking._id) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <FiAlertCircle className="mx-auto text-red-500 text-3xl mb-2" />
        <p className="text-red-700 font-medium">Invalid booking data</p>
        <p className="text-sm text-red-500 mt-1">
          Booking information is missing or corrupted
        </p>
      </div>
    );
  }

  const formatDate = (date) => {
    try {
      if (!date) return "Not scheduled";
      return format(new Date(date), "MMM dd, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  const formatDateTime = (date) => {
    try {
      if (!date) return "Not scheduled";
      return format(new Date(date), "MMM dd, yyyy hh:mm a");
    } catch {
      return "Invalid date";
    }
  };

  const formatTime = (time) => {
    return time || "Not scheduled";
  };

  const formatCurrency = (amount) => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount || 0);
    } catch {
      return "$0";
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: <FiClock size={14} />,
        label: "Pending",
        bgLight: "bg-yellow-50",
        textDark: "text-yellow-800",
      },
      confirmed: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: <FiCheckCircle size={14} />,
        label: "Confirmed",
        bgLight: "bg-blue-50",
        textDark: "text-blue-800",
      },
      in_progress: {
        color: "bg-indigo-100 text-indigo-800 border-indigo-200",
        icon: <FiLoader size={14} />,
        label: "In Progress",
        bgLight: "bg-indigo-50",
        textDark: "text-indigo-800",
      },
      completed: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: <FiCheckCircle size={14} />,
        label: "Completed",
        bgLight: "bg-green-50",
        textDark: "text-green-800",
      },
      cancelled: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: <FiXCircle size={14} />,
        label: "Cancelled",
        bgLight: "bg-red-50",
        textDark: "text-red-800",
      },
    };
    return configs[status] || configs.pending;
  };

  const statusConfig = getStatusConfig(booking.status);

  // Calculate grand total (subtotal + vat)
  const grandTotal = (booking.subtotal || booking.totalAmount || 0) + (booking.vatAmount || 0);
  
  // Calculate total paid so far from payment history
  const totalPaid = booking.paymentHistory 
    ? booking.paymentHistory.reduce((sum, payment) => sum + (payment.amount || 0), 0)
    : (booking.advanceAmount || 0);
  
  // Calculate remaining balance
const roundToTwo = (num) => Math.round(num * 100) / 100;

const remainingBalance = roundToTwo(
  Math.max(0, roundToTwo(grandTotal) - roundToTwo(totalPaid))
);


  const handleUpdateStatus = async (newStatus) => {
    if (
      !confirm(
        `Are you sure you want to update this booking to "${newStatus.replace("_", " ")}"?`,
      )
    ) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/bookings/${booking._id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update booking status");
      }

      setSuccessMessage(
        `Booking status updated to ${newStatus.replace("_", " ")}`,
      );
      setTimeout(() => setSuccessMessage(null), 3000);
      onRefresh();
    } catch (error) {
      console.error("Error updating booking status:", error);
      setError(error.message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBooking = async () => {
    if (
      !confirm(
        `Are you sure you want to delete booking ${booking.bookingNumber || "this booking"}? This action cannot be undone.`,
      )
    ) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/bookings/${booking._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete booking");
      }

      setSuccessMessage("Booking deleted successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
      onRefresh();
    } catch (error) {
      console.error("Error deleting booking:", error);
      setError(error.message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleSendBooking = async () => {
    if (!booking.clientEmail || booking.clientEmail.trim() === "") {
      setError("Client email is required to send booking details");
      setTimeout(() => setError(null), 5000);
      return;
    }

    if (!confirm(`Send PDF to ${booking.clientEmail}?`))
      return;

    setSending(true);
    setError(null);
    try {
      const companyInfo = {
        name: "Pack & Attack Removal Ltd",
        address:
          "Based in London — proudly serving all of Greater London, with nationwide moves available.",
        phone: "07577 441 654 / 07775 144 475",
        email: "info@Packattackremovalltd.com",
        website: "www.packattackremovals.com",
      };

      // Generate PDF
      const { MyBookingDocument } = await import("@/app/lib/pdf/BookingPDF");
      const { pdf } = await import("@react-pdf/renderer");

      const doc = (
        <MyBookingDocument booking={booking} companyInfo={companyInfo} />
      );
      const asBlob = await pdf(doc).toBlob();

      // Send email
      const formData = new FormData();
      formData.append("file", asBlob);
      formData.append("email", booking.clientEmail);
      formData.append("quoteNumber", booking.bookingNumber || booking._id);
      formData.append("clientName", booking.clientName || "");

      const response = await fetch("/api/quotes/send-email", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to send email");

      setSuccessMessage(`Booking confirmation sent to ${booking.clientEmail}`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      console.error("Error sending booking email:", error);
      setError(error.message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setSending(false);
    }
  };

const handleRecordPayment = async () => {
  // 1. Initial Validation
  const amount = parseFloat(paymentAmount);
  
  if (!paymentAmount || isNaN(amount) || amount <= 0) {
    alert("Please enter a valid payment amount.");
    return;
  }

  if (amount > remainingBalance + 0.01) {
    alert(`Payment cannot exceed the remaining balance of ${formatCurrency(remainingBalance)}`);
    return;
  }

  setProcessingPayment(true);

  try {
    // 2. API Call
    const response = await fetch(`/api/bookings/${booking._id}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount,
        paymentDate: paymentDate,
        paymentMethod: paymentMethod,
        notes: paymentNotes,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || result.message || "Failed to record payment");
    }

    // 3. Success Actions
    alert("Payment recorded successfully!");
    
    // Reset Modal Fields
    setPaymentAmount("");
    setPaymentNotes("");
    setPaymentDate(format(new Date(), "yyyy-MM-dd"));
    setPaymentMethod("cash");
    setShowPaymentModal(false);

    // 4. Refresh the data
    if (typeof onRefresh === "function") {
      onRefresh();
    }

  } catch (error) {
    console.error("Payment Error:", error);
    alert(error.message || "An error occurred while processing the payment.");
  } finally {
    setProcessingPayment(false);
  }
};

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col relative">
        {/* Header - Always visible */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${statusConfig.color}`}>
                {statusConfig.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">
                  {booking.bookingNumber || "Booking #" + booking._id.slice(-6)}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  <FiCalendar className="inline mr-1" size={12} />
                  {formatDate(booking.shiftingDate)} at{" "}
                  {formatTime(booking.shiftingTime)}
                </p>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
            >
              {statusConfig.label}
            </span>
          </div>
        </div>

        {/* Compact View - Default */}
        {!isExpanded ? (
          <div className="p-4 flex-1">
            {/* Client Info */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiUser className="text-blue-600" size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {booking.clientName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {booking.clientPhone}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <FiPackage className="mx-auto text-gray-400 mb-1" size={14} />
                <p className="text-xs text-gray-500">Items</p>
                <p className="text-sm font-semibold text-gray-900">
                  {booking.items?.length || 0}
                </p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <FiDollarSign className="mx-auto text-gray-400 mb-1" size={14} />
                <p className="text-xs text-gray-500">Paid</p>
                <p className="text-sm font-semibold text-green-600">
                  {formatCurrency(totalPaid).replace("$", "")}
                </p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <FiTruck className="mx-auto text-gray-400 mb-1" size={14} />
                <p className="text-xs text-gray-500">Remaining</p>
                <p className="text-sm font-semibold text-orange-600">
                  {formatCurrency(remainingBalance).replace("$", "")}
                </p>
              </div>
            </div>

            {/* Expand Button */}
            <button
              onClick={() => setExpandedBookingId(booking._id)}
              className="w-full py-2 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition flex items-center justify-center gap-1 border border-gray-200"
            >
              <FiChevronDown size={14} />
              View Details
            </button>
          </div>
        ) : (
          /* Expanded View */
          <div className="p-4 flex-1 overflow-y-auto max-h-[500px]">
            {/* Success/Error Messages */}
            {successMessage && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
                <FiCheckCircle className="flex-shrink-0" size={14} />
                <span className="text-sm">{successMessage}</span>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <FiAlertCircle className="flex-shrink-0" size={14} />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Client Details */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="text-xs font-medium text-gray-500 mb-2">
                  CLIENT INFORMATION
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FiUser className="text-gray-400 flex-shrink-0" size={14} />
                    <span className="text-sm font-medium text-gray-900">
                      {booking.clientName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiPhone className="text-gray-400 flex-shrink-0" size={14} />
                    <span className="text-sm text-gray-700">
                      {booking.clientPhone}
                    </span>
                  </div>
                  {booking.clientEmail && (
                    <div className="flex items-center gap-2">
                      <FiMail className="text-gray-400 flex-shrink-0" size={14} />
                      <span className="text-sm text-gray-700 truncate">
                        {booking.clientEmail}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Addresses */}
              <div>
                <h4 className="text-xs font-medium text-gray-500 mb-2">
                  ADDRESSES
                </h4>
                <div className="space-y-2">
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <div className="flex items-start gap-2">
                      <FiMapPin
                        className="text-blue-600 flex-shrink-0 mt-0.5"
                        size={14}
                      />
                      <div>
                        <p className="text-xs font-medium text-gray-700">
                          Pickup
                        </p>
                        <p className="text-xs text-gray-600">
                          {booking.pickupAddress || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <div className="flex items-start gap-2">
                      <FiMapPin
                        className="text-green-600 flex-shrink-0 mt-0.5"
                        size={14}
                      />
                      <div>
                        <p className="text-xs font-medium text-gray-700">
                          Delivery
                        </p>
                        <p className="text-xs text-gray-600">
                          {booking.deliveryAddress || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <div className="flex justify-between gap-2">
                      <div>
                        <p className="text-xs font-medium text-gray-700">
                          Shifting Time
                        </p>
                        <p className="text-xs text-gray-600">
                          {booking.shiftingTime || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-700">
                          Shifting Date
                        </p>
                        <p className="text-xs text-gray-600">
                          {booking.shiftingDate || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items List */}
              {booking.items?.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500 mb-2">
                    ITEMS
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {booking.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.quantity} {item.unit} ×{" "}
                            {formatCurrency(item.unitPrice)}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 ml-2">
                          {formatCurrency(item.totalPrice)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Summary */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="text-xs font-medium text-gray-500 mb-2">
                  PAYMENT SUMMARY
                </h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Subtotal:</span>
                    <span className="text-xs font-medium">
                      {formatCurrency(booking.subtotal || booking.totalAmount || 0)}
                    </span>
                  </div>
                  {(booking.vatAmount ?? 0) !== 0 && (
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">VAT ({booking.vatPercentage || 15}%):</span>
                      <span className="text-xs font-medium text-blue-600">
                        +{formatCurrency(booking.vatAmount || 0)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1.5 border-t border-gray-200">
                    <span className="text-sm font-bold text-gray-900">
                      Grand Total:
                    </span>
                    <span className="text-sm font-bold text-blue-700">
                      {formatCurrency(grandTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-gray-600">Total Paid:</span>
                    <span className="text-xs font-medium text-green-600">
                      {formatCurrency(totalPaid)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-gray-200">
                    <span className="text-sm font-bold text-gray-900">
                      Remaining Balance:
                    </span>
                    <span className="text-sm font-bold text-orange-600">
                      {formatCurrency(remainingBalance)}
                    </span>
                  </div>

                  {/* Payment History with Dates */}
                  {booking.paymentHistory && booking.paymentHistory.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-500 mb-2">PAYMENT HISTORY</p>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {booking.paymentHistory.map((payment, index) => (
                          <div key={index} className="flex justify-between items-start text-xs p-2 bg-white rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <FiCalendar className="text-gray-400" size={12} />
                                <span className="font-medium text-gray-700">
                                  {formatDateTime(payment.date)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <FiCreditCard className="text-gray-400" size={12} />
                                <span className="text-gray-600 capitalize">
                                  {payment.method}
                                </span>
                              </div>
                              {payment.notes && (
                                <p className="text-gray-500 text-xs mt-1 pl-6">
                                  {payment.notes}
                                </p>
                              )}
                            </div>
                            <span className="font-semibold text-green-600 ml-2">
                              {formatCurrency(payment.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {(booking.notes || booking.specialInstructions) && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500 mb-2">
                    NOTES
                  </h4>
                  {booking.notes && (
                    <div className="bg-blue-50 p-2 rounded-lg mb-2">
                      <div className="flex items-start gap-2">
                        <FiInfo
                          className="text-blue-600 flex-shrink-0 mt-0.5"
                          size={14}
                        />
                        <p className="text-xs text-blue-800">{booking.notes}</p>
                      </div>
                    </div>
                  )}
                  {booking.specialInstructions && (
                    <div className="bg-purple-50 p-2 rounded-lg">
                      <div className="flex items-start gap-2">
                        <FiAlertCircle
                          className="text-purple-600 flex-shrink-0 mt-0.5"
                          size={14}
                        />
                        <p className="text-xs text-purple-800">
                          {booking.specialInstructions}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={() => setExpandedBookingId(null)}
                className="w-full py-2 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition flex items-center justify-center gap-1 border border-gray-200"
              >
                <FiChevronUp size={14} />
                Close Details
              </button>
            </div>
          </div>
        )}

        {/* Actions - Always visible */}
        <div className="p-3 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
          <div className="flex flex-wrap gap-1.5 justify-end">
            <Link
  href={`/admin/bookings/edit/${booking._id}`}
  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
  title="Edit Booking"
>
  <FiEdit2 size={16} />
</Link>

            <div className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
              <BookingDownloadButton
                booking={booking}
                companyInfo={{
                  name: "Pack & Attack Removal Ltd",
                  address:
                    "Based in London — proudly serving all of Greater London, with nationwide moves available.",
                  phone: "07577 441 654 / 07775 144 475",
                  email: "info@Packattackremovalltd.com",
                  website: "www.packattackremovals.com",
                }}
              />
            </div>

            <button
              onClick={handleSendBooking}
              disabled={sending || loading}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 cursor-pointer rounded-lg transition disabled:opacity-50"
              title="Send to client"
            >
              {sending ? (
                <FiLoader className="animate-spin" size={16} />
              ) : (
                <FiSend size={16} />
              )}
            </button>

            {(booking.status === "pending" || booking.status === "cancelled"||
  booking.status === "completed"||booking.status === "confirmed"|| booking.status === "in_progress") && (
              <button
                onClick={handleDeleteBooking}
                disabled={loading}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                title="Delete Booking"
              >
                <FiTrash2 size={16} />
              </button>
            )}
          </div>

          {/* Status Update Buttons */}
          {booking.status !== "cancelled" && booking.status !== "completed" && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-gray-200">
              {booking.status === "pending" && (
                <>
                  <button
  onClick={() => handleUpdateStatus("in_progress")}
  disabled={loading}
  className="flex-1 px-3 py-2 text-xs cursor-pointer font-medium text-white bg-secondary rounded-lg transition flex items-center justify-center gap-1.5 disabled:opacity-50"
>
  <FiCheckCircle size={14} />
  Confirm
</button>
                  <button
                    onClick={() => handleUpdateStatus("cancelled")}
                    disabled={loading}
                    className="flex-1 px-3 py-2 text-xs cursor-pointer font-medium text-gray-700 bg-white hover:bg-red-50 hover:text-red-600 rounded-lg transition border border-gray-300 hover:border-red-300 flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <FiXCircle size={14} />
                    Decline
                  </button>
                </>
              )}

              {booking.status === "confirmed" && (
  <button
    onClick={() => handleUpdateStatus("cancelled")}
    disabled={loading}
    className="flex-1 px-3 py-2 text-xs cursor-pointer font-medium text-gray-700 bg-white hover:bg-red-50 hover:text-red-600 rounded-lg transition border border-gray-300 hover:border-red-300 flex items-center justify-center gap-1.5 disabled:opacity-50"
  >
    <FiXCircle size={14} />
    Decline
  </button>
)}

              {booking.status === "in_progress" && (
                <button
                  onClick={() => handleUpdateStatus("completed")}
                  disabled={loading}
                  className="flex-1 px-3 py-2 cursor-pointer text-xs font-medium text-white bg-secondary hover:from-green-700 hover:to-green-800 rounded-lg transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <FiCheckCircle size={14} />
                  Complete
                </button>
              )}

              {/* Record Payment Button - Always visible when there's remaining balance */}
              {["confirmed", "in_progress"].includes(booking.status) &&
  remainingBalance > 0 && (
    <button
      onClick={() => setShowPaymentModal(true)}
      disabled={loading}
      className="flex-1 px-3 py-2 cursor-pointer text-xs font-medium text-white bg-primary rounded-lg transition flex items-center justify-center gap-1.5 disabled:opacity-50"
    >
      <FiPlus size={14} />
      Record Payment
    </button>
)}
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Record Payment</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Current Balance Info */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">Grand Total:</span>
                  <span className="font-bold text-blue-700">{formatCurrency(grandTotal)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-blue-700">Total Paid:</span>
                  <span className="font-bold text-green-600">{formatCurrency(totalPaid)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold mt-2 pt-2 border-t border-blue-200">
                  <span className="text-blue-700">Remaining Balance:</span>
                  <span className="font-bold text-orange-600">{formatCurrency(remainingBalance)}</span>
                </div>
              </div>

              {/* Payment Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Date *
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  max={format(new Date(), "yyyy-MM-dd")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Payment Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
  type="number"
  min="0.01"
  step="0.01"
  value={paymentAmount}
  onChange={(e) => {
    const value = e.target.value;
    if (value === "") {
      setPaymentAmount(value);
      return;
    }
    
    const roundedValue = Math.round(parseFloat(value) * 100) / 100;
    
    // Check if the value is a valid number and not exceeding remaining balance
    if (!isNaN(roundedValue) && roundedValue <= remainingBalance) {
      setPaymentAmount(value);
    }
  }}
  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
  placeholder={`Max: ${formatCurrency(remainingBalance).replace('$', '')}`}
/>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Maximum: {formatCurrency(remainingBalance)}
                </p>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="check">Check</option>
                  <option value="online">Online Payment</option>
                </select>
              </div>

              {/* Payment Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Add any notes about this payment..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRecordPayment}
                  disabled={processingPayment || !paymentAmount || parseFloat(paymentAmount) <= 0 || parseFloat(paymentAmount) > remainingBalance}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-secondary transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processingPayment ? (
                    <>
                      <FiLoader className="animate-spin" size={16} />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FiCheckCircle size={16} />
                      Record Payment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookingCard;