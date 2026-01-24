"use client";

import { useState } from "react";
import {
  FiPackage,
  FiEdit2,
  FiTrash2,
  FiDollarSign,
  FiTag,
  FiLayers,
  FiActivity,
  FiFileText,
  FiChevronDown,
  FiChevronUp,
  FiEye,
  FiInfo,
} from "react-icons/fi";
import { format } from "date-fns";

const ItemCard = ({ item, onEdit, onDelete, onView }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEyeIcon, setShowEyeIcon] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Hard":
        return "bg-orange-100 text-orange-800";
      case "Expert":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSizeColor = (size) => {
    switch (size) {
      case "Small":
        return "bg-blue-100 text-blue-800";
      case "Medium":
        return "bg-indigo-100 text-indigo-800";
      case "Large":
        return "bg-purple-100 text-purple-800";
      case "Extra Large":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Limited view for collapsed state
  const limitedView = (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          {/* <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3> */}
          <div className="flex items-center gap-3 mt-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800`}>
              <FiTag className="inline mr-1" size={12} />
              {item.category}
            </span>
            {/* <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSizeColor(item.size)}`}>
              <FiLayers className="inline mr-1" size={12} />
              {item.size}
            </span> */}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(item.basePrice)}
          </div>
          {/* <div className="text-sm text-gray-500">per {item.unit}</div> */}
        </div>
      </div>
      
      {/* Description preview */}
      {/* {item.description && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
          {item.description}
        </p>
      )} */}
    </div>
  );

  // Full expanded view
  const fullView = (
    <div className="p-6">
      {/* Category & Price Row */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
            <FiTag className="inline mr-1" size={14} />
            {item.category}
          </span>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(item.basePrice)}
          </div>
          <div className="text-sm text-gray-500">per {item.unit}</div>
        </div>
      </div>

      {/* Full Description */}
      {item.description && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {item.description}
          </p>
        </div>
      )}

      {/* Item Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Size */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FiLayers className="text-gray-400" size={16} />
            <span className="text-sm text-gray-500">Size:</span>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSizeColor(item.size)}`}>
            {item.size}
          </span>
        </div>

        {/* Difficulty (optional - uncomment if needed) */}
        {/* <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FiActivity className="text-gray-400" size={16} />
            <span className="text-sm text-gray-500">Difficulty:</span>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(item.difficulty)}`}>
            {item.difficulty}
          </span>
        </div> */}

        {/* Unit */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FiPackage className="text-gray-400" size={16} />
            <span className="text-sm text-gray-500">Unit:</span>
          </div>
          <span className="font-medium text-gray-800">{item.unit}</span>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FiActivity className="text-gray-400" size={16} />
            <span className="text-sm text-gray-500">Status:</span>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {item.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {/* Notes Section - Only show if notes exist */}
      {item.notes && item.notes.trim() && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
          <div className="flex items-start gap-3">
            <FiFileText className="text-yellow-500 mt-0.5 flex-shrink-0" size={16} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-yellow-800">Notes:</span>
              </div>
              <p className="text-sm text-yellow-700 whitespace-pre-line leading-relaxed">
                {item.notes}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Update Date */}
      <div className="text-xs text-gray-500 pt-4 border-t border-gray-100">
        Updated: {format(new Date(item.updatedAt), "MMM d, yyyy")}
      </div>
    </div>
  );

  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden group relative"
      onMouseEnter={() => setShowEyeIcon(true)}
      onMouseLeave={() => setShowEyeIcon(false)}
    >
      {/* Card Header - Always visible */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-lg ${item.isActive ? "bg-blue-100" : "bg-gray-100"}`}
            >
              <FiPackage
                className={`text-xl ${item.isActive ? "text-blue-600" : "text-gray-400"}`}
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {item.name}
                </h3>
              </div>
            </div>
          </div>

          {/* Eye icon for expand */}
          {/* {showEyeIcon && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
              title={isExpanded ? "Show less" : "Show full details"}
            >
              <FiEye size={18} />
            </button>
          )} */}

          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(item)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
              title="Edit Item"
            >
              <FiEdit2 size={18} />
            </button>
            <button
              onClick={() => onDelete(item)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Delete Item"
            >
              <FiTrash2 size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Card Body - Conditional rendering */}
      {isExpanded ? fullView : limitedView}

      {/* Expand/Collapse Button */}
      <div className="border-t border-gray-100">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition"
        >
          {isExpanded ? (
            <>
              <FiChevronUp size={16} />
              Show Less
            </>
          ) : (
            <>
              <FiChevronDown size={16} />
              Show Full Details
            </>
          )}
        </button>
      </div>

      {/* Info badge for mobile */}
      <div className="md:hidden absolute top-4 left-4">
        <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
          <FiInfo size={10} />
          <span>Tap for details</span>
        </div>
      </div>

      {/* Active/Inactive Indicator */}
      <div
        className={`h-1 ${item.isActive ? "bg-green-500" : "bg-gray-400"}`}
      ></div>
    </div>
  );
};

export default ItemCard;