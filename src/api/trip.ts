import { ApiResponse } from '../types/ApiResponse';
import { TripDto, TripSearchRequestDto } from '../types/TripDto';
import apiClient from './config';

export const tripApi = {
  async getUserTrips(): Promise<ApiResponse<TripDto[]>> {
    try {
      const response = await apiClient.get('/trip/usertrips');
      return {
        success: true,
        message: "Trips fetched successfully",
        data: response.data
      };
    } catch (error: any) {
      console.error('Get user trips error:', error);
      if (error.response?.data?.message) {
        return {
          success: false,
          message: error.response.data.message
        };
      }
      return {
        success: false,
        message: "Failed to fetch trips"
      };
    }
  },

  async getTrip(tripId: number): Promise<ApiResponse<TripDto>> {
    try {
      const response = await apiClient.get(`/trip/${tripId}`);
      return {
        success: true,
        message: "Trip fetched successfully",
        data: response.data
      };
    } catch (error: any) {
      console.error('Get trip error:', error);
      if (error.response?.data?.message) {
        return {
          success: false,
          message: error.response.data.message
        };
      }
      return {
        success: false,
        message: "Failed to fetch trip"
      };
    }
  },

  async getBookedSeats(tripId: number): Promise<ApiResponse<string[]>> {
    try {
      const response = await apiClient.get(`/trip/bookedseat/${tripId}`);
      return {
        success: true,
        message: "Booked seats fetched successfully",
        data: response.data
      };
    } catch (error: any) {
      console.error('Get booked seats error:', error);
      if (error.response?.data?.message) {
        return {
          success: false,
          message: error.response.data.message
        };
      }
      return {
        success: false,
        message: "Failed to fetch booked seats"
      };
    }
  },

  async bookTrip(tripId: number, bookingData: { trippickup: { lat: number; lng: number }, tripSeat: string }): Promise<ApiResponse<TripDto>> {
    try {
      console.log('🎫 Booking trip with data:', bookingData);
      
      const response = await apiClient.post(`/trip/book/${tripId}`, bookingData);
      
      console.log('✅ Book trip response:', response.data);
      
      return {
        success: true,
        message: "Trip booked successfully",
        data: response.data
      };
    } catch (error: any) {
      console.error('💥 Book trip error:', error);
      
      if (error.response?.data?.message) {
        return {
          success: false,
          message: error.response.data.message
        };
      }
      return {
        success: false,
        message: "Failed to book trip"
      };
    }
  },

  async searchTrips(searchData: TripSearchRequestDto): Promise<ApiResponse<TripDto[]>> {
    try {
      console.log('🔍 Starting API search with payload:', JSON.stringify(searchData, null, 2));
      console.log('📡 Making POST request to /trip/search');
      
      const response = await apiClient.post('/trip/search', searchData);
      
      console.log('✅ Search API response status:', response.status);
      console.log('📦 Search API response data:', response.data);
      console.log('📊 Number of trips found:', response.data?.length || 0);
      
      return {
        success: true,
        message: "Trips searched successfully",
        data: response.data
      };
    } catch (error: any) {
      console.error('💥 Search trips error:', error);
      console.error('📋 Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.data?.message) {
        return {
          success: false,
          message: error.response.data.message
        };
      }
      return {
        success: false,
        message: "Failed to search trips"
      };
    }
  },

  async acceptTrip(tripId: number, cabId: number): Promise<ApiResponse<TripDto>> {
    try {
      console.log('🚕 Accepting trip with cabId:', cabId, 'for tripId:', tripId);
      
      const response = await apiClient.post(`/trip/accept/${tripId}`, {
        cabId: cabId
      });
      
      console.log('✅ Accept trip response:', response.data);
      
      return {
        success: true,
        message: "Trip accepted successfully",
        data: response.data
      };
    } catch (error: any) {
      console.error('💥 Accept trip error:', error);
      
      if (error.response?.data?.message) {
        return {
          success: false,
          message: error.response.data.message
        };
      }
      return {
        success: false,
        message: "Failed to accept trip"
      };
    }
  },

  async addTrip(tripData: {
    tripPickuplocation: string;
    trippickup: { lat: number; lng: number };
    tripDroplocation: string;
    tripdrop: { lat: number; lng: number };
    tripDistance: number;
    tripDeparturetime: string;
    tripDate: number;
    tripCabtype: string;
    tripSeat: string;
  }): Promise<ApiResponse<TripDto>> {
    try {
      console.log('🚗 Adding new trip with data:', tripData);
      
      const response = await apiClient.post('/trip/add', tripData);
      
      console.log('✅ Add trip response:', response.data);
      
      return {
        success: true,
        message: "Trip added successfully",
        data: response.data
      };
    } catch (error: any) {
      console.error('💥 Add trip error:', error);
      
      if (error.response?.data?.message) {
        return {
          success: false,
          message: error.response.data.message
        };
      }
      return {
        success: false,
        message: "Failed to add trip"
      };
    }
  },

  async updateTrip(tripId: number, updateData: Partial<{
    tripPickuplocation: string;
    trippickup: { lat: number; lng: number };
    tripDroplocation: string;
    tripdrop: { lat: number; lng: number };
    tripDistance: number;
    tripDeparturetime: string;
    tripDate: number;
    tripCabtype: string;
    tripSeat: string;
  }>): Promise<ApiResponse<{ message: string }>> {
    try {
      console.log('🔄 Updating trip with data:', updateData);
      
      const response = await apiClient.put(`/trip/update/${tripId}`, updateData);
      
      console.log('✅ Update trip response:', response.data);
      
      return {
        success: true,
        message: "Trip updated successfully",
        data: response.data
      };
    } catch (error: any) {
      console.error('💥 Update trip error:', error);
      
      if (error.response?.data?.message) {
        return {
          success: false,
          message: error.response.data.message
        };
      }
      return {
        success: false,
        message: "Failed to update trip"
      };
    }
  },

  async deleteTrip(tripId: number): Promise<ApiResponse<{ message: string }>> {
    try {
      console.log('🗑️ Deleting trip:', tripId);
      
      const response = await apiClient.delete(`/trip/delete/${tripId}`);
      
      console.log('✅ Delete trip response:', response.data);
      
      return {
        success: true,
        message: "Trip deleted successfully",
        data: response.data
      };
    } catch (error: any) {
      console.error('💥 Delete trip error:', error);
      
      if (error.response?.data?.message) {
        return {
          success: false,
          message: error.response.data.message
        };
      }
      return {
        success: false,
        message: "Failed to delete trip"
      };
    }
  }
};
