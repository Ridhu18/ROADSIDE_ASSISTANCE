"use client";

import dynamic from 'next/dynamic';
import type { MapProps } from './Map';

const Map = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <p className="text-muted-foreground">Loading map...</p>
    </div>
  )
});

export default function ClientMap(props: MapProps) {
  return <Map {...props} />;
} 