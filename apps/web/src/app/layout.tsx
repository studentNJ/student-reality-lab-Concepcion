import Link from "next/link";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The 30% Problem",
  description: "Rent burden dashboard for young adults across major metros.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="px-4 pt-4 sm:px-6">
          <div className="motion-rise hover-lift mx-auto max-w-6xl rounded-2xl border border-slate-200/80 bg-white/90 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)] backdrop-blur">
            <nav className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 text-sm text-slate-700 sm:px-6">
              <div className="flex items-center gap-4">
                <Link className="group flex items-center gap-3" href="/">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold tracking-wide text-white transition-transform duration-200 group-hover:scale-[1.04]">
                    30%
                  </span>
                  <span className="space-y-0.5">
                    <span className="block text-base font-semibold text-slate-900 transition-colors duration-200 group-hover:text-blue-800">The 30% Problem</span>
                    <span className="block text-xs uppercase tracking-[0.18em] text-slate-500">
                      Rent Burden Teaching Lab
                    </span>
                  </span>
                </Link>
              </div>

              <div className="flex items-center gap-3">
                <span className="hover-soft hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 sm:inline-flex">
                  Metro affordability explorer
                </span>
                <Link
                  className="hover-soft rounded-full border border-blue-200 bg-blue-50 px-4 py-2 font-medium text-blue-800 transition-colors hover:border-blue-300 hover:bg-blue-100"
                  href="/methodology"
                >
                  Open full methodology
                </Link>
              </div>
            </nav>
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}
