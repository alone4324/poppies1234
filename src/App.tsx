import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import Interface from './interface/Interface';
import Game from './Game';
import SoundControls from './components/SoundControls';
import { useSoundManager } from './hooks/useSoundManager';
import WalletWidget from './components/WalletWidget';
import HelpButton from './interface/helpButton/HelpButton';

const TopRightControls = ({
  isMuted,
  onToggleMute
}: any) => (
  <div className="top-right-controls">
    <SoundControls 
      isMuted={isMuted}
      onToggleMute={onToggleMute}
    />
    <WalletWidget />
    <HelpButton />
  </div>
);

const App = () => {
  const [windowWidth] = useState(window.innerWidth);
  const cameraPositionZ = windowWidth > 500 ? 30 : 40;

  // Sound manager
  const {
    isMuted,
    toggleMute,
    playBackgroundMusic,
    isBackgroundPlaying
  } = useSoundManager();

  // Auto-start background music if not muted
  React.useEffect(() => {
    if (!isMuted && !isBackgroundPlaying) {
      playBackgroundMusic();
    }
  }, [isMuted, isBackgroundPlaying, playBackgroundMusic]);

  return (
    <>
      <TopRightControls 
        isMuted={isMuted}
        onToggleMute={toggleMute}
      />
      <Interface />
      <Canvas 
        className="slot-machine"
        camera={{ fov: 75, position: [0, 0, cameraPositionZ] }}
        style={{ background: 'transparent' }}
      >
        <Game />
      </Canvas>
    </>
  );
};

export default App;
