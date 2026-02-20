"use client";

import { useState } from "react";
import {
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiCalendar,
  FiPackage,
  FiDollarSign,
  FiEdit2,
  FiTrash2,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiTrendingUp,
  FiLoader,
} from "react-icons/fi";
import { format } from "date-fns";

const ClientCard = ({ 
  client, 
  onEdit, 
  onDelete, 
  isExpanded, 
  onToggle,
  loadingStats = false 
}) => {
  const formatDate = (date) => {
    try {
      return format(new Date(date), "MMM dd, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  // Use stats from API if available, otherwise fallback to local calculations
  const stats = client.stats || {};
  
  // Get values from stats API
  const totalBookings = stats.totalBookings || 0;
  const completedBookings = stats.completedBookings || 0;
  const pendingBookings = stats.pendingBookings || 0;
  const totalRemaining = stats.totalRemaining || 0;
  const totalSpent = stats.totalSpent || client.totalSpent || 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex justify-between items-start flex-wrap gap-4">
          {/* Name + Avatar */}
          <div className="flex gap-4 min-w-0 items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FiUser className="text-blue-600 text-xl" />
            </div>

            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {client.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1 truncate">
                Customer since {formatDate(client.createdAt)}
              </p>
            </div>
          </div>

          {/* Edit + Delete Buttons */}
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => onEdit(client)}
              className="p-2 hover:bg-green-50 rounded-lg text-gray-500 hover:text-green-600"
            >
              <FiEdit2 />
            </button>
            <button
              onClick={() => onDelete(client)}
              className="p-2 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-600"
            >
              <FiTrash2 />
            </button>
          </div>
        </div>

        {/* Quick Stats Row - Always visible */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="bg-blue-50 rounded-lg p-2 text-center">
            <p className="text-xs text-blue-600 font-medium">Total Bookings</p>
            {loadingStats ? (
              <FiLoader className="animate-spin mx-auto text-blue-600" size={20} />
            ) : (
              <p className="text-lg font-bold text-blue-700">{totalBookings}</p>
            )}
          </div>
          <div className="bg-green-50 rounded-lg p-2 text-center">
            <p className="text-xs text-green-600 font-medium">Completed Bookings</p>
            {loadingStats ? (
              <FiLoader className="animate-spin mx-auto text-green-600" size={20} />
            ) : (
              <p className="text-lg font-bold text-green-700">{completedBookings}</p>
            )}
          </div>
          <div className="bg-orange-50 rounded-lg p-2 text-center">
            <p className="text-xs text-orange-600 font-medium">Remaining Amount</p>
            {loadingStats ? (
              <FiLoader className="animate-spin mx-auto text-orange-600" size={20} />
            ) : (
              <p className="text-lg font-bold text-orange-700">
                ${totalRemaining.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {!isExpanded && (
          <>
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 break-words">
                <FiPhone className="text-gray-400" />
                {client.phone}
              </div>
              {client.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600 break-words">
                  <FiMail className="text-gray-400" />
                  {client.email}
                </div>
              )}
            </div>

            {/* Stats Cards - Optional, you can uncomment if needed */}
            {/* <div className="grid grid-cols-2 gap-4">
              <StatCard
                icon={FiPackage}
                label="Active Bookings"
                value={pendingBookings}
                color="blue"
              />
              <StatCard
                icon={FiTrendingUp}
                label="Remaining Balance"
                value={`$${totalRemaining.toLocaleString()}`}
                color="orange"
              />
            </div> */}
          </>
        )}

        {isExpanded && (
          <>
            {/* Contact Information */}
            <div className="space-y-3">
              <InfoRow icon={FiPhone} label="Phone" value={client.phone} />
              {client.email && (
                <InfoRow icon={FiMail} label="Email" value={client.email} />
              )}
              {client.address && (
                <InfoRow
                  icon={FiMapPin}
                  label="Address"
                  value={client.address}
                  wrap
                />
              )}
            </div>

            {/* Booking Stats */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Booking Summary</h4>
              {loadingStats ? (
                <div className="flex justify-center items-center py-8">
                  <FiLoader className="animate-spin text-blue-600" size={24} />
                  <span className="ml-2 text-gray-600">Loading stats...</span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {/* <StatCard
                      icon={FiPackage}
                      label="Total Bookings"
                      value={totalBookings}
                      color="blue"
                    />
                    <StatCard
                      icon={FiCheckCircle}
                      label="Completed"
                      value={completedBookings}
                      color="green"
                    /> */}
                    <StatCard
                      icon={FiClock}
                      label="Pending"
                      value={pendingBookings}
                      color="yellow"
                    />
                    <StatCard
                      icon={FiDollarSign}
                      label="Total Recieve"
                      value={`$${totalSpent.toLocaleString()}`}
                      color="purple"
                    />
                  </div>
                  
                  {/* Total Outstanding */}
                  {/* <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-orange-700 font-medium">Total Outstanding Balance</p>
                        <p className="text-xs text-orange-600 mt-1">Across all active bookings</p>
                      </div>
                      <p className="text-2xl font-bold text-orange-700">
                        ${totalRemaining.toLocaleString()}
                      </p>
                    </div>
                  </div> */}
                </>
              )}
            </div>

            {/* Recent Bookings Preview - Only show if bookings array exists */}
            {client.bookings && client.bookings.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Bookings</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {client.bookings.slice(0, 3).map((booking) => {
                    const grandTotal = (booking.subtotal || booking.totalAmount || 0) + (booking.vatAmount || 0);
                    return (
                      <div key={booking._id} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {booking.bookingNumber || `Booking #${booking._id?.slice(-6)}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(booking.shiftingDate)} • {booking.shiftingTime}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">
                              ${grandTotal.toLocaleString()}
                            </p>
                            <p className={`text-xs ${
                              booking.status === 'completed' ? 'text-green-600' : 
                              booking.status === 'cancelled' ? 'text-red-600' : 
                              'text-yellow-600'
                            }`}>
                              {booking.status?.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Notes */}
            {client.notes && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Notes</p>
                <p className="bg-gray-50 p-4 rounded-lg text-gray-700 whitespace-pre-wrap break-words">
                  {client.notes}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Toggle */}
      <button
        onClick={onToggle}
        className="mt-auto border-t border-gray-200 py-3 text-sm text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2"
      >
        {isExpanded ? (
          <>
            <FiChevronUp /> Show Less
          </>
        ) : (
          <>
            <FiChevronDown /> Show Full Details
          </>
        )}
      </button>
    </div>
  );
};

/* Helpers */

const InfoRow = ({ icon: Icon, label, value, wrap }) => (
  <div className="flex items-start gap-3">
    <Icon className="text-gray-400 mt-1 flex-shrink-0" />
    <div className="min-w-0 flex-1">
      <p className="text-sm text-gray-500">{label}</p>
      <p
        className={`font-medium text-gray-900 ${
          wrap ? "whitespace-normal break-words" : "truncate"
        }`}
      >
        {value || "Not provided"}
      </p>
    </div>
  </div>
);

const StatCard = ({ icon: Icon, label, value, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
    yellow: "bg-yellow-50 text-yellow-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className={`${colorClasses[color]} rounded-lg p-3`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`text-${color}-500`} />
        <span className="text-xs text-gray-600">{label}</span>
      </div>
      <p className="text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
};

// Add this if you don't have it imported
const FiCheckCircle = (props) => (
  <svg
    stroke="currentColor"
    fill="none"
    strokeWidth="2"
    viewBox="0 0 24 24"
    strokeLinecap="round"
    strokeLinejoin="round"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

export default ClientCard;