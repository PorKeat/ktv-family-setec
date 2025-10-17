import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDatabase();

    // Today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Summary and today stats
    const [
      totalCustomers,
      totalRooms,
      availableRooms,
      todayBookings,
      activeBookings,
      todayOrders,
      todayRevenue,
    ] = await Promise.all([
      db.collection("customers").countDocuments(),
      db.collection("rooms").countDocuments(),
      db.collection("rooms").countDocuments({ available: true }),
      db.collection("bookings").countDocuments({
        bookingAt: { $gte: today, $lt: tomorrow },
      }),
      db.collection("bookings").countDocuments({ status: "Active" }),
      db.collection("orders").countDocuments({
        orderDate: { $gte: today, $lt: tomorrow },
      }),
      db
        .collection("orders")
        .aggregate([
          { $match: { orderDate: { $gte: today, $lt: tomorrow } } },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ])
        .toArray(),
    ]);

    // Popular products
    const popularProducts = await db
      .collection("orders")
      .aggregate([
        { $unwind: "$orderDetails" },
        {
          $group: {
            _id: "$orderDetails.productId",
            productName: { $first: "$orderDetails.productName" },
            totalQuantity: { $sum: "$orderDetails.quantity" },
            totalRevenue: { $sum: "$orderDetails.subtotal" },
          },
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 5 },
      ])
      .toArray();

    // Room utilization
    const roomUtilization = await db
      .collection("bookings")
      .aggregate([
        { $match: { bookingAt: { $gte: today, $lt: tomorrow } } },
        {
          $group: {
            _id: "$roomId",
            bookingCount: { $sum: 1 },
            totalHours: { $sum: "$duration" },
          },
        },
        { $sort: { totalHours: -1 } },
      ])
      .toArray();

    // Recent bookings (latest 5)
    const recentBookings = await db
      .collection("bookings")
      .aggregate([
        { $sort: { bookingAt: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "customers",
            localField: "customerId",
            foreignField: "customerId",
            as: "customer",
          },
        },
        { $unwind: "$customer" },
        {
          $lookup: {
            from: "rooms",
            localField: "roomId",
            foreignField: "roomId",
            as: "room",
          },
        },
        { $unwind: "$room" },
        {
          $project: {
            bookingId: 1,
            customerName: "$customer.name",
            roomName: "$room.name",
            startAt: "$timeSlot.startAt",
            endAt: "$timeSlot.endAt",
            status: 1,
          },
        },
      ])
      .toArray();

    // All rooms for room status
    const rooms = await db.collection("rooms").find().toArray();

    return NextResponse.json({
      success: true,
      dashboard: {
        summary: {
          totalCustomers,
          totalRooms,
          availableRooms,
          occupancyRate: totalRooms
            ? (((totalRooms - availableRooms) / totalRooms) * 100).toFixed(1)
            : 0,
        },
        today: {
          bookings: todayBookings,
          activeBookings,
          orders: todayOrders,
          revenue: todayRevenue[0]?.total || 0,
        },
        popularProducts,
        roomUtilization,
        recentBookings,
        rooms,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch dashboard data",
      },
      { status: 500 }
    );
  }
}
