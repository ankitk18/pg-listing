import User from "@/models/userModel";
import { connectToDatabase } from "@/lib/db";

export async function POST(request) {
  await connectToDatabase();
  const { email, password } = await request.json();

  try {
    const user = await User.login(email, password);
    return Response.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Login error:", error);
    return Response.json({ message: error.message }, { status: 400 });
  }
}