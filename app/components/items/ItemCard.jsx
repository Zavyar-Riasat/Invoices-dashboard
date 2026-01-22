"use client";

import {
  FiPackage,
  FiEdit2,
  FiTrash2,
  FiDollarSign,
  FiTag,
  FiLayers,
  FiActivity,
  FiFileText,
} from "react-icons/fi";
import { format } from "date-fns";

const ItemCard = ({ item, onEdit, onDelete, onView }) => {
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden group">
      {/* Card Header */}
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
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {item.description}
              </p>
            </div>
          </div>

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
        <div>
          {item.isActive && (
            <span className="px-2 py-1 bg-blue-100 mt-1  text-blue-600 text-xs font-medium rounded">
              Active
            </span>
          )}
        </div>
        <div>
          {!item.isActive && (
            <span className="px-2 py-1 bg-gray-100 mt-1  text-red-600 text-xs font-medium rounded">
              Inactive
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
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

  {/* Item Details */}
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

    {/* Difficulty (keep this or remove based on your needs) */}
    {/* <div className="space-y-2">
      <div className="flex items-center gap-2">
        <FiActivity className="text-gray-400" size={16} />
        <span className="text-sm text-gray-500">Difficulty:</span>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(item.difficulty)}`}>
        {item.difficulty}
      </span>
    </div> */}
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

  {/* Status & Actions */}
  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
    <div className="text-xs text-gray-500">
      Updated: {format(new Date(item.updatedAt), "MMM d, yyyy")}
    </div>
    {/* <button
      onClick={() => onView(item)}
      className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline"
    >
      View Details →
    </button> */}
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
