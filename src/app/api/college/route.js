import { connectToDatabase } from "@/lib/db";
import Colleges from "@/models/collegemodel";
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const collegeName = searchParams.get("collegeName");
    const state = searchParams.get("state");

    if (!collegeName) {
      return Response.json(
        { message: "collegeName query parameter is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const colleges = await Colleges.find({
      name: { $regex: new RegExp(collegeName, "i") },
      ...(state && { state: state }),
    }).sort({ createdAt: -1 });

    return Response.json(colleges, { status: 200 });
  } catch (error) {
    console.error("GET error:", error);
    return Response.json({ message: "Internal Server Error" }, { status: 500 });
  }
}