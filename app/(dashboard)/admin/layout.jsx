import Sidebar from "@/app/components/sidebar/Sidebar";

export default function DashboardLayout({ children }) {
  // In a real app, you would get this from your auth context
  const mockUser = {
    name: "John Doe",
    email: "john@example.com",
    role: "Admin"
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar user={mockUser} />
        
        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="p-4 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}