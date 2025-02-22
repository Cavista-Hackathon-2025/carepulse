'use server'
import { Prisma } from "@prisma/client";
import { db } from "./db";
import { generateMealPlan } from "~/utils/ai";
import { currentUser } from '@clerk/nextjs/server'


export const createMealPlan = async(userId: string, healthGoals: string[], input: { mealTime: any; }) => {
    const mealPlan = await generateMealPlan(healthGoals);

    const savedMealPlan = await db.mealSchedule.create({
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
    return db.mealSchedule.findFirst({ where: {userId}})
}