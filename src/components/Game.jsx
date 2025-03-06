// src/components/Game.jsx
import React, { useEffect, useState, useRef } from 'react';
import Player from './Player';
import ScoreBoard from './ScoreBoard';
import { GAME_DURATION, FIELD_WIDTH, FIELD_HEIGHT, GOAL_WIDTH, GOAL_HEIGHT, PLAYER_SIZE, RESTITUTION, GOAL_DISTANCE, GOAL_POST_DIAMETER, FIELD_CENTER_X, FIELD_CENTER_Y } from '../constants';

function Game() {
  const [scores, setScores] = useState({ player1: 0, player2: 0 });
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameOver, setGameOver] = useState(false);
  // Initial positions: blue player at (-5m, 0m), red player at (5m, 0m) in field-centered coordinates
  const [player1Pos, setPlayer1Pos] = useState({ x: FIELD_CENTER_X - 250, y: FIELD_CENTER_Y }); // Blue player (-5m, 0m)
  const [player2Pos, setPlayer2Pos] = useState({ x: FIELD_CENTER_X + 250, y: FIELD_CENTER_Y }); // Red player (5m, 0m)
  const [player1Vel, setPlayer1Vel] = useState({ x: 0, y: 0 });
  const [player2Vel, setPlayer2Vel] = useState({ x: 0, y: 0 });
  const gameLoopRef = useRef();
  const lastUpdateRef = useRef(Date.now());

  const checkCollision = (pos1, pos2, radius) => {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < radius * 2;
  };

  const calculateCollisionResponse = (pos1, vel1, pos2, vel2) => {
    // Calculate displacement vector between the two objects
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    
    // Calculate distance and normalize the displacement vector
    const distance = Math.sqrt(dx * dx + dy * dy);
    const normalX = dx / distance;
    const normalY = dy / distance;
    
    // Calculate relative velocity
    const relVelX = vel2.x - vel1.x;
    const relVelY = vel2.y - vel1.y;
    
    // Calculate relative velocity in terms of the normal direction
    const velAlongNormal = relVelX * normalX + relVelY * normalY;
    
    // Do not resolve if objects are moving away from each other
    if (velAlongNormal > 0) {
      return { vel1, vel2 };
    }
    
    // Use the coefficient of restitution from constants
    const restitution = RESTITUTION;
    
    // Calculate impulse scalar
    const j = -(1 + restitution) * velAlongNormal;
    
    // Apply impulse
    const impulseX = j * normalX;
    const impulseY = j * normalY;
    
    // Equal mass assumed (mass = 1)
    return {
      vel1: { 
        x: vel1.x - impulseX, 
        y: vel1.y - impulseY 
      },
      vel2: { 
        x: vel2.x + impulseX, 
        y: vel2.y + impulseY 
      }
    };
  };

  // Keep track of goals to prevent duplicate scoring
  const [player1InBlueGoal, setPlayer1InBlueGoal] = useState(false);
  const [player1InRedGoal, setPlayer1InRedGoal] = useState(false);
  const [player2InBlueGoal, setPlayer2InBlueGoal] = useState(false);
  const [player2InRedGoal, setPlayer2InRedGoal] = useState(false);
  
  // Track direction of movement for goal detection (from front or back)
  const [player1LastXPos, setPlayer1LastXPos] = useState(FIELD_CENTER_X - 250);
  const [player2LastXPos, setPlayer2LastXPos] = useState(FIELD_CENTER_X + 250);
  
  // Goal post positions
  const blueTopPostPos = { x: GOAL_DISTANCE, y: FIELD_CENTER_Y - GOAL_HEIGHT/2 };
  const blueBottomPostPos = { x: GOAL_DISTANCE, y: FIELD_CENTER_Y + GOAL_HEIGHT/2 };
  const redTopPostPos = { x: FIELD_WIDTH - GOAL_DISTANCE, y: FIELD_CENTER_Y - GOAL_HEIGHT/2 };
  const redBottomPostPos = { x: FIELD_WIDTH - GOAL_DISTANCE, y: FIELD_CENTER_Y + GOAL_HEIGHT/2 };

  // Check collision with circular goal post
  const checkGoalPostCollision = (playerPos, playerVel, postPos) => {
    const dx = playerPos.x - postPos.x;
    const dy = playerPos.y - postPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // If collision with goal post
    if (distance < PLAYER_SIZE + GOAL_POST_DIAMETER/2) {
      // Calculate collision normal
      const normalX = dx / distance;
      const normalY = dy / distance;
      
      // Calculate relative velocity component along normal
      const velAlongNormal = playerVel.x * normalX + playerVel.y * normalY;
      
      // Only reflect if moving toward the post
      if (velAlongNormal < 0) {
        // Reflect velocity with rebound effect
        const rebound = 2 * velAlongNormal * RESTITUTION;
        const newVelX = playerVel.x - rebound * normalX;
        const newVelY = playerVel.y - rebound * normalY;
        
        // Push player outside of collision zone
        const overlap = PLAYER_SIZE + GOAL_POST_DIAMETER/2 - distance;
        const pushX = normalX * overlap * 1.01; // Add small extra to ensure separation
        const pushY = normalY * overlap * 1.01;
        
        return {
          hasCollided: true,
          newVel: { x: newVelX, y: newVelY },
          newPos: { x: playerPos.x + pushX, y: playerPos.y + pushY }
        };
      }
    }
    
    return { hasCollided: false };
  };
  
  const checkGoal = (pos, isPlayer1, lastXPos) => {
    const goalY = FIELD_HEIGHT / 2;
    const goalHalfHeight = GOAL_HEIGHT / 2;
    const playerDirection = pos.x - lastXPos; // Positive means moving right, negative means moving left
    
    // Left goal (blue goal) bounds check
    const inBlueGoal = pos.x <= GOAL_DISTANCE + GOAL_WIDTH &&
                      pos.x >= GOAL_DISTANCE &&
                      Math.abs(pos.y - goalY) <= goalHalfHeight;
    
    // Right goal (red goal) bounds check
    const inRedGoal = pos.x >= FIELD_WIDTH - GOAL_DISTANCE - GOAL_WIDTH &&
                     pos.x <= FIELD_WIDTH - GOAL_DISTANCE &&
                     Math.abs(pos.y - goalY) <= goalHalfHeight;
    
    // Update goal state tracking
    if (isPlayer1) {
      // For player 1 (blue player)
      
      // Check blue goal (left goal)
      if (inBlueGoal) {
        if (!player1InBlueGoal && playerDirection < 0) {
          // Only count if entering from front (right to left) for left goal
          // Blue player entering blue goal = own goal (player2 scores)
          setPlayer1InBlueGoal(true);
          return 'player2';
        }
      } else {
        // Reset state when player is out of blue goal
        if (player1InBlueGoal) setPlayer1InBlueGoal(false);
      }
      
      // Check red goal (right goal)
      if (inRedGoal) {
        if (!player1InRedGoal && playerDirection > 0) {
          // Only count if entering from front (left to right) for right goal
          // Blue player entering red goal = goal (player1 scores)
          setPlayer1InRedGoal(true);
          return 'player1';
        } 
      } else {
        // Reset state when player is out of red goal
        if (player1InRedGoal) setPlayer1InRedGoal(false);
      }
      
    } else {
      // For player 2 (red player)
      
      // Check blue goal (left goal)
      if (inBlueGoal) {
        if (!player2InBlueGoal && playerDirection < 0) {
          // Only count if entering from front (right to left) for left goal
          // Red player entering blue goal = goal (player2 scores)
          setPlayer2InBlueGoal(true);
          return 'player2';
        }
      } else {
        // Reset state when player is out of blue goal
        if (player2InBlueGoal) setPlayer2InBlueGoal(false);
      }
      
      // Check red goal (right goal)
      if (inRedGoal) {
        if (!player2InRedGoal && playerDirection > 0) {
          // Only count if entering from front (left to right) for right goal
          // Red player entering red goal = own goal (player1 scores)
          setPlayer2InRedGoal(true);
          return 'player1';
        }
      } else {
        // Reset state when player is out of red goal
        if (player2InRedGoal) setPlayer2InRedGoal(false);
      }
    }
    
    return null;
  };

  useEffect(() => {
    const gameLoop = () => {
      const now = Date.now();
      const deltaTime = (now - lastUpdateRef.current) / 1000;
      lastUpdateRef.current = now;

      if (timeLeft > 0 && !gameOver) {
        setTimeLeft(prev => Math.max(0, prev - deltaTime));

        // Check drone collision
        if (checkCollision(player1Pos, player2Pos, PLAYER_SIZE)) {
          // Calculate new velocities based on physics
          const newVels = calculateCollisionResponse(
            player1Pos, player1Vel,
            player2Pos, player2Vel
          );
          
          // Apply the new velocities
          setPlayer1Vel(newVels.vel1);
          setPlayer2Vel(newVels.vel2);
          
          // Move drones apart to prevent sticking
          const dx = player2Pos.x - player1Pos.x;
          const dy = player2Pos.y - player1Pos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < PLAYER_SIZE * 2) {
            const overlap = PLAYER_SIZE * 2 - distance;
            const moveX = (dx / distance) * overlap * 0.5;
            const moveY = (dy / distance) * overlap * 0.5;
            
            // Move drones apart to prevent sticking
            setPlayer1Pos(prev => ({
              x: prev.x - moveX,
              y: prev.y - moveY
            }));
            
            setPlayer2Pos(prev => ({
              x: prev.x + moveX,
              y: prev.y + moveY
            }));
          }
        }
        
        // Check collision with goal posts for Player 1
        const player1BlueTopPostCollision = checkGoalPostCollision(player1Pos, player1Vel, blueTopPostPos);
        const player1BlueBottomPostCollision = checkGoalPostCollision(player1Pos, player1Vel, blueBottomPostPos);
        const player1RedTopPostCollision = checkGoalPostCollision(player1Pos, player1Vel, redTopPostPos);
        const player1RedBottomPostCollision = checkGoalPostCollision(player1Pos, player1Vel, redBottomPostPos);
        
        // Apply goal post collision for Player 1
        if (player1BlueTopPostCollision.hasCollided) {
          setPlayer1Vel(player1BlueTopPostCollision.newVel);
          setPlayer1Pos(player1BlueTopPostCollision.newPos);
        } else if (player1BlueBottomPostCollision.hasCollided) {
          setPlayer1Vel(player1BlueBottomPostCollision.newVel);
          setPlayer1Pos(player1BlueBottomPostCollision.newPos);
        } else if (player1RedTopPostCollision.hasCollided) {
          setPlayer1Vel(player1RedTopPostCollision.newVel);
          setPlayer1Pos(player1RedTopPostCollision.newPos);
        } else if (player1RedBottomPostCollision.hasCollided) {
          setPlayer1Vel(player1RedBottomPostCollision.newVel);
          setPlayer1Pos(player1RedBottomPostCollision.newPos);
        }
        
        // Check collision with goal posts for Player 2
        const player2BlueTopPostCollision = checkGoalPostCollision(player2Pos, player2Vel, blueTopPostPos);
        const player2BlueBottomPostCollision = checkGoalPostCollision(player2Pos, player2Vel, blueBottomPostPos);
        const player2RedTopPostCollision = checkGoalPostCollision(player2Pos, player2Vel, redTopPostPos);
        const player2RedBottomPostCollision = checkGoalPostCollision(player2Pos, player2Vel, redBottomPostPos);
        
        // Apply goal post collision for Player 2
        if (player2BlueTopPostCollision.hasCollided) {
          setPlayer2Vel(player2BlueTopPostCollision.newVel);
          setPlayer2Pos(player2BlueTopPostCollision.newPos);
        } else if (player2BlueBottomPostCollision.hasCollided) {
          setPlayer2Vel(player2BlueBottomPostCollision.newVel);
          setPlayer2Pos(player2BlueBottomPostCollision.newPos);
        } else if (player2RedTopPostCollision.hasCollided) {
          setPlayer2Vel(player2RedTopPostCollision.newVel);
          setPlayer2Pos(player2RedTopPostCollision.newPos);
        } else if (player2RedBottomPostCollision.hasCollided) {
          setPlayer2Vel(player2RedBottomPostCollision.newVel);
          setPlayer2Pos(player2RedBottomPostCollision.newPos);
        }

        // Update last positions for direction tracking
        setPlayer1LastXPos(player1Pos.x);
        setPlayer2LastXPos(player2Pos.x);
        
        // Create a flag to track if we need to reset after this frame
        let needsReset = false;
        let updatedScores = {...scores};
        
        // Check goals - only count when a player enters the opposite goal
        const player1Goal = checkGoal(player1Pos, true, player1LastXPos);
        const player2Goal = checkGoal(player2Pos, false, player2LastXPos);

        // Handle both players' goals in the same frame
        if (player1Goal) {
          // Player 1's drone went into a goal
          updatedScores = {
            ...updatedScores,
            [player1Goal]: updatedScores[player1Goal] + 1
          };
          needsReset = true;
        } 
        
        if (player2Goal) {
          // Player 2's drone went into a goal
          updatedScores = {
            ...updatedScores,
            [player2Goal]: updatedScores[player2Goal] + 1
          };
          needsReset = true;
        }
        
        // Update scores if needed
        if (needsReset) {
          // Update scores
          setScores(updatedScores);
          
          // Reset players after goal
          setTimeout(() => {
          //reset操作不能对球的位置重置
            //setPlayer1Pos({ x: FIELD_CENTER_X - 250, y: FIELD_CENTER_Y });
            //setPlayer2Pos({ x: FIELD_CENTER_X + 250, y: FIELD_CENTER_Y });
            //setPlayer1Vel({ x: 0, y: 0 });
            //setPlayer2Vel({ x: 0, y: 0 });
            // Reset all goal tracking states
            setPlayer1InBlueGoal(false);
            setPlayer1InRedGoal(false);
            setPlayer2InBlueGoal(false);
            setPlayer2InRedGoal(false);
          }, 1000);
        }
      } else if (!gameOver) {
        setGameOver(true);
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameOver, player1Pos, player2Pos, player1Vel, player2Vel, timeLeft, blueTopPostPos, blueBottomPostPos, redTopPostPos, redBottomPostPos]);

  const resetGame = () => {
    setScores({ player1: 0, player2: 0 });
    setTimeLeft(GAME_DURATION);
    setGameOver(false);
    setPlayer1Pos({ x: FIELD_CENTER_X - 250, y: FIELD_CENTER_Y });
    setPlayer2Pos({ x: FIELD_CENTER_X + 250, y: FIELD_CENTER_Y });
    setPlayer1Vel({ x: 0, y: 0 });
    setPlayer2Vel({ x: 0, y: 0 });
    // Reset goal tracking states
    setPlayer1InBlueGoal(false);
    setPlayer1InRedGoal(false);
    setPlayer2InBlueGoal(false);
    setPlayer2InRedGoal(false);
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-gray-900">
      <div className="relative" style={{ width: FIELD_WIDTH, height: FIELD_HEIGHT }}>
        {/* Field */}
        <div className="absolute inset-0 border-4 border-white bg-green-800">
          {/* Center line */}
          <div className="absolute left-1/2 top-0 w-1 h-full bg-white transform -translate-x-1/2" />
          <div className="absolute left-1/2 top-1/2 w-20 h-20 border-4 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2" />
          
          {/* Goals - 2m from boundary */}
          {/* Left goal - blue */}
          <div className="absolute top-1/2 transform -translate-y-1/2" 
               style={{ left: GOAL_DISTANCE, width: GOAL_WIDTH, height: GOAL_HEIGHT }}>
            {/* Goal net (dashed line) */}
            <div className="absolute inset-0 border-2 border-dashed border-blue-200 bg-blue-500 bg-opacity-20" />
            
            {/* Goal posts (2 circular posts) */}
            <div className="absolute rounded-full bg-blue-500" 
                 style={{ width: GOAL_POST_DIAMETER, height: GOAL_POST_DIAMETER, 
                          left: 0, top: -GOAL_POST_DIAMETER/2 }} />
            <div className="absolute rounded-full bg-blue-500" 
                 style={{ width: GOAL_POST_DIAMETER, height: GOAL_POST_DIAMETER, 
                          left: 0, bottom: -GOAL_POST_DIAMETER/2 }} />
          </div>
          
          {/* Right goal - red */}
          <div className="absolute top-1/2 transform -translate-y-1/2" 
               style={{ right: GOAL_DISTANCE, width: GOAL_WIDTH, height: GOAL_HEIGHT }}>
            {/* Goal net (dashed line) */}
            <div className="absolute inset-0 border-2 border-dashed border-red-200 bg-red-500 bg-opacity-20" />
            
            {/* Goal posts (2 circular posts) */}
            <div className="absolute rounded-full bg-red-500" 
                 style={{ width: GOAL_POST_DIAMETER, height: GOAL_POST_DIAMETER, 
                          right: 0, top: -GOAL_POST_DIAMETER/2 }} />
            <div className="absolute rounded-full bg-red-500" 
                 style={{ width: GOAL_POST_DIAMETER, height: GOAL_POST_DIAMETER, 
                          right: 0, bottom: -GOAL_POST_DIAMETER/2 }} />
          </div>
        </div>

        <Player 
          isPlayer1={true}
          gameOver={gameOver}
          position={player1Pos}
          setPosition={setPlayer1Pos}
          velocity={player1Vel}
          setVelocity={setPlayer1Vel}
        />
        <Player 
          isPlayer1={false}
          gameOver={gameOver}
          position={player2Pos}
          setPosition={setPlayer2Pos}
          velocity={player2Vel}
          setVelocity={setPlayer2Vel}
        />
        <ScoreBoard 
          scores={scores}
          timeLeft={timeLeft}
          gameOver={gameOver}
          onReset={resetGame}
        />
      </div>
    </div>
  );
}

export default Game;