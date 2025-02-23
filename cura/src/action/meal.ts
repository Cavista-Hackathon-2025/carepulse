'use server'
import { prisma } from "@/lib/prisma";
import { generateMealPlan } from "@/lib/ai";
import { currentUser } from '@clerk/nextjs/server'
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Validation schemas
const NutrientSchema = z.object({
  protein: z.number().optional(),
  carbs: z.number().optional(),
  fats: z.number().optional(),
});

const MealSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  image: z.string().optional(),
  calories: z.number(),
  time: z.string(),
  type: z.string(),
  nutrients: NutrientSchema.optional(),
});

const MealPlanUpdateSchema = z.object({
  id: z.string(),
  meals: z.array(MealSchema).optional(),
  totalCalories: z.number().optional(),
  targetCalories: z.number().optional(),
  healthScore: z.number().optional(),
  healthGoals: z.array(z.string()).optional(),
  mealTime: z.date().optional(),
});

type MealPlanUpdate = z.infer<typeof MealPlanUpdateSchema>;

interface Meal {
  id: string;
  name: string;
  image?: string;
  calories: number;
  time: string;
  type: string;
  nutrients?: {
    protein?: number;
    carbs?: number;
    fats?: number;
  };
}

interface MealPlan {
  id: string;
  day: string;
  meals: Meal[];
  totalCalories: number;
  targetCalories: number;
  progress: number;
  healthScore?: number;
}

export async function deleteMealPlan(id: string) {
  try {
    // Check authentication
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify the meal plan exists and belongs to the user
    const existingMealPlan = await prisma.mealSchedule.findFirst({
      where: {
        id: id,
        userId: user.id
      }
    });

    if (!existingMealPlan) {
      return { 
        success: false, 
        error: "Meal plan not found or you don't have permission to delete it" 
      };
    }

    // Delete the meal plan
    await prisma.mealSchedule.delete({
      where: {
        id: id
      }
    });

    // Revalidate the page to update the UI
    revalidatePath('/meal-planner');

    return { 
      success: true, 
      message: "Meal plan deleted successfully" 
    };

  } catch (error) {
    console.error("Error deleting meal plan:", error);
    return { 
      success: false, 
      error: "Failed to delete meal plan" 
    };
  }
}

// Helper function to validate meal plan data
export async function validateMealPlanAccess(mealPlanId: string, userId: string) {
  const mealPlan = await prisma.mealSchedule.findFirst({
    where: {
      id: mealPlanId,
      userId: userId
    }
  });

  return !!mealPlan;
}

export async function updateMealPlan(mealPlanId: string, updates: Partial<MealPlanUpdate>) {
  try {
    // Verify authentication
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate input data
    const validatedData = MealPlanUpdateSchema.partial().safeParse({
      id: mealPlanId,
      ...updates
    });

    if (!validatedData.success) {
      return {
        success: false,
        error: "Invalid update data",
        validationErrors: validatedData.error.errors
      };
    }

    // Check if meal plan exists and belongs to user
    const existingMealPlan = await prisma.mealSchedule.findFirst({
      where: {
        id: mealPlanId,
        userId: user.id
      }
    });

    if (!existingMealPlan) {
      return {
        success: false,
        error: "Meal plan not found or you don't have permission to update it"
      };
    }

    // Prepare update data
    const currentMealPlan = existingMealPlan.mealPlan as any;
    const updatedMealPlan = {
      ...currentMealPlan,
      ...(updates.meals && { meals: updates.meals }),
      ...(updates.totalCalories && { totalCalories: updates.totalCalories }),
      ...(updates.targetCalories && { targetCalories: updates.targetCalories }),
      ...(updates.healthScore && { healthScore: updates.healthScore })
    };

    // Calculate new progress if calories changed
    if (updates.totalCalories || updates.targetCalories) {
      const newTotal = updates.totalCalories || currentMealPlan.totalCalories;
      const newTarget = updates.targetCalories || currentMealPlan.targetCalories;
      updatedMealPlan.progress = (newTotal / newTarget) * 100;
    }

    // Update the meal plan
    const updatedPlan = await prisma.mealSchedule.update({
      where: {
        id: mealPlanId
      },
      data: {
        mealPlan: updatedMealPlan,
        ...(updates.healthGoals && { healthGoals: updates.healthGoals }),
        ...(updates.mealTime && { mealTime: updates.mealTime })
      }
    });

    // Revalidate the page
    revalidatePath('/meal-planner');

    return {
      success: true,
      mealPlan: updatedPlan
    };

  } catch (error) {
    console.error("Error updating meal plan:", error);
    return {
      success: false,
      error: "Failed to update meal plan"
    };
  }
}

// Helper function to update a single meal within a meal plan
export async function updateMeal(mealPlanId: string, mealId: string, mealUpdates: Partial<z.infer<typeof MealSchema>>) {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Fetch current meal plan
    const mealPlan = await prisma.mealSchedule.findFirst({
      where: {
        id: mealPlanId,
        userId: user.id
      }
    });

    if (!mealPlan) {
      return {
        success: false,
        error: "Meal plan not found or you don't have permission to update it"
      };
    }

    // Update the specific meal
    const currentMealPlan = mealPlan.mealPlan as any;
    const mealIndex = currentMealPlan.meals.findIndex((meal: any) => meal.id === mealId);

    if (mealIndex === -1) {
      return {
        success: false,
        error: "Meal not found in meal plan"
      };
    }

    // Update meal and recalculate totals
    const updatedMeals = [...currentMealPlan.meals];
    updatedMeals[mealIndex] = {
      ...updatedMeals[mealIndex],
      ...mealUpdates
    };

    const totalCalories = updatedMeals.reduce((sum, meal) => sum + meal.calories, 0);
    const progress = (totalCalories / currentMealPlan.targetCalories) * 100;

    // Update meal plan with new data
    const updatedPlan = await prisma.mealSchedule.update({
      where: {
        id: mealPlanId
      },
      data: {
        mealPlan: {
          ...currentMealPlan,
          meals: updatedMeals,
          totalCalories,
          progress
        }
      }
    });

    revalidatePath('/meal-planner');

    return {
      success: true,
      mealPlan: updatedPlan
    };

  } catch (error) {
    console.error("Error updating meal:", error);
    return {
      success: false,
      error: "Failed to update meal"
    };
  }
}

export const createMealPlan = async(userId: string, healthGoals: string[], input: { mealTime: any; }) => {
    const mealPlan = await generateMealPlan(healthGoals);

    const savedMealPlan = await prisma.mealSchedule.create({
        data: {
            userId,
            healthGoals,
            mealPlan: mealPlan,
            mealTime: input.mealTime,
        }
    });
    return savedMealPlan
}

export const getMealPlan = async(userId: string) =>{
    return prisma.mealSchedule.findFirst({ where: {userId}})
}