"use client";

import { useState } from "react";
import SidebarItem from "./SidebarItem";
import {
  FiHome,
  FiUsers,
  FiFileText,
  FiPackage,
  FiDollarSign,
  FiBarChart2,
  FiMenu,
  FiX,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight
} from "react-icons/fi";

const Sidebar = ({ user }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", icon: <FiHome size={20} />, href: "/admin/dashboard" },
    { label: "Clients", icon: <FiUsers size={20} />, href: "/admin/clients" },
    { label: "Invoices", icon: <FiFileText size={20} />, href: "/admin/invoices" },
    { label: "Item Catalog", icon: <FiPackage size={20} />, href: "/admin/items" },
    { label: "Expenses", icon: <FiDollarSign size={20} />, href: "/admin/expenses" },
    { label: "Reports", icon: <FiBarChart2 size={20} />, href: "/admin/reports" },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-blue-600 text-white"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 
          h-screen bg-white shadow-xl z-40
          transition-all duration-300 ease-in-out
          flex flex-col
          ${isOpen ? "w-64" : "w-20"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className={`flex items-center gap-3 ${!isOpen && "justify-center"}`}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">I</span>
            </div>
            {isOpen && (
              <h1 className="text-xl font-bold text-gray-800">Home Shift</h1>
            )}
          </div>
          
          {/* Desktop Toggle Button */}
          <button
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <FiChevronLeft size={20} /> : <FiChevronRight size={20} />}
          </button>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-gray-100">
          <div className={`flex items-center gap-3 ${!isOpen && "justify-center"}`}>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold">
                {user?.name?.charAt(0) || "A"}
              </span>
            </div>
            {isOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{user?.name || "Admin"}</p>
                <p className="text-sm text-gray-500 truncate">{user?.email || "admin@example.com"}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => (
              <SidebarItem
                key={item.label}
                item={item}
                isOpen={isOpen}
              />
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-100">
          <button
            className={`
              flex items-center gap-3 w-full p-3 rounded-lg
              text-gray-600 hover:text-red-600 hover:bg-red-50
              transition-colors duration-200
              ${!isOpen && "justify-center"}
            `}
            onClick={() => {
              // Handle logout
              console.log("Logout clicked");
            }}
          >
            <FiLogOut size={20} />
            {isOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;