'use client'
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Sidebar from "@/components/sidebar";
import {
  Bell, Plus, Calendar, ChevronDown, History,
  Utensils, ArrowRight, Loader2, Scale, Clock,
  Sparkles, AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { fetchMealPlan, fetchUserData } from '@/action/fetchActions';
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Meal {
  name: string;
  image: string;
  calories: number;
  time: string;
  type: string;
  nutrients?: {
    protein?: number;
    carbs?: number;
    fats?: number;
  };
}

interface MealPlan {
  day: string;
  meals: Meal[];
  totalCalories: number;
  targetCalories: number;
  progress: number;
  healthScore?: number;
}

export default function EnhancedMealPlanner() {
  const { user } = useUser();
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('today');
  const [showHealthTip, setShowHealthTip] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, selectedDay]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [mealPlanData, userDataResponse] = await Promise.all([
        fetchMealPlan(user?.id as string),
        fetchUserData()
      ]);

      if (userDataResponse.success && userDataResponse.userData) {
        setUserData(userDataResponse.userData);
      }

      if (mealPlanData.success) {
        // Transform the meal plan data if needed
        const transformedMealPlan = transformMealPlanData(mealPlanData.mealPlan);
        setMealPlan(transformedMealPlan);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const transformMealPlanData = (data: any) => {
    // For demo purposes, using static data - replace with actual data transformation
    return {
      day: selectedDay,
      meals: [
        {
          name: "Protein-Packed Overnight Oats",
          image: "/api/placeholder/300/200",
          calories: 350,
          time: "8:00 AM",
          type: "Breakfast",
          nutrients: {
            protein: 15,
            carbs: 45,
            fats: 12
          }
        },
        {
          name: "Mediterranean Chicken Salad",
          image: "/api/placeholder/300/200",
          calories: 450,
          time: "12:30 PM",
          type: "Lunch",
          nutrients: {
            protein: 35,
            carbs: 25,
            fats: 15
          }
        },
        {
          name: "Herb-Crusted Salmon with Quinoa",
          image: "/api/placeholder/300/200",
          calories: 550,
          time: "7:00 PM",
          type: "Dinner",
          nutrients: {
            protein: 40,
            carbs: 35,
            fats: 22
          }
        }
      ],
      totalCalories: 1350,
      targetCalories: 2000,
      progress: 67.5,
      healthScore: 85
    };
  };

  const getHealthTip = () => {
    const tips = [
      "Try to eat protein with every meal to maintain steady energy levels.",
      "Include colorful vegetables to maximize your nutrient intake.",
      "Stay hydrated! Aim for 8 glasses of water daily.",
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  };

  const renderNutrientBadge = (value: number, label: string) => (
    <div className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1">
      <span className="text-xs font-medium text-gray-600">{label}</span>
      <span className="text-xs font-bold text-gray-800">{value}g</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showHealthTip && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <Sparkles className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {getHealthTip()}
            </AlertDescription>
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-auto" 
              onClick={() => setShowHealthTip(false)}
            >
              Dismiss
            </Button>
          </Alert>
        )}

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meal Planner</h1>
            <p className="text-gray-500 mt-2">
              {userData?.healthGoals ? 
                `Working towards: ${userData.healthGoals}` : 
                'Plan and track your daily nutrition goals'}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/meal-planner/create">
              <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4" />
                Create Meal Plan
              </Button>
            </Link>
            
            <Select value={selectedDay} onValueChange={setSelectedDay}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="tomorrow">Tomorrow</SelectItem>
                <SelectItem value="custom">Custom Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Daily Summary</span>
                  {mealPlan?.healthScore && (
                    <Badge className="bg-green-100 text-green-800">
                      Health Score: {mealPlan.healthScore}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Scale className="h-5 w-5 text-green-600" />
                      <span className="text-sm text-gray-600">Total Calories</span>
                    </div>
                    <span className="font-semibold">
                      {mealPlan?.totalCalories} / {mealPlan?.targetCalories}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-green-600 h-2.5 rounded-full transition-all duration-500" 
                      style={{ width: `${mealPlan?.progress ?? 0}%` }}
                    ></div>
                  </div>

                  <div className="pt-4">
                    <Badge variant="outline" className="mb-2">Meal Times</Badge>
                    {mealPlan?.meals.map((meal, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{meal.time}</span>
                        </div>
                        <span className="text-sm font-medium">{meal.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-6">
              {mealPlan?.meals.map((meal, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-6">
                      <img
                        src={meal.image}
                        alt={meal.name}
                        className="w-32 h-32 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <Badge className="bg-green-100 text-green-800 mb-2">{meal.type}</Badge>
                          <span className="text-sm text-gray-500">{meal.time}</span>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{meal.name}</h3>
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-2">
                            <Scale className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{meal.calories} kcal</span>
                          </div>
                        </div>
                        {meal.nutrients && (
                          <div className="flex gap-2">
                            {renderNutrientBadge(meal.nutrients.protein!, "Protein")}
                            {renderNutrientBadge(meal.nutrients.carbs!, "Carbs")}
                            {renderNutrientBadge(meal.nutrients.fats!, "Fats")}
                          </div>
                        )}
                      </div>
                      <Button variant="outline" className="ml-4">
                        View Recipe
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}