'use client'
import React, { useState } from 'react';
import { Camera, Upload, Search, AlertCircle, Check, X, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/sidebar";
import { scanFoodLabel, scanFoodImage } from '@/action/scan';
import { useUser } from '@clerk/nextjs';

export default function FoodScanner() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [labelText, setLabelText] = useState('');
  const [scanResults, setScanResults] = useState(null);
  const [error, setError] = useState('');
  const [scanMode, setScanMode] = useState('image'); // 'image' or 'label'

  const handleScan = async () => {
    if (!user) {
      setError('Please sign in to use the scanner');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      let results;
      if (scanMode === 'image') {
        results = await scanFoodImage(user.id, imageUrl);
      } else {
        results = await scanFoodLabel(user.id, labelText);
      }
      setScanResults(results);
    } catch (err) {
      setError('Failed to scan food. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 p-8 ml-64">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Food Scanner</h1>
              <p className="text-gray-500 mt-2">Analyze food content and nutritional information</p>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={scanMode === 'image' ? 'default' : 'outline'}
                onClick={() => setScanMode('image')}
              >
                <Camera className="w-4 h-4 mr-2" />
                Image Scan
              </Button>
              <Button
                variant={scanMode === 'label' ? 'default' : 'outline'}
                onClick={() => setScanMode('label')}
              >
                <Search className="w-4 h-4 mr-2" />
                Label Scan
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{scanMode === 'image' ? 'Food Image Analysis' : 'Food Label Analysis'}</CardTitle>
            </CardHeader>
            <CardContent>
              {scanMode === 'image' ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="flex-1"
                    />
                    <span className="text-gray-400">or</span>
                    <Input
                      type="text"
                      placeholder="Paste image URL"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  {imageUrl && (
                    <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={imageUrl}
                        alt="Food preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <textarea
                  className="w-full h-32 p-3 border rounded-lg"
                  placeholder="Paste food label text here..."
                  value={labelText}
                  onChange={(e) => setLabelText(e.target.value)}
                />
              )}

              <Button 
                className="w-full mt-4" 
                onClick={handleScan}
                disabled={loading || (!imageUrl && !labelText)}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Analyze Food
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {scanResults && (
            <Card>
              <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{scanResults.foodName}</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{scanResults.calories} kcal</Badge>
                      {Object.entries(scanResults.nutrients).map(([nutrient, value]) => (
                        <Badge key={nutrient} variant="outline">
                          {nutrient}: {value}g
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {scanResults.allergens && (
                    <div>
                      <h4 className="font-medium mb-2">Allergens</h4>
                      <div className="flex flex-wrap gap-2">
                        {scanResults.allergens.map((allergen, index) => (
                          <Badge key={index} variant="destructive">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {allergen}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {scanResults.dietCompatibility && (
                    <div>
                      <h4 className="font-medium mb-2">Diet Compatibility</h4>
                      <div className="flex flex-wrap gap-2">
                        {scanResults.dietCompatibility.map((diet, index) => (
                          <Badge 
                            key={index}
                            variant="outline"
                            className={diet.startsWith('Not') ? 'bg-red-50' : 'bg-green-50'}
                          >
                            {diet.startsWith('Not') ? (
                              <X className="w-3 h-3 mr-1" />
                            ) : (
                              <Check className="w-3 h-3 mr-1" />
                            )}
                            {diet}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}