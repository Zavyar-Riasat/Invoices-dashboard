import clientPromise from "@/lib/mongodb";
import bcrypt from "bcrypt";

export async function POST(req) {
  const { name, email, password } = await req.json();

  const client = await clientPromise;
  const db = client.db();

  const existingUser = await db
    .collection("users")
    .findOne({ email });

  if (existingUser) {
    return Response.json(
      { message: "User already exists" },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.collection("users").insertOne({
    name,
  email,
  password: hashedPassword,
  provider: "credentials",
  role: "user", // default role
  createdAt: new Date(),
  });

  return Response.json({ message: "User created" });
}
