'use client';

import { useState, useEffect } from 'react';
import { Home, FileText, Utensils, Activity, ScanIcon as Scanner, Settings, Bell, Flame, Salad, ShieldCheck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import Sidebar from '@/components/sidebar';

interface DashboardStats {
  caloriesConsumed: number;
  mealPlanProgress: number;
  foodSafetyAlerts: number;
  nextMealTime: string;
}

export default function Dashboard() {
  const { user } = useUser();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/dashboard');
      if (!response.ok) throw new Error('Failed to fetch dashboard stats');
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
        <Sidebar/>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold">Dashboard</h2>
            <p className="text-gray-500">Welcome back, {user?.firstName}!</p>
          </div>
          <Button variant="outline" size="icon"><Bell className="h-4 w-4" /></Button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Calories Consumed</CardTitle>
              <Flame className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <p>Loading...</p> : <div className="text-2xl font-bold">{stats?.caloriesConsumed || 0}</div>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Meal Plan Progress</CardTitle>
              <Salad className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <p>Loading...</p> : <Progress value={stats?.mealPlanProgress || 0} />}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Food Safety Alert</CardTitle>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <p>Loading...</p> : <div className="text-2xl font-bold">{stats?.foodSafetyAlerts || 0}</div>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Next Scheduled Meal</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <p>Loading...</p> : <div className="text-2xl font-bold">{stats?.nextMealTime || 'Not scheduled'}</div>}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
