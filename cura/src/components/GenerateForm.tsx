"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@clerk/nextjs";
import { Camera, Upload, ChevronRight, AlertCircle, Loader2, Edit3 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Maximum file size in bytes (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

interface FoodAnalysisFormProps {
  onAnalyze: (input: string | File, type: 'text' | 'image') => Promise<{
    success: boolean;
    foodName?: string;
    calories?: number;
    nutrients?: Record<string, number>;
    error?: string;
  }>;
}

export default function FoodAnalysisForm({ onAnalyze }: FoodAnalysisFormProps) {
  const { user, isLoaded, isSignedIn } = useUser();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("text");
  const [textInput, setTextInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextAnalysis = async () => {
    if (!isLoaded || !isSignedIn || !user) {
      toast({
        title: "Error",
        description: "You must be logged in to analyze food.",
        variant: "destructive",
      });
      return;
    }

    if (!textInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await onAnalyze(textInput, 'text');
      if (result.success) {
        setAnalysisResult(result);
        toast({
          title: "Success",
          description: "Food analysis completed successfully!",
        });
      } else {
        throw new Error(result.error || "Analysis failed");
      }
    } catch (error) {
      console.error("Error analyzing food:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to analyze food. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isLoaded || !isSignedIn || !user) {
      toast({
        title: "Error",
        description: "You must be logged in to analyze food.",
        variant: "destructive",
      });
      return;
    }

    const file = event.target.files?.[0];
    if (!file) {
      toast({
        title: "Error",
        description: "No file selected. Please choose an image to upload.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Error",
        description: `File is too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.id);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      const { imageUrl } = await uploadResponse.json();
      const result = await onAnalyze(imageUrl, 'image');
      if (result.success) {
        setAnalysisResult(result);
        toast({
          title: "Success",
          description: "Food analysis completed successfully!",
        });
      } else {
        throw new Error(result.error || "Analysis failed");
      }
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Analyze Food</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="text" className="flex items-center gap-2">
                <Edit3 className="h-4 w-4" />
                Text Input
              </TabsTrigger>
              <TabsTrigger value="camera" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Take Photo
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload Image
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="mt-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="food-text">Enter food description or ingredients</Label>
                  <Textarea
                    id="food-text"
                    placeholder="Enter food details, ingredients, or nutrition information..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    className="h-32 mt-2"
                  />
                </div>
                <Button 
                  onClick={handleTextAnalysis}
                  disabled={isAnalyzing || !textInput.trim()}
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing...
                    </div>
                  ) : (
                    "Analyze Food"
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="camera" className="mt-4">
              <div className="flex flex-col items-center gap-4">
                <Button
                  variant="outline"
                  className="w-full h-32 border-dashed"
                  onClick={() => {/* Implement camera capture */}}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Camera className="h-8 w-8 text-muted-foreground" />
                    <span>Take a photo</span>
                  </div>
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="upload" className="mt-4">
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
                  disabled={isUploading || isAnalyzing}
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {(isUploading || isAnalyzing) && (
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>{isUploading ? "Uploading..." : "Analyzing food..."}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Food Name</Label>
                <p className="text-xl font-semibold">{analysisResult.foodName}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Calories</Label>
                  <p className="text-xl font-semibold">{analysisResult.calories} kcal</p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Nutrients</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  {Object.entries(analysisResult.nutrients || {}).map(([nutrient, value]) => (
                    <div key={nutrient} className="space-y-1">
                      <span className="text-sm text-muted-foreground capitalize">{nutrient}</span>
                      <p className="font-semibold">{value}g</p>
                    </div>
                  ))}
                </div>
              </div>

              {analysisResult.flagged && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Health Warnings</AlertTitle>
                  <AlertDescription>
                    {analysisResult.flagged.join(", ")}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}