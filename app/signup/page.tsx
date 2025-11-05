"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { signUp } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<"traveler" | "creator">("traveler");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleUserTypeChange = (type: "traveler" | "creator") => {
    setUserType(type);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log("[Signup] submitting", {
        email,
        username,
        userType,
        hasFullName: Boolean(fullName),
      });
      const { data, error: signupError } = await signUp(email, password, userType, fullName, username);

      if (signupError) {
        console.error("[Signup] signUp error", signupError);
        setError((signupError as any)?.message ?? "Signup failed");
        setIsLoading(false);
      } else if (data?.user) {
        // Check if email confirmation is required
        if (data.session) {
          // User is immediately logged in
          console.log("[Signup] success with active session", { userId: data.user.id });
          router.push("/chat");
        } else {
          // Email confirmation required
          console.log("[Signup] success, email confirmation required", { userId: data.user.id });
          setSuccess(true);
          setIsLoading(false);
        }
      }
    } catch (err: any) {
      console.error("[Signup] unexpected error", err);
      setError(err.message || "An error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left: Signup Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-4 py-12 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Blue%20and%20White%20Abstract%20Travel%20Logo%20(4).png"
              alt="WanderAI Logo"
              className="mx-auto h-44 sm:h-60 w-auto"
            />
          </Link>
          <p className="text-gray-600 mt-2">Create your account</p>
        </div>

        {/* Signup Form */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
              Please check your email to verify your account.
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name Input */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all text-black"
                placeholder="John Doe"
              />
            </div>

            {/* Username Input */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                required
                autoComplete="username"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all text-black"
                placeholder="johndoe"
              />
              <p className="text-xs text-gray-500 mt-1">
                Only letters, numbers, and underscores
              </p>
            </div>

            {/* User Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleUserTypeChange("traveler")}
                  className={`py-3 px-4 rounded-lg border-2 transition-all duration-200 ${
                    userType === "traveler"
                      ? "border-black bg-black text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="font-semibold">Traveler</span>
                  <p className="text-xs mt-1 opacity-75">
                    Plan your trips
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => handleUserTypeChange("creator")}
                  className={`py-3 px-4 rounded-lg border-2 transition-all duration-200 ${
                    userType === "creator"
                      ? "border-black bg-black text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="font-semibold">Creator</span>
                  <p className="text-xs mt-1 opacity-75">
                    Share your journeys
                  </p>
                </button>
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all text-black"
                placeholder="you@example.com"
              />
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all text-black"
                placeholder="••••••••"
              />
              <p className="text-xs text-gray-500 mt-1">
                At least 8 characters
              </p>
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start">
              <input
                id="terms"
                type="checkbox"
                required
                className="w-4 h-4 mt-1 text-black border-gray-300 rounded focus:ring-black"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                I agree to the{" "}
                <Link href="/terms" className="text-black hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-black hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 flex items-center">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-sm text-gray-500">or</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Social Signup */}
          <div className="mt-6 space-y-3">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-sm font-medium text-gray-700">
                Continue with Google
              </span>
            </button>
          </div>
        </div>

        {/* Login Link */}
        <p className="text-center mt-6 mb-4 text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-black font-semibold hover:text-gray-600 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
      </div>

      {/* Right: Video */}
      <div className="hidden md:block md:sticky md:top-0 md:h-screen md:w-1/2 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {userType === "traveler" ? (
            <motion.div
              key="traveler"
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(10px)" }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full"
            >
              <video
                className="absolute inset-0 w-full h-full object-cover"
                src="/Travller.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
              />
            </motion.div>
          ) : (
            <motion.div
              key="creator"
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(10px)" }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full"
            >
              <video
                className="absolute inset-0 w-full h-full object-cover"
                src="/Creator.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

