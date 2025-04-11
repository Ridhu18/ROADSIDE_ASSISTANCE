"use client";

import dynamic from 'next/dynamic';
import type { MapProps } from './Map';
import { useState, useEffect } from 'react';

const Map = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <p className="text-muted-foreground">Loading map...</p>
    </div>
  )
});

export default function ClientMap(props: MapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  return <Map {...props} />;
} 