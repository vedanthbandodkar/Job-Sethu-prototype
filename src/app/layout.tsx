import type { Metadata } from 'next';
import './globals.css';
import { AppHeader } from '@/components/app-header';
import { Toaster } from '@/components/ui/toaster';  
import { cn } from '@/lib/utils';
import { BottomNavBar } from '@/components/bottom-nav';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'Job Sethu',
  description: 'Connecting skills with opportunities',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning={true}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col bg-background">
            <AppHeader />
            <main className="flex-1 pb-16">{children}</main>
            <BottomNavBar />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
