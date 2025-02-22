// utils/upload.ts
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";
import { app } from "../server/firebase";

// Initialize Firebase Storage
const storage = getStorage(app);

export const uploadToStorage = async (base64Data: string): Promise<string> => {
  // Generate a unique file name based on timestamp and random string
  const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;

  // Create a storage reference
  const storageRef = ref(storage, `food-images/${fileName}`);

  try {
    // Upload the base64 string to Firebase Storage
    await uploadString(storageRef, base64Data, 'base64', { contentType: 'image/jpeg' });

    // Get the download URL
    const fileUrl = await getDownloadURL(storageRef);

    return fileUrl; // Return the file URL from Firebase Storage
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Image upload failed");
  }
};
