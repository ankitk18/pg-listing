import { connectToDatabase } from "@/lib/db";
import PgList from "@/models/PgModel";

export async function GET(request) {
  try {
    await connectToDatabase();
    const pgs = await PgList.find().sort({ createdAt: -1 });
    return Response.json(pgs, { status: 200 });
  } catch (error) {
    console.error("GET error:", error);
    return Response.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const {
      name,
      nearByCollege,
      address,
      rent,
      description,
      images,
      amenities,
      userId,
    } = body;
// Validate required fields
    if (!name || !nearByCollege || !address || !rent || !userId) {
      return Response.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }
    const newPg = await PgList.create({
      name,
      nearByCollege,
      address,
      rent,
      description,
      images,
      amenities,
      userId,
    });

    return Response.json(newPg, { status: 201 });
  } catch (error) {
    return Response.json(
      { message: "Failed to create PG listing", error: error.message },
      { status: 500 }
    );
  }
}
