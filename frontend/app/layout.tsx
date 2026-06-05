import type { Metadata } from "next";
import { Geist, Geist_Mono, Raleway, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/toaster"
import { BackendStatusGate } from "@/components/backend-status-gate";

const spaceGroteskHeading = Space_Grotesk({ subsets: ['latin'], variable: '--font-heading' });

const raleway = Raleway({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://upblit.com"),
  title: {
    default: "Upblit | Operational telemetry for engineering teams",
    template: "%s | Upblit",
  },
  description:
    "Dark-first observability for logs, traces, metrics, API keys, and AI-assisted incident review.",
  openGraph: {
    siteName: "Upblit",
    type: "website",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Upblit" }],
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", raleway.variable, spaceGroteskHeading.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider>
            <BackendStatusGate>{children}</BackendStatusGate>
          </TooltipProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
