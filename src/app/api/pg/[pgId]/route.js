import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import PgList from "@/models/PgModel";

export async function GET(request, { params }) {
  try {
    await connectToDatabase();

    const { pgId } = await params;
    if (!pgId) {
      return NextResponse.json({ error: "PG ID is required" }, { status: 400 });
    }
    const pg = await PgList.findById(pgId);
    if (!pg) {
      return Response.json({ error: "PG not found" }, { status: 404 });
    }
    return Response.json(
      {
        success: true,
        pg: {
          _id: pg._id,
          name: pg.name,
          nearByCollege: pg.nearByCollege,
          address: pg.address,
          rent: pg.rent,
          description: pg.description,
          images: pg.images,
          amenities: pg.amenities,
          userId: pg.userId,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching PGs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
