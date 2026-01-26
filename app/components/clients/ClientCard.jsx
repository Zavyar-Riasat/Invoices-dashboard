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
} from "react-icons/fi";
import { format } from "date-fns";

const ClientCard = ({ client, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (date) => {
    try {
      return format(new Date(date), "MMM dd, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  const statusClasses = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-yellow-100 text-yellow-800",
    completed: "bg-blue-100 text-blue-800",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-start">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiUser className="text-blue-600 text-xl" />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {client.name}
              </h3>

              <div className="flex items-center gap-3 mt-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    statusClasses[client.status] ||
                    "bg-gray-100 text-gray-800"
                  }`}
                >
                  {client.status}
                </span>
                <span className="text-sm text-gray-500">
                  {formatDate(client.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(client)}
              className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg"
            >
              <FiEdit2 size={18} />
            </button>
            <button
              onClick={() => onDelete(client)}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
            >
              <FiTrash2 size={18} />
            </button>
          </div>
        </div>

        {/* Compact info (collapsed) */}
        {!isExpanded && (
          <div className="md:hidden mt-4 flex justify-between text-sm">
            <div className="flex items-center gap-2">
              <FiPhone className="text-gray-400" />
              {client.phone}
            </div>
            <div className="flex items-center gap-2">
              <FiPackage className="text-blue-500" />
              {client.totalDeliveries || 0}
            </div>
          </div>
        )}
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Contact */}
            <div className="space-y-4">
              <InfoRow icon={FiPhone} label="Phone" value={client.phone} />
              {client.email && (
                <InfoRow icon={FiMail} label="Email" value={client.email} />
              )}
              <InfoRow
                icon={FiMapPin}
                label="Address"
                value={client.address}
              />
            </div>

            {/* Stats */}
            <div className="space-y-4">
              <InfoRow
                icon={FiCalendar}
                label="Shifting Date"
                value={formatDate(client.shiftingDate)}
              />

              <div className="grid grid-cols-2 gap-4">
                <StatCard
                  icon={FiPackage}
                  label="Deliveries"
                  value={client.totalDeliveries || 0}
                />
                <StatCard
                  icon={FiDollarSign}
                  label="Total Spent"
                  value={`$${(client.totalSpent || 0).toLocaleString()}`}
                />
              </div>
            </div>
          </div>

          {client.notes && (
            <div className="pt-6 border-t">
              <p className="text-sm text-gray-500 mb-2">Notes</p>
              <p className="bg-gray-50 p-4 rounded-lg text-gray-700">
                {client.notes}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-center gap-2 py-3 border-t text-sm font-medium text-gray-600 hover:bg-gray-50"
      >
        {isExpanded ? (
          <>
            <FiChevronUp /> Show Less Details
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

/* Small reusable components */

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <Icon className="text-gray-400 mt-1" />
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  </div>
);

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="bg-gray-50 rounded-lg p-4">
    <div className="flex items-center gap-2 mb-2">
      <Icon className="text-blue-500" />
      <span className="text-sm text-gray-500">{label}</span>
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
  </div>
);

export default ClientCard;

