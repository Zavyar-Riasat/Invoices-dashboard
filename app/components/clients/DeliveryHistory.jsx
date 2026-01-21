// "use client";

// import { useState } from 'react';
// import { FiPackage, FiCheckCircle, FiClock, FiXCircle, FiCalendar, FiDollarSign } from 'react-icons/fi';
// import { format } from 'date-fns';

// const DeliveryHistory = ({ deliveries, clientId, onAddDelivery }) => {
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [newDelivery, setNewDelivery] = useState({
//     date: new Date().toISOString().split('T')[0],
//     amount: '',
//     status: 'completed',
//     notes: ''
//   });

//   const formatDate = (dateString) => {
//     try {
//       return format(new Date(dateString), 'MMM dd, yyyy');
//     } catch (error) {
//       return 'Invalid date';
//     }
//   };

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case 'completed':
//         return <FiCheckCircle className="text-green-500" />;
//       case 'pending':
//         return <FiClock className="text-yellow-500" />;
//       case 'cancelled':
//         return <FiXCircle className="text-red-500" />;
//       default:
//         return <FiPackage className="text-gray-500" />;
//     }
//   };

//   const handleAddDelivery = async () => {
//     if (!newDelivery.amount || isNaN(parseFloat(newDelivery.amount))) {
//       alert('Please enter a valid amount');
//       return;
//     }

//     try {
//       await onAddDelivery({
//         ...newDelivery,
//         amount: parseFloat(newDelivery.amount),
//         date: new Date(newDelivery.date)
//       });
      
//       setNewDelivery({
//         date: new Date().toISOString().split('T')[0],
//         amount: '',
//         status: 'completed',
//         notes: ''
//       });
//       setShowAddForm(false);
//     } catch (error) {
//       console.error('Error adding delivery:', error);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h3 className="text-xl font-semibold text-gray-900">Delivery History</h3>
//           <p className="text-gray-600">Track all deliveries for this client</p>
//         </div>
//         <button
//           onClick={() => setShowAddForm(!showAddForm)}
//           className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
//         >
//           <FiPackage />
//           Add Delivery
//         </button>
//       </div>

//       {/* Add Delivery Form */}
//       {showAddForm && (
//         <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
//           <h4 className="text-lg font-medium text-gray-900 mb-4">Add New Delivery</h4>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Date
//               </label>
//               <input
//                 type="date"
//                 value={newDelivery.date}
//                 onChange={(e) => setNewDelivery({ ...newDelivery, date: e.target.value })}
//                 className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Amount ($)
//               </label>
//               <input
//                 type="number"
//                 step="0.01"
//                 value={newDelivery.amount}
//                 onChange={(e) => setNewDelivery({ ...newDelivery, amount: e.target.value })}
//                 className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
//                 placeholder="0.00"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Status
//               </label>
//               <select
//                 value={newDelivery.status}
//                 onChange={(e) => setNewDelivery({ ...newDelivery, status: e.target.value })}
//                 className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
//               >
//                 <option value="completed">Completed</option>
//                 <option value="pending">Pending</option>
//                 <option value="cancelled">Cancelled</option>
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Notes
//               </label>
//               <input
//                 type="text"
//                 value={newDelivery.notes}
//                 onChange={(e) => setNewDelivery({ ...newDelivery, notes: e.target.value })}
//                 className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
//                 placeholder="Optional notes"
//               />
//             </div>
//           </div>
//           <div className="flex justify-end gap-3 mt-6">
//             <button
//               onClick={() => setShowAddForm(false)}
//               className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleAddDelivery}
//               className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2"
//             >
//               <FiCheckCircle />
//               Add Delivery
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Delivery List */}
//       <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//         {deliveries && deliveries.length > 0 ? (
//           <div className="divide-y divide-gray-100">
//             {deliveries.map((delivery, index) => (
//               <div key={index} className="p-6 hover:bg-gray-50 transition">
//                 <div className="flex justify-between items-start">
//                   <div className="flex items-start gap-4">
//                     <div className="mt-1">
//                       {getStatusIcon(delivery.status)}
//                     </div>
//                     <div>
//                       <div className="flex items-center gap-3">
//                         <h4 className="font-medium text-gray-900">
//                           Delivery #{deliveries.length - index}
//                         </h4>
//                         <span className={`px-2 py-1 text-xs font-medium rounded-full ${
//                           delivery.status === 'completed' 
//                             ? 'bg-green-100 text-green-800'
//                             : delivery.status === 'pending'
//                             ? 'bg-yellow-100 text-yellow-800'
//                             : 'bg-red-100 text-red-800'
//                         }`}>
//                           {delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1)}
//                         </span>
//                       </div>
//                       <div className="flex items-center gap-4 mt-2">
//                         <div className="flex items-center gap-2 text-gray-600">
//                           <FiCalendar size={14} />
//                           <span className="text-sm">{formatDate(delivery.date)}</span>
//                         </div>
//                         <div className="flex items-center gap-2 text-gray-600">
//                           <FiDollarSign size={14} />
//                           <span className="text-sm font-medium">${delivery.amount.toLocaleString()}</span>
//                         </div>
//                       </div>
//                       {delivery.notes && (
//                         <p className="mt-3 text-gray-700 bg-gray-50 p-3 rounded-lg text-sm">
//                           {delivery.notes}
//                         </p>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="p-12 text-center">
//             <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
//               <FiPackage className="text-gray-400 text-2xl" />
//             </div>
//             <h3 className="text-lg font-medium text-gray-900 mb-2">No Deliveries Yet</h3>
//             <p className="text-gray-600 mb-6">Start by adding the first delivery for this client</p>
//             <button
//               onClick={() => setShowAddForm(true)}
//               className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2 mx-auto"
//             >
//               <FiPackage />
//               Add First Delivery
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default DeliveryHistory;