// app/layout.tsx
import './globals.css';
import { ReactNode } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/components/auth/AuthProvider';
import AuthGate from '@/components/auth/AuthGate';
import LayoutShell from '@/components/layout/LayoutShell';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-muted text-foreground">
        <AuthProvider>
          <AuthGate>
            <LayoutShell>{children}</LayoutShell>
            <Toaster position="bottom-right" />
          </AuthGate>
        </AuthProvider>
      </body>
    </html>
  );
}




