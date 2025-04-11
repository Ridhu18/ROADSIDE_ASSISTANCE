"use client";

import Link from "next/link";
import { Car, Navigation, Gift, Phone } from "lucide-react";

export function FooterNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
      <div className="container px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/dashboard" className="flex flex-col items-center">
            <Car className="w-5 h-5 text-primary" />
            <span className="text-xs mt-1 dark:text-gray-300">Home</span>
          </Link>
          <Link href="/map" className="flex flex-col items-center">
            <Navigation className="w-5 h-5 text-primary" />
            <span className="text-xs mt-1 dark:text-gray-300">Map</span>
          </Link>
          <Link href="/rewards" className="flex flex-col items-center">
            <Gift className="w-5 h-5 text-primary" />
            <span className="text-xs mt-1 dark:text-gray-300">Rewards</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center">
            <Phone className="w-5 h-5 text-primary" />
            <span className="text-xs mt-1 dark:text-gray-300">Profile</span>
          </Link>
        </div>
      </div>
    </nav>
  );
} 