import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const active = searchParams.get("active");
    const customerId = searchParams.get("customerId");

    const collection = await getCollection("memberships");

    // Build query filter
    const filter = {};
    if (type) filter.type = type;
    if (customerId) filter.customerId = customerId;
    if (active === "true") {
      filter.expiryDate = { $gte: new Date() };
    }

    const memberships = await collection
      .find(filter)
      .sort({ expiryDate: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      count: memberships.length,
      data: memberships,
    });
  } catch (error) {
    console.error("Error fetching memberships:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch memberships",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const collection = await getCollection("memberships");

    // Generate unique membership ID
    const lastMembership = await collection.findOne(
      {},
      { sort: { membershipId: -1 } }
    );
    const newId = lastMembership
      ? `M${String(parseInt(lastMembership.membershipId.slice(1)) + 1).padStart(
          3,
          "0"
        )}`
      : "M001";

    // Set discount based on type
    const discountRates = {
      Bronze: 5,
      Silver: 10,
      Gold: 20,
      Platinum: 30,
    };

    const membership = {
      membershipId: newId,
      customerId: body.customerId,
      type: body.type,
      discount: discountRates[body.type] || 0,
      startDate: new Date(body.startDate || new Date()),
      expiryDate: new Date(body.expiryDate),
      benefits: body.benefits || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(membership);

    // Update customer with membership ID
    const customerCollection = await getCollection("customers");
    await customerCollection.updateOne(
      { customerId: body.customerId },
      { $set: { membershipId: newId } }
    );

    return NextResponse.json({
      success: true,
      message: "Membership created successfully",
      data: { ...membership, _id: result.insertedId },
    });
  } catch (error) {
    console.error("Error creating membership:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create membership",
      },
      { status: 500 }
    );
  }
}
