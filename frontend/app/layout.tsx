import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "PriceWise – Smart Price Tracker",
  description: "Track prices from Amazon, Flipkart & Meesho. Get alerts when prices drop.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0f172a] text-[#f1f5f9] antialiased">
        <Navbar />
        <main>{children}</main>
        <footer className="border-t border-[#334155] mt-20 py-8 text-center text-[#94a3b8] text-sm">
          <p>
            © {new Date().getFullYear()}{" "}
            <span className="text-[#6366f1] font-semibold">PriceWise</span> — Smart Price Tracking for Indian Shoppers 🇮🇳
          </p>
        </footer>
      </body>
    </html>
  );
}