'use client'
import React, { useState, useEffect } from 'react';
import { Home, FileText, Utensils, Activity, ScanIcon as Scanner, Settings, Bell, Flame, Salad, ShieldCheck, Clock, TrendingUp, ChevronRight, Plus, Trophy, Apple, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import Sidebar from '@/components/sidebar';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from "@/components/ui/badge";

interface DashboardStats {
  caloriesConsumed: number;
  mealPlanProgress: number;
  foodSafetyAlerts: number;
  nextMealTime: string;
  dailyGoal: number;
  weeklyProgress: any[];
  recentMeals: any[];
  achievements: any[];
}

export default function Dashboard() {
  const { user } = useUser();
  const [stats, setStats] = useState<DashboardStats>({
    caloriesConsumed: 1850,
    mealPlanProgress: 75,
    foodSafetyAlerts: 0,
    nextMealTime: '12:30 PM',
    dailyGoal: 2200,
    weeklyProgress: [
      { day: 'Mon', calories: 2100 },
      { day: 'Tue', calories: 1950 },
      { day: 'Wed', calories: 2200 },
      { day: 'Thu', calories: 1850 },
      { day: 'Fri', calories: 2000 },
      { day: 'Sat', calories: 1900 },
      { day: 'Sun', calories: 1850 }
    ],
    recentMeals: [
      { name: 'Breakfast', time: '8:00 AM', calories: 450, status: 'completed' },
      { name: 'Lunch', time: '12:30 PM', calories: 650, status: 'upcoming' },
      { name: 'Dinner', time: '7:00 PM', calories: 750, status: 'planned' }
    ],
    achievements: [
      { title: 'Health Streak', description: '7 days of meeting nutrition goals', progress: 5 },
      { title: 'Balanced Diet', description: 'Perfect macro balance achieved', progress: 80 },
      { title: 'Meal Planner', description: 'Created 5 custom meal plans', progress: 60 }
    ]
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  }, [user]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Welcome back, {user?.firstName}! 👋</h2>
              <p className="text-gray-500 mt-1">Here's your nutrition overview for today</p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Log Meal
              </Button>
              <Button variant="outline" size="icon"><Bell className="h-4 w-4" /></Button>
            </div>
          </header>

          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-none">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-green-800">Calories Today</CardTitle>
                <Flame className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">{stats.caloriesConsumed}</div>
                <Progress value={(stats.caloriesConsumed / stats.dailyGoal) * 100} className="mt-2" />
                <p className="text-xs text-green-700 mt-2">Goal: {stats.dailyGoal} kcal</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Plan Progress</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.mealPlanProgress}%</div>
                <Progress value={stats.mealPlanProgress} className="mt-2" />
                <p className="text-xs text-gray-500 mt-2">Weekly target: On track</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Next Meal</CardTitle>
                <Clock className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.nextMealTime}</div>
                <p className="text-xs text-gray-500 mt-2">Lunch - 650 kcal planned</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-none">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-blue-800">Health Score</CardTitle>
                <Trophy className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">92/100</div>
                <Progress value={92} className="mt-2" />
                <p className="text-xs text-blue-700 mt-2">Great progress this week!</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Weekly Progress Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Weekly Nutrition Tracking</CardTitle>
                <CardDescription>Your calorie intake over the past week</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.weeklyProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="calories" stroke="#22c55e" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Meals */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Meals</CardTitle>
                <CardDescription>Your meal schedule for today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentMeals.map((meal, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          meal.status === 'completed' ? 'bg-green-100' :
                          meal.status === 'upcoming' ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <Utensils className={`h-4 w-4 ${
                            meal.status === 'completed' ? 'text-green-600' :
                            meal.status === 'upcoming' ? 'text-blue-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium">{meal.name}</p>
                          <p className="text-sm text-gray-500">{meal.time}</p>
                        </div>
                      </div>
                      <Badge variant={
                        meal.status === 'completed' ? 'default' :
                        meal.status === 'upcoming' ? 'secondary' : 'outline'
                      }>
                        {meal.calories} kcal
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Achievements Section */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>Your nutrition and health milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {stats.achievements.map((achievement, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        <h3 className="font-semibold">{achievement.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                      <Progress value={achievement.progress} className="h-2" />
                      <p className="text-xs text-gray-500 mt-2">{achievement.progress}% Complete</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}