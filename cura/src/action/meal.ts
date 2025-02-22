'use server'
import { prisma } from "@/lib/prisma";
import { generateMealPlan } from "@/lib/ai";
import { currentUser } from '@clerk/nextjs/server'


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