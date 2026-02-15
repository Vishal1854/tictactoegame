import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

// --- FIXED: Constants and Helper Functions moved OUTSIDE the component ---
// This fixes the Vercel build error because they are no longer "missing dependencies"

const USER = "🎭"; 
  const COMP = "👹";
const lines = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

function calculateWinner(sq) {
  for (let line of lines) {
    const [a, b, c] = line;
    if (sq[a] && sq[a] === sq[b] && sq[a] === sq[c]) {
      return sq[a];
    }
  }
  return null;
}

function getMediumMove(board) {
  const emptySpots = board.map((v, i) => v === null ? i : null).filter(v => v !== null);
  if (emptySpots.length === 0) return null;

  // MEDIUM DIFFICULTY LOGIC
  const isPlayingSmart = Math.random() < 0.7;

  if (isPlayingSmart) {
    // 1. Try to Win
    for (let line of lines) {
      const [a, b, c] = line;
      const symbols = [board[a], board[b], board[c]];
      if (symbols.filter(s => s === COMP).length === 2 && symbols.includes(null)) {
        return line[symbols.indexOf(null)];
      }
    }
    // 2. Try to Block User
    for (let line of lines) {
      const [a, b, c] = line;
      const symbols = [board[a], board[b], board[c]];
      if (symbols.filter(s => s === USER).length === 2 && symbols.includes(null)) {
        return line[symbols.indexOf(null)];
      }
    }
  }

  // 3. Otherwise, pick center or random
  if (board[4] === null && isPlayingSmart) return 4; 
  return emptySpots[Math.floor(Math.random() * emptySpots.length)]; 
}

// --- MAIN COMPONENT ---

export default function App() {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [isUserTurn, setIsUserTurn] = useState(true);
  const [statusMsg, setStatusMsg] = useState("तुमची वेळ आहे, खेळा! 🎮");

  // FIXED: Wrapped in useCallback so it can be added to dependency array safely
  const updateStatus = useCallback((currentSquares, userJustMoved) => {
    const winner = calculateWinner(currentSquares);
    if (winner) {
      setStatusMsg(winner === USER ? "कडक! तुम्ही जिंकलात! 🎉" : "ओम फट स्वाहा! तुम्ही हारलात! 😜");
    } else if (!currentSquares.includes(null)) {
      setStatusMsg("सामना बरोबरीत! पुन्हा खेळा? 🤝");
    } else {
      setStatusMsg(userJustMoved ? "तात्या विंचू विचार करतोय... 🤔" : "तुमची चाल खेळा! 👊");
    }
  }, []);

  // FIXED: Added correct dependencies [isUserTurn, squares, updateStatus]
  useEffect(() => {
    const winner = calculateWinner(squares); // Check winner first
    if (!isUserTurn && !winner && squares.includes(null)) {
      const timer = setTimeout(() => {
        const move = getMediumMove(squares);
        if (move !== null) {
          const nextSquares = squares.slice();
          nextSquares[move] = COMP;
          setSquares(nextSquares);
          setIsUserTurn(true);
          updateStatus(nextSquares, false);
        }
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isUserTurn, squares, updateStatus]);

  const handleClick = (i) => {
    if (squares[i] || calculateWinner(squares) || !isUserTurn) return;
    const nextSquares = squares.slice();
    nextSquares[i] = USER;
    setSquares(nextSquares);
    setIsUserTurn(false);
    updateStatus(nextSquares, true);
  };

  return (
    <div className="app-container">
      <div className="game-card">
        <h1 className="game-title">कॉमेडी <span className="brand-text">बॅटल</span></h1>
        <div className={`status-box ${calculateWinner(squares) ? 'animate-win' : ''}`}>{statusMsg}</div>
        <div className="game-grid">
          {squares.map((square, i) => (
            <button key={i} className={`game-cell ${square ? 'active' : ''}`} onClick={() => handleClick(i)}>{square}</button>
          ))}
        </div>
        <button className="new-game-btn" onClick={() => { 
            setSquares(Array(9).fill(null)); 
            setIsUserTurn(true); 
            setStatusMsg("चला, पुन्हा सुरुवात करूया! 🚀"); 
        }}>नवीन गेम</button>
        <p className="footer-credit">मराठी कॉमेडी कट्टा विशेष ❤️</p>
      </div>
    </div>
  );
}