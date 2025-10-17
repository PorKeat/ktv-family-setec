interface Booking {
  bookingId: string;
  customerName: string;
  roomName: string;
  startAt: string;
  endAt: string;
  status: "Confirmed" | "Active" | "Completed" | "Cancelled" | "Pending";
}

interface Room {
  roomId: string;
  name: string;
  type: string;
  pricePerHour: number;
  available: boolean;
}

interface DashboardSummary {
  totalCustomers: number;
  totalRooms: number;
  availableRooms: number;
  occupancyRate: string;
}

interface DashboardToday {
  bookings: number;
  activeBookings: number;
  orders: number;
  revenue: number;
}

interface DashboardData {
  summary: DashboardSummary;
  today: DashboardToday;
  recentBookings: Booking[];
  rooms: Room[];
}

export type { Booking, Room, DashboardSummary, DashboardToday, DashboardData };
