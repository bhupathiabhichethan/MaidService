import './globals.css';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'Helper4U - Verified Maids, Nannies & Babysitters',
  description: 'Find trusted, verified domestic helpers for your home. Book maids, nannies, and babysitters with flexible plans.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
