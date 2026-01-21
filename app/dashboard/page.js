import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) return <h1>Not logged in</h1>;
if (session.user.role == "admin") {
    return <h1>This is admin page</h1>;
  }
  if (session.user.role !== "admin") {
    return <h1>Admins only</h1>;
  }

  return <h1>Admin Dashboard</h1>;
}
