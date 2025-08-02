import type { Metadata } from "next";
import "./globals.css";
import dynamic from 'next/dynamic';

const EnhancedHealthUI = dynamic(() => import('@/components/enhanced-health-ui'), {
  loading: () => null
});

export const metadata: Metadata = {
  title: "八字运势解读 - 专业命理分析",
  description: "基于传统命理学的八字占卜系统，为年轻人提供准确的运势解读和个性化指导。包含财运、姻缘、事业、健康、学业等全面分析。",
  keywords: "八字算命,运势分析,命理学,占卜,财运,姻缘,事业,健康",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  openGraph: {
    title: "八字运势解读 - 专业命理分析",
    description: "基于传统命理学的八字占卜系统，为年轻人提供准确的运势解读",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "八字运势解读",
    description: "专业的八字占卜系统",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const showHealthDashboard = process.env.NODE_ENV === 'development';
  
  return (
    <html lang="zh">
      <body className="antialiased">
        {children}
        {showHealthDashboard && (
          <EnhancedHealthUI isDev={true} position="bottom-right" theme="auto" />
        )}
      </body>
    </html>
  );
}
