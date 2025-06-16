
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TripDto } from '../types/TripDto';

interface PickupLocationSelectorProps {
  trip: TripDto;
  onLocationSelect: (location: { lat: number; lng: number }) => void;
}

export const PickupLocationSelector: React.FC<PickupLocationSelectorProps> = ({
  trip,
  onLocationSelect
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    try {
      
  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
      
      // Use trip's pickup coordinates if available, otherwise default to Delhi
      const centerCoords: [number, number] = trip.trippickup 
        ? [trip.trippickup.lng, trip.trippickup.lat]
        : [77.2090, 28.6139];

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: centerCoords,
        zoom: 12
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add original pickup location marker
      if (trip.trippickup) {
        new mapboxgl.Marker({ color: 'green' })
          .setLngLat([trip.trippickup.lng, trip.trippickup.lat])
          .setPopup(new mapboxgl.Popup().setHTML(`<strong>Original Pickup:</strong> ${trip.tripPickuplocation}`))
          .addTo(map.current);
      }

      // Add click event to select pickup location
      map.current.on('click', (e) => {
        const { lng, lat } = e.lngLat;
        
        // Remove existing marker
        if (marker.current) {
          marker.current.remove();
        }

        // Add new marker
        marker.current = new mapboxgl.Marker({ color: 'blue' })
          .setLngLat([lng, lat])
          .setPopup(new mapboxgl.Popup().setHTML('<strong>Your Pickup Location</strong>'))
          .addTo(map.current!);

        setSelectedLocation({ lat, lng });
        onLocationSelect({ lat, lng });
      });

    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      map.current?.remove();
    };
  }, [trip, onLocationSelect]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Select Your Pickup Location</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Click on the map to select your pickup location. The green marker shows the original trip pickup point.
          </div>
          <div className="w-full h-64 sm:h-80 rounded-lg overflow-hidden border">
            <div ref={mapContainer} className="w-full h-full" />
          </div>
          {selectedLocation && (
            <div className="text-xs text-green-600 font-medium">
              Selected: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
