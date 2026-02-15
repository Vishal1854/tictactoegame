import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

// --- HELPER FUNCTIONS (Moved Outside Component to fix Build Errors) ---

const USER = "X";
const COMP = "O";
const lines = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

function calculateWinner(sq) {
  for (let line of lines) {
    const [a, b, c] = line;
    if (sq[a] && sq[a] === sq[b] && sq[a] === sq[c]) {
      return { winner: sq[a], line: line };
    }
  }
  return null;
}

function getMediumMove(board) {
  const emptySpots = board.map((v, i) => v === null ? i : null).filter(v => v !== null);
  if (emptySpots.length === 0) return null;

  // 70% Smart, 30% Random
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

  // 3. Take Center if available
  if (board[4] === null && isPlayingSmart) return 4;

  // 4. Random
  return emptySpots[Math.floor(Math.random() * emptySpots.length)];
}

// --- MAIN COMPONENT ---

export default function App() {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [isUserTurn, setIsUserTurn] = useState(true);
  const [statusMsg, setStatusMsg] = useState("तुमची वेळ आहे, खेळा! 🎮");
  const [winningLine, setWinningLine] = useState([]);

  // Wrapped in useCallback to satisfy the Linter/Build
  const updateStatus = useCallback((currentSquares, userJustMoved) => {
    const result = calculateWinner(currentSquares);
    if (result) {
      setStatusMsg(result.winner === USER ? "विषय हार्ड आहे! तुम्ही जिंकलात! 🎉" : "गल्यात आलात! तुम्ही हरलात! 😜");
      setWinningLine(result.line);
    } else if (!currentSquares.includes(null)) {
      setStatusMsg("सगळंच मुसळ केरात! मॅच ड्रॉ! 🤝");
    } else {
      setStatusMsg(userJustMoved ? "तात्या विंचू विचार करतोय... 🤔" : "तुमची चाल खेळा! 👊");
    }
  }, []);

  // Game Loop Effect
  useEffect(() => {
    const result = calculateWinner(squares);
    
    // If it's computer's turn and game is not over
    if (!isUserTurn && !result && squares.includes(null)) {
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
  }, [isUserTurn, squares, updateStatus]); // All dependencies are now strictly included

  const handleClick = (i) => {
    if (squares[i] || calculateWinner(squares) || !isUserTurn) return;
    const nextSquares = squares.slice();
    nextSquares[i] = USER;
    setSquares(nextSquares);
    setIsUserTurn(false);
    updateStatus(nextSquares, true);
  };

  const resetGame = () => {
    setSquares(Array(9).fill(null));
    setIsUserTurn(true);
    setWinningLine([]);
    setStatusMsg("चला, पुन्हा सुरुवात करूया! 🚀");
  };

  return (
    <div className="app-container">
      <div className="game-card">
        <h1 className="game-title">कॉमेडी <span className="brand-text">बॅटल</span></h1>
        
        <div className={`status-box ${winningLine.length > 0 ? 'animate-win' : ''}`}>
          {statusMsg}
        </div>

        <div className="game-grid">
          {squares.map((square, i) => (
            <button 
              key={i} 
              className={`game-cell 
                ${square === USER ? 'user-move' : square === COMP ? 'comp-move' : ''} 
                ${winningLine.includes(i) ? 'highlight' : ''}`} 
              onClick={() => handleClick(i)}
              disabled={!isUserTurn || square !== null || winningLine.length > 0}
            >
              {square}
            </button>
          ))}
        </div>

        <button className="new-game-btn" onClick={resetGame}>
          नवीन गेम 🔄
        </button>
        <p className="footer-credit">मराठी कॉमेडी कट्टा विशेष ❤️</p>
      </div>
    </div>
  );
}