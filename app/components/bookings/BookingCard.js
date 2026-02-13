"use client";

import { useState } from "react";
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
} from "react-icons/fi";
import { format } from "date-fns";

const BookingCard = ({ booking, onRefresh }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatDate = (date) => {
    try {
      return format(new Date(date), "MMM dd, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-indigo-100 text-indigo-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FiClock />;
      case 'confirmed': return <FiCheckCircle />;
      case 'in_progress': return <FiLoader />;
      case 'completed': return <FiTruck />;
      case 'cancelled': return <FiXCircle />;
      default: return <FiClock />;
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!confirm(`Are you sure you want to update booking status to ${newStatus}?`)) {
      return;
    }

    setLoading(true);
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

      alert(`Booking status updated to ${newStatus}`);
      onRefresh();
    } catch (error) {
      console.error("Error updating booking status:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBooking = async () => {
    if (!confirm(`Are you sure you want to delete booking ${booking.bookingNumber}?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/bookings/${booking._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete booking");
      }

      alert("Booking deleted successfully");
      onRefresh();
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex justify-between items-start">
          <div className="flex gap-4">
            <div className={`p-3 rounded-lg ${getStatusColor(booking.status)}`}>
              {getStatusIcon(booking.status)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {booking.bookingNumber}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                <FiCalendar className="inline mr-1" size={12} />
                {formatDate(booking.shiftingDate)} at {booking.shiftingTime}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <FiUser className="text-gray-400" size={14} />
                <span className="text-sm text-gray-700">{booking.clientName}</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(booking.totalAmount)}
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
              {booking.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {!isExpanded ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Client</p>
                <p className="font-medium">{booking.clientName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{booking.clientPhone}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Advance</p>
                <p className="text-xl font-bold">{formatCurrency(booking.advanceAmount || 0)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Remaining</p>
                <p className="text-xl font-bold">{formatCurrency(booking.remainingAmount || 0)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Items</p>
                <p className="text-xl font-bold">{booking.items?.length || 0}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Client Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FiUser className="text-gray-400" />
                  <span className="text-sm text-gray-500">Client:</span>
                </div>
                <p className="font-medium">{booking.clientName}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FiPhone className="text-gray-400" />
                  <span className="text-sm text-gray-500">Phone:</span>
                </div>
                <p className="font-medium">{booking.clientPhone}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FiCalendar className="text-gray-400" />
                  <span className="text-sm text-gray-500">Date & Time:</span>
                </div>
                <p className="font-medium">
                  {formatDate(booking.shiftingDate)} at {booking.shiftingTime}
                </p>
              </div>
            </div>

            {/* Addresses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FiMapPin className="text-gray-400" />
                  <span className="text-sm text-gray-500">Pickup Address:</span>
                </div>
                <p className="font-medium">{booking.pickupAddress}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FiMapPin className="text-gray-400" />
                  <span className="text-sm text-gray-500">Delivery Address:</span>
                </div>
                <p className="font-medium">{booking.deliveryAddress}</p>
              </div>
            </div>

            {/* Items List */}
            {booking.items?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Items</h4>
                <div className="space-y-2">
                  {booking.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          {item.quantity} {item.unit} × {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                      <p className="font-bold">{formatCurrency(item.totalPrice)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Payment Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Amount:</span>
                  <span className="font-medium">{formatCurrency(booking.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Advance Paid:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(booking.advanceAmount || 0)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-lg font-bold text-gray-900">Remaining Balance:</span>
                  <span className="text-lg font-bold text-red-600">
                    {formatCurrency(booking.remainingAmount || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Assigned Staff */}
            {booking.assignedStaff?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Assigned Staff</h4>
                <div className="flex flex-wrap gap-2">
                  {booking.assignedStaff.map((staff, index) => (
                    <div
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {staff.name} ({staff.role})
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {booking.notes && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
                <p className="text-sm text-gray-600 whitespace-pre-line">{booking.notes}</p>
              </div>
            )}

            {/* Special Instructions */}
            {booking.specialInstructions && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Special Instructions</h4>
                <p className="text-sm text-gray-600 whitespace-pre-line">{booking.specialInstructions}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="border-t">
        <div className="p-4 flex flex-wrap gap-2 justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition flex items-center gap-2"
            >
              {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
              {isExpanded ? "Show Less" : "Show Details"}
            </button>
          </div>

          <div className="flex gap-2">
            {/* Status Update Buttons */}
            {booking.status === 'pending' && (
              <button
                onClick={() => handleUpdateStatus('confirmed')}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition flex items-center gap-2 disabled:opacity-50"
              >
                <FiCheckCircle />
                Confirm
              </button>
            )}

            {booking.status === 'confirmed' && (
              <button
                onClick={() => handleUpdateStatus('in_progress')}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition flex items-center gap-2 disabled:opacity-50"
              >
                <FiLoader />
                Start Job
              </button>
            )}

            {booking.status === 'in_progress' && (
              <button
                onClick={() => handleUpdateStatus('completed')}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition flex items-center gap-2 disabled:opacity-50"
              >
                <FiTruck />
                Complete
              </button>
            )}

            {['pending', 'confirmed', 'in_progress'].includes(booking.status) && (
              <button
                onClick={() => handleUpdateStatus('cancelled')}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition flex items-center gap-2 disabled:opacity-50"
              >
                <FiXCircle />
                Cancel
              </button>
            )}

            {/* Add Payment Button */}
            {booking.status !== 'cancelled' && booking.remainingAmount > 0 && (
              <button
                onClick={() => alert("Add payment functionality")}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition flex items-center gap-2 disabled:opacity-50"
              >
                <FiPlus />
                Add Payment
              </button>
            )}

            {/* Delete Button for pending bookings */}
            {booking.status === 'pending' && (
              <button
                onClick={handleDeleteBooking}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 rounded-lg transition flex items-center gap-2 disabled:opacity-50"
              >
                <FiTrash2 />
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;