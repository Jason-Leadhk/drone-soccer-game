// src/components/Ball.jsx
import React, { useEffect, useState, useRef } from 'react';
import { BALL_SIZE, BALL_SPEED, FIELD_WIDTH, FIELD_HEIGHT, GOAL_HEIGHT } from '../constants';

function Ball({ onGoal, gameOver }) {
  const [position, setPosition] = useState({
    x: FIELD_WIDTH / 2,
    y: FIELD_HEIGHT / 2
  });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const ballRef = useRef(null);

  useEffect(() => {
    const checkCollisions = () => {
      // Wall collisions
      if (position.y <= BALL_SIZE || position.y >= FIELD_HEIGHT - BALL_SIZE) {
        setVelocity(prev => ({ ...prev, y: -prev.y * 0.8 }));
      }

      // Goal detection
      const goalY = FIELD_HEIGHT / 2;
      const goalHalfHeight = GOAL_HEIGHT / 2;

      if (position.x <= BALL_SIZE) {
        if (Math.abs(position.y - goalY) <= goalHalfHeight) {
          onGoal('player2');
          resetBall();
        } else {
          setVelocity(prev => ({ ...prev, x: -prev.x * 0.8 }));
        }
      }

      if (position.x >= FIELD_WIDTH - BALL_SIZE) {
        if (Math.abs(position.y - goalY) <= goalHalfHeight) {
          onGoal('player1');
          resetBall();
        } else {
          setVelocity(prev => ({ ...prev, x: -prev.x * 0.8 }));
        }
      }
    };

    const updatePosition = () => {
      if (gameOver) return;

      setPosition(prev => ({
        x: prev.x + velocity.x,
        y: prev.y + velocity.y
      }));

      setVelocity(prev => ({
        x: prev.x * 0.99,
        y: prev.y * 0.99
      }));

      checkCollisions();
    };

    const gameLoop = setInterval(updatePosition, 16);
    return () => clearInterval(gameLoop);
  }, [position, velocity, gameOver, onGoal]);

  const resetBall = () => {
    setPosition({
      x: FIELD_WIDTH / 2,
      y: FIELD_HEIGHT / 2
    });
    setVelocity({ x: 0, y: 0 });
  };

  return (
    <div
      ref={ballRef}
      className="absolute bg-white rounded-full"
      style={{
        width: BALL_SIZE * 2,
        height: BALL_SIZE * 2,
        left: position.x - BALL_SIZE,
        top: position.y - BALL_SIZE,
        transition: 'transform 0.1s',
      }}
    />
  );
}

export default Ball;