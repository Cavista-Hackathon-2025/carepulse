'use client';

import { useState, useEffect } from 'react';
import { Home, FileText, Utensils, Activity, ScanIcon as Scanner, Settings, Bell,Flame,Salad,ShieldCheck,Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

interface DashboardStats {
  calories: { count: number; totalWordCount: number };
  meal: { count: number; totalListens: number };
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
      const response = await fetch('/api/stats');
      if (!response.ok) throw new Error('Failed to fetch dashboard stats');
      const data = await response.json();
      if (data.success) setStats(data.stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white p-6 shadow-md">
        <h1 className="text-2xl font-bold mb-6">Cura.AI</h1>
        <nav className="space-y-4">
          <Link href='/dashboard'><Button variant="ghost" className="w-full justify-start"><Home className="mr-2 h-4 w-4" />Dashboard</Button></Link>
          <Link href='/summarize'><Button variant="ghost" className="w-full justify-start"><Utensils className="mr-2 h-4 w-4" />Meal Planner</Button></Link>
          <Link href='/podcast'><Button variant="ghost" className="w-full justify-start"><Activity className="mr-2 h-4 w-4" />Nutrition Tracker</Button></Link>
          <Link href='/articles'><Button variant="ghost" className="w-full justify-start"><FileText className="mr-2 h-4 w-4" />Health Reports</Button></Link>
          <Link href='/subscription-management'><Button variant="ghost" className="w-full justify-start"><Scanner className="mr-2 h-4 w-4" />Food Scanner</Button></Link>
          <Link href='#'><Button variant="ghost" className="w-full justify-start"><Settings className="mr-2 h-4 w-4" />Settings</Button></Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold">Dashboard</h2>
            <p className="text-gray-500">Welcome back, {user?.firstName || 'User'}!</p>
          </div>
          <Button variant="outline" size="icon"><Bell className="h-4 w-4" /></Button>
        </header>

        {/* Stats Grid */}
        <div className="">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Calories Consumed</CardTitle>
              <Flame className="h-4 w-4 text-muted-foreground " />
            </CardHeader>
            <CardContent>
              {isLoading ? (<p>Loading...</p>) : stats ? (
                <>
                  <div className="text-2xl font-bold">{stats.calories.count}</div>
                  <Progress value={Math.min((stats.calories.totalWordCount / 10000) * 100, 100)} />
                </>
              ) : (<p>No data available</p>)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Meal Plan Progress</CardTitle>
              <Salad className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (<p>Loading...</p>) : stats ? (
                <>
                  <div className="text-2xl font-bold">{stats.meal.count}</div>
                  <Progress value={Math.min((stats.meal.totalListens / 1000) * 100, 100)} />
                </>
              ) : (<p>No data available</p>)}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Food Safety Alert</CardTitle>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (<p>Loading...</p>) : stats ? (
                <>
                  <div className="text-2xl font-bold">{stats.meal.count}</div>
                  <Progress value={Math.min((stats.meal.totalListens / 1000) * 100, 100)} />
                </>
              ) : (<p>No data available</p>)}
            </CardContent>
          </Card>
          
        <Card>
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Next Scheduled Meal</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (<p>Loading...</p>) : stats ? (
                <>
                  <div className="text-2xl font-bold">{stats.meal.count}</div>
                  <Progress value={Math.min((stats.meal.totalListens / 1000) * 100, 100)} />
                </>
              ) : (<p>No data available</p>)}
            </CardContent>
          </Card>
        </div>
        
        </div>
       
      </main>
    </div>
  );
}