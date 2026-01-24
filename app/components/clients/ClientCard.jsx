"use client";

import { useState } from 'react';
import { FiUser, FiPhone, FiMail, FiMapPin, FiCalendar, FiPackage, FiDollarSign, FiEdit2, FiTrash2, FiEye, FiChevronDown, FiChevronUp, FiInfo } from 'react-icons/fi';
import { format } from 'date-fns';

const ClientCard = ({ client, onEdit, onDelete, onView }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEyeIcon, setShowEyeIcon] = useState(false);

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Limited info for collapsed view (BOTH mobile and desktop)
  const limitedInfo = (
    <div className="md:hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FiPhone className="text-gray-400" size={16} />
          <span className="text-sm font-medium">{client.phone}</span>
        </div>
        <div className="flex items-center gap-2">
          <FiPackage className="text-blue-500" size={16} />
          <span className="text-sm font-medium">{client.totalDeliveries || 0} deliveries</span>
        </div>
      </div>
      {/* <p className="text-sm text-gray-600 line-clamp-2">
        <FiMapPin className="inline mr-1 text-gray-400" size={14} />
        {client.address}
      </p> */}
    </div>
  );

  // Full info for expanded view
  const fullInfo = (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <FiPhone className="text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{client.phone}</p>
            </div>
          </div>
          
          {client.email && (
            <div className="flex items-center gap-3">
              <FiMail className="text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{client.email}</p>
              </div>
            </div>
          )}
          
          <div className="flex items-start gap-3">
            <FiMapPin className="text-gray-400 flex-shrink-0 mt-1" />
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-medium">{client.address}</p>
            </div>
          </div>
        </div>

        {/* Stats & Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <FiCalendar className="text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-500">Shifting Date</p>
              <p className="font-medium">{formatDate(client.shiftingDate)}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <FiPackage className="text-blue-500" />
                <span className="text-sm text-gray-500">Deliveries</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{client.totalDeliveries || 0}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <FiDollarSign className="text-green-500" />
                <span className="text-sm text-gray-500">Total Spent</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                ${(client.totalSpent || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notes (if available) */}
      {client.notes && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500 mb-2">Notes</p>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
            {client.notes}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden relative"
      onMouseEnter={() => setShowEyeIcon(true)}
      onMouseLeave={() => setShowEyeIcon(false)}
    >
      {/* Eye icon appears on hover (mobile/desktop) - KEEP COMMENT */}
      {/* {showEyeIcon && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute top-4 right-16 z-10 md:hidden p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition"
          title={isExpanded ? "Show less" : "Show more"}
        >
          <FiEye className="text-gray-700" size={18} />
        </button>
      )} */}

      {/* Desktop eye icon - NOW SHOWS ON BOTH */}
      {/* <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`absolute top-4 right-16 z-10 p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition ${
          showEyeIcon ? 'opacity-100' : 'opacity-0'
        }`}
        title={isExpanded ? "Show less" : "Show more"}
      >
        <FiEye size={18} />
      </button> */}

      {/* Card Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiUser className="text-blue-600 text-xl" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
              <div className="flex items-center gap-3 mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                  {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                </span>
                <span className="text-sm text-gray-500">
                  {formatDate(client.createdAt)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(client)}
              className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
              title="Edit"
            >
              <FiEdit2 size={18} />
            </button>
            <button
              onClick={() => onDelete(client)}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Delete"
            >
              <FiTrash2 size={18} />
            </button>
          </div>
        </div>

        {/* Mobile: Show limited info when collapsed - KEEP COMMENT */}
        {!isExpanded && limitedInfo}
      </div>

      {/* Card Body - Conditional rendering for BOTH mobile and desktop */}
      {isExpanded ? (
        fullInfo
      ) : (
        // Desktop: NO LONGER always show full info - show limited view
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Desktop limited view */}
            {/* <div className="flex items-center gap-3">
              <FiPhone className="text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{client.phone}</p>
              </div>
            </div>
             */}
            {/* <div className="flex items-center gap-3">
              <FiPackage className="text-blue-500 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500">Deliveries</p>
                <p className="font-medium text-xl">{client.totalDeliveries || 0}</p>
              </div>
            </div> */}
            
            {/* <div className="flex items-center gap-3">
              <FiDollarSign className="text-green-500 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500">Total Spent</p>
                <p className="font-medium text-xl">${(client.totalSpent || 0).toLocaleString()}</p>
              </div>
            </div> */}
          </div>
          
          {/* Desktop address preview */}
          {/* <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-start gap-3">
              <FiMapPin className="text-gray-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium line-clamp-2">{client.address}</p>
              </div>
            </div>
          </div> */}
        </div>
      )}

      {/* Expand/collapse button for BOTH mobile and desktop */}
      <div className="border-t border-gray-100">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition"
        >
          {isExpanded ? (
            <>
              <FiChevronUp size={16} />
              Show Less Details
            </>
          ) : (
            <>
              <FiChevronDown size={16} />
              Show Full Details
            </>
          )}
        </button>
      </div>

      {/* Info badge for mobile (always visible) - KEEP COMMENT */}
      {/* <div className="md:hidden absolute top-4 left-4">
        <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
          <FiInfo size={12} />
          <span>Tap card for details</span>
        </div>
      </div> */}
    </div>
  );
};

export default ClientCard;