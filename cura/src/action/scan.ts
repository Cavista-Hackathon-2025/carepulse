import { prisma } from "@/lib/prisma";
import { scanFoodLabelWithAI, analyzeFoodWithAI } from "@/lib/gemini";

export const scanFoodLabel = async (userId: string, labelText: string) => {
  // AI scans label for allergens, sugar, etc.
  const scanResult = await analyzeFoodWithAI(labelText);

  // Store results in database
  const scannedLabel = await prisma.foodScan.create({
    data: {
      userId,
      foodName: scanResult.foodName as string,
     calories: scanResult.calories,
     nutrients: scanResult.nutrients
    },
  });

  return scannedLabel;
};

export const scanFoodImage = async (userId: string, imageUrl: string) => {
  // AI detects food items from image
  const scanResult = await analyzeFoodWithAI(imageUrl);

  // Store results in database
  const scannedImage = await prisma.foodScan.create({
    data: {
      userId,
      foodName: scanResult.foodName as string,
     calories: scanResult.calories,
     nutrients: scanResult.nutrients
    },
  });

  return scannedImage;
};
