'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, History, ChevronDown, ChevronRight, Clock, Flame } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Sidebar from '@/components/sidebar';
import { fetchMealPlan } from '@/action/fetchActions';

interface Meal {
  name: string;
  image: string;
  calories: number;
  prepTime?: string;
}

interface MealPlan {
  day: string;
  meals: Meal[];
  totalCalories: number;
}

const MealCard = ({ meal }: { meal: Meal }) => (
  <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg">
    <div className="relative">
      <div className="aspect-video w-full overflow-hidden rounded-t-lg">
        <img 
          src={meal.image} 
          alt={meal.name} 
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" 
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </div>
    <CardContent className="p-4">
      <h3 className="font-semibold text-gray-900">{meal.name}</h3>
      <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <Flame className="h-4 w-4 text-orange-500" />
          <span>{meal.calories} kcal</span>
        </div>
        {meal.prepTime && (
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-blue-500" />
            <span>{meal.prepTime}</span>
          </div>
        )}
      </div>
      <Button 
        variant="ghost" 
        className="mt-3 w-full justify-between"
      >
        View Recipe
        <ChevronRight className="h-4 w-4" />
      </Button>
    </CardContent>
  </Card>
);

const LoadingMealCard = () => (
  <Card className="overflow-hidden">
    <Skeleton className="aspect-video w-full" />
    <CardContent className="p-4">
      <Skeleton className="h-6 w-3/4" />
      <div className="mt-2 flex justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="mt-3 h-9 w-full" />
    </CardContent>
  </Card>
);

export default function MealPlannerPage() {
  const { user } = useUser();
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('today');

  useEffect(() => {
    if (user) fetchMealPlanData();
  }, [user, selectedDay]);

  const fetchMealPlanData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchMealPlan(user?.id as string);
      setMealPlan(data.mealPlan);
    } catch (error) {
      console.error('Error fetching meal plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl p-8">
          <header className="flex flex-col gap-y-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold tracking-tight">Meal Planner</h2>
              <p className="text-muted-foreground">
                Personalized meal plan curated by ChefGPT based on your preferences
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="tomorrow">Tomorrow</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" className="relative">
                <History className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-500">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                </span>
              </Button>
            </div>
          </header>

          <div className="mt-8">
            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <LoadingMealCard key={i} />
                ))}
              </div>
            ) : mealPlan ? (
              <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {mealPlan.meals.map((meal, index) => (
                    <MealCard key={index} meal={meal} />
                  ))}
                </div>
                <Card className="mt-6">
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total Daily Calories</p>
                      <p className="text-2xl font-bold">{mealPlan.totalCalories} kcal</p>
                    </div>
                    <Button>
                      Generate Shopping List
                    </Button>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="p-6 text-center">
                <CardTitle className="text-red-500">
                  Failed to load meal plan
                </CardTitle>
                <Button 
                  onClick={fetchMealPlanData}
                  className="mt-4"
                >
                  Retry
                </Button>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}