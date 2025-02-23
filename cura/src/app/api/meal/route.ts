import prisma from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

export async function GET() {
    try {
      const mealPlans = await prisma.mealSchedule.findMany();
      return NextResponse.json({ success: true, mealPlans });
    } catch (error) {
      return NextResponse.json({ success: false, error: "Failed to fetch meal plans" }, { status: 500 });
    }
  }
  
  export async function PATCH(req: NextRequest) {
    try {
      const { id, updates } = await req.json();
      const updatedMealPlan = await prisma.mealSchedule.update({
        where: { id },
        data: updates,
      });
      return NextResponse.json({ success: true, updatedMealPlan });
    } catch (error) {
      return NextResponse.json({ success: false, error: "Failed to update meal plan" }, { status: 500 });
    }
  }
  
  export async function DELETE(req: NextRequest) {
    try {
      const { id } = await req.json();
      await prisma.mealSchedule.delete({ where: { id } });
      return NextResponse.json({ success: true, message: "Meal plan deleted successfully" });
    } catch (error) {
      return NextResponse.json({ success: false, error: "Failed to delete meal plan" }, { status: 500 });
    }
  }
  