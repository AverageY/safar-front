
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { UpdateUserDialog } from '../components/UpdateUserDialog';
import { DeleteUserDialog } from '../components/DeleteUserDialog';
import { AddCabDialog } from '../components/AddCabDialog';
import { ViewCabsDialog } from '../components/ViewCabsDialog';

export const ProfilePage: React.FC = () => {
  const { user, logout, fetchMe } = useAuth();
  const [cabRefreshTrigger, setCabRefreshTrigger] = useState(0);

  const handleLogout = async () => {
    await logout();
  };

  const handleUserUpdated = async () => {
    // Refresh user data after update
    await fetchMe();
  };

  const handleCabAdded = () => {
    // Trigger refresh of cabs list
    setCabRefreshTrigger(prev => prev + 1);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Handle both userName and username fields, with safe fallback
  const displayName = user.userName || user.username || 'Unknown User';
  const avatarFallback = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-8 space-y-4 sm:space-y-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Profile</h1>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={() => window.location.href = '/trips'} 
                variant="outline" 
                className="w-full sm:w-auto"
              >
                My Trips
              </Button>
              <Button onClick={handleLogout} variant="outline" className="w-full sm:w-auto">
                Logout
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col items-center space-y-6">
            {/* Profile Picture */}
            <Avatar className="w-24 h-24 sm:w-32 sm:h-32">
              <AvatarImage 
                src={user.profileImg} 
                alt={displayName}
                className="object-cover"
              />
              <AvatarFallback className="text-xl sm:text-2xl">
                {avatarFallback}
              </AvatarFallback>
            </Avatar>

            {/* User Details */}
            <div className="text-center space-y-4 w-full">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                  {displayName}
                </h2>
                <p className="text-sm text-gray-500 capitalize">
                  {user.userType ? user.userType.toLowerCase() : 'user'}
                </p>
              </div>

              {user.mobileNum && (
                <div className="bg-gray-50 p-4 rounded-lg w-full">
                  <p className="text-sm text-gray-600">Mobile Number</p>
                  <p className="text-base sm:text-lg font-medium">{user.mobileNum}</p>
                </div>
              )}

              {/* Profile Actions */}
              <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full">
                <UpdateUserDialog user={user} onUserUpdated={handleUserUpdated} />
                <DeleteUserDialog />
              </div>

              {/* Driver-specific buttons */}
              {user.userType === 'DRIVER' && (
                <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full">
                  <AddCabDialog onCabAdded={handleCabAdded} />
                  <ViewCabsDialog refreshTrigger={cabRefreshTrigger} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
