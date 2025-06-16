
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripApi } from '../api/trip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Calendar, Clock, Car } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LocationSearchWithMap } from '../components/LocationSearchWithMap';
import { SeatSelector } from '../components/SeatSelector';

export const AddTripPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Form state
  const [pickupLocation, setPickupLocation] = useState<{ address: string; lat: number; lng: number } | null>(null);
  const [dropLocation, setDropLocation] = useState<{ address: string; lat: number; lng: number } | null>(null);
  const [departureTime, setDepartureTime] = useState('');
  const [tripDate, setTripDate] = useState('');
  const [cabType, setCabType] = useState<'SEDAN' | 'SUV' | ''>('');
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);

  const calculateDistance = (pickup: { lat: number; lng: number }, drop: { lat: number; lng: number }) => {
    // Haversine formula for calculating distance between two points
    const R = 6371; // Earth's radius in kilometers
    const dLat = (drop.lat - pickup.lat) * Math.PI / 180;
    const dLon = (drop.lng - pickup.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(pickup.lat * Math.PI / 180) * Math.cos(drop.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return Math.round(distance);
  };

  const formatDateToNumber = (dateStr: string) => {
    // Convert YYYY-MM-DD to YYYYMMDD number format
    return parseInt(dateStr.replace(/-/g, ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pickupLocation) {
      toast({
        title: "Error",
        description: "Please select a pickup location",
        variant: "destructive",
      });
      return;
    }

    if (!dropLocation) {
      toast({
        title: "Error",
        description: "Please select a drop location",
        variant: "destructive",
      });
      return;
    }

    if (!departureTime) {
      toast({
        title: "Error",
        description: "Please select departure time",
        variant: "destructive",
      });
      return;
    }

    if (!tripDate) {
      toast({
        title: "Error",
        description: "Please select trip date",
        variant: "destructive",
      });
      return;
    }

    if (!cabType) {
      toast({
        title: "Error",
        description: "Please select cab type",
        variant: "destructive",
      });
      return;
    }

    if (!selectedSeat) {
      toast({
        title: "Error",
        description: "Please select your seat",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const distance = calculateDistance(pickupLocation, dropLocation);

      const tripData = {
        tripPickuplocation: pickupLocation.address,
        trippickup: {
          lat: pickupLocation.lat,
          lng: pickupLocation.lng
        },
        tripDroplocation: dropLocation.address,
        tripdrop: {
          lat: dropLocation.lat,
          lng: dropLocation.lng
        },
        tripDistance: distance,
        tripDeparturetime: departureTime,
        tripDate: formatDateToNumber(tripDate),
        tripCabtype: cabType,
        tripSeat: selectedSeat
      };

      console.log('🚗 Submitting trip data:', tripData);

      const response = await tripApi.addTrip(tripData);

      if (response.success && response.data) {
        toast({
          title: "Success",
          description: "Trip added successfully!",
        });
        navigate(`/trips/${response.data.tripId}`);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to add trip",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding trip:', error);
      toast({
        title: "Error",
        description: "Failed to add trip",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-2 sm:p-4 lg:p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Button onClick={() => navigate('/trips')} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Back to Trips</span>
            <span className="sm:hidden">Back</span>
          </Button>
          <h1 className="text-lg sm:text-2xl font-bold flex items-center space-x-2">
            <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
            <span>Add New Trip</span>
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Location Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LocationSearchWithMap
              title="Pickup Location"
              placeholder="Search for pickup location..."
              onLocationSelect={setPickupLocation}
              selectedLocation={pickupLocation}
            />
            <LocationSearchWithMap
              title="Drop Location"
              placeholder="Search for drop location..."
              onLocationSelect={setDropLocation}
              selectedLocation={dropLocation}
            />
          </div>

          {/* Trip Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Trip Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Trip Date</span>
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={tripDate}
                    onChange={(e) => setTripDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time" className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Departure Time</span>
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Car className="h-4 w-4" />
                    <span>Cab Type</span>
                  </Label>
                  <Select value={cabType} onValueChange={(value: 'SEDAN' | 'SUV') => setCabType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cab type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SEDAN">Sedan (₹13/km)</SelectItem>
                      <SelectItem value="SUV">SUV (₹30/km)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {pickupLocation && dropLocation && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm font-medium text-blue-800">
                    Estimated Distance: {calculateDistance(pickupLocation, dropLocation)} km
                  </div>
                  {cabType && (
                    <div className="text-sm text-blue-600">
                      Base Price: ₹{calculateDistance(pickupLocation, dropLocation) * (cabType === 'SEDAN' ? 13 : 30)}
                      <span className="text-xs ml-2">(Price may vary based on demand)</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Seat Selection */}
          {cabType && (
            <SeatSelector
              cabType={cabType}
              bookedSeats={[]} // No booked seats for new trip
              selectedSeat={selectedSeat}
              onSeatSelect={setSelectedSeat}
            />
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/trips')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !pickupLocation || !dropLocation || !departureTime || !tripDate || !cabType || !selectedSeat}
            >
              {loading ? 'Adding Trip...' : 'Add Trip'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
