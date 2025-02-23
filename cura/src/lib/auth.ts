'use server'
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const getOrCreateUser = async () => {
  const user = await currentUser();
  if (!user) throw new Error("User not authenticated");

  const existingUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });

  if (!existingUser) {
    return await prisma.user.create({
      data: {
        clerkId: user.id,
        email: user.emailAddresses[0].emailAddress,
        name: user.firstName || "User",
      },
    });
  }
  console.log(user.id)
  return existingUser;
};
