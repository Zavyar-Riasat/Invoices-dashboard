"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SidebarItem = ({ item, isOpen }) => {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <li>
      <Link
        href={item.href}
        className={`
          flex items-center gap-3 px-4 py-3 rounded-lg
          transition-all duration-200
          ${isActive 
            ? "bg-secondary text-accent  font-semibold" 
            : "text-gray-600 hover:bg-secondary hover:text-white hover:font-semibold"
          }
          ${!isOpen && "justify-center"}
        `}
      >
        <span className={isActive ? "text-accent" : "text-gray-400 "}>
          {item.icon}
        </span>
        {isOpen && (
          <span className="flex-1 truncate">{item.label}</span>
        )}
        {isActive && isOpen && (
          <span className="w-2 h-2 bg-accent rounded-full"></span>
        )}
      </Link>
    </li>
  );
};

export default SidebarItem;