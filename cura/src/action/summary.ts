import { prisma } from "@/lib/prisma";
import { generateHealthSummaryAI } from "@/lib/ai";

interface MealLog {
  id: string;
  userId: string;
  name: string;
  nutrients: any; // Replace with a more specific type if needed
  createdAt: Date;
}

interface HealthSummary {
  dietScore: number;
  healthRisks: string;
  improvementTips: string;
}

export const generateDailySummary = async (userId: string) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0); // Start of the day

  const todayMeals = await prisma.mealLog.findMany({
    where: { userId, createdAt: { gte: todayStart } },
  });

  if (!todayMeals.length) {
    throw new Error("No meal data found for today.");
  }

  // AI generates summary based on meals
  const summary = await generateHealthSummaryAI(todayMeals);
  if (!summary) {
    throw new Error("Failed to generate health summary.");
  }

  // Store in DB
  return prisma.summary.create({
    data: {
      userId,
      type: "daily",
      date: new Date(),
      dietScore: summary.dietScore,
      healthRisks: summary.healthRisks,
      improvementTips: summary.improvementTips,
    },
  });
};

export const generateWeeklySummary = async (userId: string) => {
  const lastWeekStart = new Date();
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  lastWeekStart.setHours(0, 0, 0, 0);

  const lastWeekMeals = await prisma.mealLog.findMany({
    where: { userId, createdAt: { gte: lastWeekStart } },
  });

  if (!lastWeekMeals.length) {
    throw new Error("No meal data found for the past week.");
  }

  // AI generates summary based on meals
  const summary = await generateHealthSummaryAI(lastWeekMeals);
  if (!summary) {
    throw new Error("Failed to generate health summary.");
  }

  // Store in DB
  return prisma.summary.create({
    data: {
      userId,
      type: "weekly",
      date: new Date(),
      dietScore: summary.dietScore,
      healthRisks: summary.healthRisks,
      improvementTips: summary.improvementTips,
    },
  });
};
