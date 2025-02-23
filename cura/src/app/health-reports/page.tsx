"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import Sidebar from "@/components/sidebar";
import { fetchUserData } from "@/action/fetchActions";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface HealthMetric {
  date: string;
  value: number;
}

export default function HealthDashboard() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const response = await fetchUserData();
      if (response.success && response.userData) {
        setUserData(response.userData);
      } else {
        setError(response.error || "Failed to load user data");
      }
    } catch (err) {
      setError("An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };

  const getLatestMealSchedule = () => {
    if (!userData?.mealSchedules?.length) return null;
    return userData.mealSchedules.reduce((latest: any, current: any) => {
      return new Date(latest.mealTime) > new Date(current.mealTime) ? latest : current;
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 p-6">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  const latestMealSchedule = getLatestMealSchedule();

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6">Health Report</h1>
        
        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-2">Personal Info</h2>
              <div className="space-y-1">
                <p>Age: {userData.age || 'Not specified'}</p>
                <p>Gender: {userData.gender || 'Not specified'}</p>
                <p>Height: {userData.height ? `${userData.height} cm` : 'Not specified'}</p>
                <p>Weight: {userData.weight ? `${userData.weight} kg` : 'Not specified'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-2">Health Goals</h2>
              <div className="space-y-1">
                {userData.healthGoals ? (
                  <p>{userData.healthGoals}</p>
                ) : (
                  <p className="text-gray-500">No health goals specified</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-2">Medical Conditions</h2>
              <div className="space-y-1">
                {userData.medicalConditions && userData.medicalConditions.length > 0 ? (
                  userData.medicalConditions.map((condition: string, index: number) => (
                    <p key={index}>{condition}</p>
                  ))
                ) : (
                  <p className="text-gray-500">No medical conditions recorded</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Allergies and Dietary Restrictions */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-2">Allergies & Dietary Restrictions</h2>
            <div className="flex flex-wrap gap-2">
              {userData.allergies && userData.allergies.length > 0 ? (
                userData.allergies.map((allergy: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                    {allergy}
                  </span>
                ))
              ) : (
                <p className="text-gray-500">No allergies recorded</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Latest Meal Plan */}
        {latestMealSchedule && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-2">Latest Meal Plan</h2>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Scheduled for: {new Date(latestMealSchedule.mealTime).toLocaleDateString()}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-1">Health Goals</h3>
                    <ul className="list-disc list-inside">
                      {latestMealSchedule.healthGoals.map((goal: string, index: number) => (
                        <li key={index} className="text-sm">{goal}</li>
                      ))}
                    </ul>
                  </div>
                  {latestMealSchedule.mealPlan.meals && (
                    <div>
                      <h3 className="font-medium mb-1">Daily Meals</h3>
                      <ul className="list-disc list-inside">
                        {latestMealSchedule.mealPlan.meals.map((meal: any, index: number) => (
                          <li key={index} className="text-sm">
                            {meal.name} - {meal.calories} kcal
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Health Summary */}
        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-4">Health Summary</h2>
            <div className="space-y-4">
              {userData.summaries && userData.summaries.length > 0 ? (
                userData.summaries.map((summary: any, index: number) => (
                  <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                    <p className="font-medium">{new Date(summary.date).toLocaleDateString()}</p>
                    {summary.dietScore && (
                      <p className="text-sm">Diet Score: {summary.dietScore}/100</p>
                    )}
                    {summary.healthRisks && (
                      <p className="text-sm text-red-600">Health Risks: {summary.healthRisks}</p>
                    )}
                    {summary.improvementTips && (
                      <p className="text-sm text-green-600">
                        Improvement Tips: {summary.improvementTips}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No health summaries available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}