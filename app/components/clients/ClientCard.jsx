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

const ClientCard = ({ client, onEdit, onDelete, isExpanded, onToggle }) => {
  const formatDate = (date) => {
    try {
      return format(new Date(date), "MMM dd, yyyy");
    } catch {
      return "Invalid date";
    }
  };

   return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex justify-between items-start">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiUser className="text-blue-600 text-xl" />
            </div>

            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {client.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {formatDate(client.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
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

        {!isExpanded && (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 break-words">
            <FiPhone className="text-gray-400" />
            {client.phone}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-6 border-t border-green-400">
        {!isExpanded && (
          <>
            {client.email && (
              <div className="flex items-center gap-2 text-sm text-gray-600 break-words">
                <FiMail className="text-gray-400" />
                {client.email}
              </div>
            )}

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
          </>
        )}

        {isExpanded && (
          <>
            <InfoRow icon={FiPhone} label="Phone" value={client.phone} />
            {client.email && (
              <InfoRow icon={FiMail} label="Email" value={client.email} />
            )}

            <InfoRow
              icon={FiMapPin}
              label="Address"
              value={client.address}
              wrap
            />

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
        className="mt-auto border-t border-green-500 py-3 text-sm text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2"
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
  <div className="flex items-start gap-3 ">
    <Icon className="text-gray-400 mt-1" />
    <div className="min-w-0">
      <p className="text-sm text-gray-500">{label}</p>
      <p
        className={`font-medium ${
          wrap ? "whitespace-normal break-words" : "truncate"
        }`}
      >
        {value}
      </p>
    </div>
  </div>
);

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="bg-gray-50 rounded-lg p-4">
    <div className="flex items-center gap-2 mb-1">
      <Icon className="text-blue-500" />
      <span className="text-sm text-gray-500">{label}</span>
    </div>
    <p className="text-xl font-bold text-gray-900">{value}</p>
  </div>
);

export default ClientCard;
