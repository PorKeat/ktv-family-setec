import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const available = searchParams.get("available");
    const search = searchParams.get("search");

    const collection = await getCollection("products");

    // Build query filter
    const filter = {};
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

    // Group products by category
    const groupedProducts = products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      count: products.length,
      data: products,
      grouped: groupedProducts,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const collection = await getCollection("products");

    // Generate unique product ID
    const lastProduct = await collection.findOne(
      {},
      { sort: { productId: -1 } }
    );

    // Determine prefix based on category
    const prefix =
      body.category === "Food" ? "F" : body.category === "Drink" ? "D" : "S";

    // Get last product in same category
    const lastInCategory = await collection.findOne(
      { productId: { $regex: `^${prefix}` } },
      { sort: { productId: -1 } }
    );

    const newId = lastInCategory
      ? `${prefix}${String(
          parseInt(lastInCategory.productId.slice(1)) + 1
        ).padStart(3, "0")}`
      : `${prefix}001`;

    const product = {
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
