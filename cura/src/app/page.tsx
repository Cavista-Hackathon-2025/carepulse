"use client"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function LandingPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">CURA</h1>
        <div>
          <Button onClick={() => setIsLogin(true)} variant="outline" className="mr-2">Login</Button>
          <Button onClick={() => setIsLogin(false)}>Sign Up</Button>
        </div>
      </nav>
      
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
        <h2 className="text-4xl font-bold text-gray-800">Your Health, Our Priority</h2>
        <p className="text-gray-600 mt-2">AI-powered health analysis and meal planning made easy.</p>
        <Button className="mt-4 px-6 py-3 text-lg">Get Started</Button>
      </div>
      
      {/* Authentication Modal */}
      {isLogin !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
            <h3 className="text-xl font-semibold">{isLogin ? "Login" : "Sign Up"}</h3>
            <Input placeholder="Email" className="mt-4" />
            <Input placeholder="Password" type="password" className="mt-2" />
            <Button className="mt-4 w-full">{isLogin ? "Login" : "Sign Up"}</Button>
            <p className="text-sm text-gray-500 mt-2 cursor-pointer" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
