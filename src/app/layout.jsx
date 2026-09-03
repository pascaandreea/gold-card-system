import './globals.css';

export const metadata = {
  title: 'GOLD Card System',
  description: 'Loyalty card management',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ro">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="bg-stone-50 text-stone-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
