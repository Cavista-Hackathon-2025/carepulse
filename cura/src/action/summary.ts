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

  // AI generates summary based on meals
  const summary = await generateHealthSummaryAI(todayMeals);

  // Store in DB
  const savedSummary = await prisma.summary.create({
    data: {
      userId,
      type: "daily",
      date: new Date(), // Current date
      dietScore: summary.dietScore,
      healthRisks: summary.healthRisks,
      improvementTips: summary.improvementTips,
    },
  });

  return savedSummary;
};

export const generateWeeklySummary = async (userId: string) => {
    const lastWeekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
  
    const lastWeekMeals = await prisma.mealLog.findMany({
      where: { userId, createdAt: { gte: lastWeekStart } },
    });
  
    // AI generates summary based on meals
    const summary = await generateHealthSummaryAI(lastWeekMeals);
  
    // Store in DB
    const savedSummary = await prisma.summary.create({
      data: {
        userId,
        type: "weekly",
        date: new Date(), // Current date
        dietScore: summary.dietScore,
        healthRisks: summary.healthRisks,
        improvementTips: summary.improvementTips,
      },
    });
  
    return savedSummary;
  };
