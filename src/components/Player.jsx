// src/components/Player.jsx
import React, { useEffect, useCallback } from 'react';
import { PLAYER_SPEED, PLAYER_SIZE, FIELD_WIDTH, FIELD_HEIGHT } from '../constants';
import TouchControls from './TouchControls';
import MouseControls from './MouseControls';
import useDeviceDetection from '../hooks/useDeviceDetection';

function Player({ isPlayer1, gameOver, position, setPosition, velocity, setVelocity }) {
  const { isMobile } = useDeviceDetection();
  const keysPressed = {};

  const handleKeyDown = useCallback((e) => {
    if (gameOver) return;
    
    const keys = isPlayer1 
      ? { up: 'w', down: 's', left: 'a', right: 'd' }
      : { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' };

    keysPressed[e.key] = true;
    
    let newVelocity = { x: velocity.x, y: velocity.y };
    
    if (keysPressed[keys.up]) newVelocity.y = -PLAYER_SPEED;
    if (keysPressed[keys.down]) newVelocity.y = PLAYER_SPEED;
    if (keysPressed[keys.left]) newVelocity.x = -PLAYER_SPEED;
    if (keysPressed[keys.right]) newVelocity.x = PLAYER_SPEED;

    setVelocity(newVelocity);
  }, [gameOver, velocity]);

  const handleKeyUp = useCallback((e) => {
    delete keysPressed[e.key];
    
    if (Object.keys(keysPressed).length === 0) {
      setVelocity({ x: 0, y: 0 });
    }
  }, []);

  const handleTouchDirection = useCallback((direction) => {
    if (gameOver) return;
    setVelocity({
      x: direction.x * PLAYER_SPEED,
      y: direction.y * PLAYER_SPEED
    });
  }, [gameOver]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  useEffect(() => {
    const updatePosition = () => {
      if (gameOver) return;

      const damping = 0.98; // Add damping to make movement more realistic
      const newVelocity = {
        x: velocity.x * damping,
        y: velocity.y * damping
      };

      setPosition(prev => {
        const newX = prev.x + newVelocity.x;
        const newY = prev.y + newVelocity.y;

        // Boundary collision with elastic response
        let finalX = newX;
        let finalY = newY;
        let finalVelX = newVelocity.x;
        let finalVelY = newVelocity.y;

        if (newX <= PLAYER_SIZE) {
          finalX = PLAYER_SIZE;
          finalVelX = Math.abs(newVelocity.x) * 0.8; // Elastic collision
        } else if (newX >= FIELD_WIDTH - PLAYER_SIZE) {
          finalX = FIELD_WIDTH - PLAYER_SIZE;
          finalVelX = -Math.abs(newVelocity.x) * 0.8;
        }

        if (newY <= PLAYER_SIZE) {
          finalY = PLAYER_SIZE;
          finalVelY = Math.abs(newVelocity.y) * 0.8;
        } else if (newY >= FIELD_HEIGHT - PLAYER_SIZE) {
          finalY = FIELD_HEIGHT - PLAYER_SIZE;
          finalVelY = -Math.abs(newVelocity.y) * 0.8;
        }

        setVelocity({ x: finalVelX, y: finalVelY });
        return { x: finalX, y: finalY };
      });
    };

    const gameLoop = setInterval(updatePosition, 16);
    return () => clearInterval(gameLoop);
  }, [velocity, gameOver]);

  return (
    <>
      <div
        className={`absolute rounded-full ${isPlayer1 ? 'bg-blue-500' : 'bg-red-500'} border-2 ${isPlayer1 ? 'border-blue-700' : 'border-red-700'}`}
        style={{
          width: PLAYER_SIZE * 2,
          height: PLAYER_SIZE * 2,
          left: position.x - PLAYER_SIZE,
          top: position.y - PLAYER_SIZE,
          transition: 'transform 0.1s',
        }}
      />
      {/* Always show control components regardless of device type */}
      {/* Touch controls for mobile devices */}
      {isMobile && (
        <TouchControls 
          isPlayer1={isPlayer1} 
          onDirectionChange={handleTouchDirection}
        />
      )}
      {/* Mouse controls for desktop devices */}
      {!isMobile && (
        <MouseControls 
          isPlayer1={isPlayer1} 
          onDirectionChange={handleTouchDirection}
        />
      )}
    </>
  );
}

export default Player;