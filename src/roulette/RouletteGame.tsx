import { useState, useRef } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useBlockchainGame } from '../hooks/useBlockchainGame';
import { useSoundManager } from '../hooks/useSoundManager';
import useGame from '../stores/store';
import RouletteWheel from './RouletteWheel';
import RouletteTable from './RouletteTable';

// Roulette numbers for reference
const ROULETTE_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5,
  24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

const RouletteGame = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [selectedBets, setSelectedBets] = useState<{ [key: string]: number }>({});
  const [totalBet, setTotalBet] = useState(0);
  const [gameState, setGameState] = useState<'betting' | 'spinning' | 'result'>('betting');
  
  const { authenticated, monBalance } = useBlockchainGame();
  const { playClick, playSpin, playMonReward, playBadLuck } = useSoundManager();
  const insufficientFundsPopup = useGame((state) => state.insufficientFundsPopup);

  const spinButtonRef = useRef<THREE.Group>(null);
  const clearButtonRef = useRef<THREE.Group>(null);

  const getNumberColor = (num: number): string => {
    if (num === 0) return 'green';
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    return redNumbers.includes(num) ? 'red' : 'black';
  };

  const handleBetClick = (betType: string) => {
    if (gameState !== 'betting') return;
    
    playClick();
    const betAmount = 0.01; // 0.01 MON per bet
    
    // Check if player has enough balance
    const currentBalance = parseFloat(monBalance || '0');
    if (currentBalance < betAmount) {
      return; // Not enough funds
    }

    setSelectedBets(prev => ({
      ...prev,
      [betType]: (prev[betType] || 0) + betAmount
    }));
    
    setTotalBet(prev => prev + betAmount);
  };

  const clearBets = () => {
    if (gameState !== 'betting') return;
    
    playClick();
    setSelectedBets({});
    setTotalBet(0);
  };

  const calculateWinnings = (winningNum: number): number => {
    let totalWinnings = 0;
    
    Object.entries(selectedBets).forEach(([betType, amount]) => {
      let isWinning = false;
      let payout = 0;
      
      // Check different bet types
      if (betType === winningNum.toString()) {
        // Straight up bet (35:1)
        isWinning = true;
        payout = 35;
      } else if (betType === 'red' && getNumberColor(winningNum) === 'red') {
        // Red bet (1:1)
        isWinning = true;
        payout = 1;
      } else if (betType === 'black' && getNumberColor(winningNum) === 'black') {
        // Black bet (1:1)
        isWinning = true;
        payout = 1;
      } else if (betType === 'odd' && winningNum % 2 === 1 && winningNum !== 0) {
        // Odd bet (1:1)
        isWinning = true;
        payout = 1;
      } else if (betType === 'even' && winningNum % 2 === 0 && winningNum !== 0) {
        // Even bet (1:1)
        isWinning = true;
        payout = 1;
      }
      
      if (isWinning) {
        totalWinnings += amount * (payout + 1); // Include original bet
      }
    });
    
    return totalWinnings;
  };

  const spinRoulette = () => {
    if (gameState !== 'betting' || totalBet === 0 || !authenticated) return;
    
    playClick();
    playSpin();
    
    setGameState('spinning');
    setIsSpinning(true);
    
    // Generate random winning number
    const randomIndex = Math.floor(Math.random() * ROULETTE_NUMBERS.length);
    const winning = ROULETTE_NUMBERS[randomIndex];
    setWinningNumber(winning);
  };

  const handleSpinComplete = () => {
    setIsSpinning(false);
    setGameState('result');
    
    if (winningNumber !== null) {
      const winnings = calculateWinnings(winningNumber);
      
      if (winnings > 0) {
        playMonReward();
        console.log(`Won ${winnings} MON!`);
      } else {
        playBadLuck();
        console.log('No winnings this time');
      }
      
      // Reset after showing result
      setTimeout(() => {
        setGameState('betting');
        setSelectedBets({});
        setTotalBet(0);
        setWinningNumber(null);
      }, 3000);
    }
  };

  const canSpin = authenticated && gameState === 'betting' && totalBet > 0 && !insufficientFundsPopup;

  return (
    <group>
      {/* Roulette Wheel */}
      <group position={[0, 2, 0]}>
        <RouletteWheel
          isSpinning={isSpinning}
          targetNumber={winningNumber}
          onSpinComplete={handleSpinComplete}
        />
      </group>

      {/* Roulette Table */}
      <RouletteTable
        selectedBets={selectedBets}
        onBetClick={handleBetClick}
      />

      {/* Control Buttons */}
      <group position={[0, -11, 0]}>
        {/* Spin Button */}
        <group ref={spinButtonRef} position={[-2, 0, 0]}>
          <mesh 
            onClick={canSpin ? spinRoulette : undefined}
            onPointerOver={(e) => {
              if (canSpin) {
                e.object.material.color.setHex(0x4CAF50);
              }
            }}
            onPointerOut={(e) => {
              e.object.material.color.setHex(canSpin ? 0x2E7D32 : 0x666666);
            }}
          >
            <boxGeometry args={[3, 1, 0.2]} />
            <meshStandardMaterial color={canSpin ? "#2E7D32" : "#666666"} />
          </mesh>
          <Text
            position={[0, 0, 0.11]}
            fontSize={0.3}
            color="white"
            anchorX="center"
            anchorY="middle"
            font="./fonts/nickname.otf"
          >
            {gameState === 'spinning' ? 'SPINNING...' : 
             gameState === 'result' ? 'RESULT' : 
             !authenticated ? 'CONNECT WALLET' :
             totalBet === 0 ? 'PLACE BETS' : 
             `SPIN (${totalBet.toFixed(3)} MON)`}
          </Text>
        </group>

        {/* Clear Bets Button */}
        <group ref={clearButtonRef} position={[2, 0, 0]}>
          <mesh 
            onClick={gameState === 'betting' ? clearBets : undefined}
            onPointerOver={(e) => {
              if (gameState === 'betting') {
                e.object.material.color.setHex(0xF44336);
              }
            }}
            onPointerOut={(e) => {
              e.object.material.color.setHex(gameState === 'betting' ? 0xD32F2F : 0x666666);
            }}
          >
            <boxGeometry args={[3, 1, 0.2]} />
            <meshStandardMaterial color={gameState === 'betting' ? "#D32F2F" : "#666666"} />
          </mesh>
          <Text
            position={[0, 0, 0.11]}
            fontSize={0.3}
            color="white"
            anchorX="center"
            anchorY="middle"
            font="./fonts/nickname.otf"
          >
            CLEAR BETS
          </Text>
        </group>
      </group>

      {/* Result Display */}
      {gameState === 'result' && winningNumber !== null && (
        <group position={[0, -13, 0]}>
          <mesh>
            <planeGeometry args={[6, 1.5]} />
            <meshStandardMaterial color="#1a1a1a" opacity={0.9} transparent />
          </mesh>
          <Text
            position={[0, 0.3, 0.01]}
            fontSize={0.4}
            color="white"
            anchorX="center"
            anchorY="middle"
            font="./fonts/nickname.otf"
          >
            Winning Number: {winningNumber}
          </Text>
          <Text
            position={[0, -0.3, 0.01]}
            fontSize={0.3}
            color={calculateWinnings(winningNumber) > 0 ? "#4CAF50" : "#F44336"}
            anchorX="center"
            anchorY="middle"
            font="./fonts/nickname.otf"
          >
            {calculateWinnings(winningNumber) > 0 
              ? `You Won: ${calculateWinnings(winningNumber).toFixed(3)} MON!`
              : 'Better luck next time!'
            }
          </Text>
        </group>
      )}
    </group>
  );
};

export default RouletteGame;