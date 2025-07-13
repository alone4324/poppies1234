import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface RouletteWheelProps {
  isSpinning: boolean;
  targetNumber: number | null;
  onSpinComplete: () => void;
}

// Roulette numbers in European order
const ROULETTE_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5,
  24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

// Colors for roulette numbers
const getNumberColor = (num: number): string => {
  if (num === 0) return '#00ff00'; // Green for 0
  const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  return redNumbers.includes(num) ? '#ff0000' : '#000000';
};

const RouletteWheel = ({ isSpinning, targetNumber, onSpinComplete }: RouletteWheelProps) => {
  const wheelRef = useRef<THREE.Group>(null);
  const ballRef = useRef<THREE.Mesh>(null);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [ballAngle, setBallAngle] = useState(0);
  const [spinStartTime, setSpinStartTime] = useState(0);
  const [isSpinCompleted, setIsSpinCompleted] = useState(false);

  const SPIN_DURATION = 4000; // 4 seconds
  const SEGMENTS = ROULETTE_NUMBERS.length;
  const SEGMENT_ANGLE = (Math.PI * 2) / SEGMENTS;

  useEffect(() => {
    if (isSpinning && targetNumber !== null) {
      setSpinStartTime(Date.now());
      setIsSpinCompleted(false);
    }
  }, [isSpinning, targetNumber]);

  useFrame(() => {
    if (!wheelRef.current || !ballRef.current) return;

    if (isSpinning && targetNumber !== null && !isSpinCompleted) {
      const elapsed = Date.now() - spinStartTime;
      const progress = Math.min(elapsed / SPIN_DURATION, 1);
      
      // Easing function for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      // Calculate target angle for the winning number
      const targetIndex = ROULETTE_NUMBERS.indexOf(targetNumber);
      const targetAngle = targetIndex * SEGMENT_ANGLE;
      
      // Add multiple rotations for visual effect
      const totalRotation = Math.PI * 2 * 5 + targetAngle; // 5 full rotations plus target
      
      // Update wheel rotation
      const newRotation = easeOut * totalRotation;
      setCurrentRotation(newRotation);
      wheelRef.current.rotation.z = -newRotation;
      
      // Ball moves in opposite direction
      const ballRotation = easeOut * (Math.PI * 2 * 3 - targetAngle); // 3 rotations opposite
      setBallAngle(ballRotation);
      
      // Position ball on the rim
      const ballRadius = 4.2;
      ballRef.current.position.x = Math.cos(ballRotation) * ballRadius;
      ballRef.current.position.y = Math.sin(ballRotation) * ballRadius;
      
      // Check if spin is complete
      if (progress >= 1 && !isSpinCompleted) {
        setIsSpinCompleted(true);
        setTimeout(() => {
          onSpinComplete();
        }, 500); // Small delay to show final position
      }
    }
  });

  // Create wheel segments
  const segments = ROULETTE_NUMBERS.map((number, index) => {
    const angle = index * SEGMENT_ANGLE;
    const color = getNumberColor(number);
    
    return (
      <group key={index} rotation={[0, 0, angle]}>
        {/* Segment background */}
        <mesh position={[3, 0, 0.01]}>
          <planeGeometry args={[1.5, 0.8]} />
          <meshStandardMaterial color={color} />
        </mesh>
        
        {/* Number text */}
        <Text
          position={[3, 0, 0.02]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
          font="./fonts/nickname.otf"
        >
          {number.toString()}
        </Text>
      </group>
    );
  });

  return (
    <group>
      {/* Wheel base */}
      <mesh position={[0, 0, -0.1]}>
        <cylinderGeometry args={[4.5, 4.5, 0.2, 32]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Wheel rim */}
      <mesh position={[0, 0, 0]}>
        <ringGeometry args={[4, 4.5, 32]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
      
      {/* Wheel center */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[1, 1, 0.1, 16]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
      
      {/* Rotating wheel with numbers */}
      <group ref={wheelRef}>
        {segments}
      </group>
      
      {/* Ball */}
      <mesh ref={ballRef} position={[4.2, 0, 0.1]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="white" />
      </mesh>
      
      {/* Pointer */}
      <mesh position={[4.3, 0, 0.1]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.2, 0.5, 3]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
    </group>
  );
};

export default RouletteWheel;