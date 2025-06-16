
export interface TripDto {
  tripId: number;
  tripPickuplocation: string;
  tripDroplocation: string;
  tripDistance: number;
  tripDeparturetime: string;
  tripDate: number;
  tripCabtype: string;
  tripPrice: number;
  tripOtp: number;
  tripStatus: boolean;
  host?: {
    user: {
      userId: number;
      userName: string;
    };
  };
  riders?: Array<{
    user: {
      userId: number;
      userName: string;
    };
  }>;
  driver?: {
    user: {
      userId: number;
      userName: string;
    };
  };
  cab?: {
    cabId: number;
    cabNumber: string;
    cabName: string;
    cabColor: string;
    cabType: string;
  };
  trippickup?: {
    trippickupId: number;
    lat: number;
    lng: number;
  };
  tripdrop?: {
    tripdropId: number;
    lat: number;
    lng: number;
  };
}

export interface TripSearchDto {
  tripId: number;
  hostUsername: string;
  pickupAddress: string;
  dropAddress: string;
  cabType: 'SEDAN' | 'SUV';
  availableSeats: number;
  estimatedFare: number;
  distanceFromUser: number;
}

export interface TripRiderDto {
  tripId: number;
  riderId: number;
  seatNumber: number;
  joinedAt: string;
}

export interface TripSearchRequestDto {
  trippickup: {
    lat: number;
    lng: number;
  };
  tripdrop: {
    lat: number;
    lng: number;
  };
  tripDeparturetime: string;
  tripDate: number;
}

export interface TripRiderBookingDto {
  trippickup: {
    lat: number;
    lng: number;
  };
  tripSeat: string;
}

export interface TripAddDto {
  tripPickuplocation: string;
  trippickup: {
    lat: number;
    lng: number;
  };
  tripDroplocation: string;
  tripdrop: {
    lat: number;
    lng: number;
  };
  tripDistance: number;
  tripDeparturetime: string;
  tripDate: number;
  tripCabtype: string;
  tripSeat: string;
}
