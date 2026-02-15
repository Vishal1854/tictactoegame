import React, { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [isUserTurn, setIsUserTurn] = useState(true);
  const [statusMsg, setStatusMsg] = useState("तुमची वेळ आहे, खेळा! 🎭");

  const USER = "🎭"; 
  const COMP = "👹";
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

  useEffect(() => {
    if (!isUserTurn && !calculateWinner(squares)) {
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
  }, [isUserTurn]);

  const getMediumMove = (board) => {
    const emptySpots = board.map((v, i) => v === null ? i : null).filter(v => v !== null);
    
    // MEDIUM DIFFICULTY LOGIC:
    // 70% of the time play smart, 30% of the time play random (mistake)
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

    // 3. Otherwise, pick a strategic or random spot
    if (board[4] === null && isPlayingSmart) return 4; // Take center
    return emptySpots[Math.floor(Math.random() * emptySpots.length)]; // Random
  };

  const updateStatus = (currentSquares, userJustMoved) => {
    const winner = calculateWinner(currentSquares);
    if (winner) {
      setStatusMsg(winner === USER ? "🔥 कडक! तुम्ही जिंकलात! 🏆" : "💀 ओम फट स्वाहा! तुम्ही हारलात! 👹");
    } else if (!currentSquares.includes(null)) {
      setStatusMsg("🤝 सामना बरोबरीत! पुन्हा खेळा?");
    } else {
      setStatusMsg(userJustMoved ? "तात्या विंचू विचार करतोय..." : "तुमची चाल खेळा! 🎭");
    }
  };

  const handleClick = (i) => {
    if (squares[i] || calculateWinner(squares) || !isUserTurn) return;
    const nextSquares = squares.slice();
    nextSquares[i] = USER;
    setSquares(nextSquares);
    setIsUserTurn(false);
    updateStatus(nextSquares, true);
  };

  function calculateWinner(sq) {
    for (let line of lines) {
      const [a, b, c] = line;
      if (sq[a] && sq[a] === sq[b] && sq[a] === sq[c]) return sq[a];
    }
    return null;
  }

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
        <button className="new-game-btn" onClick={() => { setSquares(Array(9).fill(null)); setIsUserTurn(true); setStatusMsg("चला, पुन्हा सुरुवात करूया! 🎭"); }}>नवीन गेम</button>
        <p className="footer-credit">मराठी कॉमेडी कट्टा विशेष 🎬</p>
      </div>
    </div>
  );
}

