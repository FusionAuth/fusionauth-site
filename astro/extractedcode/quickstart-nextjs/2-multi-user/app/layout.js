export const metadata = { title: 'Text Editor' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'sans-serif', margin: 40, lineHeight: 1.6 }}>{children}</body>
    </html>
  );
}
