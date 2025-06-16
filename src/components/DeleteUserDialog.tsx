
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { authApi } from '../api/auth';
import { useNavigate } from 'react-router-dom';

export const DeleteUserDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const { logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') {
      toast({
        title: "Confirmation required",
        description: "Please type 'DELETE' to confirm account deletion",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.deleteUser();
      
      if (response.success) {
        toast({
          title: "Account deleted",
          description: "Your account has been deleted successfully",
        });
        
        // Log out user and redirect to login
        await logout();
        navigate('/login');
      } else {
        toast({
          title: "Delete failed",
          description: response.message || "Failed to delete account",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="flex-1">
          Delete Account
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Account</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label htmlFor="confirmDelete" className="text-sm font-medium">
              Type "DELETE" to confirm:
            </label>
            <input
              id="confirmDelete"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
              placeholder="Type DELETE here"
              disabled={isLoading}
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                setConfirmText('');
              }}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              variant="destructive"
              className="flex-1"
              disabled={isLoading || confirmText !== 'DELETE'}
            >
              {isLoading ? 'Deleting...' : 'Delete Account'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
