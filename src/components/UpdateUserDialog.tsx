
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { authApi, uploadImageToCloudinary } from '../api/auth';
import { UserDto } from '../types/UserDto';

interface UpdateUserDialogProps {
  user: UserDto;
  onUserUpdated: () => void;
}

export const UpdateUserDialog: React.FC<UpdateUserDialogProps> = ({ user, onUserUpdated }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    userName: user.userName || '',
    mobileNum: user.mobileNum || '',
    pswd: '',
    userType: user.userType,
    profileImg: user.profileImg || ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(user.profileImg || '');

  const { toast } = useToast();

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
      let profileImgUrl = formData.profileImg;
      
      // Upload new image if selected
      if (imageFile) {
        toast({
          title: "Uploading image...",
          description: "Please wait while we upload your profile picture",
        });
        profileImgUrl = await uploadImageToCloudinary(imageFile);
      }

      // Prepare update data - only send fields that have values
      const updateData: any = {};
      if (formData.userName !== user.userName) updateData.userName = formData.userName;
      if (formData.mobileNum !== user.mobileNum) updateData.mobileNum = formData.mobileNum;
      if (formData.pswd) updateData.pswd = formData.pswd; // Only send password if it's being changed
      if (formData.userType !== user.userType) updateData.userType = formData.userType;
      if (profileImgUrl !== user.profileImg) updateData.profileImg = profileImgUrl;

      // Only make API call if there are changes
      if (Object.keys(updateData).length === 0) {
        toast({
          title: "No changes",
          description: "No changes were made to update.",
        });
        setOpen(false);
        return;
      }

      const response = await authApi.updateUser(updateData);
      
      if (response.success) {
        toast({
          title: "Update successful",
          description: "Your profile has been updated successfully!",
        });
        setOpen(false);
        onUserUpdated();
      } else {
        toast({
          title: "Update failed",
          description: response.message || "Failed to update profile",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Update error:', error);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex-1">
          Update Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Image Upload */}
          <div className="flex flex-col items-center space-y-4">
            <div 
              className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden"
              onClick={() => !isLoading && document.getElementById('updateProfileImg')?.click()}
            >
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Profile Preview" 
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="text-center">
                  <div className="text-xl text-gray-400">📷</div>
                  <div className="text-xs text-gray-500">Upload</div>
                </div>
              )}
            </div>
            <input
              type="file"
              id="updateProfileImg"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="userName">Full Name</Label>
              <Input
                id="userName"
                name="userName"
                type="text"
                value={formData.userName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <Label htmlFor="mobileNum">Mobile Number</Label>
              <Input
                id="mobileNum"
                name="mobileNum"
                type="tel"
                value={formData.mobileNum}
                onChange={handleInputChange}
                placeholder="Enter your mobile number"
                pattern="[0-9]{10}"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <Label htmlFor="pswd">New Password (leave blank to keep current)</Label>
              <Input
                id="pswd"
                name="pswd"
                type="password"
                value={formData.pswd}
                onChange={handleInputChange}
                placeholder="Enter new password"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <Label htmlFor="userType">User Type</Label>
              <select
                id="userType"
                name="userType"
                value={formData.userType}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isLoading}
              >
                {userTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Profile'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
