import Message from "@/models/MessageModel";
import { connectToDatabase } from "@/lib/db";

export async function GET(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const currentUser = searchParams.get("currentUser");
    const targetedUserId = searchParams.get("targetedUserId");
    const targetedPgId = searchParams.get("targetedPgId");
    console.log("Fetching messagescfewdfwef for:", {
      currentUser,
      targetedUserId,
      targetedPgId,
    });
    const messages = await Message.find({
      participants: { $all: [currentUser, targetedUserId].sort() },
      pgId: targetedPgId,
    }).sort({ timeStamp: 1 }); // Sort messages by timestamp in ascending order
    return Response.json(messages, { status: 200 });
  } catch (error) {
    console.error("GET error:", error);
    return Response.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
