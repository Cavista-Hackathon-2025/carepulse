import { createTRPCRouter, privateProcedure } from "./api/trpc";
import { z } from "zod";
import { uploadToStorage } from "../utils/upload"; // Cloud storage helper
import { analyzeFoodWithAI } from "../utils/ai"; // AI analysis function
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const foodRouter = createTRPCRouter({
  uploadFoodImage: privateProcedure
    .input(
      z.object({
        imageBase64: z.string(), // Accept base64 or file URL
      })
    )
    .mutation(async ({ input, ctx }: any) => {
      const { userId } = ctx.session;

      // Upload image to cloud storage
      const imageUrl = await uploadToStorage(input.imageBase64);

      // AI processes the image & extracts food info
      const { foodName, calories, nutrients } = await analyzeFoodWithAI(imageUrl);

      // Store in DB
      const foodLog = await prisma.foodScan.create({
        data: {
          userId,
          foodName : foodName as string,
          imageUrl : imageUrl as string,
          calories : calories,
          nutrients: nutrients ? JSON.stringify(nutrients) : null as any,
        },
      });

      return { success: true, foodLog };
    }),
});
