import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import Providers from './providers';

export const metadata = {
  title: 'ServiceNow Study Guide',
  description:
    'Supplementary practice for ServiceNow CSA and CAD certifications.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <Providers>{children}</Providers>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
