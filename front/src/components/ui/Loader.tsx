import React from 'react';

interface LoaderProps {
  fullScreen?: boolean;
  text?: string;
}

export const Loader: React.FC<LoaderProps> = ({ fullScreen = false, text = 'Loading...' }) => {
  return (
    <div className={`loader-container ${fullScreen ? 'fullscreen' : ''}`}>
      <div className="loader-spinner">
        <div className="loader-ring"></div>
        <div className="loader-ring-inner"></div>
      </div>
      <p className="loader-text">{text}</p>
    </div>
  );
};