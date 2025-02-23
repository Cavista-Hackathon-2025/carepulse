import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { currentUser } from "@clerk/nextjs/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
    const user = await currentUser()
  try {
    const { healthReport, healthGoal } = await req.json();
    if (!healthReport || typeof healthReport !== "string" || !healthGoal) {
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 }
      );
    }

    const prompt = `Analyze this health report and suggest a personalized meal plan based on the user's condition:
    ${healthReport}
    Consider dietary restrictions, health risks, and nutritional needs.`;

    const completion = await genAI.getGenerativeModel({ model: "gemini-pro" }).generateContent([prompt]);
    const mealPlan = completion.response.text();

    const mealPlanTitle = `MealPlan_${new Date().toISOString()}`;

    const mealPlanEntry = await prisma.mealSchedule.create({
      data: {
        userId: user.id as any, // Assuming you have the user ID from the request
        mealTime: new Date(), // You might want to set this to a specific time
        mealPlan: mealPlan,
        healthGoals: healthGoal,
      },
    });

    return NextResponse.json({ success: true, mealPlan, mealPlanEntry });
  } catch (error) {
    console.error("Error generating meal plan:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate meal plan",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
