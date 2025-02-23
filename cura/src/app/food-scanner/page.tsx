"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, Search } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function FoodScannerPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useUser();
  const [selectedFile, setSelectedFile] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const uploadAndScan = async () => {
    if (!selectedFile) {
      toast({ title: "Error", description: "Please select a file first", variant: "destructive" });
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadResponse.json();

      if (!uploadData.success) {
        throw new Error(uploadData.error);
      }

      const scanResponse = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl: uploadData.fileUrl }),
      });
      const scanData = await scanResponse.json();

      if (scanData.success) {
        setScanResult(scanData.result);
        toast({ title: "Success", description: "Food scanned successfully" });
      } else {
        throw new Error(scanData.error);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to scan food", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Food Scanner</h1>
      </div>

      <div className="mb-6">
        <Input type="file" onChange={handleFileUpload} className="mb-4" />
        <Button onClick={uploadAndScan} disabled={isLoading} className="gap-2">
          <Upload className="w-4 h-4" />
          {isLoading ? "Scanning..." : "Upload & Scan"}
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          className="pl-10"
          placeholder="Search food information..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {scanResult && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Scan Result</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{scanResult}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
