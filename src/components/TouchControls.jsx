// src/components/TouchControls.jsx
import React from 'react';
import { TOUCH_BUTTON_SIZE } from '../constants';

function TouchControls({ isPlayer1, onDirectionChange }) {
  const handleTouchStart = (direction, e) => {
    e.preventDefault();
    onDirectionChange(direction);
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    onDirectionChange({ x: 0, y: 0 });
  };

  const buttonStyle = "w-16 h-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-white text-2xl active:bg-opacity-40 touch-none";
  const containerStyle = `fixed bottom-8 ${isPlayer1 ? 'left-8' : 'right-8'} flex flex-col items-center gap-2`;

  return (
    <div className={containerStyle} style={{ width: TOUCH_BUTTON_SIZE * 3 }}>
      {/* Up button */}
      <button
        className={buttonStyle}
        onTouchStart={(e) => handleTouchStart({ x: 0, y: -1 }, e)}
        onTouchEnd={handleTouchEnd}
        aria-label="Up"
      >
        ↑
      </button>
      
      {/* Middle row (Left, Right) */}
      <div className="flex justify-between w-full">
        <button
          className={buttonStyle}
          onTouchStart={(e) => handleTouchStart({ x: -1, y: 0 }, e)}
          onTouchEnd={handleTouchEnd}
          aria-label="Left"
        >
          ←
        </button>
        <button
          className={buttonStyle}
          onTouchStart={(e) => handleTouchStart({ x: 1, y: 0 }, e)}
          onTouchEnd={handleTouchEnd}
          aria-label="Right"
        >
          →
        </button>
      </div>
      
      {/* Down button */}
      <button
        className={buttonStyle}
        onTouchStart={(e) => handleTouchStart({ x: 0, y: 1 }, e)}
        onTouchEnd={handleTouchEnd}
        aria-label="Down"
      >
        ↓
      </button>
    </div>
  );
}

export default TouchControls;