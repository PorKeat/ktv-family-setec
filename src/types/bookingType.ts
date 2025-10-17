interface TimeSlot {
  startAt: string;
  endAt: string;
}

interface Booking {
  bookingId: string;
  customerId: string;
  roomId: string;
  timeSlot: TimeSlot;
  status: string;
  duration?: number;
  totalPrice?: number;
}

interface NewBooking {
  customerId: string;
  roomId: string;
  timeSlot: {
    startAt: string;
    endAt: string;
  };
  status: string;
}

export type { Booking, NewBooking, TimeSlot };
