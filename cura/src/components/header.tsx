'use client';
import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Bell } from 'lucide-react'
import { useUser } from '@clerk/nextjs';


interface DashboardStats {
    caloriesConsumed: number;
    mealPlanProgress: number;
    foodSafetyAlerts: number;
    nextMealTime: string;
  }
  

const header = () => {
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
        <div className="flex-1 p-8 overflow-auto">
             <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold">Dashboard</h2>
            <p className="text-gray-500">Welcome back, {user?.firstName}!</p>
          </div>
          <Button variant="outline" size="icon"><Bell className="h-4 w-4" /></Button>
        </header>
        </div>
  )
}

export default header