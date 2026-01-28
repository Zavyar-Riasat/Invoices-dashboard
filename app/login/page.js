"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { MdEmail, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => setShowPassword(!showPassword);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res.error) {
        console.error("Login error:", res.error);
        alert(res.error);
      } else {
        window.location.href = "/admin/dashboard";
      }
    } catch (err) {
      console.error("Unexpected login error:", err);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signIn("google", { callbackUrl: "/admin/dashboard" });
    } catch (err) {
      console.error("Google login error:", err);
      alert("Google login failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-green-800 px-4">
      <div className="bg-white shadow-2xl rounded-3xl w-full max-w-md p-10">
        {/* Header */}
        <h1 className="text-4xl font-extrabold text-center mb-2 text-gray-800">
          Welcome Back
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Sign in to access your dashboard
        </p>

        {/* Google Login */}
        {/* <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-medium py-3 px-4 rounded-lg mb-6 shadow-sm hover:shadow-md transition-all"
        >
          <FcGoogle className="text-2xl" />
          {loading ? "Loading..." : "Continue with Google"}
        </button> */}

        {/* Divider */}
        {/* <div className="flex items-center my-6">
          <hr className="flex-1 border-gray-300" />
          <span className="mx-3 text-gray-400 text-sm">OR</span>
          <hr className="flex-1 border-gray-300" />
        </div> */}

        {/* Email/Password Login Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full p-2 pr-10 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="you@example.com"
              />
              <MdEmail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <div className="mt-1 relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full p-2 pr-10 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={togglePassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl"
              >
                {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white hover:cursor-pointer py-3 rounded-lg hover:bg-green-800 shadow-sm hover:shadow-md transition-all font-medium"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Footer */}
        {/* <p className="text-center text-gray-400 text-sm mt-6">
          Don’t have an account?{" "}
          <Link href="/signup">
            <span className="text-accent hover:underline cursor-pointer">
              Sign up
            </span>
          </Link>
        </p> */}
      </div>
    </div>
  );
}
