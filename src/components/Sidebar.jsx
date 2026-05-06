"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  CalendarDays,
  DoorOpen,
  MonitorSpeaker,
  CheckSquare,
  BarChart3,
  LogOut,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const links = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: ["Admin", "Manager", "Employee"],
    },
    {
      href: "/dashboard/calendar",
      label: "Calendar",
      icon: CalendarDays,
      roles: ["Admin", "Manager", "Employee"],
    },
    {
      href: "/dashboard/rooms",
      label: "Rooms",
      icon: DoorOpen,
      roles: ["Admin", "Manager"],
    },
    {
      href: "/dashboard/resources",
      label: "Resources",
      icon: MonitorSpeaker,
      roles: ["Admin", "Manager"],
    },
    {
      href: "/dashboard/approvals",
      label: "Approvals",
      icon: CheckSquare,
      roles: ["Admin", "Manager"],
    },
    { href: "/dashboard/users", label: "Users", icon: Users, roles: ["Admin"] },
    {
      href: "/dashboard/reports",
      label: "Reports",
      icon: BarChart3,
      roles: ["Admin", "Manager"],
    },
  ];

  const visibleLinks = links.filter((link) => link.roles.includes(user.role));

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            OfficeFlow
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {visibleLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50",
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5",
                  isActive
                    ? "text-indigo-700 dark:text-indigo-400"
                    : "text-gray-400 dark:text-gray-500",
                )}
              />
              {link.label}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full"
        >
          <LogOut className="w-5 h-5 text-red-500 dark:text-red-400" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
