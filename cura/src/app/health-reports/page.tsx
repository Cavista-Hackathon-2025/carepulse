"use client";

import { useState } from "react";
import { LayoutDashboard, FileText, Utensils, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import Sidebar from "@/components/sidebar";

const data = [
  { day: "Mon", calories: 1800, weight: 70 },
  { day: "Tue", calories: 2000, weight: 70.5 },
  { day: "Wed", calories: 1750, weight: 70.2 },
  { day: "Thu", calories: 1850, weight: 70.4 },
  { day: "Fri", calories: 1900, weight: 70.3 },
  { day: "Sat", calories: 1950, weight: 70.1 },
  { day: "Sun", calories: 2100, weight: 70.0 },
];

export default function page() {
  const [activeSection, setActiveSection] = useState("dashboard");

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar/>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {activeSection === "dashboard" && (
          <div>
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card><CardContent className="p-4"><h2 className="text-lg font-semibold">Calories This Week</h2><p className="text-2xl font-bold">13,400 kcal</p></CardContent></Card>
              <Card><CardContent className="p-4"><h2 className="text-lg font-semibold">Average Weight</h2><p className="text-2xl font-bold">70.3 kg</p></CardContent></Card>
              <Card><CardContent className="p-4"><h2 className="text-lg font-semibold">Hydration Level</h2><p className="text-2xl font-bold">2.5L/day</p></CardContent></Card>
            </div>
            <h2 className="text-xl font-semibold mb-2">Weekly Trends</h2>
            <Card>
              <CardContent className="p-4">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="calories" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="weight" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSection === "health-report" && (
          <div>
            <h1 className="text-2xl font-bold mb-4">Health Report</h1>
            <Card><CardContent className="p-4"><h2 className="text-lg font-semibold">Blood Pressure</h2><p className="text-2xl font-bold">120/80 mmHg</p></CardContent></Card>
            <Card><CardContent className="p-4"><h2 className="text-lg font-semibold">Heart Rate</h2><p className="text-2xl font-bold">75 BPM</p></CardContent></Card>
            <Card><CardContent className="p-4"><h2 className="text-lg font-semibold">Glucose Level</h2><p className="text-2xl font-bold">90 mg/dL</p></CardContent></Card>
            <h2 className="text-xl font-semibold mt-4">Health Summary</h2>
            <p className="text-gray-700">Your vitals are within a healthy range. Keep maintaining a balanced diet and regular exercise.</p>
          </div>
        )}

        {activeSection === "nutrition-tracker" && (
          <div>
            <h1 className="text-2xl font-bold mb-4">Nutrition Tracker</h1>
            <Card><CardContent className="p-4"><h2 className="text-lg font-semibold">Today's Calories</h2><p className="text-2xl font-bold">1850 kcal</p></CardContent></Card>
            <Card><CardContent className="p-4"><h2 className="text-lg font-semibold">Protein Intake</h2><p className="text-2xl font-bold">90g</p></CardContent></Card>
            <Card><CardContent className="p-4"><h2 className="text-lg font-semibold">Carbs Intake</h2><p className="text-2xl font-bold">220g</p></CardContent></Card>
            <h2 className="text-xl font-semibold mt-4">Meal History</h2>
            <ul className="list-disc ml-6 text-gray-700">
              <li>Breakfast: Oatmeal & Banana - 400 kcal</li>
              <li>Lunch: Grilled Chicken & Rice - 600 kcal</li>
              <li>Dinner: Salmon & Vegetables - 850 kcal</li>
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
