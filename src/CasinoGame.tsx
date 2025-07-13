import { useRef, useState } from 'react';
import { OrbitControls } from '@react-three/drei';
import Lights from './lights/Lights';
import SlotMachine from './SlotMachine';
import RouletteGame3D from './roulette/RouletteGame3D';
import { Text } from '@react-three/drei';
import { useSoundManager } from './hooks/useSoundManager';

const CasinoGame = () => {
  const slotMachineRef = useRef();
  const rouletteRef = useRef();
  const [activeGame, setActiveGame] = useState<'both' | 'roulette' | 'slots'>('both');
  const { playClick } = useSoundManager();

  const switchToRoulette = () => {
    playClick();
    setActiveGame('roulette');
  };

  const switchToSlots = () => {
    playClick();
    setActiveGame('slots');
  };

  const showBoth = () => {
    playClick();
    setActiveGame('both');
  };

  return (
    <>
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={15}
        maxDistance={100}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2}
        target={
          activeGame === 'roulette' ? [-30, 0, 0] :
          activeGame === 'slots' ? [30, 0, 0] :
          [0, 0, 0]
        }
      />
      <Lights />
      
      {/* Game Selector Buttons */}
      <group position={[0, 20, 0]}>
        {/* Roulette Button */}
        <group position={[-8, 0, 0]}>
          <mesh onClick={switchToRoulette}>
            <boxGeometry args={[4, 1.5, 0.3]} />
            <meshStandardMaterial 
              color={activeGame === 'roulette' ? "#4CAF50" : "#2A1558"}
              emissive={activeGame === 'roulette' ? "#1B5E20" : "#1a0d3d"}
              emissiveIntensity={0.3}
            />
          </mesh>
          <Text
            position={[0, 0, 0.16]}
            fontSize={0.4}
            color="white"
            anchorX="center"
            anchorY="middle"
            font="./fonts/nickname.otf"
          >
            ROULETTE
          </Text>
        </group>

        {/* Both Games Button */}
        <group position={[0, 0, 0]}>
          <mesh onClick={showBoth}>
            <boxGeometry args={[4, 1.5, 0.3]} />
            <meshStandardMaterial 
              color={activeGame === 'both' ? "#4CAF50" : "#2A1558"}
              emissive={activeGame === 'both' ? "#1B5E20" : "#1a0d3d"}
              emissiveIntensity={0.3}
            />
          </mesh>
          <Text
            position={[0, 0, 0.16]}
            fontSize={0.4}
            color="white"
            anchorX="center"
            anchorY="middle"
            font="./fonts/nickname.otf"
          >
            BOTH
          </Text>
        </group>

        {/* Slots Button */}
        <group position={[8, 0, 0]}>
          <mesh onClick={switchToSlots}>
            <boxGeometry args={[4, 1.5, 0.3]} />
            <meshStandardMaterial 
              color={activeGame === 'slots' ? "#4CAF50" : "#2A1558"}
              emissive={activeGame === 'slots' ? "#1B5E20" : "#1a0d3d"}
              emissiveIntensity={0.3}
            />
          </mesh>
          <Text
            position={[0, 0, 0.16]}
            fontSize={0.4}
            color="white"
            anchorX="center"
            anchorY="middle"
            font="./fonts/nickname.otf"
          >
            SLOTS
          </Text>
        </group>
      </group>
      
      {/* Roulette Game - Left Side */}
      {(activeGame === 'both' || activeGame === 'roulette') && (
        <group 
          position={activeGame === 'both' ? [-35, 0, 0] : [0, 0, 0]} 
          ref={rouletteRef}
          scale={activeGame === 'roulette' ? [1.2, 1.2, 1.2] : [1, 1, 1]}
        >
          <RouletteGame3D />
        </group>
      )}
      
      {/* Slot Machine - Right Side */}
      {(activeGame === 'both' || activeGame === 'slots') && (
        <group 
          position={activeGame === 'both' ? [35, 0, 0] : [0, 0, 0]} 
          ref={slotMachineRef}
          scale={activeGame === 'slots' ? [1.2, 1.2, 1.2] : [1, 1, 1]}
        >
          <SlotMachine value={[1, 2, 3]} />
        </group>
      )}

      {/* Casino Floor */}
      <mesh position={[0, 0, -5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial 
          color="#1a1a1a" 
          roughness={0.8}
          metalness={0.1
        />
      </mesh>

      {/* Casino Ceiling Lights */}
      {[-30, 0, 30].map((x, i) => (
        <group key={i} position={[x, 25, 10]}>
          <mesh>
            <cylinderGeometry args={[2, 2, 1, 16]} />
            <meshStandardMaterial 
              color="#FFD700" 
              emissive="#FFD700"
              emissiveIntensity={0.5}
            />
          </mesh>
          <pointLight 
            position={[0, -2, 0]} 
            intensity={1} 
            distance={50} 
            color="#FFD700"
          />
        </group>
      ))}
      </group>
    </>
  );
};

export default CasinoGame;