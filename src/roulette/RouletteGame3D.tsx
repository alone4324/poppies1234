import { useState, useRef } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useBlockchainGame } from '../hooks/useBlockchainGame';
import { useSoundManager } from '../hooks/useSoundManager';
import useGame from '../stores/store';
import RouletteWheel3D from './RouletteWheel3D';
import RouletteTable3D from './RouletteTable3D';

// European roulette numbers in wheel order
const ROULETTE_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5,
  24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

const RouletteGame3D = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [selectedBets, setSelectedBets] = useState<{ [key: string]: number }>({});
  const [totalBet, setTotalBet] = useState(0);
  const [gameState, setGameState] = useState<'betting' | 'spinning' | 'result'>('betting');
  const [lastWinnings, setLastWinnings] = useState(0);
  
  const { authenticated, monBalance } = useBlockchainGame();
  const { playClick, playSpin, playMonReward, playBadLuck, playReel, stopReel } = useSoundManager();
  const insufficientFundsPopup = useGame((state) => state.insufficientFundsPopup);

  const spinButtonRef = useRef<THREE.Group>(null);
  const clearButtonRef = useRef<THREE.Group>(null);

  const getNumberColor = (num: number): 'red' | 'black' | 'green' => {
    if (num === 0) return 'green';
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    return redNumbers.includes(num) ? 'red' : 'black';
  };

  const handleBetClick = (betType: string) => {
    if (gameState !== 'betting') return;
    
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
    playReel(); // Start reel sound for spinning effect
    
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
    stopReel(); // Stop reel sound
    
    if (winningNumber !== null) {
      const winnings = calculateWinnings(winningNumber);
      setLastWinnings(winnings);
      
      if (winnings > 0) {
        playMonReward();
        console.log(`🎉 Roulette Win! ${winnings.toFixed(3)} MON on number ${winningNumber}`);
      } else {
        playBadLuck();
        console.log(`😔 No winnings this time. Number was ${winningNumber}`);
      }
      
      // Reset after showing result
      setTimeout(() => {
        setGameState('betting');
        setSelectedBets({});
        setTotalBet(0);
        setWinningNumber(null);
        setLastWinnings(0);
      }, 4000);
    }
  };

  const canSpin = authenticated && gameState === 'betting' && totalBet > 0 && !insufficientFundsPopup;

  // Create button materials
  const spinButtonMaterial = new THREE.MeshStandardMaterial({
    color: canSpin ? '#2E7D32' : '#666666',
    roughness: 0.3,
    metalness: 0.7
  });

  const clearButtonMaterial = new THREE.MeshStandardMaterial({
    color: gameState === 'betting' ? '#D32F2F' : '#666666',
    roughness: 0.3,
    metalness: 0.7
  });

  return (
    <group>
      {/* Roulette Wheel - elevated and prominent */}
      <group position={[0, 3, 1]}>
        <RouletteWheel3D
          isSpinning={isSpinning}
          targetNumber={winningNumber}
          onSpinComplete={handleSpinComplete}
        />
      </group>

      {/* Roulette Table - realistic casino table */}
      <RouletteTable3D
        selectedBets={selectedBets}
        onBetClick={handleBetClick}
        isSpinning={isSpinning}
      />

      {/* Control Panel - elevated like slot machine */}
      <group position={[0, -14, 0.5]}>
        {/* Control panel base */}
        <mesh position={[0, 0, -0.2]}>
          <boxGeometry args={[8, 2, 0.3]} />
          <meshStandardMaterial 
            color="#2A1558" 
            roughness={0.6}
            metalness={0.3
          />
        </mesh>

        {/* Spin Button */}
        <group ref={spinButtonRef} position={[-2, 0, 0]}>
          <mesh 
            onClick={canSpin ? spinRoulette : undefined}
            onPointerOver={(e) => {
              if (canSpin) {
                e.object.material.color.setHex(0x4CAF50);
                document.body.style.cursor = 'pointer';
              }
            }}
            onPointerOut={(e) => {
              e.object.material.color.setHex(canSpin ? 0x2E7D32 : 0x666666);
              document.body.style.cursor = 'default';
            }}
          >
            <boxGeometry args={[3.5, 1.5, 0.3]} />
            <primitive object={spinButtonMaterial} />
          </mesh>
          
          {/* Button highlight */}
          <mesh position={[0, 0, 0.16]}>
            <boxGeometry args={[3.3, 1.3, 0.02]} />
            <meshStandardMaterial 
              color={canSpin ? "#4CAF50" : "#888888"} 
              emissive={canSpin ? "#1B5E20" : "#000000"}
              emissiveIntensity={0.2}
            />
          </mesh>
          
          <Text
            position={[0, 0, 0.18]}
            fontSize={0.25}
            color="white"
            anchorX="center"
            anchorY="middle"
            font="./fonts/nickname.otf"
            material-toneMapped={false}
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
                document.body.style.cursor = 'pointer';
              }
            }}
            onPointerOut={(e) => {
              e.object.material.color.setHex(gameState === 'betting' ? 0xD32F2F : 0x666666);
              document.body.style.cursor = 'default';
            }}
          >
            <boxGeometry args={[3.5, 1.5, 0.3]} />
            <primitive object={clearButtonMaterial} />
          </mesh>
          
          {/* Button highlight */}
          <mesh position={[0, 0, 0.16]}>
            <boxGeometry args={[3.3, 1.3, 0.02]} />
            <meshStandardMaterial 
              color={gameState === 'betting' ? "#F44336" : "#888888"} 
              emissive={gameState === 'betting' ? "#B71C1C" : "#000000"}
              emissiveIntensity={0.2}
            />
          </mesh>
          
          <Text
            position={[0, 0, 0.18]}
            fontSize={0.25}
            color="white"
            anchorX="center"
            anchorY="middle"
            font="./fonts/nickname.otf"
            material-toneMapped={false}
          >
            CLEAR BETS
          </Text>
        </group>
      </group>

      {/* Result Display - casino-style */}
      {gameState === 'result' && winningNumber !== null && (
        <group position={[0, -17, 1]}>
          {/* Result panel background */}
          <mesh>
            <boxGeometry args={[8, 2.5, 0.2]} />
            <meshStandardMaterial 
              color="#1a1a1a" 
              opacity={0.95} 
              transparent 
              emissive="#111111"
              emissiveIntensity={0.3}
            />
          </mesh>
          
          {/* Winning number display */}
          <Text
            position={[0, 0.6, 0.11]}
            fontSize={0.5}
            color="#FFD700"
            anchorX="center"
            anchorY="middle"
            font="./fonts/nickname.otf"
            material-toneMapped={false}
          >
            Winning Number: {winningNumber}
          </Text>
          
          {/* Color indicator */}
          <mesh position={[0, 0, 0.11]}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial 
              color={
                getNumberColor(winningNumber) === 'red' ? '#8B0000' :
                getNumberColor(winningNumber) === 'black' ? '#1a1a1a' : '#2d5016'
              }
              emissive={
                getNumberColor(winningNumber) === 'red' ? '#330000' :
                getNumberColor(winningNumber) === 'black' ? '#111111' : '#1a3309'
              }
              emissiveIntensity={0.3}
            />
          </mesh>
          
          {/* Winnings display */}
          <Text
            position={[0, -0.6, 0.11]}
            fontSize={0.35}
            color={lastWinnings > 0 ? "#4CAF50" : "#F44336"}
            anchorX="center"
            anchorY="middle"
            font="./fonts/nickname.otf"
            material-toneMapped={false}
          >
            {lastWinnings > 0 
              ? `🎉 You Won: ${lastWinnings.toFixed(3)} MON!`
              : '😔 Better luck next time!'
            }
          </Text>
        </group>
      )}

      {/* Betting info display */}
      {gameState === 'betting' && totalBet > 0 && (
        <group position={[0, -17, 0.5]}>
          <mesh>
            <boxGeometry args={[6, 1, 0.1]} />
            <meshStandardMaterial 
              color="#2A1558" 
              opacity={0.9} 
              transparent
              emissive="#1a0d3d"
              emissiveIntensity={0.2}
            />
          </mesh>
          <Text
            position={[0, 0, 0.06]}
            fontSize={0.25}
            color="#FFD700"
            anchorX="center"
            anchorY="middle"
            font="./fonts/nickname.otf"
            material-toneMapped={false}
          >
            Total Bet: {totalBet.toFixed(3)} MON
          </Text>
        </group>
      )}
    </group>
  );
};

export default RouletteGame3D;