'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button'
import { Bell, FileText, Settings,ScanIcon as Scanner, Activity, Utensils, Home } from 'lucide-react'
import Link from 'next/link';

import { useUser } from '@clerk/nextjs';

interface DashboardStats {
    caloriesConsumed: number;
    mealPlanProgress: number;
    foodSafetyAlerts: number;
    nextMealTime: string;
  }
  
const page = () => {
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
          <aside className="w-64 bg-white p-6 shadow-md">
        <h1 className="text-2xl font-bold mb-6">Cura.AI</h1>
        <nav className="space-y-4">
          <Link href='/dashboard'><Button variant="ghost" className="w-full justify-start"><Home className="mr-2 h-4 w-4" />Dashboard</Button></Link>
          <Link href='/meal-planner'><Button variant="ghost" className="w-full justify-start"><Utensils className="mr-2 h-4 w-4" />Meal Planner</Button></Link>
          <Link href='/nutrition-tracker'><Button variant="ghost" className="w-full justify-start"><Activity className="mr-2 h-4 w-4" />Nutrition Tracker</Button></Link>
          <Link href='/health-reports'><Button variant="ghost" className="w-full justify-start"><FileText className="mr-2 h-4 w-4" />Health Reports</Button></Link>
          <Link href='/food-scanner'><Button variant="ghost" className="w-full justify-start"><Scanner className="mr-2 h-4 w-4" />Food Scanner</Button></Link>
          <Link href='/settings'><Button variant="ghost" className="w-full justify-start"><Settings className="mr-2 h-4 w-4" />Settings</Button></Link>
        </nav>
      </aside>

      {/* Main Content */}
    <main className="flex-1 p-8 overflow-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold">Dashboard</h2>
            <p className="text-gray-500">Welcome back, {user?.firstName}!</p>
          </div>
          <Button variant="outline" size="icon"><Bell className="h-4 w-4" /></Button>
        </header>
    </main>
</div>
  )
}

export default page