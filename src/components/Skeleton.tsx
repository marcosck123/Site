import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  circle?: boolean;
}

export default function Skeleton({ className = '', width, height, circle }: SkeletonProps) {
  const style: React.CSSProperties = {
    width: width,
    height: height,
    borderRadius: circle ? '50%' : undefined,
  };

  return (
    <div 
      className={`skeleton ${className}`} 
      style={style}
    />
  );
}
