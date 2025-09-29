"use client"

import React from 'react';

const LoadingPage: React.FC = () => {
  return (
    <div style={overlayStyle}>
      <div style={spinnerStyle} />
      <div style={textStyle}>Loading...</div>
    </div>
  );
};

// Styles
const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
};

const spinnerStyle: React.CSSProperties = {
  width: 50,
  height: 50,
  border: '6px solid #ccc',
  borderTop: '6px solid #4caf50',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
};

const textStyle: React.CSSProperties = {
  marginTop: 16,
  fontSize: 18,
  color: '#4caf50',
};

// Add global keyframes (put this in your CSS or style component)
/*
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
*/

export default LoadingPage;
