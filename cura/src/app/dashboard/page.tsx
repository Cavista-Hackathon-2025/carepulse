'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import Sidebar from '@/components/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, AlertCircle, Bell, Plus, Flame, Apple, Trophy, Calendar, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { fetchUserData, getFoodScans, getSummaries, getMealSchedules, getNotifications } from '@/action/fetchActions';
import { getOrCreateUser } from '@/lib/auth';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface DashboardStats {
  caloriesConsumed: number;
  mealPlanProgress: number;
  foodSafetyAlerts: number;
  nextMealTime: string;
  dailyGoal: number;
  weeklyProgress: any[];
  mealSchedules: any[];
  notifications: any[];
  healthScore: number;
}

export default function Dashboard() {
  const { user } = useUser();
  const [stats, setStats] = useState<DashboardStats>({
    caloriesConsumed: 0,
    mealPlanProgress: 0,
    foodSafetyAlerts: 0,
    nextMealTime: '',
    dailyGoal: 2000,
    weeklyProgress: [],
    mealSchedules: [],
    notifications: [],
    healthScore: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        await getOrCreateUser();
        const [userData, foodScans, summaries, mealSchedules, notifications] = await Promise.all([
          fetchUserData(),
          getFoodScans(user.id),
          getSummaries(user.id),
          getMealSchedules(user.id),
          getNotifications(user.id),
        ]);

        if (!userData.success) throw new Error(userData.error);

        // Process foodScans to calculate calories consumed today
        const today = new Date().toISOString().split('T')[0];
        const todaysFoodScans = foodScans.foodScans.filter((scan: any) => 
          scan.createdAt.split('T')[0] === today
        );
        const caloriesConsumed = todaysFoodScans.reduce((sum: number, scan: any) => 
          sum + (scan.calories || 0), 0
        );

        // Process weekly progress from summaries
        const weeklyProgress = processWeeklyProgress(summaries.summaries);

        // Get upcoming meals
        const upcomingMeals = mealSchedules.mealSchedules
          .filter((schedule: any) => new Date(schedule.mealTime) > new Date())
          .sort((a: any, b: any) => new Date(a.mealTime).getTime() - new Date(b.mealTime).getTime());

        setStats({
          caloriesConsumed,
          mealPlanProgress: calculateMealProgress(mealSchedules.mealSchedules),
          foodSafetyAlerts: notifications.notifications.filter((n: any) => n.type === 'health_alert').length,
          nextMealTime: upcomingMeals[0]?.mealTime || '',
          dailyGoal: userData.userData?.healthGoals?.dailyCalories || 2000,
          weeklyProgress,
          mealSchedules: upcomingMeals,
          notifications: notifications.notifications,
          healthScore: calculateHealthScore(summaries.summaries),
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  const calculateMealProgress = (schedules: any[]) => {
    const totalMeals = schedules.length;
    const completedMeals = schedules.filter((s: any) => new Date(s.mealTime) < new Date()).length;
    return totalMeals ? (completedMeals / totalMeals) * 100 : 0;
  };

  const calculateHealthScore = (summaries: any[]) => {
    if (!summaries.length) return 0;
    const latestSummary = summaries[0];
    return latestSummary.dietScore || 0;
  };

  const processWeeklyProgress = (summaries: any[]) => {
    // Process and return weekly progress data
    return summaries
      .filter((s: any) => s.type === 'daily')
      .slice(0, 7)
      .map((s: any) => ({
        day: new Date(s.date).toLocaleDateString('en-US', { weekday: 'short' }),
        calories: s.dietScore,
      }))
      .reverse();
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Sidebar />
        <main className="flex-1 p-8 overflow-auto flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading your nutrition dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Sidebar />
        <main className="flex-1 p-8 overflow-auto flex items-center justify-center">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <header className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Welcome back, {user?.firstName}! 👋</h2>
              <p className="text-gray-500 mt-1">Here's your nutrition overview for today</p>
            </div>
            <div className="flex gap-4">
              <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4" /> Log Meal
              </Button>
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                {stats.notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {stats.notifications.length}
                  </span>
                )}
              </Button>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-none shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-green-800">Calories Today</CardTitle>
                <Flame className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">{stats.caloriesConsumed}</div>
                <Progress 
                  value={(stats.caloriesConsumed / stats.dailyGoal) * 100} 
                  className="mt-2"
                  indicatorClassName="bg-gradient-to-r from-green-500 to-green-600"
                />
                <p className="text-xs text-green-700 mt-2">Goal: {stats.dailyGoal} kcal</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-none shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-blue-800">Health Score</CardTitle>
                <Trophy className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">{stats.healthScore}</div>
                <Progress 
                  value={stats.healthScore} 
                  className="mt-2"
                  indicatorClassName="bg-gradient-to-r from-blue-500 to-blue-600"
                />
                <p className="text-xs text-blue-700 mt-2">Based on your weekly average</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-none shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-purple-800">Next Meal</CardTitle>
                <Calendar className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-900">
                  {stats.nextMealTime ? new Date(stats.nextMealTime).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  }) : 'No meals scheduled'}
                </div>
                <p className="text-xs text-purple-700 mt-2">
                  {stats.mealSchedules[0]?.mealPlan?.name || 'Schedule your next meal'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-none shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-orange-800">Meal Plan Progress</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-900">{Math.round(stats.mealPlanProgress)}%</div>
                <Progress 
                  value={stats.mealPlanProgress} 
                  className="mt-2"
                  indicatorClassName="bg-gradient-to-r from-orange-500 to-orange-600"
                />
                <p className="text-xs text-orange-700 mt-2">Daily goals completed</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Nutrition Tracking</CardTitle>
                <CardDescription>Your calorie intake over the past week</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.weeklyProgress}>
                    <defs>
                      <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="calories" 
                      stroke="#22c55e" 
                      fillOpacity={1} 
                      fill="url(#colorCalories)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Meals</CardTitle>
                <CardDescription>Your scheduled meals for today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.mealSchedules.slice(0, 3).map((meal: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-full bg-green-100">
                          <Apple className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{meal.mealPlan.name || 'Scheduled Meal'}</h4>
                          <p className="text-sm text-gray-500">
                            {new Date(meal.mealTime).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">View Details</Button>
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