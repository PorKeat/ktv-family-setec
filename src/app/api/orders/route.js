import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    const status = searchParams.get("status");
    const date = searchParams.get("date");
    const bookingId = searchParams.get("bookingId");

    const collection = await getCollection("orders");

    // Build query filter
    const filter = {};
    if (customerId) filter.customerId = customerId;
    if (status) filter.status = status;
    if (bookingId) filter.bookingId = bookingId;
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      filter.orderDate = { $gte: startDate, $lte: endDate };
    }

    const orders = await collection
      .find(filter)
      .sort({ orderDate: -1 })
      .toArray();

    // Calculate total revenue
    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    return NextResponse.json({
      success: true,
      count: orders.length,
      totalRevenue,
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch orders",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const collection = await getCollection("orders");

    // Generate unique order ID
    const lastOrder = await collection.findOne({}, { sort: { orderId: -1 } });
    const newId = lastOrder
      ? `O${String(parseInt(lastOrder.orderId.slice(1)) + 1).padStart(3, "0")}`
      : "O001";

    // Get customer membership for discount
    const customerCollection = await getCollection("customers");
    const customer = await customerCollection.findOne({
      customerId: body.customerId,
    });

    let discount = 0;
    if (customer && customer.membershipId) {
      const membershipCollection = await getCollection("memberships");
      const membership = await membershipCollection.findOne({
        membershipId: customer.membershipId,
      });
      if (membership) {
        discount = (body.subtotal * membership.discount) / 100;
      }
    }

    const order = {
      orderId: newId,
      customerId: body.customerId,
      bookingId: body.bookingId || null,
      orderDate: new Date(),
      status: body.status || "Pending",
      orderDetails: body.orderDetails,
      subtotal: body.subtotal,
      discount: discount,
      totalAmount: body.subtotal - discount,
      paymentMethod: body.paymentMethod,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(order);

    // Update product stock
    const productCollection = await getCollection("products");
    for (const item of body.orderDetails) {
      await productCollection.updateOne(
        { productId: item.productId },
        { $inc: { stock: -item.quantity } }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order created successfully",
      data: { ...order, _id: result.insertedId },
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create order",
      },
      { status: 500 }
    );
  }
}
