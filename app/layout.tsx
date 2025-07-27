import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/providers";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "个人博客 - 全栈开发者",
    template: "%s | 个人博客",
  },
  metadataBase: new URL("https://yourdomain.com"), // 替换为你的实际域名

  description:
    "一个基于Next.js的个人展示网站，包含博客系统、项目展示和在线简历",
  keywords: ["Next.js", "React", "TypeScript", "GraphQL", "Blog", "Portfolio"],
  authors: [{ name: "Your Name" }],
  creator: "Your Name",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://yourdomain.com",
    title: "个人博客 - 全栈开发者",
    description:
      "一个基于Next.js的个人展示网站，包含博客系统、项目展示和在线简历",
    siteName: "个人博客",
  },
  twitter: {
    card: "summary_large_image",
    title: "个人博客 - 全栈开发者",
    description:
      "一个基于Next.js的个人展示网站，包含博客系统、项目展示和在线简历",
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
