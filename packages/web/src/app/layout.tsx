import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TestMaster - Test Automation Platform',
  description: 'AI-augmented test automation platform',
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
