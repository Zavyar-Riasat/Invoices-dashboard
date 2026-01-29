"use client";

import { useState, useEffect } from "react";
import { FiUser, FiMail, FiMapPin, FiCalendar, FiX } from "react-icons/fi";
import PhoneInput from "react-phone-input-2";
import 'react-phone-input-2/lib/style.css';

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

  // Reset form on modal open
  useEffect(() => {
    if (!isOpen) return;

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
  }, [client, isOpen]);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";

    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    if (submitError) setSubmitError("");
  };

  // Validation
  const validateForm = () => {
    const e = {};
    if (!formData.name.trim()) e.name = "Name is required";

    if (!formData.phone.trim()) e.phone = "Phone number is required";
    else if (!/^\+?[0-9]{10,15}$/.test(formData.phone)) 
      e.phone = "Enter a valid phone number (10-15 digits)";

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email))
      e.email = "Enter a valid email address";

    if (!formData.address.trim()) e.address = "Address is required";

    if (!formData.shiftingDate) e.shiftingDate = "Shifting date is required";
    else if (new Date(formData.shiftingDate) > new Date())
      e.shiftingDate = "Shifting date cannot be in the future";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try { await onSubmit(formData); } 
    catch (error) {
      let errorMessage = error?.message || (typeof error === 'string' ? error : 'An unexpected error occurred');
      setSubmitError(errorMessage);
    }
  };

  // Close modal
  const handleClose = (e) => {
    if (e.target === e.currentTarget || e.target.closest('.close-btn')) onCancel();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 transition-all duration-300" onClick={handleClose}>
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 opacity-100 animate-fadeInUp mt-20" onClick={e => e.stopPropagation()}>
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{client ? "Edit Client" : "Add New Client"}</h2>
                <p className="text-sm text-gray-500 mt-1">{client ? "Update client information" : "Enter client details"}</p>
              </div>
              <button onClick={onCancel} className="close-btn p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Close modal">
                <FiX size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {submitError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 flex items-center gap-2"><span className="font-medium">Error:</span> {submitError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <span className="flex items-center gap-2"><FiUser className="text-gray-400" size={16} /> Full Name *</span>
                  </label>
                  <input name="name" value={formData.name} onChange={handleChange} placeholder="John Doe"
                    className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${errors.name ? "border-red-300 bg-red-50" : "border-gray-300"}`} />
                  {errors.name && <p className="text-sm text-red-500 mt-1 flex items-center gap-1"><span>⚠</span> {errors.name}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <PhoneInput
                    country={'pk'}
                    value={formData.phone}
                    onChange={phone => setFormData(prev => ({ ...prev, phone }))}
                    inputClass={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${errors.phone ? "border-red-300 bg-red-50" : "border-gray-300"}`}
                    dropdownClass="rounded-lg"
                  />
                  {errors.phone && <p className="text-sm text-red-500 mt-1 flex items-center gap-1"><span>⚠</span> {errors.phone}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1"><FiMail className="text-gray-400" size={16} /> Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@example.com"
                    className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${errors.email ? "border-red-300 bg-red-50" : "border-gray-300"}`} />
                  {errors.email && <p className="text-sm text-red-500 mt-1 flex items-center gap-1"><span>⚠</span> {errors.email}</p>}
                </div>

                {/* Shifting Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1"><FiCalendar className="text-gray-400" size={16} /> Shifting Date *</label>
                  <input type="date" name="shiftingDate" value={formData.shiftingDate} onChange={handleChange}
                    className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${errors.shiftingDate ? "border-red-300 bg-red-50" : "border-gray-300"}`} />
                  {errors.shiftingDate && <p className="text-sm text-red-500 mt-1 flex items-center gap-1"><span>⚠</span> {errors.shiftingDate}</p>}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1"><FiMapPin className="text-gray-400" size={16} /> Address *</label>
                  <textarea rows="2" name="address" value={formData.address} onChange={handleChange} placeholder="123 Main Street, City, Country"
                    className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none ${errors.address ? "border-red-300 bg-red-50" : "border-gray-300"}`} />
                  {errors.address && <p className="text-sm text-red-500 mt-1 flex items-center gap-1"><span>⚠</span> {errors.address}</p>}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea rows="2" name="notes" value={formData.notes} onChange={handleChange} placeholder="Additional information about the client..."
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none" />
                </div>

              </form>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl">
              <button type="button" onClick={onCancel} disabled={isLoading} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition">Cancel</button>
              <button type="submit" onClick={handleSubmit} disabled={isLoading} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2">
                {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : client ? "Update Client" : "Create Client"}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Animation */}
      <style jsx>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeInUp { animation: fadeInUp 0.3s ease-out; }
      `}</style>
    </>
  );
};

export default ClientForm;
