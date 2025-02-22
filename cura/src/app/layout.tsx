import type { Metadata } from "next";
import { Poppins } from "next/font/google"; // Import Poppins from Google Fonts
import "./globals.css";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs';

// Load Poppins font
const poppins = Poppins({
  subsets: ["latin"], // Specify the subset(s) you want to load
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"], // Specify the weights you need
  variable: "--font-poppins", // Define a CSS variable for the font
});

export const metadata: Metadata = {
  title: "Podscribe",
  description: "Article into rich Audio Summaries",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${poppins.variable} font-sans antialiased`} // Apply the Poppins font
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}