import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useSoundManager } from '../hooks/useSoundManager';

interface RouletteTable3DProps {
  selectedBets: { [key: string]: number };
  onBetClick: (betType: string) => void;
  isSpinning: boolean;
}

const RouletteTable3D = ({ selectedBets, onBetClick, isSpinning }: RouletteTable3DProps) => {
  const { playClick } = useSoundManager();

  // Roulette numbers layout (3 rows, 12 columns)
  const numbers = [
    [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
    [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
    [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34]
  ];

  const getNumberColor = (num: number): string => {
    if (num === 0) return '#2d5016';
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    return redNumbers.includes(num) ? '#8B0000' : '#1a1a1a';
  };

  const getBetAmount = (betType: string): number => {
    return selectedBets[betType] || 0;
  };

  const handleBetClick = (betType: string) => {
    if (!isSpinning) {
      playClick();
      onBetClick(betType);
    }
  };

  // Create realistic table materials
  const tableMaterial = new THREE.MeshStandardMaterial({ 
    color: '#0f4d2a',
    roughness: 0.8,
    metalness: 0.1
  });

  const feltMaterial = new THREE.MeshStandardMaterial({ 
    color: '#1a5d35',
    roughness: 0.9,
    metalness: 0.0
  });

  const chipMaterial = new THREE.MeshStandardMaterial({ 
    color: '#FFD700',
    roughness: 0.3,
    metalness: 0.7
  });

  return (
    <group position={[0, -8, 0]}>
      {/* Table base - thick wooden base */}
      <mesh position={[0, 0, -0.2]}>
        <boxGeometry args={[18, 10, 0.3]} />
        <primitive object={tableMaterial} />
      </mesh>

      {/* Felt surface */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[17.5, 9.5, 0.05]} />
        <primitive object={feltMaterial} />
      </mesh>

      {/* Table border - decorative gold trim */}
      <mesh position={[0, 0, 0]}>
        <ringGeometry args={[8.5, 9, 64]} />
        <meshStandardMaterial color="#FFD700" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Zero section - special green area */}
      <group position={[-7.5, 3, 0]}>
        <mesh 
          onClick={() => handleBetClick('0')}
          onPointerOver={(e) => { 
            if (!isSpinning) {
              e.object.material.color.setHex(0x4d7c2a); 
              document.body.style.cursor = 'pointer';
            }
          }}
          onPointerOut={(e) => { 
            e.object.material.color.setHex(0x2d5016);
            document.body.style.cursor = 'default';
          }}
        >
          <boxGeometry args={[1.2, 4, 0.08]} />
          <meshStandardMaterial 
            color="#2d5016" 
            roughness={0.7}
            metalness={0.2
            }
          />
        </mesh>
        
        {/* Zero text */}
        <Text
          position={[0, 0, 0.05]}
          fontSize={0.6}
          color="#FFD700"
          anchorX="center"
          anchorY="middle"
          font="./fonts/nickname.otf"
          material-toneMapped={false}
        >
          0
        </Text>
        
        {/* Bet chip display */}
        {getBetAmount('0') > 0 && (
          <>
            <mesh position={[0, -1.5, 0.1]}>
              <cylinderGeometry args={[0.2, 0.2, 0.05, 16]} />
              <primitive object={chipMaterial} />
            </mesh>
            <Text
              position={[0, -1.5, 0.13]}
              fontSize={0.15}
              color="#000000"
              anchorX="center"
              anchorY="middle"
              font="./fonts/nickname.otf"
            >
              {getBetAmount('0').toFixed(2)}
            </Text>
          </>
        )}
      </group>

      {/* Number grid - main betting area */}
      {numbers.map((row, rowIndex) => 
        row.map((number, colIndex) => {
          const x = -5.5 + colIndex * 1;
          const y = 2 - rowIndex * 1.3;
          const color = getNumberColor(number);
          const textColor = '#FFFFFF';
          
          return (
            <group key={number} position={[x, y, 0]}>
              {/* Number betting square */}
              <mesh 
                onClick={() => handleBetClick(number.toString())}
                onPointerOver={(e) => { 
                  if (!isSpinning) {
                    const hoverColor = color === '#8B0000' ? 0xCC0000 : 0x444444;
                    e.object.material.color.setHex(hoverColor);
                    document.body.style.cursor = 'pointer';
                  }
                }}
                onPointerOut={(e) => { 
                  const originalColor = color === '#8B0000' ? 0x8B0000 : 0x1a1a1a;
                  e.object.material.color.setHex(originalColor);
                  document.body.style.cursor = 'default';
                }}
              >
                <boxGeometry args={[0.9, 1.2, 0.08]} />
                <meshStandardMaterial 
                  color={color} 
                  roughness={0.7}
                  metalness={0.2
                  }
                />
              </mesh>
              
              {/* Number text */}
              <Text
                position={[0, 0, 0.05]}
                fontSize={0.35}
                color={textColor}
                anchorX="center"
                anchorY="middle"
                font="./fonts/nickname.otf"
                material-toneMapped={false}
              >
                {number}
              </Text>
              
              {/* Bet chip */}
              {getBetAmount(number.toString()) > 0 && (
                <>
                  <mesh position={[0, -0.4, 0.1]}>
                    <cylinderGeometry args={[0.15, 0.15, 0.05, 16]} />
                    <primitive object={chipMaterial} />
                  </mesh>
                  <Text
                    position={[0, -0.4, 0.13]}
                    fontSize={0.12}
                    color="#000000"
                    anchorX="center"
                    anchorY="middle"
                    font="./fonts/nickname.otf"
                  >
                    {getBetAmount(number.toString()).toFixed(2)}
                  </Text>
                </>
              )}
            </group>
          );
        })
        )
      )
      )}

      {/* Outside bets section */}
      <group position={[0, -3.5, 0]}>
        {/* Red betting area */}
        <group position={[-4, 0, 0]}>
          <mesh 
            onClick={() => handleBetClick('red')}
            onPointerOver={(e) => { 
              if (!isSpinning) {
                e.object.material.color.setHex(0xCC0000);
                document.body.style.cursor = 'pointer';
              }
            }}
            onPointerOut={(e) => { 
              e.object.material.color.setHex(0x8B0000);
              document.body.style.cursor = 'default';
            }}
          >
            <boxGeometry args={[2.5, 1.2, 0.08]} />
            <meshStandardMaterial 
              color="#8B0000" 
              roughness={0.7}
              metalness={0.2
              }
            />
          </mesh>
          <Text
            position={[0, 0, 0.05]}
            fontSize={0.4}
            color="#FFFFFF"
            anchorX="center"
            anchorY="middle"
            font="./fonts/nickname.otf"
            material-toneMapped={false}
          >
            RED
          </Text>
          {getBetAmount('red') > 0 && (
            <>
              <mesh position={[0, -0.4, 0.1]}>
                <cylinderGeometry args={[0.15, 0.15, 0.05, 16]} />
                <primitive object={chipMaterial} />
              </mesh>
              <Text
                position={[0, -0.4, 0.13]}
                fontSize={0.12}
                color="#000000"
                anchorX="center"
                anchorY="middle"
                font="./fonts/nickname.otf"
              >
                {getBetAmount('red').toFixed(2)}
              </Text>
            </>
          )}
        </group>

        {/* Black betting area */}
        <group position={[-1, 0, 0]}>
          <mesh 
            onClick={() => handleBetClick('black')}
            onPointerOver={(e) => { 
              if (!isSpinning) {
                e.object.material.color.setHex(0x444444);
                document.body.style.cursor = 'pointer';
              }
            }}
            onPointerOut={(e) => { 
              e.object.material.color.setHex(0x1a1a1a);
              document.body.style.cursor = 'default';
            }}
          >
            <boxGeometry args={[2.5, 1.2, 0.08]} />
            <meshStandardMaterial 
              color="#1a1a1a" 
              roughness={0.7}
              metalness={0.2
              }
            />
          </mesh>
          <Text
            position={[0, 0, 0.05]}
            fontSize={0.4}
            color="#FFFFFF"
            anchorX="center"
            anchorY="middle"
            font="./fonts/nickname.otf"
            material-toneMapped={false}
          >
            BLACK
          </Text>
          {getBetAmount('black') > 0 && (
            <>
              <mesh position={[0, -0.4, 0.1]}>
                <cylinderGeometry args={[0.15, 0.15, 0.05, 16]} />
                <primitive object={chipMaterial} />
              </mesh>
              <Text
                position={[0, -0.4, 0.13]}
                fontSize={0.12}
                color="#000000"
                anchorX="center"
                anchorY="middle"
                font="./fonts/nickname.otf"
              >
                {getBetAmount('black').toFixed(2)}
              </Text>
            </>
          )}
        </group>

        {/* Odd betting area */}
        <group position={[2, 0, 0]}>
          <mesh 
            onClick={() => handleBetClick('odd')}
            onPointerOver={(e) => { 
              if (!isSpinning) {
                e.object.material.color.setHex(0x555555);
                document.body.style.cursor = 'pointer';
              }
            }}
            onPointerOut={(e) => { 
              e.object.material.color.setHex(0x333333);
              document.body.style.cursor = 'default';
            }}
          >
            <boxGeometry args={[2.2, 1.2, 0.08]} />
            <meshStandardMaterial 
              color="#333333" 
              roughness={0.7}
              metalness={0.2
              }
            />
          </mesh>
          <Text
            position={[0, 0, 0.05]}
            fontSize={0.35}
            color="#FFFFFF"
            anchorX="center"
            anchorY="middle"
            font="./fonts/nickname.otf"
            material-toneMapped={false}
          >
            ODD
          </Text>
          {getBetAmount('odd') > 0 && (
            <>
              <mesh position={[0, -0.4, 0.1]}>
                <cylinderGeometry args={[0.15, 0.15, 0.05, 16]} />
                <primitive object={chipMaterial} />
              </mesh>
              <Text
                position={[0, -0.4, 0.13]}
                fontSize={0.12}
                color="#000000"
                anchorX="center"
                anchorY="middle"
                font="./fonts/nickname.otf"
              >
                {getBetAmount('odd').toFixed(2)}
              </Text>
            </>
          )}
        </group>

        {/* Even betting area */}
        <group position={[5, 0, 0]}>
          <mesh 
            onClick={() => handleBetClick('even')}
            onPointerOver={(e) => { 
              if (!isSpinning) {
                e.object.material.color.setHex(0x555555);
                document.body.style.cursor = 'pointer';
              }
            }}
            onPointerOut={(e) => { 
              e.object.material.color.setHex(0x333333);
              document.body.style.cursor = 'default';
            }}
          >
            <boxGeometry args={[2.2, 1.2, 0.08]} />
            <meshStandardMaterial 
              color="#333333" 
              roughness={0.7}
              metalness={0.2
              }
            />
          </mesh>
          <Text
            position={[0, 0, 0.05]}
            fontSize={0.35}
            color="#FFFFFF"
            anchorX="center"
            anchorY="middle"
            font="./fonts/nickname.otf"
            material-toneMapped={false}
          >
            EVEN
          </Text>
          {getBetAmount('even') > 0 && (
            <>
              <mesh position={[0, -0.4, 0.1]}>
                <cylinderGeometry args={[0.15, 0.15, 0.05, 16]} />
                <primitive object={chipMaterial} />
              </mesh>
              <Text
                position={[0, -0.4, 0.13]}
                fontSize={0.12}
                color="#000000"
                anchorX="center"
                anchorY="middle"
                font="./fonts/nickname.otf"
              >
                {getBetAmount('even').toFixed(2)}
              </Text>
            </>
          )}
        </group>
      </group>
    </group>
  );
};

export default RouletteTable3D;