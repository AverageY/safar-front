import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, MapPin, Calendar, Clock } from 'lucide-react';
import { TripSearchRequestDto } from '../types/TripDto';

interface MapboxSuggestion {
  name: string;
  full_address: string;
  mapbox_id: string;
}

interface MapboxFeature {
  geometry: {
    coordinates: [number, number];
  };
  properties: {
    full_address: string;
    name: string;
  };
}

interface TripSearchFormProps {
  onSearch: (searchData: TripSearchRequestDto) => void;
  isLoading?: boolean;
}

export const TripSearchForm: React.FC<TripSearchFormProps> = ({ onSearch, isLoading }) => {
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropLocation, setDropLocation] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [tripDate, setTripDate] = useState('');
  
  const [pickupSuggestions, setPickupSuggestions] = useState<MapboxSuggestion[]>([]);
  const [dropSuggestions, setDropSuggestions] = useState<MapboxSuggestion[]>([]);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDropSuggestions, setShowDropSuggestions] = useState(false);
  
  const [selectedPickupId, setSelectedPickupId] = useState<string>('');
  const [selectedDropId, setSelectedDropId] = useState<string>('');
  
  const pickupInputRef = useRef<HTMLInputElement>(null);
  const dropInputRef = useRef<HTMLInputElement>(null);
  
  const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  // Stable session token for Mapbox suggestions
  const sessionTokenRef = useRef<string>(Date.now().toString());
  
  // Debounce timers
  const pickupDebounce = useRef<number | null>(null);
  const dropDebounce = useRef<number | null>(null);

  const getSuggestions = useCallback(async (query: string): Promise<MapboxSuggestion[]> => {
    if (query.length < 3 || !mapboxToken) return [];
    try {
      const suggestUrl =
        `https://api.mapbox.com/search/searchbox/v1/suggest` +
        `?q=${encodeURIComponent(query)}` +
        `&access_token=${mapboxToken}` +
        `&session_token=${sessionTokenRef.current}` +
        `&country=IN`;
      const response = await fetch(suggestUrl);
      const data = await response.json();
      if (data.suggestions && data.suggestions.length > 0) {
        return data.suggestions.map((suggestion: any) => ({
          name: suggestion.name,
          full_address: suggestion.full_address || suggestion.place_formatted || suggestion.name,
          mapbox_id: suggestion.mapbox_id,
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return [];
    }
  }, [mapboxToken]);

  const retrieveCoordinates = useCallback(async (mapboxId: string) => {
    if (!mapboxToken) return null;
    try {
      const retrieveUrl =
        `https://api.mapbox.com/search/searchbox/v1/retrieve/${mapboxId}` +
        `?access_token=${mapboxToken}` +
        `&session_token=${sessionTokenRef.current}`;
      const response = await fetch(retrieveUrl);
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].geometry.coordinates;
        return { lat, lng };
      }
      return null;
    } catch (error) {
      console.error('Error retrieving coordinates:', error);
      return null;
    }
  }, [mapboxToken]);

  const handlePickupInputChange = (value: string) => {
    setPickupLocation(value);
    setSelectedPickupId('');
    setShowPickupSuggestions(false);
    setPickupSuggestions([]);

    if (pickupDebounce.current) clearTimeout(pickupDebounce.current);
    pickupDebounce.current = window.setTimeout(async () => {
      if (value.length >= 3) {
        const suggestions = await getSuggestions(value);
        setPickupSuggestions(suggestions);
        setShowPickupSuggestions(true);
      }
    }, 3000);
  };

  const handleDropInputChange = (value: string) => {
    setDropLocation(value);
    setSelectedDropId('');
    setShowDropSuggestions(false);
    setDropSuggestions([]);

    if (dropDebounce.current) clearTimeout(dropDebounce.current);
    dropDebounce.current = window.setTimeout(async () => {
      if (value.length >= 3) {
        const suggestions = await getSuggestions(value);
        setDropSuggestions(suggestions);
        setShowDropSuggestions(true);
      }
    }, 3000);
  };

  const handlePickupSuggestionSelect = (suggestion: MapboxSuggestion) => {
    setPickupLocation(suggestion.full_address);
    setSelectedPickupId(suggestion.mapbox_id);
    setShowPickupSuggestions(false);
    setPickupSuggestions([]);
  };

  const handleDropSuggestionSelect = (suggestion: MapboxSuggestion) => {
    setDropLocation(suggestion.full_address);
    setSelectedDropId(suggestion.mapbox_id);
    setShowDropSuggestions(false);
    setDropSuggestions([]);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupLocation || !dropLocation || !departureTime || !tripDate) {
      alert('Please fill in all fields');
      return;
    }
    if (!selectedPickupId || !selectedDropId) {
      alert('Please select pickup and drop locations from the suggestions');
      return;
    }

    const dateNumber = parseInt(tripDate.replace(/-/g, ''), 10);

    const pickupCoords = await retrieveCoordinates(selectedPickupId);
    const dropCoords = await retrieveCoordinates(selectedDropId);
    if (!pickupCoords || !dropCoords) {
      alert('Could not retrieve coordinates for the selected locations. Please try again.');
      return;
    }

    onSearch({
      trippickup: pickupCoords,
      tripdrop: dropCoords,
      tripDeparturetime: departureTime,
      tripDate: dateNumber,
    });
  };

  // Close suggestions on outside click
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (pickupInputRef.current && !pickupInputRef.current.contains(e.target as Node)) {
        setShowPickupSuggestions(false);
      }
      if (dropInputRef.current && !dropInputRef.current.contains(e.target as Node)) {
        setShowDropSuggestions(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Search className="h-5 w-5" />
          <span>Search Trips</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!mapboxToken && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Configuration Required:</strong> Please set the VITE_MAPBOX_ACCESS_TOKEN environment variable to enable location search.
            </p>
          </div>
        )}
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 relative" ref={pickupInputRef}>
              <Label htmlFor="pickup" className="flex items-center space-x-1">
                <MapPin className="h-4 w-4 text-green-600" />
                <span>Pickup Location</span>
              </Label>
              <Input
                id="pickup"
                type="text"
                placeholder="Enter pickup address"
                value={pickupLocation}
                onChange={e => handlePickupInputChange(e.target.value)}
                required
                autoComplete="off"
              />
              {showPickupSuggestions && pickupSuggestions.length > 0 && (
                <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {pickupSuggestions.map((s, i) => (
                    <div
                      key={i}
                      className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                      onClick={() => handlePickupSuggestionSelect(s)}
                    >
                      <div className="font-medium text-sm">{s.name}</div>
                      <div className="text-xs text-gray-600">{s.full_address}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2 relative" ref={dropInputRef}>
              <Label htmlFor="drop" className="flex items-center space-x-1">
                <MapPin className="h-4 w-4 text-red-600" />
                <span>Drop Location</span>
              </Label>
              <Input
                id="drop"
                type="text"
                placeholder="Enter drop address"
                value={dropLocation}
                onChange={e => handleDropInputChange(e.target.value)}
                required
                autoComplete="off"
              />
              {showDropSuggestions && dropSuggestions.length > 0 && (
                <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {dropSuggestions.map((s, i) => (
                    <div
                      key={i}
                      className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                      onClick={() => handleDropSuggestionSelect(s)}
                    >
                      <div className="font-medium text-sm">{s.name}</div>
                      <div className="text-xs text-gray-600">{s.full_address}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center space-x-1">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span>Travel Date</span>
              </Label>
              <Input
                id="date"
                type="date"
                value={tripDate}
                onChange={e => setTripDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center space-x-1">
                <Clock className="h-4 w-4 text-purple-600" />
                <span>Departure Time</span>
              </Label>
              <Input
                id="time"
                type="time"
                value={departureTime}
                onChange={e => setDepartureTime(e.target.value)}
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            <Search className="h-4 w-4 mr-2" />
            {isLoading ? 'Searching...' : 'Search Trips'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
