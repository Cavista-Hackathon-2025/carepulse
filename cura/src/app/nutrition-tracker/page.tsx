'use client';

import { useState, useEffect } from "react";
import { 
  Flame, Beef, Plus, Trash2, ArrowUp, ArrowDown,
  Clock, Calendar 
} from "lucide-react";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchNutritionData } from "@/action/fetchActions";
import { useUser } from "@clerk/nextjs";

interface NutritionStats {
  calories: number;
  protein: number;
  carbs: number;
  goals: {
    calories: number;
    protein: number;
    carbs: number;
  };
}

interface MealEntry {
  id: string;
  name: string;
  timestamp: string;
}

const StatCard = ({ 
  title, 
  current, 
  goal, 
  icon: Icon, 
  unit,
  isLoading 
}: {
  title: string;
  current: number;
  goal: number;
  icon: any;
  unit: string;
  isLoading: boolean;
}) => {
  const percentage = (current / goal) * 100;
  const isOverGoal = current > goal;

  return (
    <Card>
      <CardContent className="pt-6">
        {isLoading ? (
          <>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-32" />
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{title}</span>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {current} {unit}
                </span>
                <span className={`flex items-center text-sm ${
                  isOverGoal ? 'text-red-500' : 'text-green-500'
                }`}>
                  {isOverGoal ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  {Math.abs(goal - current)} {unit}
                </span>
              </div>
              <Progress value={Math.min(percentage, 100)} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Goal: {goal} {unit}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default function NutritionTracker() {
  const [meal, setMeal] = useState("");
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [nutritionStats, setNutritionStats] = useState<NutritionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    if (user?.id) {
      const getNutritionData = async () => {
        try {
          const data = await fetchNutritionData(user.id);
          setNutritionStats(data);
        } catch (error) {
          console.error("Error fetching nutrition data:", error);
        } finally {
          setIsLoading(false);
        }
      };
      getNutritionData();
    }
  }, [user?.id]);

  const handleLogMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (meal.trim() !== "") {
      const newMeal: MealEntry = {
        id: Date.now().toString(),
        name: meal,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMeals([newMeal, ...meals]);
      setMeal("");
    }
  };

  const handleDeleteMeal = (id: string) => {
    setMeals(meals.filter(meal => meal.id !== id));
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl p-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Nutrition Tracker</h1>
            <p className="text-muted-foreground">Track your daily nutrition intake and goals</p>
          </header>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <StatCard
              title="Calories"
              current={nutritionStats?.calories || 0}
              goal={nutritionStats?.goals.calories || 2000}
              icon={Flame}
              unit="kcal"
              isLoading={isLoading}
            />
            <StatCard
              title="Protein"
              current={nutritionStats?.protein || 0}
              goal={nutritionStats?.goals.protein || 150}
              icon={Beef}
              unit="g"
              isLoading={isLoading}
            />
            <StatCard
              title="Carbs"
              current={nutritionStats?.carbs || 0}
              goal={nutritionStats?.goals.carbs || 250}
              icon={Beef}
              unit="g"
              isLoading={isLoading}
            />
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Log a Meal</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogMeal} className="flex gap-2">
                <Input
                  value={meal}
                  onChange={(e) => setMeal(e.target.value)}
                  placeholder="Enter meal (e.g., Chicken Salad)"
                  className="flex-1"
                />
                <Button type="submit">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Meal
                </Button>
              </form>
            </CardContent>
          </Card>

          {meals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Today's Meals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {meals.map((meal) => (
                    <div
                      key={meal.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{meal.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {meal.timestamp}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteMeal(meal.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
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