import React from 'react';
import Navbar from '@/app/components/Navbar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className='min-h-screen bg-white'>
      <Navbar />
      <main className='max-w-7xl mx-auto px-4 sm:px-6'>{children}</main>
    </div>
  );
};

export default Layout;
