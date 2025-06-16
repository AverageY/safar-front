
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cabApi } from '../api/cab';
import { tripApi } from '../api/trip';
import { CabDto } from '../types/CabDto';
import { TripDto } from '../types/TripDto';
import { useToast } from '@/hooks/use-toast';
import { Car, CheckCircle } from 'lucide-react';

interface AcceptTripDialogProps {
  trip: TripDto;
  onTripAccepted: (updatedTrip: TripDto) => void;
}

export const AcceptTripDialog: React.FC<AcceptTripDialogProps> = ({ 
  trip, 
  onTripAccepted 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [cabs, setCabs] = useState<CabDto[]>([]);
  const [selectedCabId, setSelectedCabId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const { toast } = useToast();

  const fetchCabs = async () => {
    setIsLoading(true);
    try {
      const response = await cabApi.getCabs();
      
      if (response.success && response.data) {
        // Filter cabs based on trip cab type requirement
        const compatibleCabs = response.data.filter(cab => 
          cab.cabType.toLowerCase() === trip.tripCabtype.toLowerCase()
        );
        setCabs(compatibleCabs);
        
        if (compatibleCabs.length === 0) {
          toast({
            variant: "destructive",
            title: "No Compatible Cabs",
            description: `No ${trip.tripCabtype} cabs found. Please add a ${trip.tripCabtype} cab first.`,
          });
        }
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message || "Failed to fetch cabs",
        });
      }
    } catch (error) {
      console.error('Error fetching cabs:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptTrip = async () => {
    if (!selectedCabId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a cab",
      });
      return;
    }

    setIsAccepting(true);
    try {
      const response = await tripApi.acceptTrip(trip.tripId, parseInt(selectedCabId));
      
      if (response.success && response.data) {
        toast({
          title: "Success",
          description: "Trip accepted successfully!",
        });
        onTripAccepted(response.data);
        setIsOpen(false);
        setSelectedCabId('');
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message || "Failed to accept trip",
        });
      }
    } catch (error) {
      console.error('Error accepting trip:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    } finally {
      setIsAccepting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCabs();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="w-full">
          <CheckCircle className="h-4 w-4 mr-2" />
          Accept Ride
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Accept Trip #{trip.tripId}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Trip Details</h3>
            <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
              <div><span className="font-medium">From:</span> {trip.tripPickuplocation}</div>
              <div><span className="font-medium">To:</span> {trip.tripDroplocation}</div>
              <div><span className="font-medium">Required Cab Type:</span> {trip.tripCabtype}</div>
              <div><span className="font-medium">Price:</span> ${trip.tripPrice}</div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="text-sm">Loading cabs...</div>
            </div>
          ) : cabs.length === 0 ? (
            <div className="text-center py-4">
              <Car className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">
                No {trip.tripCabtype} cabs available. Please add a {trip.tripCabtype} cab first.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Your Cab</label>
              <Select value={selectedCabId} onValueChange={setSelectedCabId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a cab" />
                </SelectTrigger>
                <SelectContent>
                  {cabs.map((cab) => (
                    <SelectItem key={cab.cabId} value={cab.cabId?.toString() || ''}>
                      <div className="flex items-center space-x-2">
                        <Car className="h-4 w-4" />
                        <span>{cab.cabNumber} - {cab.cabName} ({cab.cabColor})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAcceptTrip} 
              disabled={!selectedCabId || isAccepting || cabs.length === 0}
            >
              {isAccepting ? 'Accepting...' : 'Accept Trip'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
