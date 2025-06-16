import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search } from 'lucide-react';

interface LocationSearchWithMapProps {
  title: string;
  placeholder: string;
  onLocationSelect: (location: { address: string; lat: number; lng: number }) => void;
  selectedLocation: { address: string; lat: number; lng: number } | null;
}

export const LocationSearchWithMap: React.FC<LocationSearchWithMapProps> = ({
  title,
  placeholder,
  onLocationSelect,
  selectedLocation
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Debounce timer ref
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    try {
      mapboxgl.accessToken = mapboxToken;
      
      const centerCoords: [number, number] = selectedLocation 
        ? [selectedLocation.lng, selectedLocation.lat]
        : [77.2090, 28.6139]; // Default to Delhi

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: centerCoords,
        zoom: 12
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add click event to select location
      map.current.on('click', async (e) => {
        const { lng, lat } = e.lngLat;
        
        try {
          // Reverse geocode to get address
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}&country=IN`
          );
          const data = await response.json();
          
          const address = data.features[0]?.place_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          
          // Remove existing marker
          if (marker.current) {
            marker.current.remove();
          }

          // Add new marker
          marker.current = new mapboxgl.Marker({ color: 'blue' })
            .setLngLat([lng, lat])
            .setPopup(new mapboxgl.Popup().setHTML(`<strong>${address}</strong>`))
            .addTo(map.current!);

          setSearchQuery(address);
          onLocationSelect({ address, lat, lng });
        } catch (error) {
          console.error('Error reverse geocoding:', error);
          // Fallback to coordinates
          const address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          
          if (marker.current) {
            marker.current.remove();
          }

          marker.current = new mapboxgl.Marker({ color: 'blue' })
            .setLngLat([lng, lat])
            .addTo(map.current!);

          setSearchQuery(address);
          onLocationSelect({ address, lat, lng });
        }
      });

      // Set initial marker if location is selected
      if (selectedLocation) {
        marker.current = new mapboxgl.Marker({ color: 'blue' })
          .setLngLat([selectedLocation.lng, selectedLocation.lat])
          .addTo(map.current);
        setSearchQuery(selectedLocation.address);
      }

    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      map.current?.remove();
    };
  }, [mapboxToken]);

  const searchLocations = async (query: string) => {
    if (query.length < 3 || !mapboxToken) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&country=IN&limit=5`
      );
      const data = await response.json();
      setSuggestions(data.features || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error searching locations:', error);
      setSuggestions([]);
    }
  };

  // Debounced input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      searchLocations(q);
    }, 3000);
  };

  const selectSuggestion = (suggestion: any) => {
    const [lng, lat] = suggestion.center;
    const address = suggestion.place_name;

    // Remove existing marker
    if (marker.current) {
      marker.current.remove();
    }

    // Add new marker
    marker.current = new mapboxgl.Marker({ color: 'blue' })
      .setLngLat([lng, lat])
      .setPopup(new mapboxgl.Popup().setHTML(`<strong>${address}</strong>`))
      .addTo(map.current!);

    // Center map on selected location
    map.current?.flyTo({ center: [lng, lat], zoom: 14 });

    setSearchQuery(address);
    setShowSuggestions(false);
    onLocationSelect({ address, lat, lng });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg flex items-center space-x-2">
          <MapPin className="h-4 w-4" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!mapboxToken && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Configuration Required:</strong> Please set the VITE_MAPBOX_ACCESS_TOKEN environment variable to enable map functionality.
              </p>
            </div>
          )}

          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={placeholder}
                value={searchQuery}
                onChange={handleInputChange}
                className="pl-10"
                disabled={!mapboxToken}
              />
            </div>
            
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => selectSuggestion(suggestion)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm border-b last:border-b-0"
                  >
                    {suggestion.place_name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="text-sm text-gray-600">
            {mapboxToken 
              ? "Search for a location above or click on the map to select your " + title.toLowerCase() + "."
              : "Map functionality requires configuration."
            }
          </div>

          <div className="w-full h-64 sm:h-80 rounded-lg overflow-hidden border">
            <div ref={mapContainer} className="w-full h-full" />
          </div>

          {selectedLocation && (
            <div className="text-xs text-green-600 font-medium">
              Selected: {selectedLocation.address}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
