import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";

export const metadata: Metadata = {
  title: "Replan",
  description: "Replan MVP - behavior x mood tracker",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="main-shell">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
