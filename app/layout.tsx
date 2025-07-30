import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/providers";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "hailong 的个人网站 - 全栈开发者",
    template: "%s | hailong 的个人网站",
  },
  metadataBase: new URL("https://yourdomain.com"), // 替换为你的实际域名

  description:
    "hailong 的个人展示网站，基于Next.js构建，包含博客系统、项目展示和在线简历",
  keywords: [
    "Next.js",
    "React",
    "TypeScript",
    "GraphQL",
    "Blog",
    "Portfolio",
    "hailong",
  ],
  authors: [{ name: "hailong" }],
  creator: "hailong",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-icon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://lwjcjmx23.com",
    title: "hailong 的个人网站 - 全栈开发者",
    description:
      "hailong 的个人展示网站，基于Next.js构建，包含博客系统、项目展示和在线简历",
    siteName: "hailong 的个人网站",
  },
  twitter: {
    card: "summary_large_image",
    title: "hailong 的个人网站 - 全栈开发者",
    description:
      "hailong 的个人展示网站，基于Next.js构建，包含博客系统、项目展示和在线简历",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
