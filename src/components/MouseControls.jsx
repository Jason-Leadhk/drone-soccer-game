// src/components/MouseControls.jsx
import React from 'react';
import { TOUCH_BUTTON_SIZE } from '../constants';

function MouseControls({ isPlayer1, onDirectionChange }) {
  const handleMouseDown = (direction) => {
    onDirectionChange(direction);
  };

  const handleMouseUp = () => {
    onDirectionChange({ x: 0, y: 0 });
  };
  
  // Add touch handlers to ensure the component works on both device types
  const handleTouchStart = (direction, e) => {
    e.preventDefault();
    onDirectionChange(direction);
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    onDirectionChange({ x: 0, y: 0 });
  };

  const buttonStyle = "w-16 h-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-white text-2xl hover:bg-opacity-30 active:bg-opacity-40 transition-all cursor-pointer select-none";
  const containerStyle = `fixed bottom-8 ${isPlayer1 ? 'left-8' : 'right-8'} flex flex-col items-center gap-2`;

  return (
    <div className={containerStyle} style={{ width: TOUCH_BUTTON_SIZE * 3 }}>
      {/* Up button */}
      <div
        className={buttonStyle}
        onMouseDown={() => handleMouseDown({ x: 0, y: -1 })}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={(e) => handleTouchStart({ x: 0, y: -1 }, e)}
        onTouchEnd={handleTouchEnd}
        aria-label="Up"
      >
        ↑
      </div>
      
      {/* Middle row (Left, Right) */}
      <div className="flex justify-between w-full">
        <div
          className={buttonStyle}
          onMouseDown={() => handleMouseDown({ x: -1, y: 0 })}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={(e) => handleTouchStart({ x: -1, y: 0 }, e)}
          onTouchEnd={handleTouchEnd}
          aria-label="Left"
        >
          ←
        </div>
        <div
          className={buttonStyle}
          onMouseDown={() => handleMouseDown({ x: 1, y: 0 })}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={(e) => handleTouchStart({ x: 1, y: 0 }, e)}
          onTouchEnd={handleTouchEnd}
          aria-label="Right"
        >
          →
        </div>
      </div>
      
      {/* Down button */}
      <div
        className={buttonStyle}
        onMouseDown={() => handleMouseDown({ x: 0, y: 1 })}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={(e) => handleTouchStart({ x: 0, y: 1 }, e)}
        onTouchEnd={handleTouchEnd}
        aria-label="Down"
      >
        ↓
      </div>
    </div>
  );
}

export default MouseControls;