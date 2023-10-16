import Image from 'next/image';
import { Inter } from 'next/font/google';
import { ReactNode } from 'react';
import Navbar from './Navbar';

const inter = Inter({ subsets: ['latin'] });

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className={`flex px-24 py-12 flex-col ${inter.className}`}>
      <Navbar />
      <div className="flex">{children}</div>
    </div>
  );
};

export default Layout;
