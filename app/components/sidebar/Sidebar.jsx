"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
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
  FiChevronRight,
  FiMessageSquare, // For Quoting
  FiCalendar,      // For Bookings
  FiChevronDown,   // For collapsible menu
  FiChevronUp,     // For collapsible menu
} from "react-icons/fi";

const Sidebar = ({ user }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isQuotingOpen, setIsQuotingOpen] = useState(true);

  const navItems = [
    {
      label: "Dashboard",
      icon: <FiHome size={20} />,
      href: "/admin/dashboard",
    },
    { 
      label: "Clients", 
      icon: <FiUsers size={20} />, 
      href: "/admin/clients" 
    },
    {
      label: "Item Catalog",
      icon: <FiPackage size={20} />,
      href: "/admin/items",
    },
     {
      label: "Quotes",
      icon: <FiMessageSquare size={18} />,
      href: "/admin/quotes",
    },
    {
      label: "Bookings",
      icon: <FiCalendar size={18} />,
      href: "/admin/bookings",
    },
  ];

  const quotingItems = [
   
  ];

  const otherItems = [
    {
      label: "Invoices",
      icon: <FiFileText size={20} />,
      href: "/admin/invoices",
    },
    {
      label: "Expenses",
      icon: <FiDollarSign size={20} />,
      href: "/admin/expenses",
    },
    {
      label: "Reports",
      icon: <FiBarChart2 size={20} />,
      href: "/admin/reports",
    },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 right-4 z-50 p-2 rounded-md bg-secondary text-white"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 bg-opacity-50 z-40"
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
        <div className="p-6 border-b bg-primary border-gray-100 flex items-center justify-between">
          <div
            className={`flex items-center gap-3 ${!isOpen && "justify-center"}`}
          >
            <div className="w-14 h-14 rounded-full flex items-center justify-center">
              <Link href="/">
                <Image
                  src="https://primary.jwwb.nl/public/j/o/y/temp-iufuhcrpmzouftdhfohm/image-high-kvzqk7.png?enable-io=true&enable=upscale&height=70"
                  alt="Website Logo"
                  width={64}
                  height={64}
                  className="object-cover rounded-full cursor-pointer"
                />
              </Link>
            </div>

            {isOpen && (
              <h1 className="text-lg font-semibold text-white">Pack&Track</h1>
            )}
          </div>

          {/* Desktop Toggle Button */}
          <button
            className="hidden text-secondary hover:cursor-pointer lg:flex items-center justify-center w-8 h-8 rounded-lg hover:text-white hover:bg-secondary"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <FiChevronLeft size={20} />
            ) : (
              <FiChevronRight size={20} />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 bg-primary overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {/* Main Navigation Items */}
            {navItems.map((item) => (
              <SidebarItem key={item.label} item={item} isOpen={isOpen} />
            ))}
            {/* Other Items */}
            {otherItems.map((item) => (
              <SidebarItem key={item.label} item={item} isOpen={isOpen} />
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 bg-primary border-t border-gray-100">
          <button
            className={`
              flex items-center hover:cursor-pointer gap-3 w-full p-3 rounded-lg
              text-secondary hover:text-red-500 hover:bg-red-50
              transition-colors duration-200
              ${!isOpen && "justify-center"}
            `}
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              router.push("/login");
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