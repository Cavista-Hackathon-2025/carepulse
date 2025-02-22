'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, FileText, Settings, ScanIcon as Scanner, Activity, Utensils, Home, History, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import Sidebar from '@/components/sidebar';
import { fetchMealPlan } from '@/action/fetchActions';

interface Meal {
  name: string;
  image: string;
  calories: number;
}

interface MealPlan {
  day: string;
  meals: Meal[];
  totalCalories: number;
}

const Page = () => {
  const { user } = useUser();
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) fetchMealPlanData();
  }, [user]);

  const fetchMealPlanData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchMealPlan(user?.id as any);
      setMealPlan(data.mealPlan);
    } catch (error) {
      console.error('Error fetching meal plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Meal Planner</h2>
            <p className="text-gray-500">Based on your preference, ChefGPT has curated your meal intake for today.</p>
          </div>
          <div className="flex space-x-4">
            <Select>
              <SelectTrigger className="w-48 flex items-center border-gray-300 shadow-sm px-4 py-2 rounded-lg">
                <SelectValue placeholder="Select Day" />
                <ChevronDown className="ml-2 h-4 w-4" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monday">Monday</SelectItem>
                <SelectItem value="tuesday">Tuesday</SelectItem>
                <SelectItem value="wednesday">Wednesday</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="border-gray-300 shadow-sm">
              <History className="h-5 w-5 text-gray-700" />
            </Button>
            <Button variant="outline" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {isLoading ? (
          <p className="text-center text-gray-500">Loading meal plan...</p>
        ) : mealPlan ? (
          <div className="bg-white p-6 shadow-lg rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">{mealPlan.day}</h3>
            <div className="grid grid-cols-3 gap-6">
              {mealPlan.meals.map((meal, index) => (
                <div key={index} className="text-center bg-gray-100 p-4 rounded-lg shadow-md">
                  <img src={meal.image} alt={meal.name} className="rounded-lg shadow-sm" />
                  <p className="mt-2 font-medium text-gray-800">{meal.name}</p>
                  <p className="text-gray-500">{meal.calories} kcal</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-green-600 font-semibold">
              Total calories to be consumed: {mealPlan.totalCalories} kcal
            </p>
          </div>
        ) : (
          <p className="text-center text-red-500">Failed to load meal plan.</p>
        )}
      </main>
    </div>
  );
};

export default Page;
