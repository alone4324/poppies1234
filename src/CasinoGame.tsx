import { useRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import Lights from './lights/Lights';
import SlotMachine from './SlotMachine';
import RouletteGame from './roulette/RouletteGame';

const CasinoGame = () => {
  const slotMachineRef = useRef();
  const rouletteRef = useRef();

  return (
    <>
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={20}
        maxDistance={80}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2}
      />
      <Lights />
      
      {/* Roulette Game - Left Side */}
      <group position={[-25, 0, 0]} ref={rouletteRef}>
        <RouletteGame />
      </group>
      
      {/* Slot Machine - Right Side */}
      <group position={[25, 0, 0]} ref={slotMachineRef}>
        <SlotMachine value={[1, 2, 3]} />
      </group>
    </>
  );
};

export default CasinoGame;