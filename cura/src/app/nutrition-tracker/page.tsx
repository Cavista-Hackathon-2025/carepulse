"use client";

import { useState } from "react";
import  Sidebar  from "@/components/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Home, Utensils, BarChart } from "lucide-react";

export default function NutritionTracker() {
  const [meal, setMeal] = useState("");
  const [meals, setMeals] = useState<string[]>([]);

  const handleLogMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (meal.trim() !== "") {
      setMeals([...meals, meal]);
      setMeal("");
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      {/* Main Content */}
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Nutrition Tracker</h1>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold">Calories</h2>
              <p className="text-2xl font-bold">1,800 kcal</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold">Protein</h2>
              <p className="text-2xl font-bold">80g</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold">Carbs</h2>
              <p className="text-2xl font-bold">200g</p>
            </CardContent>
          </Card>
        </div>

        {/* Meal Logger */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Log a Meal</h2>
          <form onSubmit={handleLogMeal} className="flex gap-2">
            <Input value={meal} onChange={(e) => setMeal(e.target.value)} placeholder="Enter meal (e.g., Chicken Salad)" />
            <Button type="submit">Log Meal</Button>
          </form>
        </div>

        {/* Logged Meals */}
        {meals.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-2">Logged Meals</h2>
              <ul className="list-disc pl-4">
                {meals.map((m, index) => (
                  <li key={index}>{m}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Health Insights */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Health Insights</h2>
          <Card>
            <CardContent className="p-4">
              <p>Calories Consumed: <strong>12,600 kcal</strong></p>
              <p>Protein Intake: <strong>560g</strong></p>
              <p>Carbs Intake: <strong>1,400g</strong></p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
