import User from "@/models/userModel";
import { connectToDatabase } from "@/lib/db";

export async function POST(request) {
  await connectToDatabase();
  const {name, email, password, phone, profileUrl} = await request.json();
  try {
    const user = await User.signup(name, email, password, phone, profileUrl);
    return Response.json({ user }, { status: 201 });
  } catch (error) {
    return Response.json({ message: error.message }, { status: 400 });
  }
}
