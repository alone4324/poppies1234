/*
 *  Copyright (c) Michael Kolesidis <michael.kolesidis@gmail.com>
 *  GNU Affero General Public License v3.0
 *
 *  ATTENTION! FREE SOFTWARE
 *  This website is free software (free as in freedom).
 *  If you use any part of this code, you must make your entire project's source code
 *  publicly available under the same license. This applies whether you modify the code
 *  or use it as it is in your own project. This ensures that all modifications and
 *  derivative works remain free software, so that everyone can benefit.
 *  If you are not willing to comply with these terms, you must refrain from using any part of this code.
 *
 *  For full license terms and conditions, you can read the AGPL-3.0 here:
 *  https://www.gnu.org/licenses/agpl-3.0.html
 */

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
      >
        <Game />
      </Canvas>
    </>
  );
};

export default App;
