
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cabApi } from '../api/cab';
import { CabDto } from '../types/CabDto';
import { useToast } from '@/hooks/use-toast';
import { Car } from 'lucide-react';

interface ViewCabsDialogProps {
  refreshTrigger: number;
}

export const ViewCabsDialog: React.FC<ViewCabsDialogProps> = ({ refreshTrigger }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [cabs, setCabs] = useState<CabDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();

  const fetchCabs = async () => {
    setIsLoading(true);
    try {
      const response = await cabApi.getCabs();
      
      if (response.success && response.data) {
        setCabs(response.data);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message || "Failed to fetch cabs",
        });
      }
    } catch (error) {
      console.error('Error fetching cabs:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCabs();
    }
  }, [isOpen, refreshTrigger]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex-1">
          <Car className="w-4 h-4 mr-2" />
          View Cabs
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>My Cabs</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="text-lg">Loading cabs...</div>
          </div>
        ) : cabs.length === 0 ? (
          <div className="text-center py-8">
            <Car className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No cabs found. Add your first cab!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cab Number</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cabs.map((cab) => (
                  <TableRow key={cab.cabId}>
                    <TableCell className="font-medium">{cab.cabNumber}</TableCell>
                    <TableCell>{cab.cabName}</TableCell>
                    <TableCell>{cab.cabColor}</TableCell>
                    <TableCell>{cab.cabType}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
