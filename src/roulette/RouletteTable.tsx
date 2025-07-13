import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface RouletteTableProps {
  selectedBets: { [key: string]: number };
  onBetClick: (betType: string) => void;
}

const RouletteTable = ({ selectedBets, onBetClick }: RouletteTableProps) => {
  // Roulette numbers layout
  const numbers = [
    [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
    [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
    [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34]
  ];

  const getNumberColor = (num: number): string => {
    if (num === 0) return '#00aa00';
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    return redNumbers.includes(num) ? '#cc0000' : '#000000';
  };

  const getBetAmount = (betType: string): number => {
    return selectedBets[betType] || 0;
  };

  return (
    <group position={[0, -6, 0]}>
      {/* Table background */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[16, 8]} />
        <meshStandardMaterial color="#0f5132" />
      </mesh>

      {/* Zero */}
      <group position={[-6, 2, 0]}>
        <mesh 
          onClick={() => onBetClick('0')}
          onPointerOver={(e) => { e.object.material.color.setHex(0x444444); }}
          onPointerOut={(e) => { e.object.material.color.setHex(0x00aa00); }}
        >
          <planeGeometry args={[1, 3]} />
          <meshStandardMaterial color="#00aa00" />
        </mesh>
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.4}
          color="white"
          anchorX="center"
          anchorY="middle"
          font="./fonts/nickname.otf"
        >
          0
        </Text>
        {getBetAmount('0') > 0 && (
          <Text
            position={[0, -1, 0.02]}
            fontSize={0.2}
            color="yellow"
            anchorX="center"
            anchorY="middle"
            font="./fonts/nickname.otf"
          >
            {getBetAmount('0')}
          </Text>
        )}
      </group>

      {/* Number grid */}
      {numbers.map((row, rowIndex) => 
        row.map((number, colIndex) => {
          const x = -4.5 + colIndex * 0.75;
          const y = 1.5 - rowIndex * 1;
          const color = getNumberColor(number);
          
          return (
            <group key={number} position={[x, y, 0]}>
              <mesh 
                onClick={() => onBetClick(number.toString())}
                onPointerOver={(e) => { 
                  const currentColor = color === '#cc0000' ? 0xff4444 : 0x444444;
                  e.object.material.color.setHex(currentColor); 
                }}
                onPointerOut={(e) => { 
                  const originalColor = color === '#cc0000' ? 0xcc0000 : 0x000000;
                  e.object.material.color.setHex(originalColor); 
                }}
              >
                <planeGeometry args={[0.7, 0.9]} />
                <meshStandardMaterial color={color} />
              </mesh>
              <Text
                position={[0, 0, 0.01]}
                fontSize={0.25}
                color="white"
                anchorX="center"
                anchorY="middle"
                font="./fonts/nickname.otf"
              >
                {number}
              </Text>
              {getBetAmount(number.toString()) > 0 && (
                <Text
                  position={[0, -0.3, 0.02]}
                  fontSize={0.15}
                  color="yellow"
                  anchorX="center"
                  anchorY="middle"
                  font="./fonts/nickname.otf"
                >
                  {getBetAmount(number.toString())}
                </Text>
              )}
            </group>
          );
        })
      )}

      {/* Outside bets */}
      <group position={[0, -2.5, 0]}>
        {/* Red/Black */}
        <group position={[-3, 0, 0]}>
          <mesh 
            onClick={() => onBetClick('red')}
            onPointerOver={(e) => { e.object.material.color.setHex(0xff4444); }}
            onPointerOut={(e) => { e.object.material.color.setHex(0xcc0000); }}
          >
            <planeGeometry args={[2, 0.8]} />
            <meshStandardMaterial color="#cc0000" />
          </mesh>
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.3}
            color="white"
            anchorX="center"
            anchorY="middle"
            font="./fonts/nickname.otf"
          >
            RED
          </Text>
          {getBetAmount('red') > 0 && (
            <Text
              position={[0, -0.25, 0.02]}
              fontSize={0.2}
              color="yellow"
              anchorX="center"
              anchorY="middle"
              font="./fonts/nickname.otf"
            >
              {getBetAmount('red')}
            </Text>
          )}
        </group>

        <group position={[-1, 0, 0]}>
          <mesh 
            onClick={() => onBetClick('black')}
            onPointerOver={(e) => { e.object.material.color.setHex(0x444444); }}
            onPointerOut={(e) => { e.object.material.color.setHex(0x000000); }}
          >
            <planeGeometry args={[2, 0.8]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.3}
            color="white"
            anchorX="center"
            anchorY="middle"
            font="./fonts/nickname.otf"
          >
            BLACK
          </Text>
          {getBetAmount('black') > 0 && (
            <Text
              position={[0, -0.25, 0.02]}
              fontSize={0.2}
              color="yellow"
              anchorX="center"
              anchorY="middle"
              font="./fonts/nickname.otf"
            >
              {getBetAmount('black')}
            </Text>
          )}
        </group>

        {/* Odd/Even */}
        <group position={[1, 0, 0]}>
          <mesh 
            onClick={() => onBetClick('odd')}
            onPointerOver={(e) => { e.object.material.color.setHex(0x444444); }}
            onPointerOut={(e) => { e.object.material.color.setHex(0x333333); }}
          >
            <planeGeometry args={[1.8, 0.8]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.25}
            color="white"
            anchorX="center"
            anchorY="middle"
            font="./fonts/nickname.otf"
          >
            ODD
          </Text>
          {getBetAmount('odd') > 0 && (
            <Text
              position={[0, -0.25, 0.02]}
              fontSize={0.2}
              color="yellow"
              anchorX="center"
              anchorY="middle"
              font="./fonts/nickname.otf"
            >
              {getBetAmount('odd')}
            </Text>
          )}
        </group>

        <group position={[3, 0, 0]}>
          <mesh 
            onClick={() => onBetClick('even')}
            onPointerOver={(e) => { e.object.material.color.setHex(0x444444); }}
            onPointerOut={(e) => { e.object.material.color.setHex(0x333333); }}
          >
            <planeGeometry args={[1.8, 0.8]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.25}
            color="white"
            anchorX="center"
            anchorY="middle"
            font="./fonts/nickname.otf"
          >
            EVEN
          </Text>
          {getBetAmount('even') > 0 && (
            <Text
              position={[0, -0.25, 0.02]}
              fontSize={0.2}
              color="yellow"
              anchorX="center"
              anchorY="middle"
              font="./fonts/nickname.otf"
            >
              {getBetAmount('even')}
            </Text>
          )}
        </group>
      </group>
    </group>
  );
};

export default RouletteTable;