import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import type { Document } from "mongodb";

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

// GET all customers
export async function GET() {
  try {
    const collection = await getCollection<Customer>("customers");
    const data = await collection.find({}).toArray();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("❌ Error fetching customers:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

// POST new customer
export async function POST(req: Request) {
  try {
    const body: Partial<Customer> = await req.json();
    const collection = await getCollection<Customer>("customers");

    const customerId = `C${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(3, "0")}`;
    const newCustomer: Customer = {
      ...body,
      customerId,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Customer;

    const result = await collection.insertOne(newCustomer);
    if (result.insertedId) {
      newCustomer._id = result.insertedId.toString();
    }

    return NextResponse.json({
      success: true,
      data: newCustomer,
      message: "Customer created successfully",
    });
  } catch (error) {
    console.error("❌ Error creating customer:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create customer" },
      { status: 500 }
    );
  }
}
