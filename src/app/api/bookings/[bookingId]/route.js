import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";

// 🧾 GET /api/bookings/[bookingId]
export async function GET(request, { params }) {
  try {
    const bookingId = params.bookingId;
    const collection = await getCollection("bookings");
    const booking = await collection.findOne({ bookingId });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: booking });
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

// ❌ DELETE /api/bookings/[bookingId]
export async function DELETE(request, { params }) {
  try {
    const bookingId = params.bookingId;
    const collection = await getCollection("bookings");
    const roomCollection = await getCollection("rooms");

    const booking = await collection.findOne({ bookingId });
    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    const result = await collection.deleteOne({ bookingId });
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Failed to delete booking" },
        { status: 500 }
      );
    }

    if (["Active", "Confirmed"].includes(booking.status)) {
      await roomCollection.updateOne(
        { roomId: booking.roomId },
        { $set: { available: true } }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Booking ${bookingId} deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete booking" },
      { status: 500 }
    );
  }
}

// ✏️ PUT /api/bookings/[bookingId]
export async function PUT(request, { params }) {
  try {
    const bookingId = params.bookingId;
    const body = await request.json();
    const collection = await getCollection("bookings");
    const roomCollection = await getCollection("rooms");

    const existingBooking = await collection.findOne({ bookingId });
    if (!existingBooking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    const { _id, ...rest } = existingBooking;

    let duration = rest.duration;
    let totalPrice = rest.totalPrice;
    if (body.timeSlot?.startAt && body.timeSlot?.endAt) {
      const startAt = new Date(body.timeSlot.startAt);
      const endAt = new Date(body.timeSlot.endAt);
      duration = (endAt - startAt) / (1000 * 60 * 60);

      const roomId = body.roomId || rest.roomId;
      const room = await roomCollection.findOne({ roomId });
      totalPrice = room ? room.pricePerHour * duration : 0;
    }

    const updatedBooking = {
      ...rest,
      customerId: body.customerId || rest.customerId,
      roomId: body.roomId || rest.roomId,
      timeSlot: body.timeSlot || rest.timeSlot,
      duration,
      totalPrice,
      status: body.status || rest.status,
      bookingAt: body.timeSlot?.startAt
        ? new Date(body.timeSlot.startAt)
        : rest.bookingAt,
      updatedAt: new Date(),
    };

    const result = await collection.updateOne(
      { bookingId },
      { $set: updatedBooking }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Failed to update booking" },
        { status: 500 }
      );
    }

    // Update room availability
    if (body.status && body.status !== rest.status) {
      const oldRoomId = rest.roomId;
      const newRoomId = updatedBooking.roomId;

      if (["Active", "Confirmed"].includes(rest.status)) {
        await roomCollection.updateOne(
          { roomId: oldRoomId },
          { $set: { available: true } }
        );
      }

      if (["Active", "Confirmed"].includes(body.status)) {
        await roomCollection.updateOne(
          { roomId: newRoomId },
          { $set: { available: false } }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Booking ${bookingId} updated successfully`,
      data: updatedBooking,
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update booking" },
      { status: 500 }
    );
  }
}
