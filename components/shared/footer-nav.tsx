"use client";

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Map, Award, User } from "lucide-react"

export function FooterNav() {
  const pathname = usePathname()

  const navItems = [
    {
      icon: <Home className="w-5 h-5" />,
      label: "Home",
      href: "/dashboard",
    },
    {
      icon: <Map className="w-5 h-5" />,
      label: "Map",
      href: "/map",
    },
    {
      icon: <Award className="w-5 h-5" />,
      label: "Rewards",
      href: "/rewards",
    },
    {
      icon: <User className="w-5 h-5" />,
      label: "Profile",
      href: "/profile",
    },
  ]

  return (
    <nav className="sticky bottom-0 z-10 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
      <div className="container grid h-16 grid-cols-4">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div
              className={`flex flex-col items-center justify-center h-full ${
                pathname === item.href
                  ? "text-primary dark:text-primary/90"
                  : "text-muted-foreground dark:text-gray-400 hover:text-primary dark:hover:text-primary/90"
              }`}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </nav>
  )
} 