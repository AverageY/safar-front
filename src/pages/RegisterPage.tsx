
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { uploadImageToCloudinary } from '../api/auth';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    userName: '',
    mobileNum: '',
    pswd: '',
    userType: 'STUDENT' as 'STUDENT' | 'TEACHER' | 'DRIVER',
    profileImg: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const userTypeOptions = [
    { value: 'STUDENT', label: 'Student' },
    { value: 'TEACHER', label: 'Teacher' },
    { value: 'DRIVER', label: 'Driver' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let profileImgUrl = '';
      
      // Upload image if selected
      if (imageFile) {
        toast({
          title: "Uploading image...",
          description: "Please wait while we upload your profile picture",
        });
        profileImgUrl = await uploadImageToCloudinary(imageFile);
      }

      const registerData = {
        userName: formData.userName,
        mobileNum: formData.mobileNum,
        pswd: formData.pswd,
        userType: formData.userType,
        profileImg: profileImgUrl
      };

      console.log('Attempting registration...');
      const success = await register(registerData);
      console.log('Registration result:', success);
      
      if (success) {
        toast({
          title: "Registration successful",
          description: "Welcome to Safar!",
        });
        navigate('/profile');
      } else {
        toast({
          title: "Registration failed",
          description: "Username or mobile number might already be taken",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="max-w-md w-full space-y-8 p-6 sm:p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
            Join Safar
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-primary hover:text-primary/80"
            >
              sign in to your account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Profile Image Upload */}
          <div className="flex flex-col items-center space-y-4">
            <div 
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden"
              onClick={() => !isLoading && document.getElementById('profileImg')?.click()}
            >
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Profile Preview" 
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="text-center">
                  <div className="text-xl sm:text-2xl text-gray-400">📷</div>
                  <div className="text-xs text-gray-500">Upload Photo</div>
                </div>
              )}
            </div>
            <input
              type="file"
              id="profileImg"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-4">
            <Input
              label="Full Name"
              name="userName"
              type="text"
              value={formData.userName}
              onChange={handleInputChange}
              required
              placeholder="Enter your full name"
              disabled={isLoading}
            />
            
            <Input
              label="Mobile Number"
              name="mobileNum"
              type="tel"
              value={formData.mobileNum}
              onChange={handleInputChange}
              required
              placeholder="Enter your mobile number"
              pattern="[0-9]{10}"
              disabled={isLoading}
            />
            
            <Input
              label="Password"
              name="pswd"
              type="password"
              value={formData.pswd}
              onChange={handleInputChange}
              required
              placeholder="Create a password"
              minLength={5}
              disabled={isLoading}
            />
            
            <Select
              label="User Type"
              name="userType"
              value={formData.userType}
              onChange={handleInputChange}
              options={userTypeOptions}
              required
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>
      </div>
    </div>
  );
};
