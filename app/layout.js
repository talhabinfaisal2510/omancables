import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import IdleTimerProvider from "../components/IdleTimerProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Cables Sustainability Event",
  description: "Interactive event experience",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <IdleTimerProvider>{children}</IdleTimerProvider>
      </body>
    </html>
  );
}
