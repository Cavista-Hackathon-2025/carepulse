'use server';

import { PrismaClient } from "@prisma/client";
import { MealLog } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);


const gemini = {
  chat: {
    completions: {
      create: async (data: any) => {
        return {
          choices: [{
            message: {
              content: "Processed AI Response here",
            },
          }],
        };
      },
    },
  },
};

interface healthSummary {
  dietScore: number;
  healthRisks: string;
  improvementTips: string;
}

const prisma = new PrismaClient();

/**
 * 🥗 AI FOOD IMAGE ANALYSIS (using Gemini)
 * Uses AI to recognize food in an image and estimate calories & nutrients.
 */
export async function formatImageForGemini(base64Image: string, mimeType: string) {
  return {
    inlineData: {
      data: base64Image,
      mimeType
    }
  };
}

// Modified analysis function
export async function analyzeFoodWithAI(base64Image: string, mimeType: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
    
    const prompt = `
      Analyze this food image and estimate nutritional values. Consider:
      - Food identification (main ingredients)
      - Calorie estimation
      - Macronutrient breakdown (proteins, carbs, fats)
      - Micronutrients if detectable
      - Portion size estimation
      Return in JSON format with numerical values only.
    `;

    const imagePart = formatImageForGemini(base64Image, mimeType);

    const result = await model.generateContent([prompt, imagePart]);
    const response = result.response;
    
    return parseFoodAnalysis(response.text());
  } catch (error) {
    console.error("Food analysis failed:", error);
    throw new Error("Failed to analyze food");
  }
}

// // Example parser function
// function parseFoodAnalysis(textResponse: string) {
//   try {
//     const jsonMatch = textResponse.match(/{[\s\S]*}/);
//     if (!jsonMatch) throw new Error('Invalid response format');
    
//     return JSON.parse(jsonMatch[0]);
//   } catch (error) {
//     console.error("Error parsing AI response:", error);
//     return {
//       error: "Failed to parse nutrition data",
//       rawResponse: textResponse
//     };
//   }
// }
/**
 * 🏥 AI HEALTH SUMMARY (using Gemini)
 * Generates a health summary based on the user's past meals.
 */
export async function analyzeHealthData(meals: any[]) {
  try {
    const mealDescriptions = meals.map((meal) => `${meal.foodName} (${meal.calories} kcal)`).join(", ");
    const prompt = `Analyze this meal history and generate a health summary:
    Meals: ${mealDescriptions}
    Consider caloric intake, nutrient balance, and potential health risks.`;

    const response = await gemini.chat.completions.create({
      model: "gemini-pro", // Use the appropriate Gemini model
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
    });

    return response.choices[0]?.message?.content || "No summary generated.";
  } catch (error) {
    console.error("Health summary failed:", error);
    throw new Error("Failed to generate health summary.");
  }
}

/**
 * 🍽️ AI MEAL PLANNING (using Gemini)
 * Generates a personalized meal plan based on health goals.
 */
export async function generateMealPlan(healthGoal: string[]) {
  try {
    const response = await gemini.chat.completions.create({
      model: "gemini-pro",
      messages: [
        { role: "system", content: "You are a nutritionist AI that creates personalized meal plans." },
        { role: "user", content: `Create a 3-meal daily plan for a person with the goal: ${healthGoal}.` },
      ],
      max_tokens: 500,
    });

    return parseMealPlan(response.choices[0]?.message?.content || "");
  } catch (error) {
    console.error("Meal planning failed:", error);
    throw new Error("Failed to generate meal plan.");
  }
}

/**
 * 🏷️ FOOD LABEL SCANNING (using Gemini)
 * Scans ingredients and flags potential allergens or unhealthy items.
 */
export async function scanFoodLabelWithAI(imageBase64: string) {
  try {
    const response = await gemini.chat.completions.create({
      model: "gemini-pro", // Assuming this is the Gemini model for vision
      messages: [
        { role: "system", content: "You are an AI that scans food labels and flags harmful ingredients." },
        { role: "user", content: `Scan this food label: ${imageBase64}` },
      ],
      max_tokens: 500,
    });

    const aiResponse = response.choices[0]?.message?.content || "";
    return parseFoodLabelScan(aiResponse);
  } catch (error) {
    console.error("Food label scanning failed:", error);
    throw new Error("Failed to scan food label.");
  }
}

/**
 * 🏥 AI HEALTH REPORT SCANNING (using Gemini)
 * Scans health reports and suggests meal plans.
 */
export async function scanHealthReportWithAI(imageBase64: string, userId: string) {
  try {
    const response = await gemini.chat.completions.create({
      model: "gemini-pro-vision", // Assuming this is the Gemini model for scanning health reports
      messages: [
        { role: "system", content: "You are an AI that scans health reports, identifies health conditions, and suggests personalized meal plans." },
        { role: "user", content: `Analyze this health report: ${imageBase64}` },
      ],
      max_tokens: 700,
    });

    const aiResponse = response.choices[0]?.message?.content || "";
    const healthAnalysis = parseHealthReportScan(aiResponse);

    // Save health analysis to the database
    await prisma.healthReports.create({
      data: {
        userId,
        reportData: healthAnalysis,
        createdAt: new Date(),
      },
    });

    // Generate meal plans based on health analysis
    const mealPlan = generateMealPlan(healthAnalysis);

    return { healthAnalysis, mealPlan };
  } catch (error) {
    console.error("Health report scanning failed:", error);
    throw new Error("Failed to scan health report.");
  }
}

// Parsing functions remain unchanged
function parseHealthReportScan(response: string) {
  try {
    return JSON.parse(response);
  } catch {
    return { insights: response }; // Fallback
  }
}

// AI data parsing helpers for food analysis, meal plans, etc.
function parseFoodAnalysis(responseText: string) {
  const match = responseText.match(/Detected: (.+) \((\d+) kcal, (.+)\)/);
  if (!match) return { foodName: "Unknown", calories: 0, nutrients: {} };

  return {
    foodName: match[1],
    calories: parseInt(match[2] as string, 10),
    nutrients: parseNutrients(match[3] as string),
  };
}

function parseMealPlan(responseText: string) {
  const meals = responseText.split(". ").map((meal) => meal.trim());
  return { breakfast: meals[0], lunch: meals[1], dinner: meals[2] };
}

function parseFoodLabelScan(responseText: string) {
  const match = responseText.match(/Product: (.+)\. Ingredients: (.+)\. Flagged: (.+)\./);
  return {
    productName: match ? match[1] : "Unknown",
    ingredients: match ? (match[2] as string).split(", ") : [],
    flagged: match ? (match[3] as string).split(", ") : [],
  };
}

function parseNutrients(nutrientString: string) {
  const nutrientRegex = /(\d+)g (\w+)/g;
  const nutrients: Record<string, number> = {};
  let match;
  while ((match = nutrientRegex.exec(nutrientString)) !== null) {
    nutrients[match[2] as string] = parseInt(match[1] as string, 10);
  }
  return nutrients;
}

export const generateHealthSummaryAI = async (meals: MealLog[]): Promise<healthSummary> => {
  if (meals.length === 0) {
    return {
      dietScore: 0,
      healthRisks: "No meals logged for this period.",
      improvementTips: "Start logging your meals to receive personalized health insights.",
    };
  }

  const mealDescriptions = meals
    .map((meal) => `${meal.name}: ${JSON.stringify(meal.nutrients)}`)
    .join("\n");

  const prompt = `
    You are a nutrition AI assistant. Analyze the following meal logs and provide a summary of the user's health based on their food intake.
    Identify trends, potential deficiencies, and suggestions for a balanced diet.

    Meals logged:
    ${mealDescriptions}

    Generate a concise health summary in easy-to-understand language.
    Return the response as a JSON object with the following structure:
    {
      "dietScore": number,
      "healthRisks": string,
      "improvementTips": string
    }
  `;

  try {
    const response = await gemini.chat.completions.create({
      model: "gemini-turbo",
      messages: [{ role: "system", content: prompt }],
      temperature: 0.7,
    });

    const summary = JSON.parse(response.choices[0].message.content);

    return {
      dietScore: summary.dietScore,
      healthRisks: summary.healthRisks,
      improvementTips: summary.improvementTips,
    };
  } catch (error) {
    console.error("Error generating health summary:", error);
    return {
      dietScore: 0,
      healthRisks: "Could not generate summary. Please try again.",
      improvementTips: "An error occurred while generating the summary.",
    };
  }
};
