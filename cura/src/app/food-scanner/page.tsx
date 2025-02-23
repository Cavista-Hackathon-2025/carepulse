'use client';

import { useState, useRef } from "react";
import { 
  Camera, Barcode, X, Upload, ChevronRight, 
  AlertCircle, Check, Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Sidebar from "@/components/sidebar";
import { scanFoodLabel } from "@/action/scan";

interface FoodInfo {
  name: string;
  calories: number;
  protein: string;
  fat: string;
  carbs: string;
  ingredients?: string[];
  allergens?: string[];
  servingSize?: string;
  message?: string;
}

export default function FoodScanner() {
  const [activeTab, setActiveTab] = useState("barcode");
  const [barcode, setBarcode] = useState("");
  const [foodInfo, setFoodInfo] = useState<FoodInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScan = async (type: 'barcode' | 'image', value?: string | File) => {
    setLoading(true);
    setError(null);
    try {
      const result = await scanFoodLabel("user-id-placeholder", value as any);
      setFoodInfo(result);
    } catch (error) {
      console.error("Error scanning food:", error);
      setError("Failed to analyze food. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleScan('image', file);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-3xl p-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">AI Food Scanner</h1>
            <p className="text-muted-foreground">
              Scan food items using barcode or camera to get nutritional information
            </p>
          </header>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="barcode" className="flex items-center gap-2">
                <Barcode className="h-4 w-4" />
                Barcode
              </TabsTrigger>
              <TabsTrigger value="camera" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Camera
              </TabsTrigger>
            </TabsList>

            <TabsContent value="barcode" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Enter barcode number"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={() => handleScan('barcode', barcode)}
                      disabled={loading || !barcode}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="camera" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                    />
                    <Button
                      variant="outline"
                      className="w-full h-32 border-dashed"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <span>Upload food photo</span>
                        <span className="text-sm text-muted-foreground">
                          or drag and drop
                        </span>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {error && (
            <Alert variant="destructive" className="mt-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {foodInfo && !error && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  {foodInfo.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Calories</span>
                      <p className="text-xl font-bold">{foodInfo.calories} kcal</p>
                    </div>
                    {foodInfo.servingSize && (
                      <div className="space-y-1">
                        <span className="text-sm text-muted-foreground">Serving Size</span>
                        <p className="text-xl font-bold">{foodInfo.servingSize}</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Protein</span>
                      <p className="font-semibold">{foodInfo.protein}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Fat</span>
                      <p className="font-semibold">{foodInfo.fat}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Carbs</span>
                      <p className="font-semibold">{foodInfo.carbs}</p>
                    </div>
                  </div>

                  {foodInfo.ingredients && (
                    <div className="space-y-2">
                      <span className="text-sm text-muted-foreground">Ingredients</span>
                      <p className="text-sm">{foodInfo.ingredients.join(", ")}</p>
                    </div>
                  )}

                  {foodInfo.allergens && foodInfo.allergens.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-sm text-muted-foreground">Allergens</span>
                      <p className="text-sm font-medium text-red-500">
                        {foodInfo.allergens.join(", ")}
                      </p>
                    </div>
                  )}

                  {foodInfo.message && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{foodInfo.message}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}