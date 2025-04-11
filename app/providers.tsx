"use client";

import { SessionProvider } from "next-auth/react";
import { DarkModeProvider } from "./contexts/DarkModeContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <DarkModeProvider>
        {children}
      </DarkModeProvider>
    </SessionProvider>
  );
} 