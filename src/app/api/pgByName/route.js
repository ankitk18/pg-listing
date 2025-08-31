import { connectToDatabase } from "@/lib/db";
import PgList from "@/models/PgModel";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const collegeName = searchParams.get("collegeName") || "";
  try {
    await connectToDatabase();
    const pgs = await PgList.find({
      nearByCollege: { $regex: collegeName, $options: "i" },
    }).sort({ createdAt: -1 });
    return Response.json(pgs, { status: 200 });
  } catch (error) {
    console.error("GET error:", error);
    return Response.json({ message: "Internal Server Error" }, { status: 500 });
  }
}