import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TripDto } from '../types/TripDto';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Clock, Car, DollarSign, Pencil, Trash2 } from 'lucide-react';
import { AcceptTripDialog } from './AcceptTripDialog';
import { BookTripDialog } from './BookTripDialog';
import { DeleteTripDialog } from './DeleteTripDialog';
import { useAuth } from '../contexts/AuthContext';

interface TripCardProps {
  trip: TripDto;
  onViewRoute: (trip: TripDto) => void;
  onTripAccepted?: (updatedTrip: TripDto) => void;
  onTripDeleted?: (tripId: number) => void;
}

export const TripCard: React.FC<TripCardProps> = ({ 
  trip, 
  onViewRoute, 
  onTripAccepted,
  onTripDeleted 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-600' : 'text-orange-600';
  };

  const getStatusText = (status: boolean) => {
    return status ? 'Completed' : 'Pending';
  };

  const formatDate = (dateNumber: number) => {
    const dateStr = dateNumber.toString();
    if (dateStr.length === 8) {
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      return `${day}/${month}/${year}`;
    }
    return dateNumber.toString();
  };

  const handleViewDetails = () => {
    navigate(`/trips/${trip.tripId}`);
  };

  const handleEditTrip = () => {
    navigate(`/trips/edit/${trip.tripId}`);
  };

  const isDriver = user?.userType === 'DRIVER';
  const isPendingTrip = !trip.tripStatus;
  
  // Check if current user is the host of this trip
  const isHost = trip.host?.user?.userId === user?.userId;
  
  const showAcceptButton = isDriver && isPendingTrip && onTripAccepted;
  const showBookButton = !isDriver && isPendingTrip && onTripAccepted && !isHost;
  const showHostActions = isHost && isPendingTrip && onTripDeleted;

  console.log('🎫 TripCard booking check:', {
    userType: user?.userType,
    isDriver,
    tripStatus: trip.tripStatus,
    isPendingTrip,
    isHost,
    hostUserId: trip.host?.user?.userId,
    currentUserId: user?.userId,
    showBookButton,
    hasOnTripAccepted: !!onTripAccepted,
    showHostActions
  });

  return (
    <Card className="w-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base sm:text-lg">Trip #{trip.tripId}</CardTitle>
          <span className={`text-xs sm:text-sm font-medium ${getStatusColor(trip.tripStatus)}`}>
            {getStatusText(trip.tripStatus)}
          </span>
        </div>
        {isHost && (
          <div className="text-xs text-blue-600 font-medium">
            Your Trip
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-start space-x-2">
            <MapPin className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span className="text-xs sm:text-sm break-words">
              <span className="font-medium">From:</span> {trip.tripPickuplocation}
            </span>
          </div>
          <div className="flex items-start space-x-2">
            <MapPin className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <span className="text-xs sm:text-sm break-words">
              <span className="font-medium">To:</span> {trip.tripDroplocation}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <span className="text-xs sm:text-sm">{formatDate(trip.tripDate)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-purple-600 flex-shrink-0" />
            <span className="text-xs sm:text-sm">{trip.tripDeparturetime}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center space-x-2">
            <Car className="h-4 w-4 text-gray-600 flex-shrink-0" />
            <span className="text-xs sm:text-sm capitalize">{trip.tripCabtype}</span>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium">${trip.tripPrice}</span>
          </div>
        </div>

        <div className="pt-3 border-t space-y-2">
          {showAcceptButton && (
            <AcceptTripDialog 
              trip={trip} 
              onTripAccepted={onTripAccepted}
            />
          )}
          {showBookButton && (
            <BookTripDialog 
              trip={trip} 
              onTripBooked={onTripAccepted}
            />
          )}
          {showHostActions && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button 
                onClick={handleEditTrip}
                variant="outline" 
                size="sm" 
                className="text-xs sm:text-sm"
              >
                <Pencil className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Edit Trip</span>
                <span className="sm:hidden">Edit</span>
              </Button>
              <DeleteTripDialog 
                trip={trip}
                onTripDeleted={onTripDeleted}
              />
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button 
              onClick={() => onViewRoute(trip)} 
              variant="outline" 
              size="sm" 
              className="text-xs sm:text-sm"
            >
              View Route
            </Button>
            <Button 
              onClick={handleViewDetails}
              variant="outline" 
              size="sm" 
              className="text-xs sm:text-sm"
            >
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
