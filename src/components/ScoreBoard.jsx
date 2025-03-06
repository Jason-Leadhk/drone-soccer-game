// src/components/ScoreBoard.jsx
import React from 'react';

function ScoreBoard({ scores, timeLeft, gameOver, onReset }) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getWinner = () => {
    if (scores.player1 > scores.player2) return "Blue Wins!";
    if (scores.player2 > scores.player1) return "Red Wins!";
    return "It's a Draw!";
  };

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-lg p-4 text-white">
      <div className="flex items-center space-x-8">
        <div className="text-blue-500 text-2xl font-bold">{scores.player1}</div>
        <div className="text-xl font-semibold">{formatTime(timeLeft)}</div>
        <div className="text-red-500 text-2xl font-bold">{scores.player2}</div>
      </div>
      
      {gameOver && (
        <div className="mt-4 text-center">
          <div className="text-xl font-bold mb-2">{getWinner()}</div>
          <button
            onClick={onReset}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}

export default ScoreBoard;