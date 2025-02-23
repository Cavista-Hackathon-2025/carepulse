"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@clerk/nextjs";
import { Edit3, Loader2 } from "lucide-react";
import Sidebar from "@/components/sidebar";

export default function MealPlanPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [textInput, setTextInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [mealPlan, setMealPlan] = useState<string | null>(null);
  const [healthGoals, setHealthGoals] = useState("");
  const [mealTime, setMealTime] = useState("");

  const handleGenerateMealPlan = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please sign in to generate a meal plan",
        variant: "destructive",
      });
      return;
    }

    if (!textInput.trim() || !mealTime.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setMealPlan(null);
    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          healthReport: textInput,
          healthGoal: healthGoals ? healthGoals.split(",").map((goal) => goal.trim()) : [],
        }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setMealPlan(result.mealPlan);
        toast({
          title: "Success",
          description: "Meal plan generated successfully!",
        });
      } else {
        throw new Error(result.error || "Failed to generate meal plan");
      }
    } catch (error) {
      console.error("Error generating meal plan:", error);
      toast({
        title: "Error",
        description: "Failed to generate meal plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <h1 className="text-3xl font-bold mb-8">Generate Meal Plan</h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Meal Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="meal-time">Meal Time</Label>
                  <Input
                    id="meal-time"
                    type="datetime-local"
                    value={mealTime}
                    onChange={(e) => setMealTime(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="health-goals">Health Goals</Label>
                  <Input
                    id="health-goals"
                    placeholder="Enter health goals (comma-separated)"
                    value={healthGoals}
                    onChange={(e) => setHealthGoals(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="preferences">Dietary Preferences & Restrictions</Label>
                  <Textarea
                    id="preferences"
                    placeholder="Enter your dietary preferences, restrictions, or any specific requirements..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    className="h-32 mt-2"
                  />
                </div>

                <Button
                  onClick={handleGenerateMealPlan}
                  disabled={isGenerating || !textInput.trim() || !mealTime.trim()}
                  className="w-full"
                >
                  {isGenerating ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating Plan...
                    </div>
                  ) : (
                    "Generate Meal Plan"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {mealPlan && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Your Generated Meal Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{mealPlan}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
