import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import Interface from './interface/Interface';
import Game from './Game';
import SoundControls from './components/SoundControls';
import { useSoundManager } from './hooks/useSoundManager';
import WalletWidget from './components/WalletWidget';
import HelpButton from './interface/helpButton/HelpButton';
import EntryGate from './components/EntryGate';




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
  const [gatePassed, setGatePassed] = React.useState(() =>
    typeof window !== 'undefined' && localStorage.getItem('entryGatePassed') === '1'
  );
  const [appLoading, setAppLoading] = React.useState(false);
  const [appReady, setAppReady] = React.useState(false);
  const [windowWidth] = useState(window.innerWidth);
  const cameraPositionZ = windowWidth > 500 ? 30 : 40;



  // Sound manager
  const {
    isMuted,
    toggleMute,
    playBackgroundMusic,
    isBackgroundPlaying
  } = useSoundManager();

  React.useEffect(() => {
    if (gatePassed) {
      setAppLoading(true);
      setTimeout(() => setAppReady(true), 100);
      setTimeout(() => setAppLoading(false), 900);
    }
  }, [gatePassed]);

  React.useEffect(() => {
    if (!isMuted && !isBackgroundPlaying) {
      playBackgroundMusic();
    }
  }, [isMuted, isBackgroundPlaying, playBackgroundMusic]);



  let content;
  if (!gatePassed) {
    content = <EntryGate onSuccess={() => setGatePassed(true)} />;
  } else {
    content = (
      <>
        {appLoading && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 99999,
            background: 'rgba(44, 27, 78, 0.25)',
            backdropFilter: 'blur(16px) saturate(1.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'opacity 0.5s',
            pointerEvents: 'none',
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.12)',
              borderRadius: 24,
              boxShadow: '0 8px 32px rgba(59,8,115,0.18)',
              border: '1.5px solid rgba(255,255,255,0.18)',
              padding: '40px 48px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minWidth: 220,
              maxWidth: 320,
              animation: 'fadeInGate 0.7s cubic-bezier(.4,0,.2,1)',
            }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                border: '4px solid rgba(255,255,255,0.25)',
                borderTop: '4px solid #6913c5',
                animation: 'spin 1s linear infinite',
                marginBottom: 18,
              }} />
              <div style={{
                fontFamily: "'Paytone One', 'Inter', Arial, sans-serif",
                fontSize: 22,
                color: '#fff',
                textAlign: 'center',
                textShadow: '0 2px 8px #3b087355',
                fontWeight: 700,
                letterSpacing: 1.1,
              }}>
                Loading app...
              </div>
            </div>
          </div>
        )}
        {appReady && (
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
        )}
      </>
    );
  }

  return (
    <>
      {content}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeInGate {
          from { opacity: 0; transform: scale(0.96) translateY(24px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </>
  );
};

export default App;
