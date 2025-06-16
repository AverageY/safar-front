import React, { useState, useEffect } from 'react';
import { tripApi } from '../api/trip';
import { TripDto, TripSearchRequestDto } from '../types/TripDto';
import { TripCard } from '../components/TripCard';
import { TripSearchForm } from '../components/TripSearchForm';
import { MapboxRoute } from '../components/MapboxRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, MapPin, Search, Plus, LogOut, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const TripsPage: React.FC = () => {
  const [trips, setTrips] = useState<TripDto[]>([]);
  const [searchResults, setSearchResults] = useState<TripDto[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<TripDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const { toast } = useToast();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await tripApi.getUserTrips();
      
      if (response.success && response.data) {
        setTrips(response.data);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to fetch trips",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
      toast({
        title: "Error",
        description: "Failed to fetch trips",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (searchData: TripSearchRequestDto) => {
    try {
      console.log('🎯 TripsPage: Starting search process');
      console.log('📋 Search data received in TripsPage:', searchData);
      
      setSearchLoading(true);
      const response = await tripApi.searchTrips(searchData);
      
      console.log('📈 Search response in TripsPage:', response);
      
      if (response.success && response.data) {
        console.log('✅ Search successful, setting results:', response.data);
        setSearchResults(response.data);
        setIsSearchMode(true);
        toast({
          title: "Success",
          description: `Found ${response.data.length} matching trips`,
        });
      } else {
        console.log('❌ Search failed:', response.message);
        toast({
          title: "Error",
          description: response.message || "Failed to search trips",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('💥 Error in handleSearch:', error);
      toast({
        title: "Error",
        description: "Failed to search trips",
        variant: "destructive",
      });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleViewRoute = (trip: TripDto) => {
    setSelectedTrip(trip);
  };

  const handleBackToList = () => {
    setSelectedTrip(null);
  };

  const handleBackToMyTrips = () => {
    setIsSearchMode(false);
    setSearchResults([]);
  };

  const handleTripAccepted = (updatedTrip: TripDto) => {
    console.log('🎉 Trip accepted:', updatedTrip);
    
    // Update the trip in both trips and searchResults arrays
    setTrips(prevTrips => 
      prevTrips.map(trip => 
        trip.tripId === updatedTrip.tripId ? updatedTrip : trip
      )
    );
    
    setSearchResults(prevResults => 
      prevResults.map(trip => 
        trip.tripId === updatedTrip.tripId ? updatedTrip : trip
      )
    );
    
    toast({
      title: "Success",
      description: `Trip #${updatedTrip.tripId} has been accepted!`,
    });
  };

  const handleTripDeleted = (tripId: number) => {
    console.log('🗑️ Trip deleted:', tripId);
    
    // Remove the trip from both trips and searchResults arrays
    setTrips(prevTrips => 
      prevTrips.filter(trip => trip.tripId !== tripId)
    );
    
    setSearchResults(prevResults => 
      prevResults.filter(trip => trip.tripId !== tripId)
    );
    
    toast({
      title: "Success",
      description: `Trip #${tripId} has been deleted!`,
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  const handleAddTrip = () => {
    navigate('/trips/add');
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const currentTrips = isSearchMode ? searchResults : trips;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-base sm:text-lg">Loading trips...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 sm:p-4 lg:p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {selectedTrip ? (
          // Route view
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button onClick={handleBackToList} variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Back to Trips</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <h1 className="text-lg sm:text-2xl font-bold">Trip #{selectedTrip.tripId} Route</h1>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Route Visualization</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div className="break-words">
                      <span className="font-medium text-green-600">Pickup:</span> {selectedTrip.tripPickuplocation}
                    </div>
                    <div className="break-words">
                      <span className="font-medium text-red-600">Drop:</span> {selectedTrip.tripDroplocation}
                    </div>
                  </div>
                  <MapboxRoute trip={selectedTrip} />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Trips list view with search
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                {isSearchMode ? 'Search Results' : 'My Trips'}
              </h1>
              <div className="flex flex-wrap gap-2">
                {isSearchMode && (
                  <Button onClick={handleBackToMyTrips} variant="outline" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">My Trips</span>
                    <span className="sm:hidden">My Trips</span>
                  </Button>
                )}
                <Button onClick={handleAddTrip} size="sm">
                  <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Add Trip</span>
                  <span className="sm:hidden">Add</span>
                </Button>
                <Button onClick={handleProfile} variant="outline" size="sm">
                  <User className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Profile</span>
                  <span className="sm:hidden">Profile</span>
                </Button>
                <Button onClick={fetchTrips} variant="outline" size="sm">
                  Refresh
                </Button>
                <Button onClick={handleLogout} variant="outline" size="sm">
                  <LogOut className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                  <span className="sm:hidden">Logout</span>
                </Button>
              </div>
            </div>

            <TripSearchForm onSearch={handleSearch} isLoading={searchLoading} />

            {currentTrips.length === 0 ? (
              <Card>
                <CardContent className="py-8 sm:py-12 text-center">
                  {isSearchMode ? (
                    <>
                      <Search className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No trips found</h3>
                      <p className="text-sm sm:text-base text-gray-500 px-4">No trips match your search criteria. Try adjusting your search parameters.</p>
                    </>
                  ) : (
                    <>
                      <MapPin className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No trips found</h3>
                      <p className="text-sm sm:text-base text-gray-500 px-4">You haven't created or joined any trips yet.</p>
                    </>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {currentTrips.map((trip) => (
                  <TripCard
                    key={trip.tripId}
                    trip={trip}
                    onViewRoute={handleViewRoute}
                    onTripAccepted={isSearchMode ? handleTripAccepted : handleTripAccepted}
                    onTripDeleted={handleTripDeleted}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
