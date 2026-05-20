// src/components/Background.tsx
import React from 'react';
import './Background.css';

const Background: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="background-wrapper">
      <div className="background-animation" />
      {children}
    </div>
  );
};

export default Background;
