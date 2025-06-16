import { ApiResponse } from '../types/ApiResponse';
import { LoginDto, RegisterDto, UserDto } from '../types/UserDto';
import apiClient from './config';

export const authApi = {
  async register(data: RegisterDto): Promise<ApiResponse<UserDto>> {
    const response = await apiClient.post('/register', data);
    
    // Check if registration was successful
    if (response.data.success === false) {
      // Error case - backend returned ApiResponse
      return response.data;
    } else {
      // Success case - registration completed
      // Now we need to log the user in to establish the session
      try {
        const loginResponse = await apiClient.post('/login', {
          userName: data.userName,
          pswd: data.pswd
        });
        
        if (loginResponse.data.success) {
          // Fetch user data after successful login
          const userResponse = await apiClient.get('/user');
          return {
            success: true,
            message: "Registration and login successful",
            data: userResponse.data
          };
        } else {
          // Registration succeeded but login failed
          return {
            success: false,
            message: "Registration successful but automatic login failed. Please log in manually."
          };
        }
      } catch (error) {
        console.error('Auto-login after registration failed:', error);
        return {
          success: false,
          message: "Registration successful but automatic login failed. Please log in manually."
        };
      }
    }
  },

  async login(data: LoginDto): Promise<ApiResponse<UserDto>> {
    // Transform the payload to match backend expectations
    const payload = {
      userName: data.username,
      pswd: data.password
    };
    const response = await apiClient.post('/login', payload);
    
    // Backend returns ApiResponse with success/message but no user data
    // We need to fetch user data separately after successful login
    if (response.data.success) {
      try {
        const userResponse = await apiClient.get('/user');
        return {
          success: true,
          message: response.data.message || "Login successful",
          data: userResponse.data
        };
      } catch (error) {
        console.error('Failed to fetch user after login:', error);
        return {
          success: false,
          message: "Login successful but failed to fetch user data"
        };
      }
    } else {
      return response.data;
    }
  },

  async logout(): Promise<ApiResponse> {
    const response = await apiClient.get('/logout');
    return response.data;
  },

  async getCurrentUser(): Promise<ApiResponse<UserDto>> {
    const response = await apiClient.get('/user');
    console.log('Raw /user response:', response);
    console.log('Response data:', response.data);
    
    // The backend returns the user object directly, not wrapped in ApiResponse
    return {
      success: true,
      message: "User fetched successfully",
      data: response.data
    };
  },

  async updateUser(userData: Partial<RegisterDto>): Promise<ApiResponse<void>> {
    const response = await apiClient.put('/updateuser', userData);
    return response.data;
  },

  async deleteUser(): Promise<ApiResponse<void>> {
    const response = await apiClient.delete('/deleteuser');
    return response.data;
  }
};

// Cloudinary image upload utility
export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary configuration missing. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET environment variables.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('cloud_name', cloudName);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  return data.url;
};
