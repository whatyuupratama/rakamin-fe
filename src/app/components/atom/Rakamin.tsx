import React from 'react';
import Image from 'next/image';

interface propsIcon {
  className?: string;
}
export default function Rakamin({ className }: propsIcon) {
  return (
    <Image
      src='/icon.png'
      alt='icon'
      width={200}
      height={200}
      aria-required
      priority
      className={`object-contain ${className}`}
    />
  );
}
