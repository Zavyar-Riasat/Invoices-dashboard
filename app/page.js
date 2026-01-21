import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import Link from "next/link";

export default async function Home() {
  // 🔹 Get session on server
  const session = await getServerSession(authOptions);

  return (
    <div className="p-10 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Welcome to My App</h1>

      {/* 🔹 Check if user is logged in */}
      {session ? (
        <div>
          <p className="mb-2">Logged in as: {session.user.email}</p>
          <p className="mb-4">Role: {session.user.role}</p>

          {/* 🔹 Logout button */}
          <form action="/api/auth/signout" method="post">
            <button
              type="submit"
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </form>

          {/* 🔹 Link to Dashboard */}
          <Link href="/dashboard">
            <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
              Go to Dashboard
            </button>
          </Link>
        </div>
      ) : (
        <div>
          <p className="mb-4">You are not logged in</p>

          {/* 🔹 Google login */}
          <Link href="/login">
            <button className="mb-2 w-full bg-red-500 text-white p-2 rounded">
              Login with Google
            </button>
          </Link>

          {/* 🔹 Link to Signup page (we will make this later) */}
          <Link href="/signup">
            <button className="w-full bg-black text-white p-2 rounded mt-2">
              Signup / Login with Email
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
