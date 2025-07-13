import { useRef, useEffect, useState } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface RouletteWheel3DProps {
  isSpinning: boolean;
  targetNumber: number | null;
  onSpinComplete: () => void;
}

// European roulette numbers in correct wheel order
const ROULETTE_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5,
  24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

const getNumberColor = (num: number): string => {
  if (num === 0) return '#2d5016'; // Dark green for 0
  const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  return redNumbers.includes(num) ? '#8B0000' : '#1a1a1a'; // Dark red or black
};

const RouletteWheel3D = ({ isSpinning, targetNumber, onSpinComplete }: RouletteWheel3DProps) => {
  const wheelRef = useRef<THREE.Group>(null);
  const ballRef = useRef<THREE.Mesh>(null);
  const rimRef = useRef<THREE.Mesh>(null);
  
  const [currentRotation, setCurrentRotation] = useState(0);
  const [ballAngle, setBallAngle] = useState(0);
  const [ballRadius, setBallRadius] = useState(4.8);
  const [spinStartTime, setSpinStartTime] = useState(0);
  const [isSpinCompleted, setIsSpinCompleted] = useState(false);

  const SPIN_DURATION = 5000; // 5 seconds
  const SEGMENTS = ROULETTE_NUMBERS.length;
  const SEGMENT_ANGLE = (Math.PI * 2) / SEGMENTS;

  // Create realistic materials
  const woodMaterial = new THREE.MeshStandardMaterial({ 
    color: '#8B4513',
    roughness: 0.8,
    metalness: 0.1
  });

  const goldMaterial = new THREE.MeshStandardMaterial({ 
    color: '#FFD700',
    roughness: 0.2,
    metalness: 0.8
  });

  const ballMaterial = new THREE.MeshStandardMaterial({ 
    color: '#F5F5F5',
    roughness: 0.1,
    metalness: 0.9
  });

  const centerMaterial = new THREE.MeshStandardMaterial({ 
    color: '#C0C0C0',
    roughness: 0.3,
    metalness: 0.7
  });

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
      
      // Advanced easing for realistic deceleration
      const easeOut = 1 - Math.pow(1 - progress, 4);
      
      // Calculate target angle for the winning number
      const targetIndex = ROULETTE_NUMBERS.indexOf(targetNumber);
      const targetAngle = targetIndex * SEGMENT_ANGLE;
      
      // Multiple rotations for dramatic effect
      const totalWheelRotation = Math.PI * 2 * 8 + targetAngle; // 8 full rotations
      const totalBallRotation = Math.PI * 2 * 12 - targetAngle; // 12 rotations opposite
      
      // Update wheel rotation
      const newRotation = easeOut * totalWheelRotation;
      setCurrentRotation(newRotation);
      wheelRef.current.rotation.z = -newRotation;
      
      // Ball physics - starts fast, slows down, drops into pocket
      const ballRotation = easeOut * totalBallRotation;
      setBallAngle(ballRotation);
      
      // Ball radius decreases as it loses momentum and falls into pocket
      const radiusReduction = progress * 0.6; // Ball moves inward
      const currentRadius = 4.8 - radiusReduction;
      setBallRadius(currentRadius);
      
      // Position ball with realistic physics
      ballRef.current.position.x = Math.cos(ballRotation) * currentRadius;
      ballRef.current.position.y = Math.sin(ballRotation) * currentRadius;
      ballRef.current.position.z = 0.3 - (progress * 0.2); // Ball drops down
      
      // Add ball rotation for realism
      ballRef.current.rotation.x += 0.5;
      ballRef.current.rotation.y += 0.3;
      
      // Rim sparkle effect during spin
      if (rimRef.current) {
        rimRef.current.material.emissive.setHex(
          progress > 0.8 ? 0x444400 : 0x222200
        );
      }
      
      // Check if spin is complete
      if (progress >= 1 && !isSpinCompleted) {
        setIsSpinCompleted(true);
        setTimeout(() => {
          onSpinComplete();
        }, 800);
      }
    }
  });

  // Create wheel segments with realistic 3D depth
  const segments = ROULETTE_NUMBERS.map((number, index) => {
    const angle = index * SEGMENT_ANGLE;
    const color = getNumberColor(number);
    const textColor = number === 0 ? '#FFD700' : '#FFFFFF';
    
    return (
      <group key={index} rotation={[0, 0, angle]}>
        {/* Segment pocket - 3D depression */}
        <mesh position={[4.2, 0, -0.05]}>
          <boxGeometry args={[0.8, 0.6, 0.1]} />
          <meshStandardMaterial 
            color={color} 
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>
        
        {/* Segment walls for 3D effect */}
        <mesh position={[4.6, 0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[0.05, 0.2, 0.15]} />
          <meshStandardMaterial color="#C0C0C0" metalness={0.8} />
        </mesh>
        <mesh position={[4.6, -0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[0.05, 0.2, 0.15]} />
          <meshStandardMaterial color="#C0C0C0" metalness={0.8} />
        </mesh>
        
        {/* Number text with better positioning */}
        <Text
          position={[4.2, 0, 0.02]}
          fontSize={0.25}
          color={textColor}
          anchorX="center"
          anchorY="middle"
          font="./fonts/nickname.otf"
          material-toneMapped={false}
        >
          {number.toString()}
        </Text>
      </group>
    );
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Wheel base - thick wooden base */}
      <mesh position={[0, 0, -0.3]}>
        <cylinderGeometry args={[5.5, 5.5, 0.4, 64]} />
        <primitive object={woodMaterial} />
      </mesh>
      
      {/* Outer decorative ring */}
      <mesh position={[0, 0, -0.05]}>
        <ringGeometry args={[5.0, 5.4, 64]} />
        <primitive object={goldMaterial} />
      </mesh>
      
      {/* Main wheel surface */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[4.8, 4.8, 0.1, 64]} />
        <meshStandardMaterial 
          color="#2d1810" 
          roughness={0.6}
          metalness={0.2}
        />
      </mesh>
      
      {/* Inner rim with metallic finish */}
      <mesh ref={rimRef} position={[0, 0, 0.05]}>
        <ringGeometry args={[3.8, 4.8, 64]} />
        <meshStandardMaterial 
          color="#C0C0C0" 
          roughness={0.1}
          metalness={0.9}
          emissive="#111100"
        />
      </mesh>
      
      {/* Center hub - detailed */}
      <mesh position={[0, 0, 0.1]}>
        <cylinderGeometry args={[1.2, 1.2, 0.15, 32]} />
        <primitive object={centerMaterial} />
      </mesh>
      
      {/* Center logo area */}
      <mesh position={[0, 0, 0.18]}>
        <cylinderGeometry args={[0.8, 0.8, 0.05, 32]} />
        <meshStandardMaterial 
          color="#FFD700" 
          roughness={0.2}
          metalness={0.8
          }
        />
      </mesh>
      
      {/* Rotating wheel with numbers */}
      <group ref={wheelRef}>
        {segments}
      </group>
      
      {/* Roulette ball with realistic material */}
      <mesh ref={ballRef} position={[4.8, 0, 0.3]}>
        <sphereGeometry args={[0.08, 32, 32]} />
        <primitive object={ballMaterial} />
      </mesh>
      
      {/* Ball track - the groove where ball rolls */}
      <mesh position={[0, 0, 0.25]}>
        <ringGeometry args={[4.7, 4.9, 64]} />
        <meshStandardMaterial 
          color="#8B4513" 
          roughness={0.8}
          metalness={0.1
          }
        />
      </mesh>
      
      {/* Deflectors - small metal pins that affect ball movement */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <mesh 
          key={i} 
          position={[
            Math.cos(i * Math.PI / 4) * 4.5,
            Math.sin(i * Math.PI / 4) * 4.5,
            0.2
          ]}
        >
          <cylinderGeometry args={[0.03, 0.03, 0.1, 8]} />
          <meshStandardMaterial color="#C0C0C0" metalness={0.9} />
        </mesh>
      ))}
      
      {/* Pointer/Marker */}
      <mesh position={[5.2, 0, 0.15]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.15, 0.3, 8]} />
        <primitive object={goldMaterial} />
      </mesh>
    </group>
  );
};

export default RouletteWheel3D;