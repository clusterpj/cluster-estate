'use client';

import { type ReactNode } from 'react';
import { ThemeProvider } from '../theme-provider';
import { AuthProvider } from './auth-provider';
import { Toaster } from '@/components/ui/toaster';
import { ToastProvider } from '@/components/ui/toast';
import { PayPalProvider } from './paypal-provider';

interface ProvidersProps {
  children: ReactNode;
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
          <PayPalProvider>
            <div className="min-h-screen flex flex-col antialiased">
              {children}
              <Toaster />
            </div>
          </PayPalProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
