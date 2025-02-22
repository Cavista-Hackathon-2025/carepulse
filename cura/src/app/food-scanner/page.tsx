"use client";

import { useState } from "react";
import { Camera, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Sidebar from "@/components/sidebar";

const mockFoodDatabase = {
  "123456789": {
    name: "Chocolate Bar",
    calories: 250,
    protein: "3g",
    fat: "12g",
    carbs: "30g",
    allergens: ["Nuts", "Dairy"],
    dietCompatibility: ["Not Vegan", "Not Keto"],
  },
  "987654321": {
    name: "Oatmeal Cereal",
    calories: 150,
    protein: "5g",
    fat: "2g",
    carbs: "27g",
    allergens: ["Gluten"],
    dietCompatibility: ["Vegan", "Low Fat"],
  },
};

export default function FoodScanner() {
  const [barcode, setBarcode] = useState("");
  const [foodInfo, setFoodInfo] = useState<any | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const scanFood = () => {
    if (mockFoodDatabase[barcode]) {
      setFoodInfo(mockFoodDatabase[barcode]);
    } else {
      setFoodInfo({ name: "Unknown Food", message: "No data available for this item." });
    }
  };

  return (
    <div className="flex h-screen">
        <Sidebar/>
      {/* Main Content */}
      <div className="flex-1 p-8 mb-20 sm:ml-64">
        <h1 className="text-2xl font-bold mb-4">AI Food Scanner</h1>
        
        {/* Input Field with Camera Icon */}
        <Card>
          <CardContent className="p-4 flex items-center gap-2">
            <Input
              type="text"
              placeholder="Enter or scan barcode"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline" size="icon">
              <Camera className="h-5 w-5" />
            </Button>
          </CardContent>
        </Card>

        <Button className="mt-4 w-full" onClick={scanFood}>
          Scan Food
        </Button>

        {/* Food Info Display */}
        {foodInfo && (
          <Card className="mt-4">
            <CardContent className="p-4">
              <h2 className="text-xl font-bold">{foodInfo.name}</h2>
              {foodInfo.message ? (
                <p className="text-gray-600">{foodInfo.message}</p>
              ) : (
                <>
                  <p>Calories: {foodInfo.calories} kcal</p>
                  <p>Protein: {foodInfo.protein}</p>
                  <p>Fat: {foodInfo.fat}</p>
                  <p>Carbs: {foodInfo.carbs}</p>
                  <h3 className="font-semibold mt-2">⚠️ Allergens:</h3>
                  <ul>
                    {foodInfo.allergens.map((allergen: string, index: number) => (
                      <li key={index} className="text-red-500">{allergen}</li>
                    ))}
                  </ul>
                  <h3 className="font-semibold mt-2">✔️ Diet Compatibility:</h3>
                  <ul>
                    {foodInfo.dietCompatibility.map((diet: string, index: number) => (
                      <li key={index} className="text-green-500">{diet}</li>
                    ))}
                  </ul>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
