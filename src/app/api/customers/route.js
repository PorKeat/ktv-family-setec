import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "0");
    const sort = searchParams.get("sort") || "createdAt";
    const order = parseInt(searchParams.get("order") || "-1");
    const search = searchParams.get("search") || "";

    const collection = await getCollection("customers");

    // Build search filter
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const customers = await collection
      .find(filter)
      .sort({ [sort]: order })
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch customers",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const collection = await getCollection("customers");

    // Generate unique customer ID
    const lastCustomer = await collection.findOne(
      {},
      { sort: { customerId: -1 } }
    );

    const newId = lastCustomer
      ? `C${String(parseInt(lastCustomer.customerId.slice(1)) + 1).padStart(
          3,
          "0"
        )}`
      : "C001";

    const customer = {
      customerId: newId,
      name: body.name,
      email: body.email,
      phone: body.phone,
      address: body.address,
      membershipId: body.membershipId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(customer);

    return NextResponse.json({
      success: true,
      message: "Customer created successfully",
      data: { ...customer, _id: result.insertedId },
    });
  } catch (error) {
    console.error("Error creating customer:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create customer",
      },
      { status: 500 }
    );
  }
}
