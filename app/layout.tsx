import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
    title: "Meta-Pilot AI | Autonomous DeFi Wealth Management",
    description: "Intent-driven, autonomous DeFi wealth management powered by MetaMask Advanced Permissions. Transform your DeFi experience with AI agents.",
    keywords: ["DeFi", "AI", "MetaMask", "ERC-7715", "Autonomous Trading", "Yield Farming"],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
                {children}
            </body>
        </html>
    );
}
