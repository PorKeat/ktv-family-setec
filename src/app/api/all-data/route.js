import { NextResponse } from "next/server";
import { getAllData, getDashboardStats } from "@/lib/mongodb";

export async function GET(request) {
  try {
    const allData = await getAllData(); // This was missing!
    const stats = await getDashboardStats();

    return NextResponse.json({
      success: true,
      data: allData,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching all data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
