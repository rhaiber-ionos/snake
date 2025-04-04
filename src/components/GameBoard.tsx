import React, { useEffect, useRef, useState } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Play, Pause, RotateCw } from 'lucide-react';

type Position = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;

const SnakeGame: React.FC = () => {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const gameLoopRef = useRef<NodeJS.Timeout>();

  // Generate random food position
  const generateFood = (): Position => {
    const x = Math.floor(Math.random() * GRID_SIZE);
    const y = Math.floor(Math.random() * GRID_SIZE);
    return { x, y };
  };

  // Check if position is occupied by snake
  const isPositionOccupied = (pos: Position): boolean => {
    return snake.some(segment => segment.x === pos.x && segment.y === pos.y);
  };

  // Initialize game
  const initGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection('RIGHT');
    setFood(generateFood());
    setGameOver(false);
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setIsPaused(false);
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;

      switch (e.key) {
        case 'ArrowUp':
          if (direction !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
          if (direction !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
          if (direction !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
          if (direction !== 'LEFT') setDirection('RIGHT');
          break;
        case ' ':
          setIsPaused(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, gameOver]);

  // Game loop
  useEffect(() => {
    if (isPaused || gameOver) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = { ...prevSnake[0] };

        // Move head based on direction
        switch (direction) {
          case 'UP':
            head.y -= 1;
            break;
          case 'DOWN':
            head.y += 1;
            break;
          case 'LEFT':
            head.x -= 1;
            break;
          case 'RIGHT':
            head.x += 1;
            break;
        }

        // Check wall collision
        if (
          head.x < 0 ||
          head.x >= GRID_SIZE ||
          head.y < 0 ||
          head.y >= GRID_SIZE
        ) {
          setGameOver(true);
          return prevSnake;
        }

        // Check self collision
        if (prevSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        // Check food collision
        if (head.x === food.x && head.y === food.y) {
          let newFood = generateFood();
          while (isPositionOccupied(newFood)) {
            newFood = generateFood();
          }
          setFood(newFood);
          setScore(prev => prev + 10);
          if (score > 0 && score % 50 === 0) {
            setSpeed(prev => Math.max(prev - 10, 50));
          }
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    gameLoopRef.current = setInterval(moveSnake, speed);
    return () => clearInterval(gameLoopRef.current);
  }, [direction, food, isPaused, gameOver, speed, score]);

  // Update high score
  useEffect(() => {
    if (gameOver && score > highScore) {
      setHighScore(score);
    }
  }, [gameOver, score, highScore]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <div className="text-2xl font-bold text-gray-800">
            Score: <span className="text-green-600">{score}</span>
          </div>
          <div className="text-lg font-semibold text-gray-700">
            High Score: <span className="text-blue-600">{highScore}</span>
          </div>
        </div>

        <div 
          className="relative bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200"
          style={{
            width: GRID_SIZE * CELL_SIZE,
            height: GRID_SIZE * CELL_SIZE,
          }}
        >
          {/* Food */}
          <div
            className="absolute bg-red-500 rounded-full"
            style={{
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
              left: food.x * CELL_SIZE,
              top: food.y * CELL_SIZE,
            }}
          />

          {/* Snake */}
          {snake.map((segment, index) => (
            <div
              key={index}
              className={`absolute ${index === 0 ? 'bg-green-600' : 'bg-green-500'} rounded-sm`}
              style={{
                width: CELL_SIZE - 1,
                height: CELL_SIZE - 1,
                left: segment.x * CELL_SIZE,
                top: segment.y * CELL_SIZE,
              }}
            />
          ))}

          {/* Game Over Overlay */}
          {gameOver && (
            <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center">
              <div className="text-white text-2xl font-bold mb-4">Game Over!</div>
              <button
                onClick={initGame}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full flex items-center"
              >
                <RotateCw className="mr-2" size={18} />
                Play Again
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-center space-x-4">
          <button
            onClick={() => setIsPaused(prev => !prev)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full flex items-center"
          >
            {isPaused ? (
              <>
                <Play className="mr-2" size={18} />
                Play
              </>
            ) : (
              <>
                <Pause className="mr-2" size={18} />
                Pause
              </>
            )}
          </button>
          <button
            onClick={initGame}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full flex items-center"
          >
            <RotateCw className="mr-2" size={18} />
            Restart
          </button>
        </div>

        <div className="mt-6 text-center text-gray-600">
          <p className="mb-2">Use arrow keys to control the snake</p>
          <div className="flex justify-center space-x-2">
            <div className="bg-gray-200 p-2 rounded">
              <ArrowUp size={20} />
            </div>
            <div className="bg-gray-200 p-2 rounded">
              <ArrowDown size={20} />
            </div>
            <div className="bg-gray-200 p-2 rounded">
              <ArrowLeft size={20} />
            </div>
            <div className="bg-gray-200 p-2 rounded">
              <ArrowRight size={20} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;
