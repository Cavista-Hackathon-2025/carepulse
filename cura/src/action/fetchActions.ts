"use server"; // Mark this as a Server Action

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Zod schemas for input validation
const foodScanSchema = z.object({
  userId: z.string(),
  foodName: z.string(),
  imageUrl: z.string().optional(),
  calories: z.number().optional(),
  nutrients: z.record(z.string(), z.any()).optional(),
  flaggedIssues: z.string().optional(),
});

const summarySchema = z.object({
  userId: z.string(),
  type: z.enum(["daily", "weekly"]),
  date: z.date(),
  dietScore: z.number().optional(),
  healthRisks: z.string().optional(),
  improvementTips: z.string().optional(),
});

const mealScheduleSchema = z.object({
  userId: z.string(),
  mealTime: z.date(),
  mealPlan: z.record(z.string(), z.any()),
  healthGoals: z.array(z.string()),
});

const notificationSchema = z.object({
  userId: z.string(),
  type: z.enum(["meal_reminder", "health_alert"]),
  message: z.string(),
});

interface UserData {
    id: string;
    email: string;
    name: string | null;
    age: number | null;
    gender: string | null;
    weight: number | null;
    height: number | null;
    healthGoals: string | null;
    medicalConditions: string[];
    allergies: string[];
    foodScans: {
      id: string;
      foodName: string;
      imageUrl: string | null;
      calories: number | null;
      nutrients: any;
      flaggedIssues: string | null;
      createdAt: Date;
    }[];
    summaries: {
      id: string;
      type: string;
      date: Date;
      dietScore: number | null;
      healthRisks: string | null;
      improvementTips: string | null;
      createdAt: Date;
    }[];
    mealSchedules: {
      id: string;
      mealTime: Date;
      mealPlan: any;
      healthGoals: string[];
      reminderSent: boolean;
      createdAt: Date;
    }[];
    notifications: {
      id: string;
      type: string;
      message: string;
      sentAt: Date;
    }[];
  }
  
  export async function fetchUserData(): Promise<{
    success: boolean;
    userData?: UserData;
    error?: string;
  }> {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }
  
    try {
      // Fetch the user's data from the database
      const userData = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          FoodScan: true,
          MealSchedule: true,
          Notification: true,
        },
      });
  
      if (!userData) {
        return { success: false, error: "User not found" };
      }
  
      // Format the response
      const formattedUserData: UserData = {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          age: userData.age,
          gender: userData.gender,
          weight: userData.weight,
          height: userData.height,
          healthGoals: userData.healthGoals,
          medicalConditions: userData.medicalConditions,
          allergies: userData.allergies,
          // foodScans: userData.FoodScan.map((scan: { id: any; foodName: any; imageUrl: any; calories: any; nutrients: any; flaggedIssues: any; createdAt: any; }) => ({
          //     id: scan.id,
          //     foodName: scan.foodName,
          //     imageUrl: scan.imageUrl,
          //     calories: scan.calories,
          //     nutrients: scan.nutrients,
          //     flaggedIssues: scan.flaggedIssues,
          //     createdAt: scan.createdAt,
          //   })),
          mealSchedules: userData.MealSchedule.map((schedule) => ({
              id: schedule.id,
              mealTime: schedule.mealTime,
              mealPlan: schedule.mealPlan,
              healthGoals: schedule.healthGoals,
              reminderSent: schedule.reminderSent,
              createdAt: schedule.createdAt,
          })),
          foodScans: [],
          summaries: [],
          notifications: []
      };
  
      return { success: true, userData: formattedUserData };
    } catch (error) {
      console.error("Error fetching user data:", error);
      return { success: false, error: "Failed to fetch user data" };
    }
  }

// FoodScan Actions
export async function createFoodScan(data: z.infer<typeof foodScanSchema>) {
  const user = await currentUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const foodScan = await prisma.foodScan.create({
      data: {
        userId: data.userId,
        foodName: data.foodName,
        imageUrl: data.imageUrl,
        calories: data.calories,
        nutrients: data.nutrients ? JSON.stringify(data.nutrients) : null as any,
        flaggedIssues: data.flaggedIssues,
      },
    });

    return { success: true, foodScan };
  } catch (error) {
    console.error("Error creating food scan:", error);
    return { success: false, error: "Failed to create food scan" };
  }
}

export async function getFoodScans(userId: string) {
  const user = await currentUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const foodScans = await prisma.foodScan.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, foodScans };
  } catch (error) {
    console.error("Error fetching food scans:", error);
    return { success: false, error: "Failed to fetch food scans" };
  }
}

// Summary Actions
export async function createSummary(data: z.infer<typeof summarySchema>) {
  const user = await currentUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const summary = await prisma.summary.create({
      data: {
        userId: data.userId,
        type: data.type,
        date: data.date,
        dietScore: data.dietScore,
        healthRisks: data.healthRisks,
        improvementTips: data.improvementTips,
      },
    });

    return { success: true, summary };
  } catch (error) {
    console.error("Error creating summary:", error);
    return { success: false, error: "Failed to create summary" };
  }
}

export async function getSummaries(userId: string) {
  const user = await currentUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const summaries = await prisma.summary.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, summaries };
  } catch (error) {
    console.error("Error fetching summaries:", error);
    return { success: false, error: "Failed to fetch summaries" };
  }
}

// MealSchedule Actions
export async function createMealSchedule(data: z.infer<typeof mealScheduleSchema>) {
  const user = await currentUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const mealSchedule = await prisma.mealSchedule.create({
      data: {
        userId: data.userId,
        mealTime: data.mealTime,
        mealPlan: data.mealPlan,
        healthGoals: data.healthGoals,
      },
    });

    return { success: true, mealSchedule };
  } catch (error) {
    console.error("Error creating meal schedule:", error);
    return { success: false, error: "Failed to create meal schedule" };
  }
}

export async function getMealSchedules(userId: string) {
  const user = await currentUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const mealSchedules = await prisma.mealSchedule.findMany({
      where: { userId },
      orderBy: { mealTime: "asc" },
    });

    return { success: true, mealSchedules };
  } catch (error) {
    console.error("Error fetching meal schedules:", error);
    return { success: false, error: "Failed to fetch meal schedules" };
  }
}

// Notification Actions
export async function createNotification(data: z.infer<typeof notificationSchema>) {
  const user = await currentUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        message: data.message,
      },
    });

    return { success: true, notification };
  } catch (error) {
    console.error("Error creating notification:", error);
    return { success: false, error: "Failed to create notification" };
  }
}

export async function getNotifications(userId: string) {
  const user = await currentUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { sentAt: "desc" },
    });

    return { success: true, notifications };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return { success: false, error: "Failed to fetch notifications" };
  }
}