
import React, { useState, useEffect } from 'react';
import { tripApi } from '../api/trip';
import { TripDto } from '../types/TripDto';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { SeatSelector } from './SeatSelector';
import { PickupLocationSelector } from './PickupLocationSelector';

interface BookTripDialogProps {
  trip: TripDto;
  onTripBooked: (updatedTrip: TripDto) => void;
}

export const BookTripDialog: React.FC<BookTripDialogProps> = ({ trip, onTripBooked }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchBookedSeats();
    }
  }, [open]);

  const fetchBookedSeats = async () => {
    try {
      const response = await tripApi.getBookedSeats(trip.tripId);
      if (response.success && response.data) {
        setBookedSeats(response.data);
      }
    } catch (error) {
      console.error('Error fetching booked seats:', error);
    }
  };

  const handleBookTrip = async () => {
    if (!selectedSeat) {
      toast({
        title: "Error",
        description: "Please select a seat",
        variant: "destructive",
      });
      return;
    }

    if (!selectedLocation) {
      toast({
        title: "Error",
        description: "Please select your pickup location on the map",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await tripApi.bookTrip(trip.tripId, {
        trippickup: selectedLocation,
        tripSeat: selectedSeat
      });

      if (response.success && response.data) {
        onTripBooked(response.data);
        setOpen(false);
        setSelectedSeat(null);
        setSelectedLocation(null);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to book trip",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error booking trip:', error);
      toast({
        title: "Error",
        description: "Failed to book trip",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Book This Trip</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book Trip #{trip.tripId}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SeatSelector
              cabType={trip.tripCabtype}
              bookedSeats={bookedSeats}
              selectedSeat={selectedSeat}
              onSeatSelect={setSelectedSeat}
            />
            <PickupLocationSelector
              trip={trip}
              onLocationSelect={setSelectedLocation}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBookTrip} 
              disabled={loading || !selectedSeat || !selectedLocation}
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
