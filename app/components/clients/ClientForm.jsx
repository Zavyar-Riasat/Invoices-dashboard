"use client";

import { useState, useEffect } from "react";
import { FiUser, FiPhone, FiMail, FiMapPin, FiCalendar, FiX } from "react-icons/fi";

const ClientForm = ({ client = null, onSubmit, onCancel, isLoading = false, isOpen = false }) => {
  const [formData, setFormData] = useState({
    name: client?.name || "",
    phone: client?.phone || "",
    email: client?.email || "",
    address: client?.address || "",
    shiftingDate: client?.shiftingDate
      ? new Date(client.shiftingDate).toISOString().split("T")[0]
      : "",
    status: client?.status || "active",
    notes: client?.notes || "",
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  // Reset form when client prop changes
  useEffect(() => {
    console.log("ClientForm: Client prop changed", { client, isOpen });
    if (client) {
      setFormData({
        name: client.name || "",
        phone: client.phone || "",
        email: client.email || "",
        address: client.address || "",
        shiftingDate: client.shiftingDate
          ? new Date(client.shiftingDate).toISOString().split("T")[0]
          : "",
        status: client.status || "active",
        notes: client.notes || "",
      });
    } else {
      // Reset to empty form when creating new client
      setFormData({
        name: "",
        phone: "",
        email: "",
        address: "",
        shiftingDate: "",
        status: "active",
        notes: "",
      });
    }
    setErrors({});
    setSubmitError("");
  }, [client]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    console.log("ClientForm: Modal state changed", { isOpen });
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
    const { name, value } = e.target;
    console.log("ClientForm: Field changed", { name, value });
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (submitError) {
      setSubmitError("");
    }
  };

  const validateForm = () => {
    console.log("ClientForm: Validating form data", formData);
    const e = {};
    
    if (!formData.name.trim()) {
      e.name = "Name is required";
      console.error("ClientForm: Validation error - Name is required");
    }
    
 if (!formData.phone.trim()) {
  e.phone = "Phone number is required";
  console.error("ClientForm: Validation error - Phone is required");

} else {
  // remove spaces, dashes, brackets
  const cleanedPhone = formData.phone.replace(/[\s\-()]/g, '');

  if (!/^[0-9+]+$/.test(cleanedPhone)) {
    e.phone = "Phone number can contain only numbers and +";
    console.error("ClientForm: Validation error - Invalid characters");

  } else if (cleanedPhone.length < 10) {
    e.phone = "Phone number must be at least 10 digits";
    console.error("ClientForm: Validation error - Too short");

  } else if (cleanedPhone.length > 15) {
    e.phone = "Phone number cannot be more than 15 digits";
    console.error("ClientForm: Validation error - Too long");
  }
}

    
    if (!formData.address.trim()) {
      e.address = "Address is required";
      console.error("ClientForm: Validation error - Address is required");
    }
    
    if (!formData.shiftingDate) {
      e.shiftingDate = "Shifting date is required";
      console.error("ClientForm: Validation error - Shifting date is required");
    } else if (new Date(formData.shiftingDate) > new Date()) {
      e.shiftingDate = "Shifting date cannot be in the future";
      console.error("ClientForm: Validation error - Shifting date in future");
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      e.email = "Enter a valid email address";
      console.error("ClientForm: Validation error - Invalid email format");
    }
    
    setErrors(e);
    console.log("ClientForm: Validation result", { errors: e, isValid: Object.keys(e).length === 0 });
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  console.log("ClientForm: Submit initiated");
  
  if (!validateForm()) {
    console.warn("ClientForm: Submit aborted - Form validation failed");
    return;
  }
  
  try {
    console.log("ClientForm: Calling onSubmit with data", formData);
    await onSubmit(formData);
    console.log("ClientForm: Submit successful");
  } catch (error) {
    console.error("ClientForm: Submit error", {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      response: error?.response,
      status: error?.status,
      formData
    });
    
    // Try to get more details from the error
    let errorMessage = 'An unexpected error occurred';
    
    if (error?.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error?.toString) {
      errorMessage = error.toString();
    }
    
    setSubmitError(errorMessage);
  }
};

  const handleClose = (e) => {
    console.log("ClientForm: Close triggered", { 
      target: e.target.className,
      currentTarget: e.currentTarget.className 
    });
    
    if (e.target === e.currentTarget || e.target.closest('.close-btn')) {
      console.log("ClientForm: Closing modal");
      onCancel();
    }
  };

  if (!isOpen) {
    console.log("ClientForm: Modal not open, returning null");
    return null;
  }

  return (
    <>
      {/* Backdrop - Enhanced Blurry Background */}
      <div 
        className="fixed inset-0  bg-black/60 backdrop-blur-md z-50 transition-all duration-300"
        onClick={handleClose}
      >
        {/* Modal Container - Centered with slide-up animation */}
        <div className="fixed  inset-0 flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 opacity-100 animate-fadeInUp mt-20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {client ? "Edit Client" : "Add New Client"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {client ? "Update client information" : "Enter client details"}
                </p>
              </div>
              <button
                onClick={onCancel}
                className="close-btn p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {/* Submit Error Display */}
              {submitError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <span className="font-medium">Error:</span> {submitError}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center gap-2">
                      <FiUser className="text-gray-400" size={16} />
                      Full Name *
                    </span>
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                      errors.name ? "border-red-300 bg-red-50" : "border-gray-300"
                    }`}
                    placeholder="John Doe"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <span>⚠</span> {errors.name}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center gap-2">
                      <FiPhone className="text-gray-400" size={16} />
                      Phone Number *
                    </span>
                  </label>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                      errors.phone ? "border-red-300 bg-red-50" : "border-gray-300"
                    }`}
                    placeholder="+92 300 1234567"
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <span>⚠</span> {errors.phone}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center gap-2">
                      <FiMail className="text-gray-400" size={16} />
                      Email Address
                    </span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                      errors.email ? "border-red-300 bg-red-50" : "border-gray-300"
                    }`}
                    placeholder="email@example.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <span>⚠</span> {errors.email}
                    </p>
                  )}
                </div>

                {/* Shifting Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center gap-2">
                      <FiCalendar className="text-gray-400" size={16} />
                      Shifting Date *
                    </span>
                  </label>
                  <input
                    type="date"
                    name="shiftingDate"
                    value={formData.shiftingDate}
                    onChange={handleChange}
                    className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                      errors.shiftingDate ? "border-red-300 bg-red-50" : "border-gray-300"
                    }`}
                  />
                  {errors.shiftingDate && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <span>⚠</span> {errors.shiftingDate}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center gap-2">
                      <FiMapPin className="text-gray-400" size={16} />
                      Address *
                    </span>
                  </label>
                  <textarea
                    rows="2"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none ${
                      errors.address ? "border-red-300 bg-red-50" : "border-gray-300"
                    }`}
                    placeholder="123 Main Street, City, Country"
                  />
                  {errors.address && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <span>⚠</span> {errors.address}
                    </p>
                  )}
                </div>

                {/* Status */}
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="completed">Completed</option>
                  </select>
                </div> */}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    rows="2"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                    placeholder="Additional information about the client..."
                  />
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl">
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {client ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    {client ? "Update Client" : "Create Client"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default ClientForm;