import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { Filter, Collection } from "mongodb";

interface Product {
  productId: string;
  name: string;
  price: number;
  category: string;
  description: string;
  available?: boolean;
  stock?: number;
  image?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// GET: Fetch products
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const available = searchParams.get("available");
    const search = searchParams.get("search");

    const collection = (await getCollection("products")) as Collection<Product>;

    // Then for the filter:
    const filter: Filter<Product> = {};
    if (category) filter.category = category;
    if (available !== null) filter.available = available === "true";
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const products = await collection
      .find(filter)
      .sort({ category: 1, name: 1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST: Create new product
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const collection = await getCollection("products");

    // Determine prefix based on category
    const prefix =
      body.category === "Food" ? "F" : body.category === "Drink" ? "D" : "S";

    // Get last product in the same category
    const lastInCategory = await collection.findOne<Product>(
      { productId: { $regex: `^${prefix}` } },
      { sort: { productId: -1 } }
    );

    // Generate new ID
    const newId = lastInCategory
      ? `${prefix}${String(
          parseInt(lastInCategory.productId.slice(1)) + 1
        ).padStart(3, "0")}`
      : `${prefix}001`;

    const product: Product = {
      productId: newId,
      name: body.name,
      price: body.price,
      category: body.category,
      description: body.description,
      available: true,
      stock: body.stock || 100,
      image: body.image || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(product);

    return NextResponse.json({
      success: true,
      message: "Product created successfully",
      data: { ...product, _id: result.insertedId },
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create product",
      },
      { status: 500 }
    );
  }
}

// PUT: Update a product
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const collection = await getCollection("products");

    if (!body.productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    const updateData = {
      name: body.name,
      price: body.price,
      category: body.category,
      description: body.description,
      available: body.available,
      stock: body.stock,
      image: body.image,
      updatedAt: new Date(),
    };

    await collection.updateOne(
      { productId: body.productId },
      { $set: updateData }
    );

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE: Remove a product
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    const collection = await getCollection("products");
    await collection.deleteOne({ productId });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
