"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Plus, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { TabsContent } from "./ui/tabs";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Booking, NewBooking } from "@/types/bookingType";

const getStatusBadge = (status: string) => {
  const variants: {
    [key: string]: "default" | "secondary" | "destructive" | "outline";
  } = {
    Confirmed: "default",
    Active: "secondary",
    Completed: "outline",
    Cancelled: "destructive",
    Pending: "outline",
  };
  return <Badge variant={variants[status] || "default"}>{status}</Badge>;
};

export default function Booking() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [newBooking, setNewBooking] = useState<NewBooking>({
    customerId: "",
    roomId: "",
    timeSlot: { startAt: "", endAt: "" },
    status: "Pending",
  });
  const [bookingDate, setBookingDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/bookings");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();

      let filteredBookings: Booking[] = data.data || [];

      // Client-side filter by date
      if (selectedDate) {
        filteredBookings = filteredBookings.filter((booking: Booking) => {
          const start = new Date(booking.timeSlot.startAt);
          return (
            start.getFullYear() === selectedDate.getFullYear() &&
            start.getMonth() === selectedDate.getMonth() &&
            start.getDate() === selectedDate.getDate()
          );
        });
      }

      setBookings(filteredBookings);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch bookings"
      );
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveBooking = async () => {
    if (!newBooking.customerId || !newBooking.roomId || !bookingDate) {
      setFormError("Please fill in all required fields");
      return;
    }

    const startDateTime = new Date(bookingDate);
    const [startHour, startMinute] = startTime.split(":").map(Number);
    startDateTime.setHours(startHour, startMinute);

    const endDateTime = new Date(bookingDate);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    endDateTime.setHours(endHour, endMinute);

    if (endDateTime <= startDateTime) {
      setFormError("End time must be after start time");
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      const bookingData = {
        ...newBooking,
        timeSlot: {
          startAt: startDateTime.toISOString(),
          endAt: endDateTime.toISOString(),
        },
      };

      const url = editingBooking
        ? `/api/bookings/${editingBooking.bookingId}`
        : "/api/bookings";
      const method = editingBooking ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        setIsDialogOpen(false);
        resetForm();
        await fetchData();
      } else {
        setFormError(
          data.error ||
            `Failed to ${editingBooking ? "update" : "create"} booking`
        );
      }
    } catch (error) {
      console.error(
        `Failed to ${editingBooking ? "update" : "create"} booking:`,
        error
      );
      setFormError(
        error instanceof Error
          ? error.message
          : `Failed to ${editingBooking ? "update" : "create"} booking`
      );
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setNewBooking({
      customerId: "",
      roomId: "",
      timeSlot: { startAt: "", endAt: "" },
      status: "Pending",
    });
    setBookingDate(undefined);
    setStartTime("09:00");
    setEndTime("10:00");
    setEditingBooking(null);
    setFormError(null);
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    setIsDeleting(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        setBookings((prev) => prev.filter((b) => b.bookingId !== bookingId));
      } else {
        alert(data.error || "Failed to cancel booking");
      }
    } catch (error) {
      console.error("Failed to cancel booking:", error);
      alert(
        error instanceof Error ? error.message : "Failed to cancel booking"
      );
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setNewBooking({
      customerId: booking.customerId,
      roomId: booking.roomId,
      timeSlot: booking.timeSlot,
      status: booking.status,
    });
    setBookingDate(new Date(booking.timeSlot.startAt));
    setStartTime(format(new Date(booking.timeSlot.startAt), "HH:mm"));
    setEndTime(format(new Date(booking.timeSlot.endAt), "HH:mm"));
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <TabsContent value="bookings" className="space-y-6 p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Loading bookings...</p>
          </div>
        </div>
      </TabsContent>
    );
  }

  if (error) {
    return (
      <TabsContent value="bookings" className="space-y-6 p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading bookings: {error}
            <Button
              variant="outline"
              size="sm"
              className="ml-4"
              onClick={fetchData}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </TabsContent>
    );
  }

  return (
    <TabsContent value="bookings" className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <h2 className="text-2xl font-bold text-gray-800">Room Bookings</h2>
        <div className="flex flex-wrap gap-2">
          {/* Date Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : "Filter by date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
              />
            </PopoverContent>
          </Popover>

          {selectedDate && (
            <Button
              variant="outline"
              className="text-gray-600"
              onClick={() => setSelectedDate(undefined)}
            >
              Clear Filter
            </Button>
          )}

          {/* New Booking */}
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Booking
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md p-6">
              <DialogHeader>
                <DialogTitle>
                  {editingBooking ? "Edit Booking" : "Create New Booking"}
                </DialogTitle>
                <DialogDescription>
                  {editingBooking
                    ? "Update the booking details"
                    : "Book a room for a customer"}
                </DialogDescription>
              </DialogHeader>

              {formError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4 py-4">
                {/* Customer & Room */}
                <div className="grid gap-2">
                  <Label htmlFor="customerId">Customer ID *</Label>
                  <Input
                    id="customerId"
                    placeholder="Enter customer ID"
                    value={newBooking.customerId}
                    onChange={(e) =>
                      setNewBooking({
                        ...newBooking,
                        customerId: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="roomId">Room ID *</Label>
                  <Input
                    id="roomId"
                    placeholder="Enter room ID"
                    value={newBooking.roomId}
                    onChange={(e) =>
                      setNewBooking({ ...newBooking, roomId: e.target.value })
                    }
                  />
                </div>

                {/* Date & Time */}
                <div className="grid gap-2">
                  <Label>Booking Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="justify-start text-left font-normal gap-2"
                      >
                        <CalendarIcon className="h-4 w-4" />
                        {bookingDate
                          ? format(bookingDate, "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={bookingDate}
                        onSelect={setBookingDate}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={newBooking.status}
                    onValueChange={(value) =>
                      setNewBooking({ ...newBooking, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Confirmed">Confirmed</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button onClick={handleSaveBooking} disabled={isSaving}>
                  {isSaving
                    ? editingBooking
                      ? "Updating..."
                      : "Creating..."
                    : editingBooking
                    ? "Update Booking"
                    : "Create Booking"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Booking Table */}
      {bookings.length === 0 ? (
        <Card className="mt-6 p-6 text-center">
          <CardContent>
            <div className="text-gray-500">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No bookings found</p>
              <p className="text-sm">
                {selectedDate
                  ? `No bookings for ${format(selectedDate, "PPP")}`
                  : "Create your first booking to get started"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mt-6 overflow-x-auto">
          <CardContent className="p-0">
            <Table className="min-w-full divide-y divide-gray-200">
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="px-4 py-3 text-left text-gray-700">
                    Booking ID
                  </TableHead>
                  <TableHead className="px-4 py-3 text-left text-gray-700">
                    Customer
                  </TableHead>
                  <TableHead className="px-4 py-3 text-left text-gray-700">
                    Room
                  </TableHead>
                  <TableHead className="px-4 py-3 text-left text-gray-700">
                    Date & Time
                  </TableHead>
                  <TableHead className="px-4 py-3 text-left text-gray-700">
                    Duration
                  </TableHead>
                  <TableHead className="px-4 py-3 text-left text-gray-700">
                    Status
                  </TableHead>
                  <TableHead className="px-4 py-3 text-left text-gray-700">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => {
                  let duration = "N/A";
                  let dateDisplay = "Invalid Date";
                  let timeDisplay = "";

                  try {
                    const start = new Date(booking.timeSlot.startAt);
                    const end = new Date(booking.timeSlot.endAt);

                    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                      duration = `${(
                        (end.getTime() - start.getTime()) /
                        (1000 * 60 * 60)
                      ).toFixed(2)}h`;
                      dateDisplay = format(start, "PPP");
                      timeDisplay = `${format(start, "HH:mm")} - ${format(
                        end,
                        "HH:mm"
                      )}`;
                    }
                  } catch (error) {
                    console.error("Date parsing error:", error);
                  }

                  return (
                    <TableRow
                      key={booking.bookingId}
                      className="hover:bg-gray-50 transition"
                    >
                      <TableCell className="px-4 py-3 font-medium text-gray-800">
                        {booking.bookingId}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-700">
                        {booking.customerId}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-700">
                        {booking.roomId}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-700">
                        <div>{dateDisplay}</div>
                        <div className="text-sm text-gray-500">
                          {timeDisplay}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-700">
                        {duration}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {getStatusBadge(booking.status)}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditBooking(booking)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              handleCancelBooking(booking.bookingId)
                            }
                            disabled={isDeleting === booking.bookingId}
                          >
                            {isDeleting === booking.bookingId
                              ? "Canceling..."
                              : "Cancel"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </TabsContent>
  );
}
