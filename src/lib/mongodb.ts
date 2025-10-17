// lib/mongodb.ts
import { MongoClient, Db, Collection, Document } from "mongodb";
import {
  Customer,
  Room,
  Booking,
  Product,
  Order,
  Membership,
  DashboardStats,
  AllCollectionData,
} from "@/types/database";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env.local");
}

const uri: string = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName: string = process.env.DB_NAME || "KTV-Family";

const options = {
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 60000,
  serverSelectionTimeoutMS: 5000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement)
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise
export default clientPromise;

// Helper function to get database
export async function getDatabase(): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}

// Typed collection helpers
export async function getCustomersCollection(): Promise<Collection<Customer>> {
  const db = await getDatabase();
  return db.collection<Customer>("customers");
}

export async function getRoomsCollection(): Promise<Collection<Room>> {
  const db = await getDatabase();
  return db.collection<Room>("rooms");
}

export async function getBookingsCollection(): Promise<Collection<Booking>> {
  const db = await getDatabase();
  return db.collection<Booking>("bookings");
}

export async function getProductsCollection(): Promise<Collection<Product>> {
  const db = await getDatabase();
  return db.collection<Product>("products");
}

export async function getOrdersCollection(): Promise<Collection<Order>> {
  const db = await getDatabase();
  return db.collection<Order>("orders");
}

export async function getMembershipsCollection(): Promise<
  Collection<Membership>
> {
  const db = await getDatabase();
  return db.collection<Membership>("memberships");
}

// Generic helper function to get collections
export async function getCollection<T extends Document = Document>(
  collectionName: string
): Promise<Collection<T>> {
  const db = await getDatabase();
  return db.collection<T>(collectionName);
}

// Helper function to get all data from all collections with proper types
export async function getAllData(): Promise<AllCollectionData> {
  try {
    const db = await getDatabase();

    // Define collection names with their types
    const collectionQueries = [
      { name: "customers", collection: db.collection<Customer>("customers") },
      { name: "rooms", collection: db.collection<Room>("rooms") },
      { name: "bookings", collection: db.collection<Booking>("bookings") },
      { name: "products", collection: db.collection<Product>("products") },
      { name: "orders", collection: db.collection<Order>("orders") },
      {
        name: "memberships",
        collection: db.collection<Membership>("memberships"),
      },
    ];

    // Fetch all data in parallel
    const results = await Promise.all(
      collectionQueries.map(async ({ collection }) => {
        return await collection.find({}).toArray();
      })
    );

    // Map results to typed object
    const allData: AllCollectionData = {
      customers: results[0] as Customer[],
      rooms: results[1] as Room[],
      bookings: results[2] as Booking[],
      products: results[3] as Product[],
      orders: results[4] as Order[],
      memberships: results[5] as Membership[],
    };

    return allData;
  } catch (error) {
    console.error("Error fetching all data:", error);
    throw error;
  }
}

// Additional typed helper functions
export async function getCustomerById(
  customerId: string
): Promise<Customer | null> {
  const collection = await getCustomersCollection();
  return await collection.findOne({ customerId });
}

export async function getRoomById(roomId: string): Promise<Room | null> {
  const collection = await getRoomsCollection();
  return await collection.findOne({ roomId });
}

export async function getActiveBookings(): Promise<Booking[]> {
  const collection = await getBookingsCollection();
  return await collection.find({ status: "Active" }).toArray();
}

export async function getAvailableRooms(): Promise<Room[]> {
  const collection = await getRoomsCollection();
  return await collection.find({ available: true }).toArray();
}

export async function getCustomerOrders(customerId: string): Promise<Order[]> {
  const collection = await getOrdersCollection();
  return await collection
    .find({ customerId })
    .sort({ orderDate: -1 })
    .toArray();
}

export async function getProductsByCategory(
  category: "Food" | "Drink" | "Snack"
): Promise<Product[]> {
  const collection = await getProductsCollection();
  return await collection
    .find({ category, available: true })
    .sort({ name: 1 })
    .toArray();
}

// Calculate dashboard statistics
export async function getDashboardStats(): Promise<DashboardStats> {
  const allData = await getAllData();

  return {
    totalCustomers: allData.customers.length,
    totalRooms: allData.rooms.length,
    totalBookings: allData.bookings.length,
    totalProducts: allData.products.length,
    totalOrders: allData.orders.length,
    totalMemberships: allData.memberships.length,
    availableRooms: allData.rooms.filter((room) => room.available).length,
    activeBookings: allData.bookings.filter(
      (booking) => booking.status === "Active"
    ).length,
  };
}
