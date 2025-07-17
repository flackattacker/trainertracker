import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trainer Tracker API',
  description: 'API server for the Trainer Tracker application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
} 