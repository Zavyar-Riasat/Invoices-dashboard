import bcrypt from "bcrypt";
import dbConnect from "../../../lib/mongodb";
import User from "../../../lib/models/User";

export async function POST(req) {
  await dbConnect();

  const { name, email, password } = await req.json();

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return Response.json({ message: "User already exists" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    password: hashedPassword,
    provider: "credentials",
    role: "admin",
  });

  return Response.json({ message: "User created" }, { status: 201 });
}
