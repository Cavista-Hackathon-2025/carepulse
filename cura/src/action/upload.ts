"use server"; // Mark this as a Server Action

import { z } from "zod";
import { uploadToStorage } from "@/lib/upload"; // Cloud storage helper
import { analyzeFoodWithAI } from "@/lib/ai"; // AI analysis function
import { PrismaClient } from "@prisma/client";
import { currentUser } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

// Zod schema for input validation
const uploadFoodImageSchema = z.object({
  imageBase64: z.string(), // Accept base64 or file URL
});

export async function uploadFoodImage(formData: FormData) {
    const user = await currentUser()
  try {
    // Validate the input
    const input = uploadFoodImageSchema.parse({
      imageBase64: formData.get("imageBase64"),
    });

    const userId = user?.id;

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Upload image to cloud storage
    const imageUrl = await uploadToStorage(input.imageBase64);

    // AI processes the image & extracts food info
    const { foodName, calories, nutrients } = await analyzeFoodWithAI(imageUrl);

    // Store in DB
    const foodLog = await prisma.foodScan.create({
      data: {
        userId,
        foodName: foodName as string,
        imageUrl: imageUrl as string,
        calories: calories,
        nutrients: nutrients ? JSON.stringify(nutrients) : null as any,
      },
    });

    return { success: true, foodLog };
  } catch (error) {
    console.error("Error uploading food image:", error);
    throw new Error("Failed to upload food image");
  }
}