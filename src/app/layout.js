import { Inter } from 'next/font/google';
import './globals.css';
import GlobalLoader from './components/GlobalLoader';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Nova earlyElimu Code Club',
  description: 'Fullstack Development for Kids Age 8-12 in Elburgon, Kenya.',
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <GlobalLoader />
        {children}
      </body>
    </html>
  );
}

