import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";

export async function GET() {
  try {
    const collection = await getCollection("bookings");
    const bookings = await collection.find({}).toArray();
    return NextResponse.json({ success: true, data: bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const collection = await getCollection("bookings");

    // 1️⃣ Get the latest bookingId
    const lastBooking = await collection
      .find({})
      .sort({ bookingId: -1 }) // sort descending
      .limit(1)
      .toArray();

    let newBookingId = "B001"; // default if no bookings exist
    if (lastBooking.length > 0) {
      const lastId = lastBooking[0].bookingId; // e.g., "B021"
      const number = parseInt(lastId.replace("B", ""), 10) + 1; // increment
      newBookingId = "B" + number.toString().padStart(3, "0"); // e.g., B022
    }

    // 2️⃣ Create the new booking
    const newBooking = {
      bookingId: newBookingId,
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await collection.insertOne(newBooking);

    return NextResponse.json({
      success: true,
      message: "Booking created successfully",
      data: newBooking,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
