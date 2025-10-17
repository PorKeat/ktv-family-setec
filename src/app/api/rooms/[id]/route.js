import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";

export async function PATCH(request, { params }) {
  try {
    const body = await request.json();
    const collection = await getCollection("rooms");

    const updateData = {
      ...body,
      updatedAt: new Date(),
    };

    const result = await collection.findOneAndUpdate(
      { roomId: params.id },
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: "Room not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: "Room updated successfully",
    });
  } catch (error) {
    console.error("Error updating room:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update room",
      },
      { status: 500 }
    );
  }
}