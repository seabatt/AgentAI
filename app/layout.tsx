import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Headshot Generator | Agent.ai',
  description:
    'Upload a selfie, pick your look, get 3 professional headshots in under a minute.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
