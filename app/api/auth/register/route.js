import bcrypt from "bcrypt";
import dbConnect from "../../../lib/mongodb";
import User from "../../../lib/models/User";

export async function POST(req) {
  try {
    await dbConnect();

    const { email, password, name } = await req.json();

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return Response.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name: name || email.split("@")[0],
      email,
      password: hashedPassword,
      provider: "credentials",
      role: "admin",
    });

    return Response.json(
      { message: "User created successfully" },
      { status: 201 }
    );
  } catch (err) {
    console.error("Signup error:", err);
    return Response.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
