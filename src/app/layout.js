import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Nova earlyElimu Code Club',
  description: 'Same Teacher. Max 20 Kids. Real Fullstack Projects. Fullstack Development for Kids Age 8-12 in Elburgon, Kenya.',
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
