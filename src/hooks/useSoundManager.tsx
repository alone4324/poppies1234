import { useEffect, useRef, useState } from 'react';

export function useSoundManager() {
  const [isMuted, setIsMuted] = useState(false);
  const [isBackgroundPlaying, setIsBackgroundPlaying] = useState(false);
  const [isReelPlaying, setIsReelPlaying] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const clickRef = useRef<HTMLAudioElement | null>(null);
  const spinRef = useRef<HTMLAudioElement | null>(null);
  const errorRef = useRef<HTMLAudioElement | null>(null);
  const fundingRef = useRef<HTMLAudioElement | null>(null);
  const monrewardRef = useRef<HTMLAudioElement | null>(null);
  const badluckRef = useRef<HTMLAudioElement | null>(null);
  const wowRef = useRef<HTMLAudioElement | null>(null);
  const reelRef = useRef<HTMLAudioElement | null>(null);

  // Volume levels
  const NORMAL_VOLUME = 0.3;
  const REDUCED_VOLUME = 0.1; // Reduced during spin

  // Initialize audio elements
  const initializeSounds = () => {
    try {
      // Background casino music (loops)
      backgroundMusicRef.current = new Audio('/sounds/background-music.mp3');
      backgroundMusicRef.current.loop = true;
      backgroundMusicRef.current.volume = NORMAL_VOLUME;
      backgroundMusicRef.current.preload = 'auto';
      
      // Click sound (for all buttons)
      clickRef.current = new Audio('/sounds/click.mp3');
      clickRef.current.volume = 0.3;
      clickRef.current.preload = 'auto';
      
      // Spin sound (when spin button is clicked)
      spinRef.current = new Audio('/sounds/spin.mp3');
      spinRef.current.volume = 0.4;
      spinRef.current.preload = 'auto';
      
      // Error sound (for gas popup)
      errorRef.current = new Audio('/sounds/error.mp3');
      errorRef.current.volume = 0.4;
      errorRef.current.preload = 'auto';
      
      // Funding sound (when wallet is funded)
      fundingRef.current = new Audio('/sounds/funding.mp3');
      fundingRef.current.volume = 0.5;
      fundingRef.current.preload = 'auto';
      
      // MON reward sound (when MON is won)
      monrewardRef.current = new Audio('/sounds/monreward.mp3');
      monrewardRef.current.volume = 0.6;
      monrewardRef.current.preload = 'auto';
      
      // Bad luck sound (when nothing is won)
      badluckRef.current = new Audio('/sounds/bad-luck.mp3');
      badluckRef.current.volume = 0.4;
      badluckRef.current.preload = 'auto';
      
      // Wow sound (for NFT outcomes)
      wowRef.current = new Audio('/sounds/wow.mp3');
      wowRef.current.volume = 0.6;
      wowRef.current.preload = 'auto';
      
      // Reel sound (loops during spinning)
      reelRef.current = new Audio('/sounds/reel.mp3');
      reelRef.current.loop = true;
      reelRef.current.volume = 0.4;
      reelRef.current.preload = 'auto';

      console.log('🎵 Sound system initialized');
    } catch (error) {
      console.error('Error initializing sound system:', error);
    }
  };

  // Refresh sounds from folder
  const refreshSounds = () => {
    console.log('🔄 Refreshing sounds from folder...');
    
    // Stop all current sounds
    stopBackgroundMusic();
    stopReel();
    
    // Reinitialize all audio elements
    initializeSounds();
    
    // Restart background music if it was playing
    if (!isMuted && !isBackgroundPlaying) {
      setTimeout(() => {
        playBackgroundMusic();
      }, 100);
    }
  };

  useEffect(() => {
    initializeSounds();

    // Cleanup
    return () => {
      const audioElements = [
        backgroundMusicRef.current,
        clickRef.current,
        spinRef.current,
        errorRef.current,
        fundingRef.current,
        monrewardRef.current,
        badluckRef.current,
        wowRef.current,
        reelRef.current
      ];
      
      audioElements.forEach(audio => {
        if (audio) {
          audio.pause();
          audio.src = '';
        }
      });
    };
  }, []);

  // Update background music volume based on state
  useEffect(() => {
    console.log('🔊 Volume effect triggered - isMuted:', isMuted, 'isSpinning:', isSpinning);
    if (backgroundMusicRef.current) {
      if (isMuted) {
        backgroundMusicRef.current.volume = 0;
        console.log('🔇 Background volume set to 0 (muted)');
      } else if (isSpinning) {
        backgroundMusicRef.current.volume = REDUCED_VOLUME;
        console.log('🔉 Background volume reduced to:', REDUCED_VOLUME);
      } else {
        backgroundMusicRef.current.volume = NORMAL_VOLUME;
        console.log('🔊 Background volume restored to:', NORMAL_VOLUME);
      }
    } else {
      console.log('⚠️ Background music ref is null');
    }
  }, [isMuted, isSpinning]);

  // Helper function to play sound
  const playSound = (audioRef: React.RefObject<HTMLAudioElement>, soundName: string) => {
    if (isMuted || !audioRef.current) {
      console.log(`🔇 Sound muted or not available: ${soundName}`);
      return;
    }
    
    try {
      audioRef.current.currentTime = 0;
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log(`🎵 Playing sound: ${soundName}`);
          })
          .catch(error => {
            console.warn(`Failed to play sound ${soundName}:`, error);
          });
      }
    } catch (error) {
      console.warn(`Error playing sound ${soundName}:`, error);
    }
  };

  // Background music controls
  const playBackgroundMusic = () => {
    if (backgroundMusicRef.current && !isMuted) {
      const playPromise = backgroundMusicRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('🎵 Background music started');
            setIsBackgroundPlaying(true);
          })
          .catch(error => {
            console.warn('Failed to play background music:', error);
            // Try again after user interaction
            document.addEventListener('click', () => {
              if (backgroundMusicRef.current && !isMuted) {
                backgroundMusicRef.current.play().catch(e => 
                  console.warn('Still failed to play background music:', e)
                );
              }
            }, { once: true });
          });
      }
    }
  };

  const stopBackgroundMusic = () => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
      backgroundMusicRef.current.currentTime = 0;
      setIsBackgroundPlaying(false);
      console.log('🔇 Background music stopped');
    }
  };

  // Game sounds
  const playClick = () => {
    playSound(clickRef, 'click');
  };

  const playSpin = () => {
    playSound(spinRef, 'spin');
  };

  const playError = () => {
    playSound(errorRef, 'error');
  };

  const playFunding = () => {
    playSound(fundingRef, 'funding');
  };

  const playMonReward = () => {
    playSound(monrewardRef, 'monreward');
  };

  const playBadLuck = () => {
    playSound(badluckRef, 'bad-luck');
  };

  const playWow = () => {
    playSound(wowRef, 'wow');
  };

  const playReel = () => {
    if (isMuted || !reelRef.current) {
      console.log('🔇 Reel sound muted or not available');
      return;
    }
    
    try {
      reelRef.current.currentTime = 0;
      const playPromise = reelRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('🎵 Reel sound started');
            setIsReelPlaying(true);
          })
          .catch(error => {
            console.warn('Failed to play reel sound:', error);
          });
      }
    } catch (error) {
      console.warn('Error playing reel sound:', error);
    }
  };

  const stopReel = () => {
    if (reelRef.current) {
      reelRef.current.pause();
      reelRef.current.currentTime = 0;
      setIsReelPlaying(false);
      console.log('🔇 Reel sound stopped');
    }
  };

  // Spin state management
  const startSpinning = () => {
    console.log('🎰 startSpinning called - setting isSpinning to true');
    setIsSpinning(true);
    console.log('🎰 Spin started - reducing background volume');
  };

  const stopSpinning = () => {
    console.log('🎰 stopSpinning called - setting isSpinning to false');
    setIsSpinning(false);
    console.log('🎰 Spin finished - restoring background volume');
  };

  // Mute controls
  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    if (newMutedState) {
      stopBackgroundMusic();
      if (isReelPlaying) {
        stopReel();
      }
      console.log('🔇 All sounds muted');
    } else {
      if (!isBackgroundPlaying) {
        playBackgroundMusic();
      }
      console.log('🔊 Sounds unmuted');
    }
  };

  return {
    // Background music
    playBackgroundMusic,
    stopBackgroundMusic,
    isBackgroundPlaying,
    
    // Game sounds
    playClick,
    playSpin,
    playError,
    playFunding,
    playMonReward,
    playBadLuck,
    playWow,
    playReel,
    stopReel,
    isReelPlaying,
    
    // Spin state management
    startSpinning,
    stopSpinning,
    isSpinning,
    
    // Sound refresh
    refreshSounds,
    
    // Controls
    isMuted,
    toggleMute
  };
} 