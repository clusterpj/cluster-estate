"use client"; // Remove this line if not using Next.js App Router

import React from 'react';

const WaveText = ({ text = "CABARETE" }) => {
  return (
    <div className="wave-text-container">
      <h1 
        className="wave-text"
        aria-label={text}
      >
        {Array.from(text).map((letter, index) => (
          <span 
            key={index}
            className="wave-letter"
            style={{ 
              animationDelay: `${index * 0.08}s`,
            }}
          >
            {letter}
          </span>
        ))}
      </h1>
      
      <style jsx>{`
        .wave-text-container {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          overflow-x: hidden;
        }
        
        .wave-text {
          font-size: 6rem; /* Reduced from 7.5rem */
          font-weight: bold;
          color: rgba(255, 255, 255, 0.5); /* Increased transparency from 0.7 to 0.5 */
          letter-spacing: 0.05em;
          text-shadow: 0 5px 10px rgba(0, 0, 0, 0.3);
          white-space: nowrap; /* Prevent text from breaking into multiple lines */
        }
        
        .wave-letter {
          display: inline-block;
          padding: 0 0.02em;
          animation: wave 2s ease-in-out infinite;
          transform-origin: bottom center;
        }
        
        @keyframes wave {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          25% {
            transform: translateY(-15px) rotate(-3deg);
          }
          50% {
            transform: translateY(-8px) rotate(0deg);
          }
          75% {
            transform: translateY(-4px) rotate(3deg);
          }
        }
        
        @media (min-width: 640px) {
          .wave-text {
            font-size: 6.5rem; /* Reduced from 8.5rem */
          }
        }
        
        @media (min-width: 768px) {
          .wave-text {
            font-size: 7.5rem; /* Reduced from 10rem */
          }
        }
        
        @media (min-width: 1024px) {
          .wave-text {
            font-size: 8.5rem; /* Reduced from 12rem */
          }
        }
      `}</style>
    </div>
  );
};

export default WaveText;