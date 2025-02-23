'use client';

import { useState, useEffect } from 'react';
import { 
  Home, Bell, Flame, Salad, ShieldCheck, 
  Clock, TrendingUp, ChevronUp, ChevronDown 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useUser } from '@clerk/nextjs';
import Sidebar from '@/components/sidebar';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardStats {
  caloriesConsumed: number;
  mealPlanProgress: number;
  foodSafetyAlerts: number;
  nextMealTime: string;
}

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  isLoading, 
  trend,
  children 
}: { 
  title: string;
  value?: string | number;
  icon: any;
  isLoading: boolean;
  trend?: { value: number; isPositive: boolean };
  children?: React.ReactNode;
}) => (
  <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <Skeleton className="h-8 w-[100px]" />
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{value}</span>
            {trend && (
              <span className={`flex items-center text-xs ${
                trend.isPositive ? 'text-green-500' : 'text-red-500'
              }`}>
                {trend.isPositive ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                {Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {children}
        </div>
      )}
    </CardContent>
  </Card>
);

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
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl p-8">
          {/* Header */}
          <div className="flex flex-col gap-y-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
              <p className="text-muted-foreground">
                Welcome back, {user?.firstName || 'Guest'}!
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="icon"
                className="relative"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                </span>
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Calories Consumed"
              value={stats?.caloriesConsumed || 0}
              icon={Flame}
              isLoading={isLoading}
              trend={{ value: 12, isPositive: true }}
            />

            <StatCard
              title="Meal Plan Progress"
              value={`${stats?.mealPlanProgress || 0}%`}
              icon={Salad}
              isLoading={isLoading}
            >
              <Progress 
                value={stats?.mealPlanProgress || 0} 
                className="h-2"
              />
            </StatCard>

            <StatCard
              title="Food Safety Alerts"
              value={stats?.foodSafetyAlerts || 0}
              icon={ShieldCheck}
              isLoading={isLoading}
              trend={{ value: 5, isPositive: false }}
            />

            <StatCard
              title="Next Scheduled Meal"
              value={stats?.nextMealTime || 'Not scheduled'}
              icon={Clock}
              isLoading={isLoading}
            />
          </div>

          {/* Additional Sections can be added here */}
          <div className="mt-8">
            {/* Add more content like charts, recent activities, etc. */}
          </div>
        </div>
      </main>
    </div>
  );
}