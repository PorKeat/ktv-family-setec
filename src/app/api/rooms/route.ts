import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
// Room interface
interface Room {
  _id?: ObjectId;
  roomId: string;
  name: string;
  type: string;
  pricePerHour: number;
  description: string;
  available: boolean;
  capacity: number;
  equipment?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Type for room filter
type RoomFilter = {
  available?: boolean;
  type?: string;
  capacity?: { $gte: number };
};

// GET all rooms
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const available = searchParams.get("available");
    const type = searchParams.get("type");
    const minCapacity = parseInt(searchParams.get("minCapacity") || "0");

    const collection = await getCollection("rooms");

    const filter: RoomFilter = {};
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
        error: error instanceof Error ? error.message : "Failed to fetch rooms",
      },
      { status: 500 }
    );
  }
}

// POST new room
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (
      !body.name ||
      !body.type ||
      body.pricePerHour == null ||
      body.capacity == null
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const collection = await getCollection("rooms");

    // Generate new roomId
    const lastRoom = await collection.findOne({}, { sort: { roomId: -1 } });
    const newId =
      lastRoom && lastRoom.roomId
        ? `R${String(parseInt(lastRoom.roomId.slice(1)) + 1).padStart(3, "0")}`
        : "R001";

    const room: Room = {
      roomId: newId,
      name: body.name,
      type: body.type,
      pricePerHour: Number(body.pricePerHour),
      description: body.description || "",
      available: true,
      capacity: Number(body.capacity),
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
        error: error instanceof Error ? error.message : "Failed to create room",
      },
      { status: 500 }
    );
  }
}

// PATCH room update
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { roomId } = body;

    if (!roomId) {
      return NextResponse.json(
        { success: false, error: "Room ID missing" },
        { status: 400 }
      );
    }

    const collection = await getCollection("rooms");

    const updatedRoom = { ...body, updatedAt: new Date() };

    const result = await collection.updateOne(
      { roomId },
      { $set: updatedRoom }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Room not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Room updated successfully",
      data: updatedRoom,
    });
  } catch (error) {
    console.error("Error updating room:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update room",
      },
      { status: 500 }
    );
  }
}

// DELETE room
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get("roomId");

    if (!roomId) {
      return NextResponse.json(
        { success: false, error: "Room ID missing" },
        { status: 400 }
      );
    }

    const collection = await getCollection("rooms");
    const result = await collection.deleteOne({ roomId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Room not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting room:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete room",
      },
      { status: 500 }
    );
  }
}
