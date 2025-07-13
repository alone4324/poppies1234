export default function Lights() {
  return (
    <>
      {/* Main directional lights for overall illumination */}
      <directionalLight 
        position={[-10, 15, 10]} 
        intensity={1.2} 
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight 
        position={[10, 15, 10]} 
        intensity={1.2} 
        color="#ffffff"
        castShadow
      />
      
      {/* Ambient light for general scene lighting */}
      <ambientLight intensity={0.4} color="#ffffff" />
      
      {/* Spot lights for dramatic casino lighting */}
      <spotLight
        position={[-35, 20, 15]}
        angle={Math.PI / 6}
        penumbra={0.5}
        intensity={2}
        color="#FFD700"
        target-position={[-35, 0, 0]}
        castShadow
      />
      
      <spotLight
        position={[35, 20, 15]}
        angle={Math.PI / 6}
        penumbra={0.5}
        intensity={2}
        color="#FFD700"
        target-position={[35, 0, 0]}
        castShadow
      />
      
      {/* Accent lighting for atmosphere */}
      <pointLight 
        position={[0, 10, 5]} 
        intensity={0.8} 
        color="#6913c5" 
        distance={30}
      />
    </>
  );
}
