import type { Metadata } from 'next';

import { Copyright } from '@/components';
import theme from '@/theme';
import { ThemeProvider } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import CssBaseline from '@mui/material/CssBaseline';

import Providers from './providers';

export const metadata: Metadata = {
  title: 'Ghost App',
  description: 'Conneting to a Ghost Server'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Providers>
              <section>{children}</section>
              <section>
                <Copyright />
              </section>
            </Providers>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
