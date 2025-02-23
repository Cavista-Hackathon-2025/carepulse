"use server";

import { PrismaClient } from "@prisma/client";
import { scanFoodLabelWithAI, analyzeFoodWithAI } from "@/lib/gemini";

const prisma = new PrismaClient();

interface ScanResult {
  foodName: string;
  calories: number;
  nutrients: Record<string, number>;
}

interface ImageData {
  base64: string;
  mimeType: string;
}

interface ScanResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export const scanFoodLabel = async (userId: string, labelText: string): Promise<ScanResponse> => {
  try {
    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found"
      };
    }

    const scanResult = await analyzeFoodWithAI(labelText, 'text');
    
    if (!scanResult || !scanResult.foodName) {
      return {
        success: false,
        error: "Failed to analyze food label"
      };
    }

    const scannedLabel = await prisma.foodScan.create({
      data: {
        userId,
        foodName: scanResult.foodName,
        calories: scanResult.calories || 0,
        nutrients: scanResult.nutrients || {},
      },
    });

    return {
      success: true,
      data: scannedLabel
    };
  } catch (error) {
    console.error("Error scanning food label:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred"
    };
  }
};

export const scanFoodImage = async (userId: string, imageData: ImageData): Promise<ScanResponse> => {
  try {
    // Validate user
    const user = await prisma.user.findUnique({ where: { id: userId }});
    if (!user) {
      return {
        success: false,
        error: "User not found"
      };
    }

    // Validate image data
    if (!imageData.base64 || !imageData.mimeType) {
      return {
        success: false,
        error: "Invalid image data provided"
      };
    }

    // Process image with Gemini
    const scanResult = await analyzeFoodWithAI(imageData.base64, imageData.mimeType);
    
    if (!scanResult) {
      return {
        success: false,
        error: "Failed to analyze food image"
      };
    }

    // Store results
    const scannedImage = await prisma.foodScan.create({
      data: {
        userId,
        foodName: scanResult.foodName || "Unknown Food",
        calories: scanResult.calories || 0,
        nutrients: scanResult.nutrients || {},
      }
    });

    return {
      success: true,
      data: scannedImage
    };
  } catch (error) {
    console.error("Image processing error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred"
    };
  }
};

export const getUserScanHistory = async (userId: string): Promise<ScanResponse> => {
  try {
    const scanHistory = await prisma.foodScan.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: scanHistory
    };
  } catch (error) {
    console.error("Error fetching user scan history:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred"
    };
  }
};