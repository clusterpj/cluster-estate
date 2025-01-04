'use client';

import { ThemeProvider } from '../theme-provider';
import { AuthProvider } from './auth-provider';
import { Toaster } from '@/components/ui/toaster';
import { ToastProvider } from '@/components/ui/toast';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ToastProvider>
        <AuthProvider>
          <div className="min-h-screen flex flex-col antialiased">
            {children}
            <Toaster />
          </div>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
