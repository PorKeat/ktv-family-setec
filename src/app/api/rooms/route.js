import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const available = searchParams.get("available");
    const type = searchParams.get("type");
    const minCapacity = parseInt(searchParams.get("minCapacity") || "0");

    const collection = await getCollection("rooms");

    // Build query filter
    const filter = {};
    if (available !== null) filter.available = available === "true";
    if (type) filter.type = type;
    if (minCapacity > 0) filter.capacity = { $gte: minCapacity };

    const rooms = await collection.find(filter).sort({ roomId: 1 }).toArray();

    return NextResponse.json({
      success: true,
      count: rooms.length,
      data: rooms,
    });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch rooms",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const collection = await getCollection("rooms");

    // Generate unique room ID
    const lastRoom = await collection.findOne({}, { sort: { roomId: -1 } });
    const newId = lastRoom
      ? `R${String(parseInt(lastRoom.roomId.slice(1)) + 1).padStart(3, "0")}`
      : "R001";

    const room = {
      roomId: newId,
      name: body.name,
      type: body.type,
      pricePerHour: body.pricePerHour,
      description: body.description,
      available: true,
      capacity: body.capacity,
      equipment: body.equipment || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(room);

    return NextResponse.json({
      success: true,
      message: "Room created successfully",
      data: { ...room, _id: result.insertedId },
    });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create room",
      },
      { status: 500 }
    );
  }
}
