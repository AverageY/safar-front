
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from './Select';
import { cabApi, AddCabDto } from '../api/cab';
import { useToast } from '@/hooks/use-toast';
import { Car } from 'lucide-react';

interface AddCabDialogProps {
  onCabAdded: () => void;
}

const cabTypeOptions = [
  { value: '', label: 'Select cab type' },
  { value: 'suv', label: 'SUV' },
  { value: 'sedan', label: 'Sedan' }
];

export const AddCabDialog: React.FC<AddCabDialogProps> = ({ onCabAdded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<AddCabDto>({
    cabNumber: '',
    cabName: '',
    cabColor: '',
    cabType: ''
  });

  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate cab type
    if (!formData.cabType || (formData.cabType !== 'suv' && formData.cabType !== 'sedan')) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a valid cab type (SUV or Sedan)",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await cabApi.addCab(formData);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Cab added successfully!",
        });
        setIsOpen(false);
        setFormData({
          cabNumber: '',
          cabName: '',
          cabColor: '',
          cabType: ''
        });
        onCabAdded();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message || "Failed to add cab",
        });
      }
    } catch (error) {
      console.error('Error adding cab:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex-1">
          <Car className="w-4 h-4 mr-2" />
          Add Cab
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Cab</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cabNumber">Cab Number</Label>
            <Input
              id="cabNumber"
              name="cabNumber"
              value={formData.cabNumber}
              onChange={handleInputChange}
              placeholder="Enter cab number (min 10 characters)"
              required
              minLength={10}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cabName">Cab Name</Label>
            <Input
              id="cabName"
              name="cabName"
              value={formData.cabName}
              onChange={handleInputChange}
              placeholder="Enter cab name (min 3 characters)"
              required
              minLength={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cabColor">Cab Color</Label>
            <Input
              id="cabColor"
              name="cabColor"
              value={formData.cabColor}
              onChange={handleInputChange}
              placeholder="Enter cab color (min 3 characters)"
              required
              minLength={3}
            />
          </div>
          
          <div className="space-y-2">
            <Select
              label="Cab Type"
              name="cabType"
              value={formData.cabType}
              onChange={handleInputChange}
              options={cabTypeOptions}
              required
            />
            <p className="text-xs text-gray-500">Cab type can only be SUV or Sedan</p>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Cab'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
