// "use client";

// import { useState } from "react";
// import { signIn } from "next-auth/react";
// import { MdEmail, MdVisibility, MdVisibilityOff } from "react-icons/md";
// import { FcGoogle } from "react-icons/fc";
// import Link from "next/link";

// export default function Signup() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   // Toggle password visibility
//   const togglePassword = () => setShowPassword(!showPassword);

//   // Email/Password Signup Handler
//   const handleEmailSignup = async (e) => {
//     e.preventDefault();
//     try {
//       setLoading(true);

//       const res = await fetch("/api/auth/signup", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         console.error("Signup error:", data.error);
//         alert(data.error);
//         return;
//       }

//       alert("Signup successful! Logging you in...");

//       // Automatic login after signup
//       await signIn("credentials", {
//         email,
//         password,
//         callbackUrl: "/admin/dashboard",
//       });

//       setEmail("");
//       setPassword("");
//     } catch (err) {
//       console.error("Unexpected signup error:", err);
//       alert("Something went wrong!");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Google Signup Handler
//   const handleGoogleSignup = async () => {
//     try {
//       setLoading(true);
//       await signIn("google", { callbackUrl: "/dashboard" });
//     } catch (err) {
//       console.error("Google signup error:", err);
//       alert("Google signup failed!");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-yellow-600 px-4">
//       <div className="bg-white shadow-2xl rounded-3xl w-full max-w-md p-10">
//         {/* Header */}
//         <h2 className="text-3xl font-extrabold text-center mb-2 text-gray-800">
//           Create Your Account
//         </h2>
//         <p className="text-center text-gray-500 mb-8">
//           Sign up to get started with your dashboard
//         </p>

//         {/* Google Signup */}
//         <button
//           onClick={handleGoogleSignup}
//           disabled={loading}
//           className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-medium py-3 px-4 rounded-lg mb-4 shadow-sm hover:shadow-md transition-all"
//         >
//           <FcGoogle className="text-2xl" />
//           {loading ? "Loading..." : "Continue with Google"}
//         </button>

//         {/* Divider */}
//         <div className="flex items-center my-6">
//           <hr className="flex-1 border-gray-300" />
//           <span className="mx-3 text-gray-400 text-sm">OR</span>
//           <hr className="flex-1 border-gray-300" />
//         </div>

//         {/* Email Signup Form */}
//         <form onSubmit={handleEmailSignup} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Email</label>
//             <div className="mt-1 relative rounded-md shadow-sm">
//               <input
//                 type="email"
//                 required
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="block w-full p-2 pr-10 border-yellow-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
//                 placeholder="you@example.com"
//               />
//               <MdEmail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">Password</label>
//             <div className="mt-1 relative">
//               <input
//                 type={showPassword ? "text" : "password"}
//                 required
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="block w-full p-2 pr-10 border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
//                 placeholder="••••••••"
//               />
//               <button
//                 type="button"
//                 onClick={togglePassword}
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl"
//               >
//                 {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
//               </button>
//             </div>
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-accent text-white py-3 rounded-lg hover:bg-yellow-700  shadow-sm hover:shadow-md transition-all font-medium"
//           >
//             {loading ? "Signing up..." : "Sign Up"}
//           </button>
//         </form>

//         {/* Footer */}
//         <p className="text-center text-gray-400 text-sm mt-4">
//           Already have an account?{" "}
//           <Link href="/login">
//             <span className="text-accent hover:underline cursor-pointer">
//               Log in
//             </span>
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }
export default function CreateSignupPage() {
  return <div />;
}
