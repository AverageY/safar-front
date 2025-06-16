
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SeatSelectorProps {
  cabType: string;
  bookedSeats: string[];
  selectedSeat: string | null;
  onSeatSelect: (seat: string) => void;
}

export const SeatSelector: React.FC<SeatSelectorProps> = ({
  cabType,
  bookedSeats,
  selectedSeat,
  onSeatSelect
}) => {
  const getSeats = () => {
    if (cabType.toLowerCase() === 'suv') {
      return ['1', '2', '3', '4', '5', '6']; // 6 seats for SUV
    } else {
      return ['1', '2', '3', '4']; // 4 seats for Sedan
    }
  };

  const getSeatLayout = () => {
    const seats = getSeats();
    if (cabType.toLowerCase() === 'suv') {
      // SUV layout: 2+2+2
      return [
        ['1', '2'], // Front row
        ['3', '4'], // Middle row
        ['5', '6']  // Back row
      ];
    } else {
      // Sedan layout: 2+2
      return [
        ['1', '2'], // Front row
        ['3', '4']  // Back row
      ];
    }
  };

  const isSeatBooked = (seat: string) => bookedSeats.includes(seat);
  const isSeatSelected = (seat: string) => selectedSeat === seat;

  const getSeatColor = (seat: string) => {
    if (isSeatBooked(seat)) return 'bg-red-500 text-white cursor-not-allowed';
    if (isSeatSelected(seat)) return 'bg-blue-500 text-white';
    return 'bg-gray-200 hover:bg-gray-300 cursor-pointer';
  };

  const layout = getSeatLayout();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg text-center">
          Select Your Seat - {cabType.toUpperCase()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Driver position indicator */}
          <div className="flex justify-center mb-4">
            <div className="bg-gray-600 text-white px-3 py-1 rounded text-xs">
              Driver
            </div>
          </div>

          {/* Seat layout */}
          <div className="space-y-3">
            {layout.map((row, rowIndex) => (
              <div key={rowIndex} className="flex justify-center space-x-8">
                {row.map((seat) => (
                  <button
                    key={seat}
                    onClick={() => !isSeatBooked(seat) && onSeatSelect(seat)}
                    disabled={isSeatBooked(seat)}
                    className={cn(
                      'w-12 h-12 rounded-lg flex items-center justify-center text-sm font-medium transition-colors',
                      getSeatColor(seat)
                    )}
                  >
                    {seat}
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex justify-center space-x-4 text-xs pt-4 border-t">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-200 rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Selected</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Booked</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
