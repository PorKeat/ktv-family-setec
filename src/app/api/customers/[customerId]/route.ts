// app/api/customers/[customerId]/route.ts
import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import type { Document } from "mongodb";

// Customer type definition
interface Customer extends Document {
  _id?: string;
  customerId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  membershipId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// ---------------- GET Customer by ID ----------------
export async function GET(
  _req: Request,
  { params }: { params: { customerId: string } }
) {
  try {
    const { customerId } = params;
    const collection = await getCollection<Customer>("customers");

    const customer = await collection.findOne({ customerId });

    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: customer });
  } catch (error) {
    console.error("❌ Error fetching customer:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch customer" },
      { status: 500 }
    );
  }
}

// ---------------- PUT Customer ----------------
export async function PUT(
  req: Request,
  { params }: { params: { customerId: string } }
) {
  try {
    const { customerId } = params;
    const body: Customer = await req.json();
    const collection = await getCollection<Customer>("customers");

    console.log("✏️ Replacing customer:", customerId, "with data:", body);

    // Validate required fields
    const requiredFields = [
      "customerId",
      "name",
      "email",
      "phone",
      "address",
      "membershipId",
    ];
    const missingFields = requiredFields.filter((field) => !body[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Ensure customerId in body matches URL
    if (body.customerId !== customerId) {
      return NextResponse.json(
        { success: false, message: "Customer ID in body does not match URL" },
        { status: 400 }
      );
    }

    // Check if customer exists
    const existingCustomer = await collection.findOne({ customerId });
    console.log("Existing customer:", existingCustomer);

    if (!existingCustomer) {
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 }
      );
    }

    // Replace the entire document
    const result = await collection.replaceOne(
      { customerId },
      {
        ...body,
        updatedAt: new Date(),
        createdAt: existingCustomer.createdAt || new Date(),
      },
      { upsert: false }
    );

    console.log("replaceOne result:", result);

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { ...body, updatedAt: new Date() },
      message: "Customer updated successfully",
    });
  } catch (error) {
    console.error("❌ Error updating customer:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update customer" },
      { status: 500 }
    );
  }
}

// ---------------- DELETE Customer ----------------
export async function DELETE(
  _req: Request,
  { params }: { params: { customerId: string } }
) {
  try {
    const { customerId } = params;
    const collection = await getCollection<Customer>("customers");

    console.log("🗑️ Deleting customer:", customerId);
    const result = await collection.deleteOne({ customerId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting customer:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete customer" },
      { status: 500 }
    );
  }
}
