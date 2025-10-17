"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, CreditCard, ShoppingCart, Users } from "lucide-react";
import { format } from "date-fns";
import { Booking, DashboardData } from "@/types/dashboardType";

// ===== Status Badge Helper =====
const getStatusBadge = (status: Booking["status"]) => {
  const variants: Record<
    Booking["status"],
    "default" | "secondary" | "destructive" | "outline"
  > = {
    Confirmed: "default",
    Active: "secondary",
    Completed: "outline",
    Cancelled: "destructive",
    Pending: "secondary",
  };
  return <Badge variant={variants[status] || "default"}>{status}</Badge>;
};

// ===== Component =====
export default function Dashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      setDashboard(json.dashboard as DashboardData);
      setLoading(false);
    }
    fetchDashboard();
  }, []);

  if (loading) return <p>Loading...</p>;
  const { summary, recentBookings, rooms } = dashboard!;
  const summaryCards = [
    {
      title: "Total Customers",
      value: summary.totalCustomers,
      description: "All registered customers",
      icon: Users,
    },
    {
      title: "Total Rooms",
      value: summary.totalRooms,
      description: "All available rooms",
      icon: CreditCard,
    },
    {
      title: "Available Rooms",
      value: summary.availableRooms,
      description: "Rooms ready for booking",
      icon: CalendarIcon,
    },
    {
      title: "Occupancy Rate",
      value: `${summary.occupancyRate}%`,
      description: "Percentage of rooms occupied",
      icon: ShoppingCart,
    },
  ];

  return (
    <TabsContent value="dashboard" className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-120">
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 h-100 overflow-y-auto">
            {recentBookings.length === 0 && <p>No recent bookings</p>}
            {recentBookings.map((booking) => (
              <div
                key={booking.bookingId}
                className="flex justify-between items-center p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{booking.customerName}</p>
                  <p className="text-sm text-gray-500">{booking.roomName}</p>
                  <p className="text-xs text-gray-400">
                    {format(new Date(booking.startAt), "HH:mm")} -{" "}
                    {format(new Date(booking.endAt), "HH:mm")}
                  </p>
                </div>
                {getStatusBadge(booking.status)}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Room Status */}
        <Card className="h-120">
          <CardHeader>
            <CardTitle>Room Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 h-100 overflow-y-auto">
            {rooms.map((room) => (
              <div
                key={room.roomId}
                className="flex justify-between items-center p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{room.name}</p>
                  <p className="text-sm text-gray-500">
                    {room.type} - ${room.pricePerHour}/hour
                  </p>
                </div>
                <Badge variant={room.available ? "secondary" : "destructive"}>
                  {room.available ? "Available" : "Occupied"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
}
