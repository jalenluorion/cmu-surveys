import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { createClient } from "@/lib/supabase/server";
import { createOrUpdateServerUser } from "@/lib/supabase/server-queries";
import { Navigation } from "@/components/navigation";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "CMU Survey Exchange",
  description: "Complete surveys to unlock posting privileges. Fair survey distribution for CMU students.",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Handle user authentication and profile creation at the layout level
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Create or update user profile if authenticated
  if (user) {
    await createOrUpdateServerUser(
      user.id,
      user.email || '',
      user.user_metadata?.full_name
    );
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navigation />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
