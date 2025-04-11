"use client";

import { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Circle, Stroke, Fill } from 'ol/style';
import Overlay from 'ol/Overlay';
import { Button } from "@/components/ui/button";

export interface Mechanic {
  _id: string;
  name: string;
  specialization: string;
  contactNumber: string;
  location: {
    coordinates: [number, number];
    address: string;
  };
  rating: number;
  totalReviews: number;
  isActive: boolean;
  profilePhoto?: string;
  services: Array<{
    type: string;
    price: number;
    available: boolean;
  }>;
  distance?: number;
}

export interface MapProps {
  userLocation: { latitude: number; longitude: number; address: string };
  mechanics: Mechanic[];
  selectedMechanicOnMap: Mechanic | null;
  onMechanicSelect: (mechanic: Mechanic) => void;
}

// Add distance calculation function
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return distance;
};

const deg2rad = (deg: number) => {
  return deg * (Math.PI/180);
};

const MapComponent = ({ userLocation, mechanics, selectedMechanicOnMap, onMechanicSelect }: MapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<Map | null>(null);
  const vectorSource = useRef<VectorSource | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const popupOverlay = useRef<Overlay | null>(null);
  const [selectedMechanic, setSelectedMechanic] = useState<Mechanic | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ],
      view: new View({
        center: fromLonLat([userLocation.longitude, userLocation.latitude]),
        zoom: 13
      })
    });

    // Create vector source for markers
    const source = new VectorSource();
    const vectorLayer = new VectorLayer({
      source: source
    });

    map.addLayer(vectorLayer);

    // Create popup overlay
    const popup = new Overlay({
      element: popupRef.current!,
      positioning: 'bottom-center',
      offset: [0, -10],
      autoPan: true
    });

    map.addOverlay(popup);

    // Store references
    mapInstance.current = map;
    vectorSource.current = source;
    popupOverlay.current = popup;

    // Cleanup
    return () => {
      map.setTarget(undefined);
      mapInstance.current = null;
      vectorSource.current = null;
      popupOverlay.current = null;
    };
  }, []);

  // Update markers when mechanics or user location changes
  useEffect(() => {
    if (!vectorSource.current || !mapInstance.current) return;

    // Clear existing features
    vectorSource.current.clear();

    // Add user location marker
    const userFeature = new Feature({
      geometry: new Point(fromLonLat([userLocation.longitude, userLocation.latitude])),
      type: 'user'
    });

    userFeature.setStyle(new Style({
      image: new Circle({
        radius: 8,
        fill: new Fill({ color: '#3b82f6' }),
        stroke: new Stroke({ color: '#ffffff', width: 2 })
      })
    }));

    vectorSource.current.addFeature(userFeature);

    // Add mechanic markers
    mechanics.forEach(mechanic => {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        mechanic.location.coordinates[1],
        mechanic.location.coordinates[0]
      );

      const feature = new Feature({
        geometry: new Point(fromLonLat([mechanic.location.coordinates[0], mechanic.location.coordinates[1]])),
        mechanic: mechanic,
        distance: distance
      });

      feature.setStyle(new Style({
        image: new Circle({
          radius: 8,
          fill: new Fill({ color: '#ef4444' }),
          stroke: new Stroke({ color: '#ffffff', width: 2 })
        })
      }));

      vectorSource.current!.addFeature(feature);
    });

    // Add click handler
    mapInstance.current.on('click', (event) => {
      const feature = mapInstance.current!.forEachFeatureAtPixel(event.pixel, feature => feature);
      
      if (feature && feature.get('mechanic')) {
        const mechanic = feature.get('mechanic');
        setSelectedMechanic(mechanic);
        onMechanicSelect(mechanic);
        
        if (popupRef.current && popupOverlay.current) {
          const distance = feature.get('distance');
          popupRef.current.innerHTML = `
            <div class="p-2 bg-white rounded-lg shadow-lg">
              <h3 class="font-semibold">${mechanic.name}</h3>
              <p class="text-sm text-gray-600">${mechanic.specialization}</p>
              <p class="text-sm text-gray-600">${mechanic.contactNumber}</p>
              <p class="text-sm font-medium text-primary mt-1">
                ${distance < 1 
                  ? `${(distance * 1000).toFixed(0)}m away`
                  : `${distance.toFixed(1)}km away`}
              </p>
              <button class="w-full mt-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
                Request Service
              </button>
            </div>
          `;
          popupOverlay.current.setPosition(event.coordinate);
        }
      } else {
        setSelectedMechanic(null);
        if (popupRef.current) {
          popupRef.current.innerHTML = '';
        }
      }
    });

  }, [mechanics, userLocation, onMechanicSelect]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
      <div ref={popupRef} className="absolute" />
    </div>
  );
};

export default MapComponent; 