import OpenAI from "openai"; // Use OpenAI or Gemini (Google AI)
import { PrismaClient } from "@prisma/client";
import { MealLog } from "@prisma/client";

interface healthSummary {
  dietScore: number;
  healthRisks: string;
  improvementTips: string;
}

const prisma = new PrismaClient();
<<<<<<< HEAD
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY}); // Replace with your key
=======
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); // Replace with your key
>>>>>>> parent of 9db7541 (updated ackedn and small fix to frontend)

/**
 * 🥗 AI FOOD IMAGE ANALYSIS
 * Uses AI to recognize food in an image and estimate calories & nutrients.
 */
export async function analyzeFoodWithAI(imageUrl: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        { role: "system", content: "You are an AI food analyst that detects food and estimates nutrition values." },
        { role: "user", content: `Analyze the food in this image: ${imageUrl}` }
      ],
      max_tokens: 500,
    });

    const aiResponse = response.choices[0]?.message?.content || "";
    const extractedData = parseFoodAnalysis(aiResponse);

    return extractedData;
  } catch (error) {
    console.error("Food analysis failed:", error);
    throw new Error("Failed to analyze food.");
  }
}

/**
 * 🏥 AI HEALTH SUMMARY
 * Generates a health summary based on the user's past meals.
 */
export async function analyzeHealthData(meals: any[]) {
  try {
    const mealDescriptions = meals.map((meal) => `${meal.foodName} (${meal.calories} kcal)`).join(", ");
    const prompt = `Analyze this meal history and generate a health summary:
    Meals: ${mealDescriptions}
    Consider caloric intake, nutrient balance, and potential health risks.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
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
 * 🍽️ AI MEAL PLANNING
 * Generates a personalized meal plan based on health goals.
 */
export async function generateMealPlan(healthGoal: string[]) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "You are a nutritionist AI that creates personalized meal plans." },
        { role: "user", content: `Create a 3-meal daily plan for a person with the goal: ${healthGoal}.` }
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
 * 🏷️ FOOD LABEL SCANNING
 * Scans ingredients and flags potential allergens or unhealthy items.
 */
export async function scanFoodLabelWithAI(imageBase64: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        { role: "system", content: "You are an AI that scans food labels and flags harmful ingredients." },
        { role: "user", content: `Scan this food label: ${imageBase64}` }
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

export async function scanHealthReportWithAI(imageBase64: string, userId: string) {
  try {
    // Step 1: AI scans the health report
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        { role: "system", content: "You are an AI that scans health reports, identifies health conditions, and suggests personalized meal plans." },
        { role: "user", content: `Analyze this health report: ${imageBase64}` }
      ],
      max_tokens: 700,
    });

    const aiResponse = response.choices[0]?.message?.content || "";
    const healthAnalysis = parseHealthReportScan(aiResponse);

    // Step 2: Update the database with health insights
    await prisma.healthReports.create({
      data: {
        userId,
        reportData: healthAnalysis,
        createdAt: new Date(),
      },
    });

    // Step 3: Generate meal plans based on AI insights
    const mealPlan = generateMealPlan(healthAnalysis);

    return { healthAnalysis, mealPlan };
  } catch (error) {
    console.error("Health report scanning failed:", error);
    throw new Error("Failed to scan health report.");
  }
}

function parseHealthReportScan(response: string) {
  try {
    return JSON.parse(response); // Ensure AI response is JSON structured
  } catch {
    return { insights: response }; // Fallback if not JSON
  }
}


/**
 * 🛠️ PARSING FUNCTIONS (Extract structured data from AI responses)
 */
function parseFoodAnalysis(responseText: string) {
  // Example AI response: "Detected: Chicken Salad (350 kcal, 25g protein, 10g fat, 40g carbs)."
  const match = responseText.match(/Detected: (.+) \((\d+) kcal, (.+)\)/);
  if (!match) return { foodName: "Unknown", calories: 0, nutrients: {} };

  return {
    foodName: match[1],
    calories: parseInt(match[2] as string, 10),
    nutrients: parseNutrients(match[3] as string),
  };
}

function parseMealPlan(responseText: string) {
  // Example AI response: "Breakfast: Oatmeal with banana. Lunch: Grilled salmon with quinoa. Dinner: Vegetable stir-fry."
  const meals = responseText.split(". ").map((meal) => meal.trim());
  return { breakfast: meals[0], lunch: meals[1], dinner: meals[2] };
}

function parseFoodLabelScan(responseText: string) {
  // Example AI response: "Product: Corn Flakes. Ingredients: Corn, sugar, salt. Flagged: Sugar (high content)."
  const match = responseText.match(/Product: (.+)\. Ingredients: (.+)\. Flagged: (.+)\./);
  return {
    productName: match ? match[1] : "Unknown",
    ingredients: match ? (match[2] as string).split(", ") : [],
    flagged: match ? (match[3] as string).split(", ") : [],
  };
}

function parseNutrients(nutrientString: string) {
  // Example string: "25g protein, 10g fat, 40g carbs"
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

    // Extract relevant data from meal logs
    const mealDescriptions = meals
      .map((meal) => `${meal.name}: ${JSON.stringify(meal.nutrients)}`)
      .join("\n");

    // AI prompt
    const prompt = `
      You are a nutrition AI assistant. Analyze the following meal logs and provide a summary of the user's health based on their food intake.
      Identify trends, potential deficiencies, and suggestions for a balanced diet.

      Meals logged:
      ${mealDescriptions}

      Generate a concise health summary in easy-to-understand language.
      Return the response as a JSON object with the following structure:
      {
        "dietScore": number, // A score between 0 and 100 representing the overall healthiness of the diet
        "healthRisks": string, // A description of potential health risks based on the meals
        "improvementTips": string // Suggestions for improving the diet
      }
    `;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [{ role: "system", content: prompt }],
        temperature: 0.7,
      });

      // Parse the AI response into a structured object
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