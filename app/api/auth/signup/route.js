
import clientPromise from "../../../lib/mongodb";
import bcrypt from "bcrypt";

export async function POST(req) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email and password are required" }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return new Response(JSON.stringify({ error: "User already exists" }), { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    await db.collection("users").insertOne({
      name: name || email.split("@")[0],
      email,
      password: hashedPassword,
      role: "admin",
      provider: "credentials",
      createdAt: new Date(),
    });

    return new Response(JSON.stringify({ message: "User created successfully" }), { status: 201 });
  } catch (err) {
    console.error("Signup API error:", err);
    return new Response(JSON.stringify({ error: "Something went wrong" }), { status: 500 });
  }
}
