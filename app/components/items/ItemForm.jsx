"use client";

import { useState, useEffect } from "react";
import { 
  FiPackage, FiDollarSign, FiTag, FiLayers, 
  FiActivity, FiImage, FiCheckCircle, FiX 
} from "react-icons/fi";

const ItemForm = ({ item = null, onSubmit, onCancel, isLoading = false, isOpen = false }) => {
  const [formData, setFormData] = useState({
    name: item?.name || "",
    description: item?.description || "",
    category: item?.category || "Furniture",
    basePrice: item?.basePrice || "",
    unit: item?.unit || "piece",
    size: item?.size || "Medium",
    difficulty: item?.difficulty || "Medium",
    imageUrl: item?.imageUrl || "",
    isActive: item?.isActive !== undefined ? item.isActive : true,
    notes: item?.notes || ""
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  const categories = [
    "Furniture",
    "Electronics",
    "Appliances",
    "Kitchen",
    "Bedroom",
    "Living Room",
    "Office",
    "Other"
  ];

  const units = [
    { value: "piece", label: "Piece" },
    { value: "set", label: "Set" },
    { value: "kg", label: "Kilogram" },
    { value: "cubic meter", label: "Cubic Meter" },
    { value: "item", label: "Item" }
  ];

  const sizes = ["Small", "Medium", "Large", "Extra Large", "Custom"];
  const difficulties = ["Easy", "Medium", "Hard", "Expert"];

  // Reset form when item prop changes
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || "",
        description: item.description || "",
        category: item.category || "Furniture",
        basePrice: item.basePrice || "",
        unit: item.unit || "piece",
        size: item.size || "Medium",
        difficulty: item.difficulty || "Medium",
        imageUrl: item.imageUrl || "",
        isActive: item.isActive !== undefined ? item.isActive : true,
        notes: item.notes || ""
      });
    } else {
      setFormData({
        name: "",
        description: "",
        category: "Furniture",
        basePrice: "",
        unit: "piece",
        size: "Medium",
        difficulty: "Medium",
        imageUrl: "",
        isActive: true,
        notes: ""
      });
    }
    setErrors({});
    setSubmitError("");
  }, [item]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    if (submitError) {
      setSubmitError("");
    }
  };

  const validateForm = () => {
    const e = {};
    
    if (!formData.name.trim()) {
      e.name = "Item name is required";
    } else if (formData.name.length < 2) {
      e.name = "Item name must be at least 2 characters";
    }
    
    if (!formData.category) {
      e.category = "Category is required";
    }
    
    if (!formData.basePrice) {
      e.basePrice = "Base price is required";
    } else if (isNaN(formData.basePrice) || parseFloat(formData.basePrice) < 0) {
      e.basePrice = "Please enter a valid price";
    }
    
    if (!formData.unit) {
      e.unit = "Unit is required";
    }
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await onSubmit({
        ...formData,
        basePrice: parseFloat(formData.basePrice)
      });
    } catch (error) {
      console.error("ItemForm: Submit error", error);
      setSubmitError(error.message || "An unexpected error occurred");
    }
  };

  const handleClose = (e) => {
    if (e.target === e.currentTarget || e.target.closest('.close-btn')) {
      onCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 transition-all duration-300"
        onClick={handleClose}
      >
        {/* Modal Container */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {item ? "Edit Item" : "Add New Item"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {item ? "Update item information and pricing" : "Create new item with pricing details"}
                </p>
              </div>
              <button
                onClick={onCancel}
                className="close-btn p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Submit Error Display */}
              {submitError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{submitError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Item Name & Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <span className="flex items-center gap-2">
                        <FiPackage className="text-gray-400" size={16} />
                        Item Name *
                      </span>
                    </label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                        errors.name ? "border-red-300 bg-red-50" : "border-gray-300"
                      }`}
                      placeholder="e.g., Sofa, Refrigerator, Bed"
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500 mt-2">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <span className="flex items-center gap-2">
                        <FiTag className="text-gray-400" size={16} />
                        Category *
                      </span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                        errors.category ? "border-red-300 bg-red-50" : "border-gray-300"
                      }`}
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="text-sm text-red-500 mt-2">{errors.category}</p>
                    )}
                  </div>
                </div>

                {/* Price & Unit */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <span className="flex items-center gap-2">
                        <FiDollarSign className="text-gray-400" size={16} />
                        Base Price *
                      </span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        name="basePrice"
                        value={formData.basePrice}
                        onChange={handleChange}
                        className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                          errors.basePrice ? "border-red-300 bg-red-50" : "border-gray-300"
                        }`}
                        placeholder="0.00"
                      />
                    </div>
                    {errors.basePrice && (
                      <p className="text-sm text-red-500 mt-2">{errors.basePrice}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit *
                    </label>
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                        errors.unit ? "border-red-300 bg-red-50" : "border-gray-300"
                      }`}
                    >
                      {units.map(unit => (
                        <option key={unit.value} value={unit.value}>{unit.label}</option>
                      ))}
                    </select>
                    {errors.unit && (
                      <p className="text-sm text-red-500 mt-2">{errors.unit}</p>
                    )}
                  </div>
                </div>

                {/* Size & Difficulty */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <span className="flex items-center gap-2">
                        <FiLayers className="text-gray-400" size={16} />
                        Size
                      </span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {sizes.map(size => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, size }))}
                          className={`px-4 py-3 border rounded-lg text-sm font-medium transition-all ${
                            formData.size === size
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>

                  </div>

                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <span className="flex items-center gap-2">
                        <FiActivity className="text-gray-400" size={16} />
                        Difficulty Level
                      </span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {difficulties.map(difficulty => (
                        <button
                          key={difficulty}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, difficulty }))}
                          className={`px-4 py-3 border rounded-lg text-sm font-medium transition-all ${
                            formData.difficulty === difficulty
                              ? difficulty === 'Easy'
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : difficulty === 'Medium'
                                ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                                : difficulty === 'Hard'
                                ? 'border-orange-500 bg-orange-50 text-orange-700'
                                : 'border-red-500 bg-red-50 text-red-700'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {difficulty}
                        </button>
                      ))}
                    </div>
                  </div> */}
                </div>

                {/* Image URL */}
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <FiImage className="text-gray-400" size={16} />
                      Image URL (Optional)
                    </span>
                  </label>
                  <input
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="https://example.com/image.jpg"
                  />
                </div> */}

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                    placeholder="Brief description of the item..."
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                    placeholder="Additional notes or special instructions..."
                  />
                </div>

                {/* Active Status */}
                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className={`block w-14 h-8 rounded-full transition-colors ${
                        formData.isActive ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                        formData.isActive ? 'transform translate-x-6' : ''
                      }`}></div>
                    </div>
                    <div className="ml-3 text-gray-700 font-medium">
                      <span className="flex items-center gap-2">
                        <FiCheckCircle className={formData.isActive ? 'text-green-500' : 'text-gray-400'} />
                        {formData.isActive ? 'Active Item' : 'Inactive Item'}
                      </span>
                      <p className="text-sm text-gray-500 font-normal mt-1">
                        {formData.isActive 
                          ? 'This item will be available for selection' 
                          : 'This item will be hidden from selection'}
                      </p>
                    </div>
                  </label>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-4 p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl sticky bottom-0">
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {item ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    {item ? "Update Item" : "Create Item"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ItemForm;