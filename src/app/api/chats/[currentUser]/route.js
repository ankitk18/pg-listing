import Chat from "@/models/chatModel";
import { connectToDatabase } from "@/lib/db";


export async function GET(request,{params}) {
    try {
        await connectToDatabase();
        const {currentUser} = await params;
        const chats = await Chat.find({ participants: currentUser });
        return Response.json(chats, { status: 200 });


    } catch (error) {
        console.error("GET error:", error);
        return Response.json({ message: "Internal Server Error" }, { status: 500 });
    }
}