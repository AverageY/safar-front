
import React, { useState } from 'react';
import { TripDto } from '../types/TripDto';
import { tripApi } from '../api/trip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DeleteTripDialogProps {
  trip: TripDto;
  onTripDeleted: (tripId: number) => void;
}

export const DeleteTripDialog: React.FC<DeleteTripDialogProps> = ({
  trip,
  onTripDeleted
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      const response = await tripApi.deleteTrip(trip.tripId);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Trip deleted successfully",
        });
        onTripDeleted(trip.tripId);
        setIsOpen(false);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete trip",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting trip:', error);
      toast({
        title: "Error",
        description: "Failed to delete trip",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" className="text-xs sm:text-sm">
          <Trash2 className="h-4 w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Delete Trip</span>
          <span className="sm:hidden">Delete</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Trip</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this trip? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <div><strong>From:</strong> {trip.tripPickuplocation}</div>
            <div><strong>To:</strong> {trip.tripDroplocation}</div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Trip'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
