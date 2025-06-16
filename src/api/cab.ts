
import { ApiResponse } from '../types/ApiResponse';
import { CabDto } from '../types/CabDto';
import apiClient from './config';

export interface AddCabDto {
  cabNumber: string;
  cabName: string;
  cabColor: string;
  cabType: string;
}

export const cabApi = {
  async addCab(cabData: AddCabDto): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post('/driver/addcab', cabData);
      return {
        success: true,
        message: "Cab added successfully",
        data: response.data
      };
    } catch (error: any) {
      console.error('Add cab error:', error);
      if (error.response?.data?.message) {
        return {
          success: false,
          message: error.response.data.message
        };
      }
      return {
        success: false,
        message: "Failed to add cab"
      };
    }
  },

  async getCabs(): Promise<ApiResponse<CabDto[]>> {
    try {
      const response = await apiClient.get('/driver/getcabs');
      return {
        success: true,
        message: "Cabs fetched successfully",
        data: response.data
      };
    } catch (error: any) {
      console.error('Get cabs error:', error);
      if (error.response?.data?.message) {
        return {
          success: false,
          message: error.response.data.message
        };
      }
      return {
        success: false,
        message: "Failed to fetch cabs"
      };
    }
  }
};
