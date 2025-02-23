"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Trash2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Sidebar from "@/components/sidebar";

export default function MealPlannerPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  
  interface MealPlan {
    id: string;
    mealTime: string;
    healthGoals?: string[];
    mealPlan?: {
      totalCalories?: number;
      targetCalories?: number;
    };
  }

  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUser();
  const [healthReport, setHealthReport] = useState("");
  const [healthGoal, setHealthGoal] = useState("");

  useEffect(() => {
    fetchMealPlans();
  }, []);

  const fetchMealPlans = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/meal");
      const data = await response.json();
      if (data.success) {
        setMealPlans(data.mealPlans);
      } else {
        throw new Error("Failed to load meal plans");
      }
    } catch (err) {
      setError("Failed to load meal plans");
      toast({
        title: "Error",
        description: "Failed to load meal plans",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch("/api/meal", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await response.json();
      if (data.success) {
        setMealPlans(mealPlans.filter((plan) => plan.id !== id));
        toast({ title: "Success", description: "Meal plan deleted successfully" });
      } else {
        throw new Error("Failed to delete meal plan");
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete meal plan", variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <Sidebar className="w-full md:w-1/4 lg:w-1/5" />
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Meal Planner</h1>
          <Button onClick={() => router.push("/meal/create")} className="mt-2 md:mt-0 gap-2">
            <Plus className="w-4 h-4" />
            Create Plan
          </Button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            className="pl-10 w-full"
            placeholder="Search by health goals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading ? (
          <p>Loading meal plans...</p>
        ) : mealPlans.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mealPlans.map((plan) => (
              <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{new Date(plan.mealTime).toLocaleDateString()}</CardTitle>
                      <CardDescription>{plan.healthGoals?.join(", ") || "No goals specified"}</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(plan.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>Calories: {plan.mealPlan?.totalCalories || "N/A"} / {plan.mealPlan?.targetCalories || "N/A"}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No meal plans found.</p>
            <Button
              variant="outline"
              onClick={() => router.push("/meal-planner/create")}
              className="mt-4"
            >
              Create your first meal plan
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
