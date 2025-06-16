
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tripApi } from '../api/trip';
import { TripDto } from '../types/TripDto';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Calendar, Clock, Car, DollarSign, Users, User, Hash, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BookTripDialog } from '../components/BookTripDialog';
import { useAuth } from '../contexts/AuthContext';

export const TripDetailsPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [trip, setTrip] = useState<TripDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tripId) {
      fetchTripDetails(parseInt(tripId));
    }
  }, [tripId]);

  const fetchTripDetails = async (id: number) => {
    try {
      setLoading(true);
      console.log('🔍 Fetching trip details for ID:', id);
      const response = await tripApi.getTrip(id);
      
      console.log('📋 Trip details response:', response);
      
      if (response.success && response.data) {
        setTrip(response.data);
        console.log('✅ Trip data set successfully:', response.data);
      } else {
        console.log('❌ Failed to fetch trip details:', response.message);
        toast({
          title: "Error",
          description: response.message || "Failed to fetch trip details",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('💥 Error fetching trip details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch trip details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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

  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-600' : 'text-orange-600';
  };

  const getStatusText = (status: boolean) => {
    return status ? 'Completed' : 'Pending';
  };

  const canBookTrip = () => {
    if (!trip || !user) {
      console.log('🚫 Cannot book trip - missing trip or user data');
      return false;
    }
    
    const isNotDriver = user.userType !== 'DRIVER';
    const isTripPending = !trip.tripStatus;
    
    // Check if user has already booked this trip
    const hasAlreadyBooked = trip.riders?.some(rider => rider.user.userId === user.userId);
    
    const canBook = isTripPending && isNotDriver && !hasAlreadyBooked;
    
    console.log('🎫 Booking eligibility check:', {
      userType: user.userType,
      userId: user.userId,
      isNotDriver,
      tripStatus: trip.tripStatus,
      isTripPending,
      hasAlreadyBooked,
      ridersCount: trip.riders?.length || 0,
      canBook
    });
    
    return canBook;
  };

  const handleTripBooked = (updatedTrip: TripDto) => {
    console.log('🎉 Trip booked successfully:', updatedTrip);
    setTrip(updatedTrip);
    toast({
      title: "Success",
      description: "Trip booked successfully!",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-base sm:text-lg">Loading trip details...</div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Trip not found</h2>
          <Button onClick={() => navigate('/trips')}>Back to Trips</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 sm:p-4 lg:p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Button onClick={() => navigate('/trips')} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Back to Trips</span>
            <span className="sm:hidden">Back</span>
          </Button>
          <h1 className="text-lg sm:text-2xl font-bold">Trip #{trip?.tripId} Details</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Trip Information */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-base sm:text-lg">Trip Information</CardTitle>
                <span className={`text-xs sm:text-sm font-medium ${getStatusColor(trip.tripStatus)}`}>
                  {getStatusText(trip.tripStatus)}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs sm:text-sm break-words">
                    <span className="font-medium">From:</span> {trip.tripPickuplocation}
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs sm:text-sm break-words">
                    <span className="font-medium">To:</span> {trip.tripDroplocation}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">{formatDate(trip.tripDate)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-purple-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">{trip.tripDeparturetime}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Car className="h-4 w-4 text-gray-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm capitalize">{trip.tripCabtype}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium">${trip.tripPrice}</span>
                </div>
              </div>

              {canBookTrip() && (
                <div className="pt-3 border-t">
                  <BookTripDialog trip={trip} onTripBooked={handleTripBooked} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cab Information */}
          {trip.cab && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg flex items-center space-x-2">
                  <Car className="h-4 w-4" />
                  <span>Cab Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Car className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <div className="text-sm">
                      <span className="font-medium">Name:</span> {trip.cab.cabName}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Hash className="h-4 w-4 text-gray-600 flex-shrink-0" />
                    <div className="text-sm">
                      <span className="font-medium">Number:</span> {trip.cab.cabNumber}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Palette className="h-4 w-4 text-purple-600 flex-shrink-0" />
                    <div className="text-sm">
                      <span className="font-medium">Color:</span> {trip.cab.cabColor}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Car className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <div className="text-sm">
                      <span className="font-medium">Type:</span> {trip.cab.cabType}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* People Information */}
          <div className="space-y-4 lg:col-span-1">
            {/* Host Information */}
            {trip.host && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Host</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">{trip.host.user.userName}</div>
                </CardContent>
              </Card>
            )}

            {/* Driver Information */}
            {trip.driver && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg flex items-center space-x-2">
                    <Car className="h-4 w-4" />
                    <span>Driver</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-medium">{trip.driver.user.userName}</div>
                </CardContent>
              </Card>
            )}

            {/* Riders Information */}
            {trip.riders && trip.riders.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Riders ({trip.riders.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {trip.riders.map((rider, index) => (
                      <div key={index} className="text-sm">
                        {rider.user.userName}
                        {rider.user.userId === user?.userId && (
                          <span className="ml-2 text-xs text-blue-600 font-medium">(You)</span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
