'use client'
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@clerk/nextjs";
import { Calendar, Clock, Camera, Upload, ChevronRight, AlertCircle, Loader2, Edit3 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createMealPlan, getMealPlan } from '@/action/meal';

export default function MealPlanPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("text");
  const [textInput, setTextInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [mealPlan, setMealPlan] = useState(null);
  const [healthGoals, setHealthGoals] = useState([]);
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

    if (!textInput.trim() || !mealTime) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await createMealPlan(user.id, healthGoals, {
        mealTime: new Date(mealTime),
      });

      if (result) {
        setMealPlan(result.mealPlan?.toString());
        toast({
          title: "Success",
          description: "Meal plan generated successfully!",
        });
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
      <main className="flex-1 p-8 overflow-auto">
        <h1 className="text-3xl font-bold mb-8">Generate Meal Plan</h1>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Meal Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="text" className="flex items-center gap-2">
                    <Edit3 className="h-4 w-4" />
                    Text Input
                  </TabsTrigger>
                  <TabsTrigger value="camera" className="flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Food Image
                  </TabsTrigger>
                  <TabsTrigger value="scan" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Scan Items
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="mt-4 space-y-4">
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
                      value={healthGoals.join(", ")}
                      onChange={(e) => setHealthGoals(e.target.value.split(",").map(g => g.trim()))}
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
                    disabled={isGenerating || !textInput.trim() || !mealTime}
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
                </TabsContent>

                <TabsContent value="camera" className="mt-4">
                  <div className="flex flex-col items-center gap-4">
                    <Button
                      variant="outline"
                      className="w-full h-32 border-dashed"
                      onClick={() => {/* Implement camera capture */}}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Camera className="h-8 w-8 text-muted-foreground" />
                        <span>Take a photo of ingredients</span>
                      </div>
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="scan" className="mt-4">
                  <div className="flex flex-col items-center gap-4">
                    <Button
                      variant="outline"
                      className="w-full h-32 border-dashed"
                      onClick={() => {/* Implement scanning */}}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <span>Scan ingredients or recipe</span>
                      </div>
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {mealPlan && (
            <Card>
              <CardHeader>
                <CardTitle>Your Meal Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(mealPlan).map(([mealType, details]) => (
                    <div key={mealType} className="border-b pb-4">
                      <h3 className="font-semibold capitalize mb-2">{mealType}</h3>
                      <p className="text-sm text-gray-600">{details}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}