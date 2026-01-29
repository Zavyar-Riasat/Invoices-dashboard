"use client";

import { FiDollarSign, FiUsers, FiFileText, FiTrendingUp, FiMessageSquare, // Add this
  FiCheckCircle } from "react-icons/fi";

export default function DashboardPage() {
  const stats = [
  {
    title: "Total Revenue",
    value: "$45,231.89",
    change: "+20.1%",
    icon: <FiDollarSign className="text-green-500" size={24} />,
    color: "bg-green-50",
  },
  {
    title: "Total Clients",
    value: "2,350",
    change: "+180",
    icon: <FiUsers className="text-blue-500" size={24} />,
    color: "bg-blue-50",
  },
  {
    title: "Invoices",
    value: "12,234",
    change: "+19%",
    icon: <FiFileText className="text-purple-500" size={24} />,
    color: "bg-purple-50",
  },
  {
    title: "Expenses",
    value: "$9,234",
    change: "-2%",
    icon: <FiTrendingUp className="text-red-500" size={24} />,
    color: "bg-red-50",
  },
  {
    title: "Quoting",
    value: "156",
    change: "+23%",
    icon: <FiMessageSquare className="text-amber-500" size={24} />,
    color: "bg-amber-50",
  },
  {
    title: "Booking Confirmation",
    value: "89",
    change: "+45%",
    icon: <FiCheckCircle className="text-indigo-500" size={24} />,
    color: "bg-indigo-50",
  },
];

  const recentInvoices = [
    { id: 1, client: "Acme Corp", amount: "$2,500", status: "Paid", date: "2024-01-15" },
    { id: 2, client: "Globex", amount: "$3,200", status: "Pending", date: "2024-01-14" },
    { id: 3, client: "Soylent", amount: "$1,800", status: "Paid", date: "2024-01-13" },
    { id: 4, client: "Initech", amount: "$4,500", status: "Overdue", date: "2024-01-12" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your business.</p>
        </div>
        <button className="px-6 py-3 bg-secondary text-white rounded-lg font-medium hover:bg-primary transition-colors">
          + Create Invoice
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold mt-2">{stat.value}</p>
                <p className={`text-sm mt-2 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change} from last month
                </p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Invoices */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">Recent Invoices</h2>
          <p className="text-gray-600 text-sm mt-1">Latest invoices created</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Invoice ID</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Client</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Amount</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentInvoices.map((invoice) => (
                <tr key={invoice.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="p-4">INV-{invoice.id.toString().padStart(4, '0')}</td>
                  <td className="p-4 font-medium">{invoice.client}</td>
                  <td className="p-4 font-medium">{invoice.amount}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      invoice.status === 'Paid' 
                        ? 'bg-green-100 text-green-800' 
                        : invoice.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500">{invoice.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100">
          <button className="text-blue-600 hover:text-blue-800 font-medium">
            View all invoices →
          </button>
        </div>
      </div>
    </div>
  );
}