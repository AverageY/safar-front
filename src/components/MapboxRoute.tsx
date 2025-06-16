
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { TripDto } from '../types/TripDto';

interface MapboxRouteProps {
  trip: TripDto;
}

export const MapboxRoute: React.FC<MapboxRouteProps> = ({ trip }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  const addRouteToMap = async (trip: TripDto) => {
    if (!map.current) return;

    
  const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

    try {
      console.log('🗺️ Adding route for trip:', trip);

      // Use coordinate data if available, otherwise fallback to geocoding
      let pickupCoords: [number, number];
      let dropCoords: [number, number];

      if (trip.trippickup && trip.tripdrop) {
        // Use existing coordinate data
        pickupCoords = [trip.trippickup.lng, trip.trippickup.lat];
        dropCoords = [trip.tripdrop.lng, trip.tripdrop.lat];
        console.log('✅ Using existing coordinates:', { pickup: pickupCoords, drop: dropCoords });
      } else {
        // Fallback to geocoding if coordinates not available
        console.log('📍 Geocoding addresses...');
        
        const pickupResponse = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(trip.tripPickuplocation)}.json?access_token=${mapboxToken}&country=IN`
        );
        const pickupData = await pickupResponse.json();

        const dropResponse = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(trip.tripDroplocation)}.json?access_token=${mapboxToken}&country=IN`
        );
        const dropData = await dropResponse.json();

        if (pickupData.features.length === 0 || dropData.features.length === 0) {
          console.error('❌ Could not geocode one or both locations');
          return;
        }

        pickupCoords = pickupData.features[0].center;
        dropCoords = dropData.features[0].center;
        console.log('✅ Geocoded coordinates:', { pickup: pickupCoords, drop: dropCoords });
      }

      // Calculate distance to check if route is reasonable
      const distance = Math.sqrt(
        Math.pow(dropCoords[0] - pickupCoords[0], 2) + 
        Math.pow(dropCoords[1] - pickupCoords[1], 2)
      );

      console.log('📏 Distance between points:', distance);

      // If points are too far apart (likely different continents), just show markers
      if (distance > 10) { // Roughly 10 degrees = ~1000km
        console.log('⚠️ Points too far apart for driving directions, showing markers only');
        
        // Add markers only
        new mapboxgl.Marker({ color: 'green' })
          .setLngLat(pickupCoords)
          .setPopup(new mapboxgl.Popup().setHTML(`<strong>Pickup:</strong> ${trip.tripPickuplocation}`))
          .addTo(map.current);

        new mapboxgl.Marker({ color: 'red' })
          .setLngLat(dropCoords)
          .setPopup(new mapboxgl.Popup().setHTML(`<strong>Drop:</strong> ${trip.tripDroplocation}`))
          .addTo(map.current);

        // Fit map to show both points
        const bounds = new mapboxgl.LngLatBounds()
          .extend(pickupCoords)
          .extend(dropCoords);
        map.current.fitBounds(bounds, { padding: 50 });
        return;
      }

      // Get route for nearby points
      console.log('🛣️ Getting driving directions...');
      const routeResponse = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${pickupCoords[0]},${pickupCoords[1]};${dropCoords[0]},${dropCoords[1]}?geometries=geojson&access_token=${mapboxToken}`
      );
      
      if (!routeResponse.ok) {
        console.error('❌ Route API error:', routeResponse.status, routeResponse.statusText);
        throw new Error(`Route API returned ${routeResponse.status}`);
      }

      const routeData = await routeResponse.json();
      console.log('📈 Route response:', routeData);

      if (!routeData.routes || routeData.routes.length === 0) {
        console.error('❌ No route found in response');
        throw new Error('No route found');
      }

      const route = routeData.routes[0];

      // Remove existing route if any
      if (map.current.getSource('route')) {
        map.current.removeLayer('route');
        map.current.removeSource('route');
      }

      // Add route to map
      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: route.geometry
        }
      });

      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3887be',
          'line-width': 5,
          'line-opacity': 0.75
        }
      });

      // Add markers
      new mapboxgl.Marker({ color: 'green' })
        .setLngLat(pickupCoords)
        .setPopup(new mapboxgl.Popup().setHTML(`<strong>Pickup:</strong> ${trip.tripPickuplocation}`))
        .addTo(map.current);

      new mapboxgl.Marker({ color: 'red' })
        .setLngLat(dropCoords)
        .setPopup(new mapboxgl.Popup().setHTML(`<strong>Drop:</strong> ${trip.tripDroplocation}`))
        .addTo(map.current);

      // Fit map to route
      const coordinates = route.geometry.coordinates;
      const bounds = new mapboxgl.LngLatBounds();
      coordinates.forEach((coord: [number, number]) => bounds.extend(coord));
      map.current.fitBounds(bounds, { padding: 50 });

      console.log('✅ Route added successfully');

    } catch (error) {
      console.error('💥 Error adding route to map:', error);
      
      // Fallback: just show markers if route fails
      try {
        let pickupCoords: [number, number];
        let dropCoords: [number, number];

        if (trip.trippickup && trip.tripdrop) {
          pickupCoords = [trip.trippickup.lng, trip.trippickup.lat];
          dropCoords = [trip.tripdrop.lng, trip.tripdrop.lat];
        } else {
          console.log('📍 Fallback geocoding for markers...');
          const pickupResponse = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(trip.tripPickuplocation)}.json?access_token=${mapboxToken}&country=IN`
          );
          const dropResponse = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(trip.tripDroplocation)}.json?access_token=${mapboxToken}&country=IN`
          );
          
          const pickupData = await pickupResponse.json();
          const dropData = await dropResponse.json();
          
          if (pickupData.features.length > 0 && dropData.features.length > 0) {
            pickupCoords = pickupData.features[0].center;
            dropCoords = dropData.features[0].center;
          } else {
            console.error('❌ Fallback geocoding also failed');
            return;
          }
        }

        // Add markers as fallback
        new mapboxgl.Marker({ color: 'green' })
          .setLngLat(pickupCoords)
          .setPopup(new mapboxgl.Popup().setHTML(`<strong>Pickup:</strong> ${trip.tripPickuplocation}`))
          .addTo(map.current);

        new mapboxgl.Marker({ color: 'red' })
          .setLngLat(dropCoords)
          .setPopup(new mapboxgl.Popup().setHTML(`<strong>Drop:</strong> ${trip.tripDroplocation}`))
          .addTo(map.current);

        // Fit map to show both points
        const bounds = new mapboxgl.LngLatBounds()
          .extend(pickupCoords)
          .extend(dropCoords);
        map.current.fitBounds(bounds, { padding: 50 });

        console.log('✅ Fallback markers added');
      } catch (fallbackError) {
        console.error('💥 Fallback also failed:', fallbackError);
      }
    }
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    try {
      mapboxgl.accessToken=import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [77.2090, 28.6139], // Default to Delhi, India
        zoom: 10
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add route when map loads
      map.current.on('load', () => {
        if (trip) {
          addRouteToMap(trip);
        }
      });

    } catch (error) {
      console.error('💥 Error initializing map:', error);
    }

    return () => {
      map.current?.remove();
    };
  }, [trip]);

  return (
    <div className="w-full h-64 sm:h-96 rounded-lg overflow-hidden border">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};
